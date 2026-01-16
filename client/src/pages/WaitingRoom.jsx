import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import './WaitingRoom.css';

// Import doctor avatar
import doctorFemale from '../assets/images/doctor_avatar_female_1768411074828.png';

// Emotional comfort messages that rotate
const COMFORT_MESSAGES = [
    { emoji: '💚', message: "Your doctor will be with you shortly. Take a deep breath." },
    { emoji: '🌟', message: "Everything is prepared for your consultation." },
    { emoji: '🤝', message: "You're in good hands. Relax and be yourself." },
    { emoji: '📋', message: "Have your questions ready? Jot them down while you wait." },
    { emoji: '💊', message: "Keep your previous prescriptions handy for reference." }
];

const WaitingRoom = () => {
    const { appointmentId } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const { t } = useLanguage();

    const [status, setStatus] = useState('waiting');
    const [queuePosition, setQueuePosition] = useState(2);
    const [estimatedWait, setEstimatedWait] = useState(5);
    const [countdown, setCountdown] = useState(null);

    // Consent and compliance states
    const [hasConsented, setHasConsented] = useState(false);
    const [consentTimestamp, setConsentTimestamp] = useState(null);
    const [currentComfortMessage, setCurrentComfortMessage] = useState(0);

    // Rotate comfort messages
    useEffect(() => {
        const messageInterval = setInterval(() => {
            setCurrentComfortMessage(prev => (prev + 1) % COMFORT_MESSAGES.length);
        }, 5000);
        return () => clearInterval(messageInterval);
    }, []);

    useEffect(() => {
        // Simulate doctor availability check
        const checkInterval = setInterval(() => {
            // Simulate queue movement
            if (queuePosition > 0) {
                setQueuePosition(prev => Math.max(0, prev - 1));
                setEstimatedWait(prev => Math.max(1, prev - 2));
            }
        }, 5000);

        // Simulate doctor joining after some time
        const doctorJoinTimeout = setTimeout(() => {
            setStatus('ready');
            if (hasConsented) {
                setCountdown(10);
            }
        }, 10000);

        return () => {
            clearInterval(checkInterval);
            clearTimeout(doctorJoinTimeout);
        };
    }, [hasConsented]);

    useEffect(() => {
        if (countdown !== null && countdown > 0 && hasConsented) {
            const timer = setTimeout(() => {
                setCountdown(countdown - 1);
            }, 1000);
            return () => clearTimeout(timer);
        } else if (countdown === 0 && hasConsented) {
            joinCall();
        }
    }, [countdown, hasConsented]);

    const handleConsentChange = (checked) => {
        setHasConsented(checked);
        if (checked) {
            setConsentTimestamp(new Date().toISOString());
            // Log consent for audit trail
            console.log('Patient consent recorded:', {
                userId: user?.id,
                appointmentId,
                timestamp: new Date().toISOString(),
                consentType: 'video-consultation'
            });
            // Start countdown if doctor is ready
            if (status === 'ready') {
                setCountdown(10);
            }
        } else {
            setConsentTimestamp(null);
            setCountdown(null);
        }
    };

    const joinCall = () => {
        if (!hasConsented) {
            alert('Please provide your consent before joining the consultation.');
            return;
        }
        // Store consent info in session for the video call
        sessionStorage.setItem('consultationConsent', JSON.stringify({
            appointmentId,
            timestamp: consentTimestamp,
            userId: user?.id
        }));
        navigate(`/video/${appointmentId}`);
    };

    return (
        <div className="waiting-room">
            <div className="container">
                <div className="waiting-content">
                    {/* Status Header */}
                    <div className="status-header">
                        {status === 'waiting' ? (
                            <>
                                <div className="status-icon waiting">
                                    <div className="pulse-ring"></div>
                                    <span>⏳</span>
                                </div>
                                <h1>Waiting for Doctor</h1>
                                <p className="text-secondary">
                                    Your doctor will join shortly. Please stay on this page.
                                </p>
                            </>
                        ) : (
                            <>
                                <div className="status-icon ready">
                                    <span>✅</span>
                                </div>
                                <h1>Doctor is Ready!</h1>
                                <p className="text-secondary">
                                    {countdown !== null
                                        ? `Joining automatically in ${countdown} seconds...`
                                        : 'Click the button below to join your consultation'}
                                </p>
                            </>
                        )}
                    </div>

                    {/* Queue Status */}
                    {status === 'waiting' && (
                        <div className="queue-info">
                            <div className="queue-card">
                                <div className="queue-stat">
                                    <span className="stat-value">{queuePosition}</span>
                                    <span className="stat-label">Patients Ahead</span>
                                </div>
                                <div className="queue-divider"></div>
                                <div className="queue-stat">
                                    <span className="stat-value">~{estimatedWait}</span>
                                    <span className="stat-label">Minutes Wait</span>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Doctor Info */}
                    <div className="doctor-preview">
                        <div className="preview-card">
                            <div className="preview-header">
                                <img src={doctorFemale} alt="Dr. Sarah Johnson" className="doc-avatar-img" />
                                <div>
                                    <h3>Dr. Sarah Johnson</h3>
                                    <p>Cardiologist</p>
                                </div>
                                <span className={`status-badge ${status === 'ready' ? 'online' : 'busy'}`}>
                                    {status === 'ready' ? '🟢 Online' : '🟡 In Session'}
                                </span>
                            </div>

                            <div className="preview-body">
                                <p>Your scheduled consultation</p>
                                <div className="appointment-details">
                                    <span>📅 Today</span>
                                    <span>⏰ 10:00 AM</span>
                                    <span>📹 Video Call</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Pre-call Checklist */}
                    <div className="checklist">
                        <h3>Before Your Call</h3>
                        <div className="checklist-items">
                            <label className="checklist-item">
                                <input type="checkbox" defaultChecked />
                                <span>Camera is working</span>
                            </label>
                            <label className="checklist-item">
                                <input type="checkbox" defaultChecked />
                                <span>Microphone is working</span>
                            </label>
                            <label className="checklist-item">
                                <input type="checkbox" defaultChecked />
                                <span>Stable internet connection</span>
                            </label>
                            <label className="checklist-item">
                                <input type="checkbox" />
                                <span>In a quiet, private space</span>
                            </label>
                        </div>
                    </div>

                    {/* Consent Section - Healthcare Compliance */}
                    <div className="consent-section">
                        <div className="consent-header">
                            <span className="lock-icon">🔒</span>
                            <h3>Privacy & Consent</h3>
                        </div>
                        <div className="consent-content">
                            <label className={`consent-checkbox ${hasConsented ? 'checked' : ''}`}>
                                <input
                                    type="checkbox"
                                    checked={hasConsented}
                                    onChange={(e) => handleConsentChange(e.target.checked)}
                                />
                                <span className="checkmark"></span>
                                <div className="consent-text">
                                    <strong>I consent to this video consultation</strong>
                                    <p>I understand that this session may be recorded and transcribed for medical documentation purposes. My health information will be handled securely in accordance with privacy regulations.</p>
                                </div>
                            </label>
                            {consentTimestamp && (
                                <div className="consent-timestamp">
                                    ✓ Consent recorded at {new Date(consentTimestamp).toLocaleTimeString()}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Emotional Comfort Message */}
                    <div className="comfort-message">
                        <span className="comfort-emoji">{COMFORT_MESSAGES[currentComfortMessage].emoji}</span>
                        <p>{COMFORT_MESSAGES[currentComfortMessage].message}</p>
                    </div>

                    {/* Demo Mode Banner */}
                    <div className="demo-banner">
                        <span className="demo-icon">⚠️</span>
                        <div>
                            <strong>DEMO MODE</strong>
                            <p>This is a demonstration. Do not enter real medical information.</p>
                        </div>
                    </div>

                    {/* Join Button */}
                    <button
                        className={`btn btn-primary btn-lg join-btn ${status === 'ready' && hasConsented ? 'pulse' : ''}`}
                        onClick={joinCall}
                        disabled={status === 'waiting' || !hasConsented}
                    >
                        {!hasConsented ? (
                            '✋ Please provide consent above'
                        ) : status === 'waiting' ? (
                            'Waiting for doctor...'
                        ) : (
                            <>
                                Join Consultation Now
                                {countdown !== null && <span className="countdown">({countdown})</span>}
                            </>
                        )}
                    </button>

                    {/* Tips */}
                    <div className="tips">
                        <h4>💡 Tips for a great consultation</h4>
                        <ul>
                            <li>Have your medical records or previous prescriptions ready</li>
                            <li>Write down your questions beforehand</li>
                            <li>Ensure good lighting so the doctor can see you clearly</li>
                            <li>Keep a pen and paper for notes</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default WaitingRoom;
