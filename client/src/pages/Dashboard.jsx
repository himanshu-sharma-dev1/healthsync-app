import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { Link } from 'react-router-dom';
import { appointmentService } from '../services/api';
import { demoPrescription, downloadPrescriptionPDF } from '../utils/pdfGenerator';
import './Dashboard.css';

// Import avatars
import doctorMale from '../assets/images/doctor_avatar_male_1768411093398.png';
import doctorFemale from '../assets/images/doctor_avatar_female_1768411074828.png';

// Time-based greeting utility - now returns keys instead of text
const getTimeBasedGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return { key: 'goodMorning', emoji: '🌅' };
    if (hour < 17) return { key: 'goodAfternoon', emoji: '☀️' };
    if (hour < 21) return { key: 'goodEvening', emoji: '🌆' };
    return { key: 'goodNight', emoji: '🌙' };
};

const Dashboard = () => {
    const { user } = useAuth();
    const { t } = useLanguage();
    const [activeTab, setActiveTab] = useState('upcoming');
    const [isLoading, setIsLoading] = useState(true);
    const [sortOrder, setSortOrder] = useState('date-asc'); // date-asc, date-desc, doctor

    // State for appointments - localStorage backed
    const [upcomingAppointments, setUpcomingAppointments] = useState([]);
    const [pastConsultations, setPastConsultations] = useState([]);

    // Demo data fallback
    const demoUpcoming = [
        {
            id: 1,
            doctor: 'Dr. Sarah Johnson',
            specialty: 'Cardiologist',
            date: 'Jan 16, 2026',
            time: '10:00 AM',
            status: 'confirmed'
        },
        {
            id: 2,
            doctor: 'Dr. Rajesh Kumar',
            specialty: 'General Physician',
            date: 'Jan 18, 2026',
            time: '2:30 PM',
            status: 'scheduled'
        }
    ];

    const demoPast = [
        {
            id: 101,
            doctor: 'Dr. Priya Sharma',
            specialty: 'Dermatologist',
            date: 'Jan 10, 2026',
            diagnosis: 'Mild eczema',
            rating: 5
        },
        {
            id: 102,
            doctor: 'Dr. Michael Chen',
            specialty: 'Orthopedic',
            date: 'Jan 5, 2026',
            diagnosis: 'Lower back strain',
            rating: 4
        }
    ];

    // Load appointments from localStorage on mount
    useEffect(() => {
        const loadAppointments = () => {
            try {
                // Load from localStorage
                const savedUpcoming = JSON.parse(localStorage.getItem('healthsync_upcoming') || '[]');
                const savedPast = JSON.parse(localStorage.getItem('healthsync_past') || '[]');

                // If no saved data, use initial demo data (only once)
                if (savedUpcoming.length === 0 && savedPast.length === 0) {
                    const initialUpcoming = [
                        {
                            id: 'apt-demo-1',
                            doctor: 'Dr. Rajesh Kumar',
                            specialty: 'General Physician',
                            date: 'Jan 20, 2026',
                            time: '10:00 AM',
                            status: 'confirmed'
                        },
                        {
                            id: 'apt-demo-2',
                            doctor: 'Dr. Sarah Johnson',
                            specialty: 'Cardiologist',
                            date: 'Jan 22, 2026',
                            time: '3:00 PM',
                            status: 'scheduled'
                        },
                        {
                            id: 'apt-demo-3',
                            doctor: 'Dr. Priya Sharma',
                            specialty: 'Dermatologist',
                            date: 'Jan 25, 2026',
                            time: '11:30 AM',
                            status: 'scheduled'
                        },
                        {
                            id: 'apt-demo-4',
                            doctor: 'Dr. Aisha Patel',
                            specialty: 'Neurologist',
                            date: 'Jan 28, 2026',
                            time: '9:00 AM',
                            status: 'pending'
                        },
                        {
                            id: 'apt-demo-5',
                            doctor: 'Dr. Michael Chen',
                            specialty: 'Orthopedic',
                            date: 'Feb 2, 2026',
                            time: '4:30 PM',
                            status: 'confirmed'
                        }
                    ];
                    const initialPast = [
                        {
                            id: 'past-demo-1',
                            doctor: 'Dr. Priya Sharma',
                            specialty: 'Dermatologist',
                            date: 'Jan 15, 2026',
                            diagnosis: 'Mild eczema - prescribed moisturizers and antihistamines',
                            rating: 5,
                            hasPrescription: true
                        },
                        {
                            id: 'past-demo-2',
                            doctor: 'Dr. Michael Chen',
                            specialty: 'Orthopedic',
                            date: 'Jan 12, 2026',
                            diagnosis: 'Lower back strain - physical therapy recommended',
                            rating: 4,
                            hasPrescription: true
                        },
                        {
                            id: 'past-demo-3',
                            doctor: 'Dr. Aisha Patel',
                            specialty: 'Neurologist',
                            date: 'Jan 8, 2026',
                            diagnosis: 'Tension headache - lifestyle modifications advised',
                            rating: 5,
                            hasPrescription: true
                        },
                        {
                            id: 'past-demo-4',
                            doctor: 'Dr. Sarah Johnson',
                            specialty: 'Cardiologist',
                            date: 'Jan 3, 2026',
                            diagnosis: 'Routine cardiac checkup - all parameters normal',
                            rating: 5,
                            hasPrescription: false
                        },
                        {
                            id: 'past-demo-5',
                            doctor: 'Dr. Rajesh Kumar',
                            specialty: 'General Physician',
                            date: 'Dec 28, 2025',
                            diagnosis: 'Seasonal flu - rest and fluids recommended',
                            rating: 4,
                            hasPrescription: true
                        },
                        {
                            id: 'past-demo-6',
                            doctor: 'Dr. Ananya Gupta',
                            specialty: 'Gynecologist',
                            date: 'Dec 20, 2025',
                            diagnosis: 'Annual health checkup - healthy report',
                            rating: 5,
                            hasPrescription: false
                        }
                    ];

                    // Also add demo prescriptions
                    const demoPrescriptions = [
                        {
                            id: 'rx-demo-1',
                            appointmentId: 'past-demo-1',
                            doctor: 'Dr. Priya Sharma',
                            specialty: 'Dermatologist',
                            patient: 'Patient',
                            date: 'Jan 15, 2026',
                            chiefComplaint: 'Dry, itchy skin patches on arms and legs',
                            diagnosis: 'Mild eczema (Atopic dermatitis)',
                            medications: [
                                { name: 'Cetirizine 10mg', dosage: '1 tablet', frequency: 'Once daily', duration: '14 days' },
                                { name: 'Moisturizing Cream', dosage: 'Apply liberally', frequency: 'Twice daily', duration: '30 days' },
                                { name: 'Hydrocortisone 1%', dosage: 'Apply thin layer', frequency: 'Once at night', duration: '7 days' }
                            ],
                            labTests: 'IgE levels if symptoms persist',
                            advice: 'Avoid hot showers. Use fragrance-free soaps. Keep skin moisturized. Wear cotton clothes.',
                            followUpDays: 14
                        },
                        {
                            id: 'rx-demo-2',
                            appointmentId: 'past-demo-2',
                            doctor: 'Dr. Michael Chen',
                            specialty: 'Orthopedic',
                            patient: 'Patient',
                            date: 'Jan 12, 2026',
                            chiefComplaint: 'Lower back pain after heavy lifting',
                            diagnosis: 'Lumbar muscle strain',
                            medications: [
                                { name: 'Ibuprofen 400mg', dosage: '1 tablet', frequency: 'Three times daily after meals', duration: '7 days' },
                                { name: 'Thiocolchicoside 4mg', dosage: '1 tablet', frequency: 'Twice daily', duration: '5 days' }
                            ],
                            labTests: 'X-Ray lumbar spine if pain persists beyond 2 weeks',
                            advice: 'Rest for 48-72 hours. Apply ice pack. Avoid lifting heavy objects. Start gentle stretching.',
                            followUpDays: 7
                        },
                        {
                            id: 'rx-demo-3',
                            appointmentId: 'past-demo-3',
                            doctor: 'Dr. Aisha Patel',
                            specialty: 'Neurologist',
                            patient: 'Patient',
                            date: 'Jan 8, 2026',
                            chiefComplaint: 'Frequent headaches and eye strain',
                            diagnosis: 'Tension-type headache with screen fatigue',
                            medications: [
                                { name: 'Paracetamol 650mg', dosage: '1 tablet', frequency: 'As needed (max 4/day)', duration: '7 days' },
                                { name: 'Vitamin B12 1500mcg', dosage: '1 tablet', frequency: 'Once daily', duration: '30 days' }
                            ],
                            labTests: 'None required at this time',
                            advice: 'Follow 20-20-20 rule for screens. Stay hydrated. Regular sleep schedule. Consider blue light glasses.',
                            followUpDays: 30
                        },
                        {
                            id: 'rx-demo-4',
                            appointmentId: 'past-demo-5',
                            doctor: 'Dr. Rajesh Kumar',
                            specialty: 'General Physician',
                            patient: 'Patient',
                            date: 'Dec 28, 2025',
                            chiefComplaint: 'Fever, body ache, and runny nose for 2 days',
                            diagnosis: 'Viral upper respiratory infection (Common cold)',
                            medications: [
                                { name: 'Paracetamol 500mg', dosage: '1 tablet', frequency: 'Every 6 hours if fever', duration: '3 days' },
                                { name: 'Cetirizine 10mg', dosage: '1 tablet', frequency: 'At bedtime', duration: '5 days' },
                                { name: 'Vitamin C 500mg', dosage: '1 tablet', frequency: 'Once daily', duration: '7 days' }
                            ],
                            labTests: 'CBC if fever persists beyond 3 days',
                            advice: 'Complete bed rest. Drink warm fluids. Gargle with salt water. Avoid cold foods.',
                            followUpDays: 5
                        }
                    ];

                    localStorage.setItem('healthsync_prescriptions', JSON.stringify(demoPrescriptions));
                    setUpcomingAppointments(initialUpcoming);
                    setPastConsultations(initialPast);
                    localStorage.setItem('healthsync_upcoming', JSON.stringify(initialUpcoming));
                    localStorage.setItem('healthsync_past', JSON.stringify(initialPast));
                } else {
                    setUpcomingAppointments(savedUpcoming);
                    setPastConsultations(savedPast);
                }
            } catch (error) {
                console.log('Error loading appointments:', error);
            } finally {
                setIsLoading(false);
            }
        };

        loadAppointments();

        // Listen for storage events (cross-tab sync)
        window.addEventListener('storage', loadAppointments);
        return () => window.removeEventListener('storage', loadAppointments);
    }, []);

    // Save to localStorage whenever appointments change
    useEffect(() => {
        if (!isLoading) {
            localStorage.setItem('healthsync_upcoming', JSON.stringify(upcomingAppointments));
        }
    }, [upcomingAppointments, isLoading]);

    useEffect(() => {
        if (!isLoading) {
            localStorage.setItem('healthsync_past', JSON.stringify(pastConsultations));
        }
    }, [pastConsultations, isLoading]);

    // Delete appointment
    const handleDeleteAppointment = (id) => {
        if (window.confirm('Are you sure you want to cancel this appointment?')) {
            setUpcomingAppointments(prev => prev.filter(apt => apt.id !== id));
        }
    };

    // Mark as completed
    const handleCompleteAppointment = (apt) => {
        const completedApt = {
            ...apt,
            diagnosis: 'Completed consultation',
            rating: 5,
            completedAt: new Date().toISOString()
        };
        setUpcomingAppointments(prev => prev.filter(a => a.id !== apt.id));
        setPastConsultations(prev => [completedApt, ...prev]);
    };

    // Sort appointments
    const sortAppointments = (appointments) => {
        const sorted = [...appointments];
        switch (sortOrder) {
            case 'date-asc':
                return sorted.sort((a, b) => new Date(a.date) - new Date(b.date));
            case 'date-desc':
                return sorted.sort((a, b) => new Date(b.date) - new Date(a.date));
            case 'doctor':
                return sorted.sort((a, b) => a.doctor.localeCompare(b.doctor));
            default:
                return sorted;
        }
    };

    // Demo stats for hackathon
    const patientStats = {
        upcomingAppointments: upcomingAppointments.length,
        completedConsultations: pastConsultations.length,
        prescriptions: 5
    };

    const doctorStats = {
        todayAppointments: 5,
        totalPatients: 48,
        earnings: 24500
    };

    const stats = user?.role === 'doctor' ? doctorStats : patientStats;

    // Prescriptions for Feature 12
    const prescriptions = [
        {
            id: 'RX001',
            medication: 'Omeprazole 20mg',
            doctor: 'Dr. Sarah Johnson',
            date: 'Jan 10, 2026',
            dosage: 'Once daily before breakfast',
            status: 'active'
        },
        {
            id: 'RX002',
            medication: 'Ibuprofen 400mg',
            doctor: 'Dr. Michael Chen',
            date: 'Jan 5, 2026',
            dosage: 'As needed for pain, max 3/day',
            status: 'active'
        },
        {
            id: 'RX003',
            medication: 'Vitamin D3 1000 IU',
            doctor: 'Dr. Rajesh Kumar',
            date: 'Dec 15, 2025',
            dosage: 'Once daily',
            status: 'completed'
        }
    ];

    // Medical profile for Feature 12
    const medicalProfile = {
        bloodType: 'O+',
        height: '175 cm',
        weight: '72 kg',
        allergies: ['Penicillin', 'Peanuts'],
        conditions: ['Mild anxiety'],
        emergencyContact: '+91 98765 43210'
    };

    const greeting = getTimeBasedGreeting();

    return (
        <div className="dashboard-page">
            <div className="container">
                {/* Welcome Header */}
                <div className="dashboard-header">
                    <div className="welcome-text">
                        <h1>
                            <span className="greeting-emoji">{greeting.emoji}</span>
                            {t(greeting.key)}, {user?.firstName || 'User'}!
                        </h1>
                        <p className="text-secondary">
                            {user?.role === 'doctor'
                                ? t('readyToHelp')
                                : t('healthOverview')
                            }
                        </p>
                    </div>

                    <Link to={user?.role === 'doctor' ? '/appointments' : '/intake'} className="btn btn-primary btn-cta-pulse">
                        {user?.role === 'doctor' ? `📋 ${t('viewSchedule')}` : `➕ ${t('bookAppointment')}`}
                    </Link>
                </div>

                {/* Stats Cards - Centered Icon Layout */}
                <div className="stats-grid stats-centered">
                    {user?.role === 'patient' || !user ? (
                        <>
                            <div className="stat-card stat-card-vertical stat-blue">
                                <span className="stat-icon-top">📅</span>
                                <span className="stat-number-large">{stats.upcomingAppointments}</span>
                                <span className="stat-label-bottom">{t('upcoming')}</span>
                            </div>
                            <div className="stat-card stat-card-vertical stat-teal">
                                <span className="stat-icon-top">✅</span>
                                <span className="stat-number-large">{stats.completedConsultations}</span>
                                <span className="stat-label-bottom">{t('completed')}</span>
                            </div>
                            <div className="stat-card stat-card-vertical stat-orange">
                                <span className="stat-icon-top">💊</span>
                                <span className="stat-number-large">{stats.prescriptions}</span>
                                <span className="stat-label-bottom">{t('activeRx')}</span>
                            </div>
                        </>
                    ) : (
                        <>
                            <div className="stat-card stat-card-vertical stat-blue">
                                <span className="stat-icon-top">📅</span>
                                <span className="stat-number-large">{stats.todayAppointments}</span>
                                <span className="stat-label-bottom">{t('todaysAppointments')}</span>
                            </div>
                            <div className="stat-card stat-card-vertical stat-teal">
                                <span className="stat-icon-top">👥</span>
                                <span className="stat-number-large">{stats.totalPatients}</span>
                                <span className="stat-label-bottom">{t('totalPatients')}</span>
                            </div>
                            <div className="stat-card stat-card-vertical stat-green">
                                <span className="stat-icon-top">💰</span>
                                <span className="stat-number-large">₹{stats.earnings.toLocaleString()}</span>
                                <span className="stat-label-bottom">{t('thisMonth')}</span>
                            </div>
                        </>
                    )}
                </div>

                {/* Appointments Tabs */}
                <div className="dashboard-section">
                    <div className="section-tabs">
                        <button
                            className={`tab-btn ${activeTab === 'upcoming' ? 'active' : ''}`}
                            onClick={() => setActiveTab('upcoming')}
                        >
                            📅 {t('upcoming')}
                        </button>
                        <button
                            className={`tab-btn ${activeTab === 'past' ? 'active' : ''}`}
                            onClick={() => setActiveTab('past')}
                        >
                            ✅ {t('pastConsultations')}
                        </button>
                        <button
                            className={`tab-btn ${activeTab === 'prescriptions' ? 'active' : ''}`}
                            onClick={() => setActiveTab('prescriptions')}
                        >
                            💊 {t('prescriptions')}
                        </button>
                    </div>

                    {/* Sort Dropdown - Only for upcoming */}
                    {activeTab === 'upcoming' && upcomingAppointments.length > 0 && (
                        <div className="sort-controls">
                            <label>Sort by: </label>
                            <select
                                value={sortOrder}
                                onChange={(e) => setSortOrder(e.target.value)}
                                className="sort-select"
                            >
                                <option value="date-asc">Date (Earliest First)</option>
                                <option value="date-desc">Date (Latest First)</option>
                                <option value="doctor">Doctor Name</option>
                            </select>
                        </div>
                    )}

                    {/* Upcoming Appointments */}
                    {activeTab === 'upcoming' && (
                        <div className="appointments-list">
                            {sortAppointments(upcomingAppointments).length === 0 ? (
                                <div className="empty-state">
                                    <span>📅</span>
                                    <p>No upcoming appointments</p>
                                    <Link to="/intake" className="btn btn-primary">Book Now</Link>
                                </div>
                            ) : (
                                sortAppointments(upcomingAppointments).map((apt) => (
                                    <div key={apt.id} className="appointment-card">
                                        <div className="appointment-info">
                                            <img src={doctorFemale} alt="Doctor" className="doctor-avatar-sm-img" />
                                            <div>
                                                <h4>{apt.doctor}</h4>
                                                <p className="text-secondary">{apt.specialty}</p>
                                            </div>
                                        </div>

                                        <div className="appointment-time">
                                            <span className="date">{apt.date}</span>
                                            <span className="time">{apt.time}</span>
                                        </div>

                                        <div className="appointment-actions">
                                            <span className={`badge badge-${apt.status === 'confirmed' ? 'success' : 'info'}`}>
                                                {apt.status}
                                            </span>
                                            <Link to={`/waiting-room/${apt.id}`} className="btn btn-primary btn-sm">
                                                {t('joinCall')}
                                            </Link>
                                            <button
                                                className="btn btn-success btn-sm"
                                                onClick={() => handleCompleteAppointment(apt)}
                                                title="Mark as completed"
                                            >
                                                ✓
                                            </button>
                                            <button
                                                className="btn btn-danger btn-sm"
                                                onClick={() => handleDeleteAppointment(apt.id)}
                                                title="Cancel appointment"
                                            >
                                                ✕
                                            </button>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    )}

                    {/* Past Consultations */}
                    {activeTab === 'past' && (
                        <div className="appointments-list">
                            {pastConsultations.map((consult) => (
                                <div key={consult.id} className="appointment-card past">
                                    <div className="appointment-info">
                                        <img src={doctorFemale} alt="Doctor" className="doctor-avatar-sm-img" />
                                        <div>
                                            <h4>{consult.doctor}</h4>
                                            <p className="text-secondary">{consult.specialty}</p>
                                        </div>
                                    </div>

                                    <div className="appointment-details">
                                        <span className="date">{consult.date}</span>
                                        <span className="diagnosis">📋 {consult.diagnosis}</span>
                                    </div>

                                    <div className="appointment-actions">
                                        <span className="rating">{'⭐'.repeat(consult.rating)}</span>
                                        <button
                                            className="btn btn-secondary btn-sm"
                                            onClick={() => {
                                                sessionStorage.setItem('consultationInfo', JSON.stringify({
                                                    doctor: consult.doctor,
                                                    specialty: consult.specialty,
                                                    date: consult.date,
                                                    diagnosis: consult.diagnosis
                                                }));
                                                window.location.href = `/summary/${consult.id}`;
                                            }}
                                        >
                                            {t('viewSummary')}
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Prescriptions */}
                    {activeTab === 'prescriptions' && (
                        <div className="prescriptions-list">
                            {/* Demo Prescription Card with Download */}
                            <div className="prescription-item demo-prescription">
                                <div className="rx-info">
                                    <span className="rx-icon">📋</span>
                                    <div>
                                        <h4>Demo Prescription</h4>
                                        <p className="text-secondary">{demoPrescription.diagnosis}</p>
                                    </div>
                                </div>
                                <div className="rx-meta">
                                    <span className="rx-doctor">{demoPrescription.doctor}</span>
                                    <span className="rx-date">{demoPrescription.date}</span>
                                </div>
                                <button
                                    className="btn btn-primary btn-sm"
                                    onClick={() => downloadPrescriptionPDF(demoPrescription)}
                                >
                                    📄 Download PDF
                                </button>
                            </div>

                            {/* Existing prescriptions */}
                            {prescriptions.map((rx) => (
                                <div key={rx.id} className={`prescription-item ${rx.status}`}>
                                    <div className="rx-info">
                                        <span className="rx-icon">💊</span>
                                        <div>
                                            <h4>{rx.medication}</h4>
                                            <p className="text-secondary">{rx.dosage}</p>
                                        </div>
                                    </div>
                                    <div className="rx-meta">
                                        <span className="rx-doctor">{rx.doctor}</span>
                                        <span className="rx-date">{rx.date}</span>
                                    </div>
                                    <span className={`badge badge-${rx.status === 'active' ? 'success' : 'secondary'}`}>
                                        {rx.status}
                                    </span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Medical Profile Card */}
                <div className="dashboard-section">
                    <div className="section-header">
                        <h2>📋 {t('medicalProfile')}</h2>
                        <Link to="/profile" className="btn btn-secondary btn-sm">{t('editProfile')}</Link>
                    </div>

                    <div className="profile-grid">
                        <div className="profile-item">
                            <span className="label">{t('bloodType')}</span>
                            <span className="value blood-type">{medicalProfile.bloodType}</span>
                        </div>
                        <div className="profile-item">
                            <span className="label">{t('height')}</span>
                            <span className="value">{medicalProfile.height}</span>
                        </div>
                        <div className="profile-item">
                            <span className="label">{t('weight')}</span>
                            <span className="value">{medicalProfile.weight}</span>
                        </div>
                        <div className="profile-item">
                            <span className="label">{t('emergencyContact')}</span>
                            <span className="value">{medicalProfile.emergencyContact}</span>
                        </div>
                    </div>

                    <div className="profile-tags">
                        <div className="tag-group">
                            <span className="tag-label">⚠️ {t('allergies')}:</span>
                            {medicalProfile.allergies.map((allergy, idx) => (
                                <span key={idx} className="tag allergy">{allergy}</span>
                            ))}
                        </div>
                        <div className="tag-group">
                            <span className="tag-label">🏥 {t('conditions')}:</span>
                            {medicalProfile.conditions.map((condition, idx) => (
                                <span key={idx} className="tag condition">{condition}</span>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="quick-actions">
                    <h3>{t('quickActions')}</h3>
                    <div className="actions-grid">
                        <Link to="/intake" className="action-card">
                            <span className="action-icon">🏥</span>
                            <span>{t('newConsultation')}</span>
                        </Link>
                        <Link to="/doctors" className="action-card">
                            <span className="action-icon">🔍</span>
                            <span>{t('findDoctor')}</span>
                        </Link>
                        <Link to="/appointments" className="action-card">
                            <span className="action-icon">📋</span>
                            <span>{t('allAppointments')}</span>
                        </Link>
                        <div className="action-card" onClick={() => alert('Help Center coming soon! For now, contact support@healthsync.com')} style={{ cursor: 'pointer' }}>
                            <span className="action-icon">❓</span>
                            <span>{t('helpCenter')}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
