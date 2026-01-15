import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './WaitingRoom.css';

const WaitingRoom = () => {
    const { appointmentId } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();

    const [status, setStatus] = useState('waiting');
    const [queuePosition, setQueuePosition] = useState(2);
    const [estimatedWait, setEstimatedWait] = useState(5);
    const [countdown, setCountdown] = useState(null);

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
            setCountdown(10);
        }, 10000);

        return () => {
            clearInterval(checkInterval);
            clearTimeout(doctorJoinTimeout);
        };
    }, []);

    useEffect(() => {
        if (countdown !== null && countdown > 0) {
            const timer = setTimeout(() => {
                setCountdown(countdown - 1);
            }, 1000);
            return () => clearTimeout(timer);
        } else if (countdown === 0) {
            joinCall();
        }
    }, [countdown]);

    const joinCall = () => {
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
                                <div className="doc-avatar">👨‍⚕️</div>
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

                    {/* Join Button */}
                    <button
                        className={`btn btn-primary btn-lg join-btn ${status === 'ready' ? 'pulse' : ''}`}
                        onClick={joinCall}
                        disabled={status === 'waiting'}
                    >
                        {status === 'waiting' ? (
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
