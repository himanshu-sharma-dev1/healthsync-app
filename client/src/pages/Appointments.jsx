import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import './Appointments.css';

const Appointments = () => {
    const { t } = useLanguage();
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

    const getStatusText = (status) => {
        const statusTextMap = {
            all: t('all'),
            scheduled: t('scheduled'),
            confirmed: t('confirmed'),
            completed: t('completed'),
            cancelled: t('cancelled')
        };
        return statusTextMap[status] || status;
    };

    const getSpecialtyText = (specialty) => {
        const specialtyMap = {
            'Cardiologist': t('cardiologist'),
            'General Physician': t('generalPhysician'),
            'Dermatologist': t('dermatologist'),
            'Orthopedic': t('orthopedic'),
            'Pediatrician': t('pediatrician'),
            'Psychiatrist': t('psychiatrist')
        };
        return specialtyMap[specialty] || specialty;
    };

    return (
        <div className="appointments-page">
            <div className="container">
                <div className="page-header">
                    <h1>{t('myAppointments')}</h1>
                    <Link to="/doctors" className="btn btn-primary">
                        {t('bookNewAppointment')}
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
                            {getStatusText(tab)}
                        </button>
                    ))}
                </div>

                {/* Appointments List */}
                <div className="appointments-container">
                    {filteredAppointments.length === 0 ? (
                        <div className="empty-state">
                            <span className="empty-icon">📅</span>
                            <h3>{t('myAppointments')}</h3>
                            <p>{t('bookNewAppointment')}</p>
                            <Link to="/doctors" className="btn btn-primary">{t('bookAppointment')}</Link>
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
                                        <p>{getSpecialtyText(apt.doctor.specialty)}</p>
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
                                        {getStatusText(apt.status)}
                                    </span>
                                </div>

                                <div className="apt-amount">
                                    ₹{apt.amount}
                                </div>

                                <div className="apt-actions">
                                    {(apt.status === 'confirmed' || apt.status === 'scheduled') && (
                                        <Link to={`/video/${apt.id}`} className="btn btn-primary btn-sm">
                                            {t('joinCallBtn')}
                                        </Link>
                                    )}
                                    {apt.status === 'completed' && (
                                        <Link to={`/summary/${apt.id}`} className="btn btn-secondary btn-sm">
                                            {t('viewDetails')}
                                        </Link>
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

