import { useState, useEffect } from 'react';
import './MedicationTracker.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

const MedicationTracker = () => {
    const [medications, setMedications] = useState([]);
    const [showAddForm, setShowAddForm] = useState(false);
    const [viewMode, setViewMode] = useState('today'); // 'today' or 'week'
    const [emailStatus, setEmailStatus] = useState(null);
    const [newMed, setNewMed] = useState({
        name: '',
        dosage: '',
        frequency: 'twice',
        duration: '7', // days
        startDate: new Date().toISOString().split('T')[0]
    });

    // Load medications from localStorage on mount
    useEffect(() => {
        const savedMeds = localStorage.getItem('healthsync_medications');
        if (savedMeds) {
            setMedications(JSON.parse(savedMeds));
        } else {
            // Demo medications
            const today = new Date().toISOString().split('T')[0];
            setMedications([
                {
                    id: 1,
                    name: 'Metformin',
                    dosage: '500mg',
                    startDate: today,
                    duration: 30,
                    times: [
                        { time: '08:00', label: 'Morning', taken: false },
                        { time: '20:00', label: 'Evening', taken: false }
                    ],
                    weeklyStatus: {} // { '2026-01-18': { morning: true, evening: false } }
                },
                {
                    id: 2,
                    name: 'Lisinopril',
                    dosage: '10mg',
                    startDate: today,
                    duration: 14,
                    times: [
                        { time: '08:00', label: 'Morning', taken: false }
                    ],
                    weeklyStatus: {}
                }
            ]);
        }
    }, []);

    // Save to localStorage whenever medications change
    useEffect(() => {
        if (medications.length > 0) {
            localStorage.setItem('healthsync_medications', JSON.stringify(medications));
        }
    }, [medications]);

    const toggleTaken = (medId, timeIndex, date = null) => {
        const dateKey = date || new Date().toISOString().split('T')[0];
        setMedications(prev => prev.map(med => {
            if (med.id === medId) {
                if (date) {
                    // Weekly view - update weeklyStatus
                    const weeklyStatus = { ...med.weeklyStatus };
                    if (!weeklyStatus[dateKey]) weeklyStatus[dateKey] = {};
                    const slotKey = med.times[timeIndex].label.toLowerCase();
                    weeklyStatus[dateKey][slotKey] = !weeklyStatus[dateKey][slotKey];
                    return { ...med, weeklyStatus };
                } else {
                    // Today view - update times array
                    const newTimes = [...med.times];
                    newTimes[timeIndex] = { ...newTimes[timeIndex], taken: !newTimes[timeIndex].taken };
                    return { ...med, times: newTimes };
                }
            }
            return med;
        }));
    };

    const addMedication = () => {
        if (!newMed.name.trim()) return;

        const times = newMed.frequency === 'once'
            ? [{ time: '08:00', label: 'Morning', taken: false }]
            : newMed.frequency === 'twice'
                ? [
                    { time: '08:00', label: 'Morning', taken: false },
                    { time: '20:00', label: 'Evening', taken: false }
                ]
                : [
                    { time: '08:00', label: 'Morning', taken: false },
                    { time: '14:00', label: 'Afternoon', taken: false },
                    { time: '20:00', label: 'Evening', taken: false }
                ];

        setMedications(prev => [...prev, {
            id: Date.now(),
            name: newMed.name,
            dosage: newMed.dosage,
            startDate: newMed.startDate,
            duration: parseInt(newMed.duration),
            times,
            weeklyStatus: {}
        }]);

        setNewMed({ name: '', dosage: '', frequency: 'twice', duration: '7', startDate: new Date().toISOString().split('T')[0] });
        setShowAddForm(false);
    };

    const deleteMedication = (medId) => {
        setMedications(prev => prev.filter(m => m.id !== medId));
    };

    const getProgress = () => {
        const total = medications.reduce((acc, med) => acc + med.times.length, 0);
        const taken = medications.reduce((acc, med) =>
            acc + med.times.filter(t => t.taken).length, 0);
        return total > 0 ? Math.round((taken / total) * 100) : 0;
    };

    const getTimeEmoji = (label) => {
        if (label === 'Morning') return '☀️';
        if (label === 'Afternoon') return '🌤️';
        return '🌙';
    };

    const getWeekDays = () => {
        const days = [];
        const today = new Date();
        for (let i = 0; i < 7; i++) {
            const d = new Date(today);
            d.setDate(today.getDate() + i);
            days.push({
                date: d.toISOString().split('T')[0],
                label: i === 0 ? 'Today' : i === 1 ? 'Tomorrow' : d.toLocaleDateString('en-US', { weekday: 'short' }),
                dayNum: d.getDate()
            });
        }
        return days;
    };

    // Test email reminder button for demo
    const sendTestReminder = async () => {
        // Prompt for email if not available
        const userEmail = prompt('Enter your email to receive the medication reminder:', 'hs1132sharma7@gmail.com');

        if (!userEmail) {
            return; // User cancelled
        }

        setEmailStatus('sending');
        try {
            const response = await fetch(`${API_URL}/ai/send-medication-reminder`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: userEmail,
                    name: 'Himanshu',
                    medications: medications.map(med => ({
                        name: med.name,
                        dosage: med.dosage,
                        times: med.times
                    }))
                })
            });

            const data = await response.json();

            if (data.success) {
                setEmailStatus('success');
                alert('📧 Medication reminder email sent! Check your inbox.');
                setTimeout(() => setEmailStatus(null), 3000);
            } else {
                throw new Error(data.message || 'Failed');
            }
        } catch (error) {
            console.error('Email error:', error);
            setEmailStatus('error');
            setTimeout(() => setEmailStatus(null), 3000);
        }
    };

    return (
        <div className="medication-tracker">
            <div className="tracker-header">
                <div className="header-title">
                    <span>💊</span>
                    <h3>Medication Tracker</h3>
                </div>
                <button
                    className="add-med-btn"
                    onClick={() => setShowAddForm(!showAddForm)}
                >
                    {showAddForm ? '✕' : '+'}
                </button>
            </div>

            {/* View Toggle */}
            <div className="view-toggle">
                <button
                    className={viewMode === 'today' ? 'active' : ''}
                    onClick={() => setViewMode('today')}
                >
                    📅 Today
                </button>
                <button
                    className={viewMode === 'week' ? 'active' : ''}
                    onClick={() => setViewMode('week')}
                >
                    📆 Week
                </button>
            </div>

            {/* Progress Bar */}
            <div className="progress-section">
                <div className="progress-info">
                    <span>Today's Progress</span>
                    <span className="progress-percent">{getProgress()}%</span>
                </div>
                <div className="progress-bar">
                    <div
                        className="progress-fill"
                        style={{ width: `${getProgress()}%` }}
                    />
                </div>
            </div>

            {/* Demo Email Test Button */}
            <div className="email-test-section">
                <button
                    className={`email-test-btn ${emailStatus || ''}`}
                    onClick={sendTestReminder}
                    disabled={emailStatus === 'sending'}
                >
                    {emailStatus === 'sending' ? '⏳ Sending...' :
                        emailStatus === 'success' ? '✅ Reminder Sent!' :
                            emailStatus === 'error' ? '❌ Failed' :
                                '📧 Test Email Reminder (Demo)'}
                </button>
            </div>

            {/* Add Form */}
            {showAddForm && (
                <div className="add-form">
                    <input
                        type="text"
                        placeholder="Medication name"
                        value={newMed.name}
                        onChange={(e) => setNewMed({ ...newMed, name: e.target.value })}
                    />
                    <input
                        type="text"
                        placeholder="Dosage (e.g., 500mg)"
                        value={newMed.dosage}
                        onChange={(e) => setNewMed({ ...newMed, dosage: e.target.value })}
                    />
                    <div className="form-row">
                        <select
                            value={newMed.frequency}
                            onChange={(e) => setNewMed({ ...newMed, frequency: e.target.value })}
                        >
                            <option value="once">Once daily</option>
                            <option value="twice">Twice daily</option>
                            <option value="thrice">Three times daily</option>
                        </select>
                        <select
                            value={newMed.duration}
                            onChange={(e) => setNewMed({ ...newMed, duration: e.target.value })}
                        >
                            <option value="7">7 days</option>
                            <option value="14">14 days</option>
                            <option value="30">30 days</option>
                            <option value="60">60 days</option>
                            <option value="90">90 days</option>
                        </select>
                    </div>
                    <input
                        type="date"
                        value={newMed.startDate}
                        onChange={(e) => setNewMed({ ...newMed, startDate: e.target.value })}
                    />
                    <button onClick={addMedication} className="save-btn">
                        Add Medication
                    </button>
                </div>
            )}

            {/* Today View */}
            {viewMode === 'today' && (
                <div className="medications-list">
                    {medications.map(med => (
                        <div key={med.id} className="medication-item">
                            <div className="med-header">
                                <div className="med-info">
                                    <span className="med-name">{med.name}</span>
                                    <span className="med-dosage">{med.dosage} • {med.duration} days</span>
                                </div>
                                <button
                                    className="delete-btn"
                                    onClick={() => deleteMedication(med.id)}
                                >
                                    🗑️
                                </button>
                            </div>
                            <div className="med-times">
                                {med.times.map((time, idx) => (
                                    <button
                                        key={idx}
                                        className={`time-slot ${time.taken ? 'taken' : ''}`}
                                        onClick={() => toggleTaken(med.id, idx)}
                                    >
                                        <span className="time-emoji">{getTimeEmoji(time.label)}</span>
                                        <span className="time-label">{time.label}</span>
                                        <span className="time-value">{time.time}</span>
                                        <span className="check-icon">
                                            {time.taken ? '✅' : '⬜'}
                                        </span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Week View */}
            {viewMode === 'week' && (
                <div className="week-view">
                    <div className="week-header">
                        {getWeekDays().map(day => (
                            <div key={day.date} className="week-day-header">
                                <span className="day-label">{day.label}</span>
                                <span className="day-num">{day.dayNum}</span>
                            </div>
                        ))}
                    </div>
                    {medications.map(med => (
                        <div key={med.id} className="week-med-row">
                            <div className="week-med-name">
                                <strong>{med.name}</strong>
                                <small>{med.dosage}</small>
                            </div>
                            <div className="week-days-grid">
                                {getWeekDays().map(day => (
                                    <div key={day.date} className="week-day-cell">
                                        {med.times.map((time, idx) => {
                                            const slotKey = time.label.toLowerCase();
                                            const isTaken = med.weeklyStatus?.[day.date]?.[slotKey];
                                            return (
                                                <button
                                                    key={idx}
                                                    className={`week-slot ${isTaken ? 'taken' : ''}`}
                                                    onClick={() => toggleTaken(med.id, idx, day.date)}
                                                    title={`${time.label} - ${day.label}`}
                                                >
                                                    {isTaken ? '✅' : getTimeEmoji(time.label)}
                                                </button>
                                            );
                                        })}
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {medications.length === 0 && !showAddForm && (
                <div className="empty-state">
                    <span>💊</span>
                    <p>No medications added yet</p>
                    <button onClick={() => setShowAddForm(true)}>
                        Add your first medication
                    </button>
                </div>
            )}
        </div>
    );
};

export default MedicationTracker;
