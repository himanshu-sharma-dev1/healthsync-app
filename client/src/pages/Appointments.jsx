import { useState } from 'react';
import { Link } from 'react-router-dom';
import './Appointments.css';

const Appointments = () => {
    const [filter, setFilter] = useState('all');

    // Demo appointments for hackathon
    const appointments = [
        {
            id: 1,
            doctor: { firstName: 'Sarah', lastName: 'Johnson', specialty: 'Cardiologist' },
            date: '2026-01-16',
            time: '10:00 AM',
            status: 'confirmed',
            amount: 800
        },
        {
            id: 2,
            doctor: { firstName: 'Rajesh', lastName: 'Kumar', specialty: 'General Physician' },
            date: '2026-01-18',
            time: '2:30 PM',
            status: 'scheduled',
            amount: 500
        },
        {
            id: 3,
            doctor: { firstName: 'Priya', lastName: 'Sharma', specialty: 'Dermatologist' },
            date: '2026-01-10',
            time: '11:00 AM',
            status: 'completed',
            amount: 600
        },
        {
            id: 4,
            doctor: { firstName: 'Michael', lastName: 'Chen', specialty: 'Orthopedic' },
            date: '2026-01-05',
            time: '3:00 PM',
            status: 'completed',
            amount: 900
        }
    ];

    const filteredAppointments = filter === 'all'
        ? appointments
        : appointments.filter(apt => apt.status === filter);

    const getStatusBadge = (status) => {
        const statusMap = {
            scheduled: 'info',
            confirmed: 'success',
            'in-progress': 'warning',
            completed: 'success',
            cancelled: 'error'
        };
        return statusMap[status] || 'info';
    };

    return (
        <div className="appointments-page">
            <div className="container">
                <div className="page-header">
                    <h1>My Appointments</h1>
                    <Link to="/doctors" className="btn btn-primary">
                        Book New Appointment
                    </Link>
                </div>

                {/* Filter Tabs */}
                <div className="filter-tabs">
                    {['all', 'scheduled', 'confirmed', 'completed', 'cancelled'].map(tab => (
                        <button
                            key={tab}
                            className={`filter-tab ${filter === tab ? 'active' : ''}`}
                            onClick={() => setFilter(tab)}
                        >
                            {tab.charAt(0).toUpperCase() + tab.slice(1)}
                        </button>
                    ))}
                </div>

                {/* Appointments List */}
                <div className="appointments-container">
                    {filteredAppointments.length === 0 ? (
                        <div className="empty-state">
                            <span className="empty-icon">📅</span>
                            <h3>No appointments found</h3>
                            <p>You don't have any {filter !== 'all' ? filter : ''} appointments yet.</p>
                            <Link to="/doctors" className="btn btn-primary">Book Consultation</Link>
                        </div>
                    ) : (
                        filteredAppointments.map((apt) => (
                            <div key={apt.id} className="appointment-item">
                                <div className="apt-doctor">
                                    <div className="apt-avatar">
                                        {apt.doctor.firstName[0]}{apt.doctor.lastName[0]}
                                    </div>
                                    <div className="apt-doctor-info">
                                        <h4>Dr. {apt.doctor.firstName} {apt.doctor.lastName}</h4>
                                        <p>{apt.doctor.specialty}</p>
                                    </div>
                                </div>

                                <div className="apt-datetime">
                                    <span className="apt-date">
                                        {new Date(apt.date).toLocaleDateString('en-US', {
                                            weekday: 'short',
                                            month: 'short',
                                            day: 'numeric'
                                        })}
                                    </span>
                                    <span className="apt-time">{apt.time}</span>
                                </div>

                                <div className="apt-status">
                                    <span className={`badge badge-${getStatusBadge(apt.status)}`}>
                                        {apt.status}
                                    </span>
                                </div>

                                <div className="apt-amount">
                                    ₹{apt.amount}
                                </div>

                                <div className="apt-actions">
                                    {(apt.status === 'confirmed' || apt.status === 'scheduled') && (
                                        <Link to={`/video/${apt.id}`} className="btn btn-primary btn-sm">
                                            Join Call
                                        </Link>
                                    )}
                                    {apt.status === 'completed' && (
                                        <button className="btn btn-secondary btn-sm">
                                            View Details
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};

export default Appointments;
