import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './PatientIntake.css';

const PatientIntake = () => {
    const { user, isAuthenticated } = useAuth();
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        reasonForVisit: '',
        symptoms: [],
        symptomDuration: '',
        allergies: '',
        currentMedications: '',
        preferredSpecialty: '',
        urgency: 'routine'
    });
    const [currentStep, setCurrentStep] = useState(1);

    const symptomOptions = [
        'Fever', 'Headache', 'Cough', 'Fatigue', 'Chest Pain',
        'Shortness of Breath', 'Skin Rash', 'Joint Pain', 'Anxiety',
        'Depression', 'Stomach Pain', 'Nausea', 'Back Pain', 'Other'
    ];

    const specialties = [
        { value: 'General Physician', desc: 'For general health concerns' },
        { value: 'Cardiologist', desc: 'Heart and cardiovascular issues' },
        { value: 'Dermatologist', desc: 'Skin, hair, and nail conditions' },
        { value: 'Orthopedic', desc: 'Bone, joint, and muscle problems' },
        { value: 'Pediatrician', desc: 'Child healthcare' },
        { value: 'Psychiatrist', desc: 'Mental health and wellness' }
    ];

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSymptomToggle = (symptom) => {
        setFormData(prev => ({
            ...prev,
            symptoms: prev.symptoms.includes(symptom)
                ? prev.symptoms.filter(s => s !== symptom)
                : [...prev.symptoms, symptom]
        }));
    };

    const handleNext = () => {
        if (currentStep < 3) {
            setCurrentStep(currentStep + 1);
        }
    };

    const handleBack = () => {
        if (currentStep > 1) {
            setCurrentStep(currentStep - 1);
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        // Store intake data in session/localStorage for booking page
        sessionStorage.setItem('patientIntake', JSON.stringify(formData));
        navigate(`/doctors?specialty=${encodeURIComponent(formData.preferredSpecialty)}`);
    };

    if (!isAuthenticated) {
        return (
            <div className="intake-page">
                <div className="container">
                    <div className="auth-required">
                        <h2>Login Required</h2>
                        <p>Please login or create an account to book a consultation.</p>
                        <button onClick={() => navigate('/login')} className="btn btn-primary">
                            Login to Continue
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="intake-page">
            <div className="container">
                <div className="intake-header">
                    <h1>Patient Intake Form</h1>
                    <p className="text-secondary">
                        Help us understand your health concerns to connect you with the right doctor
                    </p>

                    {/* Progress Steps */}
                    <div className="progress-steps">
                        <div className={`step ${currentStep >= 1 ? 'active' : ''}`}>
                            <span className="step-num">1</span>
                            <span className="step-label">Symptoms</span>
                        </div>
                        <div className="step-line"></div>
                        <div className={`step ${currentStep >= 2 ? 'active' : ''}`}>
                            <span className="step-num">2</span>
                            <span className="step-label">History</span>
                        </div>
                        <div className="step-line"></div>
                        <div className={`step ${currentStep >= 3 ? 'active' : ''}`}>
                            <span className="step-num">3</span>
                            <span className="step-label">Specialty</span>
                        </div>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="intake-form">
                    {/* Step 1: Symptoms */}
                    {currentStep === 1 && (
                        <div className="form-step animate-fadeIn">
                            <h2>What brings you in today?</h2>

                            <div className="form-group">
                                <label className="form-label">Reason for Visit *</label>
                                <textarea
                                    name="reasonForVisit"
                                    className="form-input"
                                    rows="3"
                                    placeholder="Briefly describe your main health concern..."
                                    value={formData.reasonForVisit}
                                    onChange={handleChange}
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label className="form-label">Select your symptoms (if any)</label>
                                <div className="symptom-grid">
                                    {symptomOptions.map(symptom => (
                                        <button
                                            key={symptom}
                                            type="button"
                                            className={`symptom-chip ${formData.symptoms.includes(symptom) ? 'selected' : ''}`}
                                            onClick={() => handleSymptomToggle(symptom)}
                                        >
                                            {symptom}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="form-group">
                                <label className="form-label">How long have you had these symptoms?</label>
                                <select
                                    name="symptomDuration"
                                    className="form-input"
                                    value={formData.symptomDuration}
                                    onChange={handleChange}
                                >
                                    <option value="">Select duration</option>
                                    <option value="today">Just today</option>
                                    <option value="few_days">A few days</option>
                                    <option value="week">About a week</option>
                                    <option value="weeks">2-4 weeks</option>
                                    <option value="month">More than a month</option>
                                    <option value="chronic">Ongoing/Chronic</option>
                                </select>
                            </div>

                            <div className="form-actions">
                                <button type="button" className="btn btn-primary" onClick={handleNext}>
                                    Continue →
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Step 2: Medical History */}
                    {currentStep === 2 && (
                        <div className="form-step animate-fadeIn">
                            <h2>Medical History</h2>

                            <div className="form-group">
                                <label className="form-label">Any known allergies?</label>
                                <input
                                    type="text"
                                    name="allergies"
                                    className="form-input"
                                    placeholder="e.g., Penicillin, Peanuts, None"
                                    value={formData.allergies}
                                    onChange={handleChange}
                                />
                            </div>

                            <div className="form-group">
                                <label className="form-label">Current medications (if any)</label>
                                <textarea
                                    name="currentMedications"
                                    className="form-input"
                                    rows="3"
                                    placeholder="List any medications you're currently taking..."
                                    value={formData.currentMedications}
                                    onChange={handleChange}
                                />
                            </div>

                            <div className="form-group">
                                <label className="form-label">How urgent is this consultation?</label>
                                <div className="urgency-options">
                                    {[
                                        { value: 'routine', label: 'Routine', desc: 'Can wait a few days' },
                                        { value: 'soon', label: 'Soon', desc: 'Within 24-48 hours' },
                                        { value: 'urgent', label: 'Urgent', desc: 'As soon as possible' }
                                    ].map(option => (
                                        <label
                                            key={option.value}
                                            className={`urgency-option ${formData.urgency === option.value ? 'selected' : ''}`}
                                        >
                                            <input
                                                type="radio"
                                                name="urgency"
                                                value={option.value}
                                                checked={formData.urgency === option.value}
                                                onChange={handleChange}
                                            />
                                            <div>
                                                <span className="urgency-label">{option.label}</span>
                                                <span className="urgency-desc">{option.desc}</span>
                                            </div>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            <div className="form-actions">
                                <button type="button" className="btn btn-secondary" onClick={handleBack}>
                                    ← Back
                                </button>
                                <button type="button" className="btn btn-primary" onClick={handleNext}>
                                    Continue →
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Step 3: Specialty Selection */}
                    {currentStep === 3 && (
                        <div className="form-step animate-fadeIn">
                            <h2>Choose a Specialty</h2>
                            <p className="text-secondary mb-lg">
                                Based on your symptoms, select the type of specialist you'd like to consult
                            </p>

                            <div className="specialty-grid">
                                {specialties.map(spec => (
                                    <label
                                        key={spec.value}
                                        className={`specialty-card ${formData.preferredSpecialty === spec.value ? 'selected' : ''}`}
                                    >
                                        <input
                                            type="radio"
                                            name="preferredSpecialty"
                                            value={spec.value}
                                            checked={formData.preferredSpecialty === spec.value}
                                            onChange={handleChange}
                                        />
                                        <div className="specialty-content">
                                            <span className="specialty-name">{spec.value}</span>
                                            <span className="specialty-desc">{spec.desc}</span>
                                        </div>
                                    </label>
                                ))}
                            </div>

                            <div className="form-actions">
                                <button type="button" className="btn btn-secondary" onClick={handleBack}>
                                    ← Back
                                </button>
                                <button
                                    type="submit"
                                    className="btn btn-primary"
                                    disabled={!formData.preferredSpecialty}
                                >
                                    Find Doctors →
                                </button>
                            </div>
                        </div>
                    )}
                </form>
            </div>
        </div>
    );
};

export default PatientIntake;
