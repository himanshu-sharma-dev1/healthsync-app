import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './EPrescription.css';

const EPrescription = () => {
    const { appointmentId } = useParams();
    const { user } = useAuth();
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        diagnosis: '',
        notes: '',
        followUp: '',
        prescriptions: [
            { medication: '', dosage: '', frequency: '', duration: '', instructions: '' }
        ]
    });

    const [isSaving, setIsSaving] = useState(false);
    const [isSaved, setIsSaved] = useState(false);

    // Demo patient data
    const patient = {
        name: 'John Doe',
        age: 35,
        gender: 'Male',
        appointmentDate: 'Jan 16, 2026',
        symptoms: ['Chest Pain', 'Fatigue'],
        allergies: 'Penicillin'
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handlePrescriptionChange = (index, field, value) => {
        const updated = [...formData.prescriptions];
        updated[index][field] = value;
        setFormData({ ...formData, prescriptions: updated });
    };

    const addPrescription = () => {
        setFormData({
            ...formData,
            prescriptions: [
                ...formData.prescriptions,
                { medication: '', dosage: '', frequency: '', duration: '', instructions: '' }
            ]
        });
    };

    const removePrescription = (index) => {
        if (formData.prescriptions.length > 1) {
            const updated = formData.prescriptions.filter((_, i) => i !== index);
            setFormData({ ...formData, prescriptions: updated });
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSaving(true);

        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1500));

        console.log('Prescription saved:', {
            appointmentId,
            doctorId: user?.id,
            ...formData
        });

        setIsSaving(false);
        setIsSaved(true);
    };

    const downloadPDF = () => {
        // Generate simple text file for demo
        const content = `
E-PRESCRIPTION
==============
Date: ${new Date().toLocaleDateString()}
Appointment ID: ${appointmentId}

PATIENT INFORMATION
-------------------
Name: ${patient.name}
Age: ${patient.age} | Gender: ${patient.gender}
Known Allergies: ${patient.allergies}

DIAGNOSIS
---------
${formData.diagnosis}

CLINICAL NOTES
--------------
${formData.notes}

PRESCRIPTIONS
-------------
${formData.prescriptions.map((rx, i) => `
${i + 1}. ${rx.medication}
   Dosage: ${rx.dosage}
   Frequency: ${rx.frequency}
   Duration: ${rx.duration}
   Instructions: ${rx.instructions}
`).join('\n')}

FOLLOW-UP
---------
${formData.followUp}

---
Dr. ${user?.firstName || 'Doctor'} ${user?.lastName || ''}
HealthSync Telehealth
        `.trim();

        const blob = new Blob([content], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `prescription-${appointmentId}.txt`;
        a.click();
        URL.revokeObjectURL(url);
    };

    return (
        <div className="prescription-page">
            <div className="container">
                <div className="prescription-header">
                    <div className="header-left">
                        <h1>📝 E-Prescription</h1>
                        <p className="text-secondary">Create prescription for patient consultation</p>
                    </div>
                    <button onClick={() => navigate(-1)} className="btn btn-secondary">
                        ← Back
                    </button>
                </div>

                {/* Patient Info Card */}
                <div className="patient-info-card">
                    <h3>👤 Patient Information</h3>
                    <div className="patient-grid">
                        <div className="info-item">
                            <span className="label">Name</span>
                            <span className="value">{patient.name}</span>
                        </div>
                        <div className="info-item">
                            <span className="label">Age / Gender</span>
                            <span className="value">{patient.age} yrs / {patient.gender}</span>
                        </div>
                        <div className="info-item">
                            <span className="label">Appointment</span>
                            <span className="value">{patient.appointmentDate}</span>
                        </div>
                        <div className="info-item">
                            <span className="label">Symptoms</span>
                            <span className="value symptoms">
                                {patient.symptoms.map(s => (
                                    <span key={s} className="symptom-tag">{s}</span>
                                ))}
                            </span>
                        </div>
                    </div>
                    <div className="allergy-warning">
                        ⚠️ <strong>Known Allergies:</strong> {patient.allergies}
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="prescription-form">
                    {/* Diagnosis */}
                    <div className="form-section">
                        <h3>🩺 Diagnosis</h3>
                        <textarea
                            name="diagnosis"
                            className="form-input"
                            rows="3"
                            placeholder="Enter primary diagnosis and any secondary conditions..."
                            value={formData.diagnosis}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    {/* Clinical Notes */}
                    <div className="form-section">
                        <h3>📋 Clinical Notes</h3>
                        <textarea
                            name="notes"
                            className="form-input"
                            rows="4"
                            placeholder="Add any observations, examination findings, or additional notes..."
                            value={formData.notes}
                            onChange={handleChange}
                        />
                    </div>

                    {/* Prescriptions */}
                    <div className="form-section">
                        <div className="section-header">
                            <h3>💊 Prescriptions</h3>
                            <button type="button" onClick={addPrescription} className="btn btn-secondary btn-sm">
                                + Add Medication
                            </button>
                        </div>

                        {formData.prescriptions.map((rx, index) => (
                            <div key={index} className="prescription-row">
                                <div className="rx-number">{index + 1}</div>
                                <div className="rx-fields">
                                    <input
                                        type="text"
                                        className="form-input"
                                        placeholder="Medication name"
                                        value={rx.medication}
                                        onChange={(e) => handlePrescriptionChange(index, 'medication', e.target.value)}
                                        required
                                    />
                                    <input
                                        type="text"
                                        className="form-input"
                                        placeholder="Dosage (e.g., 500mg)"
                                        value={rx.dosage}
                                        onChange={(e) => handlePrescriptionChange(index, 'dosage', e.target.value)}
                                        required
                                    />
                                    <select
                                        className="form-input"
                                        value={rx.frequency}
                                        onChange={(e) => handlePrescriptionChange(index, 'frequency', e.target.value)}
                                        required
                                    >
                                        <option value="">Frequency</option>
                                        <option value="Once daily">Once daily</option>
                                        <option value="Twice daily">Twice daily</option>
                                        <option value="Three times daily">Three times daily</option>
                                        <option value="As needed">As needed</option>
                                        <option value="Before meals">Before meals</option>
                                        <option value="After meals">After meals</option>
                                    </select>
                                    <input
                                        type="text"
                                        className="form-input"
                                        placeholder="Duration (e.g., 7 days)"
                                        value={rx.duration}
                                        onChange={(e) => handlePrescriptionChange(index, 'duration', e.target.value)}
                                        required
                                    />
                                    <input
                                        type="text"
                                        className="form-input full-width"
                                        placeholder="Special instructions"
                                        value={rx.instructions}
                                        onChange={(e) => handlePrescriptionChange(index, 'instructions', e.target.value)}
                                    />
                                </div>
                                {formData.prescriptions.length > 1 && (
                                    <button
                                        type="button"
                                        className="remove-btn"
                                        onClick={() => removePrescription(index)}
                                    >
                                        ✕
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>

                    {/* Follow-up */}
                    <div className="form-section">
                        <h3>📅 Follow-up Recommendations</h3>
                        <input
                            type="text"
                            name="followUp"
                            className="form-input"
                            placeholder="e.g., Follow up in 2 weeks, or if symptoms persist"
                            value={formData.followUp}
                            onChange={handleChange}
                        />
                    </div>

                    {/* Actions */}
                    <div className="form-actions">
                        {!isSaved ? (
                            <>
                                <button type="submit" className="btn btn-primary" disabled={isSaving}>
                                    {isSaving ? '⏳ Saving...' : '✅ Save Prescription'}
                                </button>
                                <button type="button" className="btn btn-secondary" onClick={downloadPDF}>
                                    📄 Download PDF
                                </button>
                            </>
                        ) : (
                            <div className="success-message">
                                <span className="success-icon">✅</span>
                                <span>Prescription saved successfully!</span>
                                <button onClick={downloadPDF} className="btn btn-primary">
                                    📄 Download PDF
                                </button>
                                <button onClick={() => navigate(`/summary/${appointmentId}`)} className="btn btn-secondary">
                                    View Summary
                                </button>
                            </div>
                        )}
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EPrescription;
