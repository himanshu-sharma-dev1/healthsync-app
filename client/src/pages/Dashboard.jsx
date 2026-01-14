import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import './Dashboard.css';

const Dashboard = () => {
    const { user } = useAuth();

    // Demo stats for hackathon
    const patientStats = {
        upcomingAppointments: 2,
        completedConsultations: 8,
        prescriptions: 5
    };

    const doctorStats = {
        todayAppointments: 5,
        totalPatients: 48,
        earnings: 24500
    };

    const stats = user?.role === 'doctor' ? doctorStats : patientStats;

    const upcomingAppointments = [
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

    return (
        <div className="dashboard-page">
            <div className="container">
                {/* Welcome Header */}
                <div className="dashboard-header">
                    <div className="welcome-text">
                        <h1>Welcome back, {user?.firstName || 'User'}! 👋</h1>
                        <p className="text-secondary">
                            {user?.role === 'doctor'
                                ? 'Manage your appointments and patients'
                                : 'Your health dashboard at a glance'
                            }
                        </p>
                    </div>

                    <Link to="/doctors" className="btn btn-primary">
                        {user?.role === 'doctor' ? 'View Schedule' : 'Book Consultation'}
                    </Link>
                </div>

                {/* Stats Cards */}
                <div className="stats-grid">
                    {user?.role === 'patient' ? (
                        <>
                            <div className="stat-card">
                                <div className="stat-icon">📅</div>
                                <div className="stat-info">
                                    <span className="stat-number">{stats.upcomingAppointments}</span>
                                    <span className="stat-label">Upcoming Appointments</span>
                                </div>
                            </div>
                            <div className="stat-card">
                                <div className="stat-icon">✅</div>
                                <div className="stat-info">
                                    <span className="stat-number">{stats.completedConsultations}</span>
                                    <span className="stat-label">Completed Consultations</span>
                                </div>
                            </div>
                            <div className="stat-card">
                                <div className="stat-icon">💊</div>
                                <div className="stat-info">
                                    <span className="stat-number">{stats.prescriptions}</span>
                                    <span className="stat-label">Prescriptions</span>
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

                {/* Upcoming Appointments */}
                <div className="dashboard-section">
                    <div className="section-header">
                        <h2>Upcoming Appointments</h2>
                        <Link to="/appointments" className="btn btn-secondary btn-sm">View All</Link>
                    </div>

                    <div className="appointments-list">
                        {upcomingAppointments.map((apt) => (
                            <div key={apt.id} className="appointment-card">
                                <div className="appointment-info">
                                    <div className="doctor-avatar-sm">👨‍⚕️</div>
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
                                    <Link to={`/video/${apt.id}`} className="btn btn-primary btn-sm">
                                        Join Call
                                    </Link>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="quick-actions">
                    <h3>Quick Actions</h3>
                    <div className="actions-grid">
                        <Link to="/doctors" className="action-card">
                            <span className="action-icon">🔍</span>
                            <span>Find Doctor</span>
                        </Link>
                        <Link to="/appointments" className="action-card">
                            <span className="action-icon">📋</span>
                            <span>My Appointments</span>
                        </Link>
                        <Link to="/profile" className="action-card">
                            <span className="action-icon">⚙️</span>
                            <span>Settings</span>
                        </Link>
                        <Link to="/help" className="action-card">
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
