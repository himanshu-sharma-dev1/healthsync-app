import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import DailyIframe from '@daily-co/daily-js';
import { io } from 'socket.io-client';
import './VideoCall.css';

// Helper to extract base URL (removes /api suffix if present)
const getBaseUrl = (apiUrl) => {
    if (!apiUrl) return 'http://localhost:5000';
    return apiUrl.replace(/\/api\/?$/, '');
};

const API_URL_ENV = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
const BASE_URL = getBaseUrl(API_URL_ENV);
const SOCKET_URL = BASE_URL;
// Replace http/https with ws/wss
const WS_URL = BASE_URL.replace(/^http/, 'ws');

// Medical term categories for highlighting
const MEDICAL_TERMS = {
    symptoms: [
        'pain', 'fever', 'headache', 'nausea', 'dizziness', 'fatigue', 'cough',
        'shortness of breath', 'chest pain', 'anxiety', 'depression', 'insomnia',
        'swelling', 'rash', 'itching', 'burning', 'numbness', 'weakness',
        'vomiting', 'diarrhea', 'constipation', 'bleeding', 'discharge'
    ],
    medications: [
        'aspirin', 'ibuprofen', 'paracetamol', 'acetaminophen', 'antibiotic',
        'amoxicillin', 'metformin', 'lisinopril', 'atorvastatin', 'omeprazole',
        'amlodipine', 'metoprolol', 'losartan', 'gabapentin', 'prednisone',
        'medicine', 'medication', 'prescription', 'tablet', 'capsule', 'syrup'
    ],
    dosages: [
        'mg', 'ml', 'gram', 'microgram', 'twice daily', 'once daily', 'three times',
        'before meals', 'after meals', 'morning', 'evening', 'bedtime', 'hourly',
        '500mg', '250mg', '100mg', '50mg', '10mg', '5mg', 'dosage', 'dose'
    ],
    critical: [
        'allergic', 'allergy', 'emergency', 'severe', 'acute', 'chronic',
        'immediately', 'urgent', 'critical', 'dangerous', 'warning', 'stop',
        'serious', 'fatal', 'risk', 'reaction', 'side effect'
    ]
};

// Function to highlight medical terms in transcript text
const highlightMedicalTerms = (text) => {
    if (!text) return [];

    const words = text.split(/(\s+)/);
    const result = [];

    words.forEach((word, index) => {
        const cleanWord = word.toLowerCase().replace(/[.,!?]/g, '');
        let type = null;

        if (MEDICAL_TERMS.critical.some(term => cleanWord.includes(term))) {
            type = 'critical';
        } else if (MEDICAL_TERMS.symptoms.some(term => cleanWord.includes(term))) {
            type = 'symptom';
        } else if (MEDICAL_TERMS.medications.some(term => cleanWord.includes(term))) {
            type = 'medication';
        } else if (MEDICAL_TERMS.dosages.some(term => cleanWord.includes(term))) {
            type = 'dosage';
        }

        result.push({ text: word, type, key: index });
    });

    return result;
};

