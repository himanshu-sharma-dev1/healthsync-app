import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './DoctorDashboard.css';

const DoctorDashboard = () => {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState('schedule');
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

    // Demo data for hackathon
    const doctorStats = {
        todayPatients: 5,
        completedToday: 2,
        pendingConsults: 3,
        monthlyEarnings: 45000
    };

    const todaySchedule = [
        {
            id: 'apt-001',
            time: '10:00 AM',
            patient: 'John Doe',
            age: 35,
            type: 'Follow-up',
            status: 'completed',
            symptoms: ['Chest Pain', 'Fatigue']
        },
        {
            id: 'apt-002',
            time: '11:00 AM',
            patient: 'Priya Sharma',
            age: 28,
            type: 'New Consultation',
            status: 'completed',
            symptoms: ['Anxiety', 'Insomnia']
        },
        {
            id: 'apt-003',
            time: '12:30 PM',
            patient: 'Rahul Kumar',
            age: 45,
            type: 'Follow-up',
            status: 'in-progress',
            symptoms: ['Back Pain']
        },
        {
            id: 'apt-004',
            time: '2:00 PM',
            patient: 'Anita Patel',
            age: 52,
            type: 'New Consultation',
            status: 'waiting',
            symptoms: ['Headache', 'Nausea']
        },
        {
            id: 'apt-005',
            time: '3:30 PM',
            patient: 'Mohammad Ali',
            age: 40,
            type: 'Follow-up',
            status: 'scheduled',
            symptoms: ['Skin Rash']
        }
    ];

    const patientQueue = todaySchedule.filter(apt =>
        apt.status === 'waiting' || apt.status === 'in-progress'
    );

    const weeklyAvailability = [
        { day: 'Monday', slots: ['9:00 AM - 1:00 PM', '2:00 PM - 5:00 PM'], enabled: true },
        { day: 'Tuesday', slots: ['9:00 AM - 1:00 PM', '2:00 PM - 5:00 PM'], enabled: true },
        { day: 'Wednesday', slots: ['9:00 AM - 1:00 PM'], enabled: true },
        { day: 'Thursday', slots: ['9:00 AM - 1:00 PM', '2:00 PM - 5:00 PM'], enabled: true },
        { day: 'Friday', slots: ['9:00 AM - 1:00 PM', '2:00 PM - 5:00 PM'], enabled: true },
        { day: 'Saturday', slots: ['10:00 AM - 2:00 PM'], enabled: true },
        { day: 'Sunday', slots: [], enabled: false }
    ];

    const getStatusBadge = (status) => {
        const styles = {
            'completed': 'badge-success',
            'in-progress': 'badge-warning',
            'waiting': 'badge-info',
            'scheduled': 'badge-secondary'
        };
        return styles[status] || 'badge-secondary';
    };

    return (
        <div className="doctor-dashboard-page">
            <div className="container">
                {/* Header */}
                <div className="dashboard-header">
                    <div className="welcome-section">
                        <h1>👨‍⚕️ Doctor Dashboard</h1>
                        <p className="text-secondary">
                            Welcome, Dr. {user?.firstName || 'Doctor'} • {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
                        </p>
                    </div>
                    <div className="header-actions">
                        <button className="btn btn-secondary">⚙️ Settings</button>
                        <button className="btn btn-primary">📅 Edit Availability</button>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="stats-row">
                    <div className="stat-card">
                        <div className="stat-icon">📅</div>
                        <div className="stat-content">
                            <span className="stat-number">{doctorStats.todayPatients}</span>
                            <span className="stat-label">Today's Patients</span>
                        </div>
                    </div>
                    <div className="stat-card success">
                        <div className="stat-icon">✅</div>
                        <div className="stat-content">
                            <span className="stat-number">{doctorStats.completedToday}</span>
                            <span className="stat-label">Completed</span>
                        </div>
                    </div>
                    <div className="stat-card warning">
                        <div className="stat-icon">⏳</div>
                        <div className="stat-content">
                            <span className="stat-number">{doctorStats.pendingConsults}</span>
                            <span className="stat-label">Pending</span>
                        </div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-icon">💰</div>
                        <div className="stat-content">
                            <span className="stat-number">₹{doctorStats.monthlyEarnings.toLocaleString()}</span>
                            <span className="stat-label">This Month</span>
                        </div>
                    </div>
                </div>

                {/* Tabs */}
                <div className="dashboard-tabs">
                    <button
                        className={`tab-btn ${activeTab === 'schedule' ? 'active' : ''}`}
                        onClick={() => setActiveTab('schedule')}
                    >
                        📋 Today's Schedule
                    </button>
                    <button
                        className={`tab-btn ${activeTab === 'queue' ? 'active' : ''}`}
                        onClick={() => setActiveTab('queue')}
                    >
                        👥 Patient Queue ({patientQueue.length})
                    </button>
                    <button
                        className={`tab-btn ${activeTab === 'availability' ? 'active' : ''}`}
                        onClick={() => setActiveTab('availability')}
                    >
                        🕐 Availability
                    </button>
                </div>

                {/* Tab Content */}
                <div className="tab-content">
                    {/* Schedule Tab */}
                    {activeTab === 'schedule' && (
                        <div className="schedule-section">
                            <div className="section-header">
                                <h3>Today's Appointments</h3>
                                <input
                                    type="date"
                                    value={selectedDate}
                                    onChange={(e) => setSelectedDate(e.target.value)}
                                    className="date-picker"
                                />
                            </div>

                            <div className="schedule-list">
                                {todaySchedule.map((apt) => (
                                    <div key={apt.id} className={`schedule-item ${apt.status}`}>
                                        <div className="time-block">
                                            <span className="time">{apt.time}</span>
                                            <span className={`badge ${getStatusBadge(apt.status)}`}>{apt.status}</span>
                                        </div>
                                        <div className="patient-info">
                                            <h4>{apt.patient}</h4>
                                            <p>{apt.age} yrs • {apt.type}</p>
                                            <div className="symptom-tags">
                                                {apt.symptoms.map(s => (
                                                    <span key={s} className="symptom-tag">{s}</span>
                                                ))}
                                            </div>
                                        </div>
                                        <div className="actions">
                                            {apt.status === 'waiting' && (
                                                <Link to={`/video/${apt.id}`} className="btn btn-primary btn-sm">
                                                    🎥 Start Call
                                                </Link>
                                            )}
                                            {apt.status === 'in-progress' && (
                                                <Link to={`/video/${apt.id}`} className="btn btn-success btn-sm">
                                                    🔗 Rejoin
                                                </Link>
                                            )}
                                            {apt.status === 'completed' && (
                                                <Link to={`/prescription/${apt.id}`} className="btn btn-secondary btn-sm">
                                                    📝 Prescription
                                                </Link>
                                            )}
                                            <button className="btn btn-secondary btn-sm">📋 History</button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Queue Tab */}
                    {activeTab === 'queue' && (
                        <div className="queue-section">
                            <h3>Current Patient Queue</h3>
                            {patientQueue.length === 0 ? (
                                <div className="empty-state">
                                    <span className="empty-icon">👍</span>
                                    <p>No patients waiting. Great job!</p>
                                </div>
                            ) : (
                                <div className="queue-list">
                                    {patientQueue.map((patient, index) => (
                                        <div key={patient.id} className={`queue-item ${patient.status === 'in-progress' ? 'current' : ''}`}>
                                            <div className="queue-number">
                                                {patient.status === 'in-progress' ? '🔴' : index + 1}
                                            </div>
                                            <div className="queue-info">
                                                <h4>{patient.patient}</h4>
                                                <p>{patient.time} • {patient.type}</p>
                                            </div>
                                            <div className="queue-actions">
                                                {patient.status === 'in-progress' ? (
                                                    <span className="current-badge">In Consultation</span>
                                                ) : (
                                                    <Link to={`/video/${patient.id}`} className="btn btn-primary btn-sm">
                                                        Start Now
                                                    </Link>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Availability Tab */}
                    {activeTab === 'availability' && (
                        <div className="availability-section">
                            <h3>Weekly Availability</h3>
                            <div className="availability-grid">
                                {weeklyAvailability.map((day) => (
                                    <div key={day.day} className={`day-card ${!day.enabled ? 'disabled' : ''}`}>
                                        <div className="day-header">
                                            <h4>{day.day}</h4>
                                            <label className="toggle">
                                                <input type="checkbox" checked={day.enabled} readOnly />
                                                <span className="toggle-slider"></span>
                                            </label>
                                        </div>
                                        <div className="day-slots">
                                            {day.slots.length > 0 ? (
                                                day.slots.map((slot, i) => (
                                                    <span key={i} className="slot-badge">{slot}</span>
                                                ))
                                            ) : (
                                                <span className="no-slots">No slots</span>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default DoctorDashboard;
