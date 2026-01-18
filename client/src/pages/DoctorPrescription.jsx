import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { downloadPrescriptionPDF } from '../utils/pdfGenerator';
import './DoctorPrescription.css';

const DoctorPrescription = () => {
    const { appointmentId } = useParams();
    const { user } = useAuth();
    const navigate = useNavigate();

    const [prescription, setPrescription] = useState({
        chiefComplaint: '',
        diagnosis: '',
        medications: [{ name: '', dosage: '', frequency: '', duration: '' }],
        labTests: '',
        advice: '',
        followUpDays: ''
    });
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);

    // Get patient info from session
    const patientInfo = JSON.parse(sessionStorage.getItem('appointmentDoctor') || '{}');

    const addMedication = () => {
        setPrescription(prev => ({
            ...prev,
            medications: [...prev.medications, { name: '', dosage: '', frequency: '', duration: '' }]
        }));
    };

    const removeMedication = (index) => {
        setPrescription(prev => ({
            ...prev,
            medications: prev.medications.filter((_, i) => i !== index)
        }));
    };

    const updateMedication = (index, field, value) => {
        setPrescription(prev => ({
            ...prev,
            medications: prev.medications.map((med, i) =>
                i === index ? { ...med, [field]: value } : med
            )
        }));
    };

    const handleDownloadPDF = () => {
        try {
            const prescriptionData = {
                id: `RX-${Date.now()}`,
                appointmentId,
                doctor: user?.firstName ? `Dr. ${user.firstName} ${user.lastName}` : 'Dr. Sarah Johnson',
                specialty: 'General Physician',
                patient: patientInfo.name || 'Patient',
                date: new Date().toLocaleDateString('en-US', {
                    month: 'short', day: 'numeric', year: 'numeric'
                }),
                ...prescription
            };
            downloadPrescriptionPDF(prescriptionData);
        } catch (err) {
            console.error('PDF generation error:', err);
            alert('Failed to download PDF: ' + err.message);
        }
    };

    const handleSave = async () => {
        setSaving(true);

        // Create prescription object
        const prescriptionData = {
            id: `rx-${Date.now()}`,
            appointmentId,
            doctor: user?.firstName ? `Dr. ${user.firstName} ${user.lastName}` : 'Dr. Sarah Johnson',
            specialty: 'General Physician',
            patient: patientInfo.name || 'Patient',
            date: new Date().toLocaleDateString('en-US', {
                month: 'short', day: 'numeric', year: 'numeric'
            }),
            ...prescription,
            createdAt: new Date().toISOString()
        };

        // Save to localStorage
        try {
            const existingRx = JSON.parse(localStorage.getItem('healthsync_prescriptions') || '[]');
            existingRx.push(prescriptionData);
            localStorage.setItem('healthsync_prescriptions', JSON.stringify(existingRx));

            // Also update the appointment in past consultations
            const pastConsults = JSON.parse(localStorage.getItem('healthsync_past') || '[]');
            const updatedPast = pastConsults.map(apt =>
                apt.id === appointmentId
                    ? { ...apt, diagnosis: prescription.diagnosis, hasPrescription: true }
                    : apt
            );
            localStorage.setItem('healthsync_past', JSON.stringify(updatedPast));

            setSaved(true);

            // Download PDF automatically
            downloadPrescriptionPDF(prescriptionData);

            // Simulate sending notification
            setTimeout(() => {
                alert('✅ Prescription saved and PDF downloaded!');
                navigate(`/summary/${appointmentId}`);
            }, 1000);
        } catch (err) {
            console.error('Error saving prescription:', err);
            alert('Failed to save prescription');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="prescription-page">
            <div className="container">
                <div className="prescription-header">
                    <h1>📝 Write Prescription</h1>
                    <p>Patient: {patientInfo.name || 'Patient'} | Appointment: #{appointmentId?.slice(-6)}</p>
                </div>

                <div className="prescription-form">
                    {/* Chief Complaint */}
                    <div className="form-section">
                        <label className="form-label">Chief Complaint</label>
                        <textarea
                            placeholder="Patient's main reason for visit..."
                            value={prescription.chiefComplaint}
                            onChange={(e) => setPrescription(p => ({ ...p, chiefComplaint: e.target.value }))}
                            rows={2}
                        />
                    </div>

                    {/* Diagnosis */}
                    <div className="form-section">
                        <label className="form-label">Diagnosis</label>
                        <textarea
                            placeholder="Your diagnosis..."
                            value={prescription.diagnosis}
                            onChange={(e) => setPrescription(p => ({ ...p, diagnosis: e.target.value }))}
                            rows={2}
                        />
                    </div>

                    {/* Medications */}
                    <div className="form-section">
                        <div className="section-header">
                            <label className="form-label">💊 Prescribed Medications</label>
                            <button type="button" className="btn btn-secondary btn-sm" onClick={addMedication}>
                                + Add Medication
                            </button>
                        </div>

                        {prescription.medications.map((med, idx) => (
                            <div key={idx} className="medication-row">
                                <input
                                    type="text"
                                    placeholder="Medicine name"
                                    value={med.name}
                                    onChange={(e) => updateMedication(idx, 'name', e.target.value)}
                                />
                                <input
                                    type="text"
                                    placeholder="Dosage (e.g., 500mg)"
                                    value={med.dosage}
                                    onChange={(e) => updateMedication(idx, 'dosage', e.target.value)}
                                />
                                <select
                                    value={med.frequency}
                                    onChange={(e) => updateMedication(idx, 'frequency', e.target.value)}
                                >
                                    <option value="">Frequency</option>
                                    <option value="Once daily">Once daily</option>
                                    <option value="Twice daily">Twice daily</option>
                                    <option value="Three times daily">Three times daily</option>
                                    <option value="As needed">As needed</option>
                                    <option value="Before meals">Before meals</option>
                                    <option value="After meals">After meals</option>
                                    <option value="At bedtime">At bedtime</option>
                                </select>
                                <input
                                    type="text"
                                    placeholder="Duration (e.g., 7 days)"
                                    value={med.duration}
                                    onChange={(e) => updateMedication(idx, 'duration', e.target.value)}
                                />
                                {prescription.medications.length > 1 && (
                                    <button
                                        type="button"
                                        className="btn-remove"
                                        onClick={() => removeMedication(idx)}
                                    >
                                        ✕
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>

                    {/* Lab Tests */}
                    <div className="form-section">
                        <label className="form-label">🧪 Recommended Lab Tests</label>
                        <textarea
                            placeholder="E.g., Complete Blood Count, Lipid Profile, HbA1c..."
                            value={prescription.labTests}
                            onChange={(e) => setPrescription(p => ({ ...p, labTests: e.target.value }))}
                            rows={2}
                        />
                    </div>

                    {/* Advice */}
                    <div className="form-section">
                        <label className="form-label">📋 Advice & Instructions</label>
                        <textarea
                            placeholder="Diet recommendations, lifestyle changes, precautions..."
                            value={prescription.advice}
                            onChange={(e) => setPrescription(p => ({ ...p, advice: e.target.value }))}
                            rows={3}
                        />
                    </div>

                    {/* Follow-up */}
                    <div className="form-section">
                        <label className="form-label">📅 Follow-up</label>
                        <div className="follow-up-row">
                            <span>Schedule follow-up in</span>
                            <input
                                type="number"
                                placeholder="7"
                                value={prescription.followUpDays}
                                onChange={(e) => setPrescription(p => ({ ...p, followUpDays: e.target.value }))}
                                min="1"
                                max="90"
                            />
                            <span>days</span>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="form-actions">
                        <button
                            className="btn btn-secondary"
                            onClick={() => navigate(-1)}
                            disabled={saving}
                        >
                            Cancel
                        </button>
                        <button
                            className="btn btn-outline"
                            onClick={handleDownloadPDF}
                            disabled={!prescription.diagnosis}
                        >
                            📄 Download PDF
                        </button>
                        <button
                            className="btn btn-primary btn-lg"
                            onClick={handleSave}
                            disabled={saving || !prescription.diagnosis}
                        >
                            {saving ? (
                                <>
                                    <span className="spinner-small"></span>
                                    Saving...
                                </>
                            ) : saved ? (
                                '✅ Saved!'
                            ) : (
                                '💾 Save & Download PDF'
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DoctorPrescription;