const VideoCall = () => {
    const { appointmentId } = useParams();
    const { user } = useAuth();
    const navigate = useNavigate();

    // Video call states
    const [callFrame, setCallFrame] = useState(null);
    const [isConnected, setIsConnected] = useState(false);
    const [isMuted, setIsMuted] = useState(false);
    const [isVideoOff, setIsVideoOff] = useState(false);
    const [callDuration, setCallDuration] = useState(0);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    // Chat states
    const [socket, setSocket] = useState(null);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [showChat, setShowChat] = useState(false);
    const [isTyping, setIsTyping] = useState(false);
    const [remoteIsTyping, setRemoteIsTyping] = useState(false);

    // Network quality state
    const [networkQuality, setNetworkQuality] = useState('good'); // 'good', 'fair', 'poor'

    // Transcription states
    const [transcription, setTranscription] = useState([]);
    const [isTranscribing, setIsTranscribing] = useState(false);
    const [showTranscription, setShowTranscription] = useState(false);
    const transcriptionWsRef = useRef(null);

    const videoContainerRef = useRef(null);
    const timerRef = useRef(null);
    const chatEndRef = useRef(null);
    const transcriptionEndRef = useRef(null);
    const typingTimeoutRef = useRef(null);

    // Format timestamp for chat messages
    const formatMessageTime = (timestamp) => {
        if (!timestamp) return '';
        const date = new Date(timestamp);
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    // Initialize Socket.io connection
    useEffect(() => {
        const newSocket = io(SOCKET_URL, {
            transports: ['websocket', 'polling']
        });

        newSocket.on('connect', () => {
            console.log('Socket connected');
            newSocket.emit('join-room', appointmentId);
        });

        newSocket.on('new-message', (message) => {
            setMessages(prev => [...prev, message]);
        });

        // Listen for typing indicator from remote user
        newSocket.on('user-typing', (data) => {
            if (data.isTyping) {
                setRemoteIsTyping(true);
                // Clear typing indicator after 3 seconds
                setTimeout(() => setRemoteIsTyping(false), 3000);
            } else {
                setRemoteIsTyping(false);
            }
        });

        newSocket.on('disconnect', () => {
            console.log('Socket disconnected');
        });

        setSocket(newSocket);

        return () => {
            newSocket.close();
        };
    }, [appointmentId]);

    // Initialize Daily.co video call
    useEffect(() => {
        initializeCall();
        return () => {
            if (callFrame) {
                callFrame.destroy();
            }
            if (timerRef.current) {
                clearInterval(timerRef.current);
            }
        };
    }, []);

    const initializeCall = async () => {
        try {
            setIsLoading(true);

            // For demo: Create a demo room URL
            // In production, this would come from your backend
            const demoRoomUrl = `https://healthsync.daily.co/demo-room-${appointmentId}`;

            // Check if Daily.co is available (it might not work without API key)
            const frame = DailyIframe.createFrame(videoContainerRef.current, {
                showLeaveButton: false,
                showFullscreenButton: true,
                iframeStyle: {
                    width: '100%',
                    height: '100%',
                    border: 'none',
                    borderRadius: '16px'
                }
            });

            frame.on('joined-meeting', () => {
                setIsConnected(true);
                setIsLoading(false);
                startTimer();
            });

            frame.on('left-meeting', () => {
                handleEndCall();
            });

            frame.on('error', (error) => {
                console.error('Daily.co error:', error);
                setError('Video connection failed. Using demo mode.');
                setIsLoading(false);
                // Fall back to demo mode
                setIsConnected(true);
                startTimer();
            });

            // Listen for network quality changes
            frame.on('network-quality-change', (event) => {
                const quality = event?.threshold;
                if (quality === 'good' || quality === 'low') {
                    setNetworkQuality(quality === 'low' ? 'poor' : 'good');
                } else if (quality === 'very-low') {
                    setNetworkQuality('poor');
                } else {
                    // Simulate network quality for demo
                    const rand = Math.random();
                    setNetworkQuality(rand > 0.7 ? 'good' : rand > 0.3 ? 'fair' : 'poor');
                }
            });

            setCallFrame(frame);

            // In demo mode, simulate connection after 2 seconds
            // In production, you would call: frame.join({ url: roomUrl })
            setTimeout(() => {
                if (!isConnected) {
                    setIsConnected(true);
                    setIsLoading(false);
                    startTimer();
                }
            }, 2000);

        } catch (err) {
            console.error('Failed to initialize call:', err);
            setError('Failed to initialize video. Using demo mode.');
            setIsLoading(false);
            setIsConnected(true);
            startTimer();
        }
    };

    const startTimer = () => {
        timerRef.current = setInterval(() => {
            setCallDuration(prev => prev + 1);
        }, 1000);
    };

    const formatDuration = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    const toggleMute = useCallback(() => {
        if (callFrame) {
            callFrame.setLocalAudio(!isMuted);
        }
        setIsMuted(!isMuted);
    }, [callFrame, isMuted]);

    const toggleVideo = useCallback(() => {
        if (callFrame) {
            callFrame.setLocalVideo(!isVideoOff);
        }
        setIsVideoOff(!isVideoOff);
    }, [callFrame, isVideoOff]);

    const handleEndCall = async () => {
        if (timerRef.current) {
            clearInterval(timerRef.current);
        }
        if (callFrame) {
            await callFrame.leave();
            callFrame.destroy();
        }
        if (socket) {
            socket.close();
        }
        navigate('/appointments');
    };

    const handleSendMessage = (e) => {
        e.preventDefault();
        if (newMessage.trim() && socket) {
            const message = {
                sender: user?.firstName || 'You',
                message: newMessage,
                timestamp: new Date()
            };
            socket.emit('chat-message', {
                roomId: appointmentId,
                ...message
            });
            setNewMessage('');
        }
    };

    // Auto-scroll chat
    useEffect(() => {
        if (chatEndRef.current) {
            chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [messages]);

    return (
        <div className="video-call-page">
            {/* Main Video Area */}
            <div className="video-container">
                {/* Video Frame */}
                <div className="video-frame" ref={videoContainerRef}>
                    {isLoading && (
                        <div className="connecting-overlay">
                            <div className="spinner"></div>
                            <p>Connecting to your consultation...</p>
                        </div>
                    )}

                    {error && (
                        <div className="error-notice">
                            <p>⚠️ {error}</p>
                        </div>
                    )}

                    {!isLoading && isConnected && !callFrame && (
                        <div className="demo-video">
                            <div className="remote-video-demo">
                                <div className="placeholder-avatar large">👨‍⚕️</div>
                                <p>Dr. Sarah Johnson</p>
                                <span className="badge badge-success">Connected</span>
                            </div>
                            <div className="local-video-demo">
                                <div className="placeholder-avatar small">
                                    {isVideoOff ? (
                                        <span>{user?.firstName?.[0] || 'Y'}</span>
                                    ) : (
                                        <span>🧑</span>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Call Info */}
                <div className="call-info">
                    <div className="call-status-container">
                        <span className={`status-dot ${isConnected ? 'connected' : 'connecting'}`}></span>
                        <span className="call-status">
                            {isConnected ? 'Connected' : 'Connecting...'}
                        </span>
                    </div>
                    <span className="call-duration">{formatDuration(callDuration)}</span>

                    {/* Network Quality Indicator */}
                    <div className={`network-quality ${networkQuality}`} title={`Network: ${networkQuality}`}>
                        <span className="quality-bars">
                            <span className="bar"></span>
                            <span className="bar"></span>
                            <span className="bar"></span>
                        </span>
                        <span className="quality-label">{networkQuality}</span>
                    </div>
                </div>

                {/* Controls */}
                <div className="video-controls">
                    <button
                        className={`control-btn ${isMuted ? 'active' : ''}`}
                        onClick={toggleMute}
                        title={isMuted ? 'Unmute' : 'Mute'}
                    >
                        <span className="control-icon">{isMuted ? '🔇' : '🎤'}</span>
                        <span className="control-label">{isMuted ? 'Unmute' : 'Mute'}</span>
                    </button>

                    <button
                        className={`control-btn ${isVideoOff ? 'active' : ''}`}
                        onClick={toggleVideo}
                        title={isVideoOff ? 'Turn on camera' : 'Turn off camera'}
                    >
                        <span className="control-icon">{isVideoOff ? '📵' : '📹'}</span>
                        <span className="control-label">{isVideoOff ? 'Start Video' : 'Stop Video'}</span>
                    </button>

                    <button
                        className={`control-btn ${showChat ? 'active' : ''}`}
                        onClick={() => setShowChat(!showChat)}
                        title="Toggle chat"
                    >
                        <span className="control-icon">💬</span>
                        <span className="control-label">Chat</span>
                        {messages.length > 0 && (
                            <span className="message-badge">{messages.length}</span>
                        )}
                    </button>

                    <button
                        className={`control-btn ${showTranscription ? 'active' : ''}`}
                        onClick={() => {
                            setShowTranscription(!showTranscription);
                            if (!showTranscription && transcription.length === 0) {
                                // Add demo transcript for hackathon
                                setTranscription([
                                    { speaker: 'Doctor', text: 'Good morning! How are you feeling today?', time: '00:00' },
                                    { speaker: 'Patient', text: 'I have been experiencing chest pain and shortness of breath for the past few days.', time: '00:05' },
                                    { speaker: 'Doctor', text: 'I understand. Have you taken any medication like aspirin or ibuprofen for the pain?', time: '00:12' },
                                    { speaker: 'Patient', text: 'Yes, I took paracetamol 500mg twice daily but it did not help much.', time: '00:20' },
                                    { speaker: 'Doctor', text: 'Given your symptoms, I recommend we do an ECG. The chest pain could be serious and needs immediate attention.', time: '00:28' }
                                ]);
                                setIsTranscribing(true);
                            }
                        }}
                        title="Toggle transcription"
                    >
                        <span className="control-icon">📝</span>
                        <span className="control-label">Transcript</span>
                        {isTranscribing && (
                            <span className="recording-indicator"></span>
                        )}
                    </button>

                    <button
                        className="control-btn end-call"
                        onClick={handleEndCall}
                        title="End call"
                    >
                        <span className="control-icon">📞</span>
                        <span className="control-label">End Call</span>
                    </button>
                </div>
            </div>

            {/* Chat Sidebar */}
            <div className={`chat-sidebar ${showChat ? 'open' : ''}`}>
                <div className="chat-header">
                    <h3>💬 In-Call Chat</h3>
                    <button className="close-chat" onClick={() => setShowChat(false)}>✕</button>
                </div>

                <div className="chat-messages">
                    {messages.length === 0 ? (
                        <div className="no-messages">
                            <span>💬</span>
                            <p>No messages yet</p>
                            <small>Messages are private to this consultation</small>
                        </div>
                    ) : (
                        messages.map((msg, idx) => (
                            <div
                                key={idx}
                                className={`chat-message ${msg.sender === (user?.firstName || 'You') ? 'own' : ''}`}
                            >
                                <span className="message-sender">{msg.sender}</span>
                                <p className="message-text">{msg.message}</p>
                                <span className="message-time">
                                    {new Date(msg.timestamp).toLocaleTimeString([], {
                                        hour: '2-digit',
                                        minute: '2-digit'
                                    })}
                                </span>
                            </div>
                        ))
                    )}
                    <div ref={chatEndRef} />
                </div>

                <form className="chat-input" onSubmit={handleSendMessage}>
                    <input
                        type="text"
                        placeholder="Type a message..."
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                    />
                    <button type="submit" disabled={!newMessage.trim()}>
                        Send
                    </button>
                </form>
            </div>

            {/* Transcription Panel */}
            <div className={`transcription-panel ${showTranscription ? 'open' : ''}`}>
                <div className="transcription-header">
                    <div className="header-left">
                        <h3>🎙️ Live Transcription</h3>
                        {isTranscribing && (
                            <span className="live-badge">
                                <span className="pulse-dot"></span>
                                LIVE
                            </span>
                        )}
                    </div>
                    <button className="close-transcription" onClick={() => setShowTranscription(false)}>✕</button>
                </div>

                {/* Color Legend */}
                <div className="term-legend">
                    <span className="legend-item symptom">Symptoms</span>
                    <span className="legend-item medication">Medications</span>
                    <span className="legend-item dosage">Dosages</span>
                    <span className="legend-item critical">Critical</span>
                </div>

                <div className="transcription-content">
                    {transcription.length === 0 ? (
                        <div className="no-transcription">
                            <span>🎙️</span>
                            <p>Transcription will appear here</p>
                            <small>Powered by DeepGram AI (nova-2-medical)</small>
                        </div>
                    ) : (
                        transcription.map((entry, idx) => (
                            <div key={idx} className={`transcript-entry ${entry.speaker.toLowerCase()}`}>
                                <div className="entry-header">
                                    <span className="speaker">{entry.speaker}</span>
                                    <span className="timestamp">{entry.time}</span>
                                </div>
                                <p className="entry-text">
                                    {highlightMedicalTerms(entry.text).map(word => (
                                        word.type ? (
                                            <span key={word.key} className={`highlight-${word.type}`}>
                                                {word.text}
                                            </span>
                                        ) : (
                                            <span key={word.key}>{word.text}</span>
                                        )
                                    ))}
                                </p>
                            </div>
                        ))
                    )}
                    <div ref={transcriptionEndRef} />
                </div>

                {/* Transcript Summary */}
                {transcription.length > 0 && (
                    <div className="transcript-summary">
                        <h4>🔍 Key Medical Terms Detected</h4>
                        <div className="summary-tags">
                            <span className="tag symptom">chest pain</span>
                            <span className="tag symptom">shortness of breath</span>
                            <span className="tag medication">paracetamol</span>
                            <span className="tag dosage">500mg</span>
                            <span className="tag critical">serious</span>
                            <span className="tag critical">immediate</span>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default VideoCall;
