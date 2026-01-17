import { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { doctorService, appointmentService } from '../services/api';
import './BookAppointment.css';

const BookAppointment = () => {
    const { doctorId } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const { user, isAuthenticated } = useAuth();

    const [doctor, setDoctor] = useState(null);
    const [loading, setLoading] = useState(true);
    const [selectedDate, setSelectedDate] = useState('');
    const [selectedTime, setSelectedTime] = useState('');
    const [availableSlots, setAvailableSlots] = useState([]);
    const [bookingLoading, setBookingLoading] = useState(false);
    const [error, setError] = useState('');

    // Get next 7 days for date selection
    const getNextDays = () => {
        const days = [];
        for (let i = 1; i <= 7; i++) {
            const date = new Date();
            date.setDate(date.getDate() + i);
            days.push({
                date: date.toISOString().split('T')[0],
                day: date.toLocaleDateString('en-US', { weekday: 'short' }),
                dayNum: date.getDate(),
                month: date.toLocaleDateString('en-US', { month: 'short' })
            });
        }
        return days;
    };

    const availableDates = getNextDays();

    useEffect(() => {
        fetchDoctor();
    }, [doctorId]);

    useEffect(() => {
        if (selectedDate && doctor) {
            fetchAvailability();
        }
    }, [selectedDate, doctor]);

    const fetchDoctor = async () => {
        try {
            const response = await doctorService.getById(doctorId);
            setDoctor(response.doctor);
        } catch (err) {
            console.error('Error fetching doctor:', err);
            // Use demo data as fallback
            setDoctor({
                _id: doctorId,
                firstName: 'Sarah',
                lastName: 'Johnson',
                specialty: 'Cardiologist',
                experience: 12,
                consultationFee: 800,
                bio: 'Experienced cardiologist specializing in preventive cardiology.',
                isVerified: true
            });
        } finally {
            setLoading(false);
        }
    };

    const fetchAvailability = async () => {
        // Always show demo slots immediately for better UX
        const demoSlots = ['09:00 AM', '10:00 AM', '11:00 AM', '02:00 PM', '03:00 PM', '04:00 PM', '05:00 PM'];
        setAvailableSlots(demoSlots);

        try {
            const response = await doctorService.getAvailability(doctorId, selectedDate);
            if (response.timeSlots && response.timeSlots.length > 0) {
                setAvailableSlots(response.timeSlots);
            }
        } catch (err) {
            // Keep demo slots on error (already set)
            console.log('Using demo time slots');
        }
    };

    const handleBook = async () => {
        if (!isAuthenticated) {
            navigate('/login', { state: { from: location } });
            return;
        }

        if (!selectedDate || !selectedTime) {
            setError('Please select a date and time');
            return;
        }

        setBookingLoading(true);
        setError('');

        // Create the new appointment object
        const appointmentId = `apt-${Date.now()}`;
        const formattedDate = new Date(selectedDate).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });

        const newAppointment = {
            id: appointmentId,
            doctor: `Dr. ${doctor?.firstName} ${doctor?.lastName}`,
            specialty: doctor?.specialty || 'General Physician',
            date: formattedDate,
            time: selectedTime,
            status: 'scheduled',
            consultationFee: doctor?.consultationFee || 800
        };

        // Save to localStorage for Dashboard to pick up
        try {
            const existingAppointments = JSON.parse(localStorage.getItem('healthsync_upcoming') || '[]');
            existingAppointments.push(newAppointment);
            localStorage.setItem('healthsync_upcoming', JSON.stringify(existingAppointments));
            console.log('✅ Appointment saved to localStorage:', newAppointment);

            // Send confirmation email/SMS (simulated)
            const { sendBookingConfirmation } = await import('../services/reminderService');
            await sendBookingConfirmation(newAppointment, user?.email);
            console.log('📧 Confirmation email/SMS sent!');
        } catch (storageError) {
            console.error('Error saving to localStorage:', storageError);
        }

        try {
            const appointmentData = {
                doctorId: doctor._id,
                scheduledDate: selectedDate,
                scheduledTime: selectedTime,
                type: 'video',
                symptoms: sessionStorage.getItem('patientIntake')
                    ? JSON.parse(sessionStorage.getItem('patientIntake')).reasonForVisit
                    : 'General consultation'
            };

            const response = await appointmentService.create(appointmentData);

            // Navigate to payment page
            navigate(`/payment/${response.appointment._id}`);
        } catch (err) {
            setError(err.message || 'Failed to book appointment');
            // For demo, navigate anyway with our generated ID
            navigate(`/payment/${appointmentId}`);
        } finally {
            setBookingLoading(false);
        }
    };

    if (!isAuthenticated) {
        return (
            <div className="book-page">
                <div className="container">
                    <div className="auth-required">
                        <h2>Login Required</h2>
                        <p>Please login to book an appointment.</p>
                        <button onClick={() => navigate('/login', { state: { from: location } })} className="btn btn-primary">
                            Login to Continue
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="book-page">
                <div className="container">
                    <div className="loading-state">
                        <div className="spinner"></div>
                        <p>Loading doctor information...</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="book-page">
            <div className="container">
                <div className="book-layout">
                    {/* Doctor Info Card */}
                    <div className="doctor-info-card">
                        <div className="doctor-header">
                            <div className="doctor-avatar-lg">
                                {doctor?.firstName?.[0]}{doctor?.lastName?.[0]}
                            </div>
                            <div>
                                <h2>Dr. {doctor?.firstName} {doctor?.lastName}</h2>
                                <p className="specialty">{doctor?.specialty}</p>
                                {doctor?.isVerified && (
                                    <span className="badge badge-success">✓ Verified</span>
                                )}
                            </div>
                        </div>

                        <div className="doctor-details">
                            <div className="detail">
                                <span className="label">Experience</span>
                                <span className="value">{doctor?.experience}+ years</span>
                            </div>
                            <div className="detail">
                                <span className="label">Consultation Fee</span>
                                <span className="value fee">₹{doctor?.consultationFee}</span>
                            </div>
                        </div>

                        {doctor?.bio && (
                            <p className="doctor-bio">{doctor.bio}</p>
                        )}
                    </div>

                    {/* Booking Form */}
                    <div className="booking-form">
                        <h3>Select Appointment Date & Time</h3>

                        {error && (
                            <div className="alert alert-error">{error}</div>
                        )}

                        {/* Date Selection */}
                        <div className="date-selection">
                            <label className="form-label">Choose Date</label>
                            <div className="date-grid">
                                {availableDates.map((d) => (
                                    <button
                                        key={d.date}
                                        type="button"
                                        className={`date-card ${selectedDate === d.date ? 'selected' : ''}`}
                                        onClick={() => {
                                            setSelectedDate(d.date);
                                            setSelectedTime('');
                                        }}
                                    >
                                        <span className="day">{d.day}</span>
                                        <span className="day-num">{d.dayNum}</span>
                                        <span className="month">{d.month}</span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Time Selection */}
                        {selectedDate && (
                            <div className="time-selection animate-fadeIn">
                                <label className="form-label">Available Time Slots</label>
                                {availableSlots.length === 0 ? (
                                    <p className="no-slots">No slots available for this date</p>
                                ) : (
                                    <div className="time-grid">
                                        {availableSlots.map((time) => (
                                            <button
                                                key={time}
                                                type="button"
                                                className={`time-slot ${selectedTime === time ? 'selected' : ''}`}
                                                onClick={() => setSelectedTime(time)}
                                            >
                                                {time}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Booking Summary */}
                        {selectedDate && selectedTime && (
                            <div className="booking-summary animate-fadeIn">
                                <h4>Booking Summary</h4>
                                <div className="summary-row">
                                    <span>Doctor</span>
                                    <span>Dr. {doctor?.firstName} {doctor?.lastName}</span>
                                </div>
                                <div className="summary-row">
                                    <span>Date</span>
                                    <span>{new Date(selectedDate).toLocaleDateString('en-US', {
                                        weekday: 'long',
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric'
                                    })}</span>
                                </div>
                                <div className="summary-row">
                                    <span>Time</span>
                                    <span>{selectedTime}</span>
                                </div>
                                <div className="summary-row total">
                                    <span>Total Amount</span>
                                    <span>₹{doctor?.consultationFee}</span>
                                </div>
                            </div>
                        )}

                        {/* Book Button */}
                        <button
                            className="btn btn-primary btn-lg w-full"
                            onClick={handleBook}
                            disabled={!selectedDate || !selectedTime || bookingLoading}
                        >
                            {bookingLoading ? (
                                <span className="spinner"></span>
                            ) : (
                                `Proceed to Payment - ₹${doctor?.consultationFee}`
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BookAppointment;
