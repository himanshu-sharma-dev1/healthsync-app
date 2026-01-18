import { useState, useEffect } from 'react';
import './MedicationTracker.css';

const MedicationTracker = () => {
    const [medications, setMedications] = useState([]);
    const [showAddForm, setShowAddForm] = useState(false);
    const [newMed, setNewMed] = useState({
        name: '',
        dosage: '',
        frequency: 'twice',
        times: ['08:00', '20:00']
    });

    // Load medications from localStorage on mount
    useEffect(() => {
        const savedMeds = localStorage.getItem('healthsync_medications');
        if (savedMeds) {
            setMedications(JSON.parse(savedMeds));
        } else {
            // Demo medications
            setMedications([
                {
                    id: 1,
                    name: 'Metformin',
                    dosage: '500mg',
                    times: [
                        { time: '08:00', label: 'Morning', taken: false },
                        { time: '20:00', label: 'Evening', taken: false }
                    ]
                },
                {
                    id: 2,
                    name: 'Lisinopril',
                    dosage: '10mg',
                    times: [
                        { time: '08:00', label: 'Morning', taken: false }
                    ]
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

    // Reset taken status at midnight
    useEffect(() => {
        const now = new Date();
        const midnight = new Date();
        midnight.setHours(24, 0, 0, 0);
        const msUntilMidnight = midnight - now;

        const timer = setTimeout(() => {
            setMedications(prev => prev.map(med => ({
                ...med,
                times: med.times.map(t => ({ ...t, taken: false }))
            })));
        }, msUntilMidnight);

        return () => clearTimeout(timer);
    }, []);

    const toggleTaken = (medId, timeIndex) => {
        setMedications(prev => prev.map(med => {
            if (med.id === medId) {
                const newTimes = [...med.times];
                newTimes[timeIndex] = { ...newTimes[timeIndex], taken: !newTimes[timeIndex].taken };
                return { ...med, times: newTimes };
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
            times
        }]);

        setNewMed({ name: '', dosage: '', frequency: 'twice', times: ['08:00', '20:00'] });
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
                    <select
                        value={newMed.frequency}
                        onChange={(e) => setNewMed({ ...newMed, frequency: e.target.value })}
                    >
                        <option value="once">Once daily</option>
                        <option value="twice">Twice daily</option>
                        <option value="thrice">Three times daily</option>
                    </select>
                    <button onClick={addMedication} className="save-btn">
                        Add Medication
                    </button>
                </div>
            )}

            {/* Medications List */}
            <div className="medications-list">
                {medications.map(med => (
                    <div key={med.id} className="medication-item">
                        <div className="med-header">
                            <div className="med-info">
                                <span className="med-name">{med.name}</span>
                                <span className="med-dosage">{med.dosage}</span>
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
