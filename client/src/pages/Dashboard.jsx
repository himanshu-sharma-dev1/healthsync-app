import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { Link } from 'react-router-dom';
import { appointmentService } from '../services/api';
import './Dashboard.css';

// Import avatars
import doctorMale from '../assets/images/doctor_avatar_male_1768411093398.png';
import doctorFemale from '../assets/images/doctor_avatar_female_1768411074828.png';

// Time-based greeting utility
const getTimeBasedGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return { text: 'Good morning', emoji: '🌅' };
    if (hour < 17) return { text: 'Good afternoon', emoji: '☀️' };
    if (hour < 21) return { text: 'Good evening', emoji: '🌆' };
    return { text: 'Good night', emoji: '🌙' };
};

const Dashboard = () => {
    const { user } = useAuth();
    const { t } = useLanguage();
    const [activeTab, setActiveTab] = useState('upcoming');
    const [isLoading, setIsLoading] = useState(true);

    // State for appointments (will try to fetch from API, fallback to demo)
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

    // Fetch appointments from API
    useEffect(() => {
        const fetchAppointments = async () => {
            try {
                const response = await appointmentService.getAll();
                if (response && response.data) {
                    const now = new Date();
                    const upcoming = response.data.filter(apt => new Date(apt.date) >= now);
                    const past = response.data.filter(apt => new Date(apt.date) < now);
                    setUpcomingAppointments(upcoming.length > 0 ? upcoming : demoUpcoming);
                    setPastConsultations(past.length > 0 ? past : demoPast);
                } else {
                    // Use demo data if no API data
                    setUpcomingAppointments(demoUpcoming);
                    setPastConsultations(demoPast);
                }
            } catch (error) {
                console.log('Using demo data:', error.message);
                setUpcomingAppointments(demoUpcoming);
                setPastConsultations(demoPast);
            } finally {
                setIsLoading(false);
            }
        };

        fetchAppointments();
    }, []);

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

    return (
        <div className="dashboard-page">
            <div className="container">
                {/* Welcome Header */}
                <div className="dashboard-header">
                    <div className="welcome-text">
                        <h1>
                            <span className="greeting-emoji">{getTimeBasedGreeting().emoji}</span>
                            {getTimeBasedGreeting().text}, {user?.firstName || 'User'}!
                        </h1>
                        <p className="text-secondary">
                            {user?.role === 'doctor'
                                ? 'Ready to help patients today'
                                : "Here's your health overview for today"
                            }
                        </p>
                    </div>

                    <Link to="/intake" className="btn btn-primary btn-cta-pulse">
                        {user?.role === 'doctor' ? '📋 View Schedule' : `➕ ${t('bookAppointment')}`}
                    </Link>
                </div>

                {/* Stats Cards */}
                <div className="stats-grid">
                    {user?.role === 'patient' || !user ? (
                        <>
                            <div className="stat-card">
                                <div className="stat-icon">📅</div>
                                <div className="stat-info">
                                    <span className="stat-number">{stats.upcomingAppointments}</span>
                                    <span className="stat-label">Upcoming</span>
                                </div>
                            </div>
                            <div className="stat-card">
                                <div className="stat-icon">✅</div>
                                <div className="stat-info">
                                    <span className="stat-number">{stats.completedConsultations}</span>
                                    <span className="stat-label">Completed</span>
                                </div>
                            </div>
                            <div className="stat-card">
                                <div className="stat-icon">💊</div>
                                <div className="stat-info">
                                    <span className="stat-number">{stats.prescriptions}</span>
                                    <span className="stat-label">Active Rx</span>
                                </div>
                            </div>
                        </>
                    ) : (
                        <>
                            <div className="stat-card">
                                <div className="stat-icon">📅</div>
                                <div className="stat-info">
                                    <span className="stat-number">{stats.todayAppointments}</span>
                                    <span className="stat-label">Today's Appointments</span>
                                </div>
                            </div>
                            <div className="stat-card">
                                <div className="stat-icon">👥</div>
                                <div className="stat-info">
                                    <span className="stat-number">{stats.totalPatients}</span>
                                    <span className="stat-label">Total Patients</span>
                                </div>
                            </div>
                            <div className="stat-card">
                                <div className="stat-icon">💰</div>
                                <div className="stat-info">
                                    <span className="stat-number">₹{stats.earnings.toLocaleString()}</span>
                                    <span className="stat-label">This Month</span>
                                </div>
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
                            📅 Upcoming
                        </button>
                        <button
                            className={`tab-btn ${activeTab === 'past' ? 'active' : ''}`}
                            onClick={() => setActiveTab('past')}
                        >
                            ✅ Past Consultations
                        </button>
                        <button
                            className={`tab-btn ${activeTab === 'prescriptions' ? 'active' : ''}`}
                            onClick={() => setActiveTab('prescriptions')}
                        >
                            💊 Prescriptions
                        </button>
                    </div>

                    {/* Upcoming Appointments */}
                    {activeTab === 'upcoming' && (
                        <div className="appointments-list">
                            {upcomingAppointments.map((apt) => (
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
                                            Join Call
                                        </Link>
                                    </div>
                                </div>
                            ))}
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
                                        <Link to={`/summary/${consult.id}`} className="btn btn-secondary btn-sm">
                                            View Summary
                                        </Link>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Prescriptions */}
                    {activeTab === 'prescriptions' && (
                        <div className="prescriptions-list">
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
                        <h2>📋 Medical Profile</h2>
                        <button className="btn btn-secondary btn-sm">Edit Profile</button>
                    </div>

                    <div className="profile-grid">
                        <div className="profile-item">
                            <span className="label">Blood Type</span>
                            <span className="value blood-type">{medicalProfile.bloodType}</span>
                        </div>
                        <div className="profile-item">
                            <span className="label">Height</span>
                            <span className="value">{medicalProfile.height}</span>
                        </div>
                        <div className="profile-item">
                            <span className="label">Weight</span>
                            <span className="value">{medicalProfile.weight}</span>
                        </div>
                        <div className="profile-item">
                            <span className="label">Emergency Contact</span>
                            <span className="value">{medicalProfile.emergencyContact}</span>
                        </div>
                    </div>

                    <div className="profile-tags">
                        <div className="tag-group">
                            <span className="tag-label">⚠️ Allergies:</span>
                            {medicalProfile.allergies.map((allergy, idx) => (
                                <span key={idx} className="tag allergy">{allergy}</span>
                            ))}
                        </div>
                        <div className="tag-group">
                            <span className="tag-label">🏥 Conditions:</span>
                            {medicalProfile.conditions.map((condition, idx) => (
                                <span key={idx} className="tag condition">{condition}</span>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="quick-actions">
                    <h3>Quick Actions</h3>
                    <div className="actions-grid">
                        <Link to="/intake" className="action-card">
                            <span className="action-icon">🏥</span>
                            <span>New Consultation</span>
                        </Link>
                        <Link to="/doctors" className="action-card">
                            <span className="action-icon">🔍</span>
                            <span>Find Doctor</span>
                        </Link>
                        <Link to="/appointments" className="action-card">
                            <span className="action-icon">📋</span>
                            <span>All Appointments</span>
                        </Link>
                        <Link to="#" className="action-card">
                            <span className="action-icon">❓</span>
                            <span>Help Center</span>
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
