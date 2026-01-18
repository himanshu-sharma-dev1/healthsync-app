import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { translateText } from '../services/translateService';
import DailyIframe from '@daily-co/daily-js';
import { io } from 'socket.io-client';
import './VideoCall.css';

// Helper to extract base URL (removes /api suffix if present)
const getBaseUrl = (apiUrl) => {
    if (!apiUrl) return 'http://localhost:5001';
    return apiUrl.replace(/\/api\/?$/, '');
};

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';
const BASE_URL = getBaseUrl(API_URL);
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
    const { appointmentId, roomName } = useParams();
    const { user } = useAuth();
    const navigate = useNavigate();

    // Determine if joining existing room vs creating new
    const isJoiningExistingRoom = !!roomName;

    // Video call states
    const [callFrame, setCallFrame] = useState(null);
    const [isConnected, setIsConnected] = useState(false);
    const [isMuted, setIsMuted] = useState(false);
    const [isVideoOff, setIsVideoOff] = useState(false);
    const [callDuration, setCallDuration] = useState(0);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [localStream, setLocalStream] = useState(null);
    const localVideoRef = useRef(null);

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
    // Translation state for transcription
    const [translateEnabled, setTranslateEnabled] = useState(false);
    const [translatedTexts, setTranslatedTexts] = useState({});

    // Shareable room link state
    const [shareableLink, setShareableLink] = useState('');
    const [linkCopied, setLinkCopied] = useState(false);

    // Emergency detection state
    const [emergencyAlert, setEmergencyAlert] = useState(null);

    const [isTranslationEnabled, setIsTranslationEnabled] = useState(false);
    const [isTranslating, setIsTranslating] = useState(false);
    const { language } = useLanguage();
    const transcriptionWsRef = useRef(null);
    const mediaRecorderRef = useRef(null);
    const audioStreamRef = useRef(null);

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
        // Main socket for chat
        const mainSocket = io(SOCKET_URL, {
            transports: ['websocket', 'polling']
        });

        // Transcription socket (namespace)
        const transcriptionSocket = io(`${SOCKET_URL}/transcription`, {
            transports: ['websocket', 'polling']
        });

        transcriptionWsRef.current = transcriptionSocket;

        mainSocket.on('connect', () => {
            console.log('Main Socket connected');
            mainSocket.emit('join-room', appointmentId);
        });

        mainSocket.on('new-message', (message) => {
            setMessages(prev => [...prev, message]);
        });

        // Listen for typing indicator from remote user
        mainSocket.on('user-typing', (data) => {
            if (data.isTyping) {
                setRemoteIsTyping(true);
                // Clear typing indicator after 3 seconds
                setTimeout(() => setRemoteIsTyping(false), 3000);
            } else {
                setRemoteIsTyping(false);
            }
        });

        mainSocket.on('disconnect', () => {
            console.log('Main Socket disconnected');
        });

        // Transcription socket events
        transcriptionSocket.on('connect', () => {
            console.log('Transcription Socket connected');
        });

        transcriptionSocket.on('transcription-data', (data) => {
            // Only show final results to avoid duplicates from interim results
            if (data.isFinal && data.text?.trim()) {
                setTranscription(prev => [...prev, {
                    speaker: data.speaker || 'Unknown',
                    text: data.text,
                    time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
                }]);

                // AI Emergency Detection - check for critical keywords
                import('../services/aiService').then(({ detectEmergency }) => {
                    const result = detectEmergency(data.text);
                    if (result.isEmergency) {
                        setEmergencyAlert(result);
                        console.log('🚨 EMERGENCY DETECTED:', result);
                    }
                });
            }
        });

        setSocket(mainSocket);

        return () => {
            mainSocket.close();
            transcriptionSocket.close();
        };
    }, [appointmentId]);

    // Initialize Daily.co video call
    const callObjectRef = useRef(null);

    useEffect(() => {
        let isMounted = true;

        const startCall = async () => {
            if (callObjectRef.current) return; // Prevent duplicate

            // Store active call in sessionStorage so navbar can show "Return to Call"
            sessionStorage.setItem('activeVideoCall', JSON.stringify({
                appointmentId,
                startTime: Date.now()
            }));

            await initializeCall();
        };

        startCall();

        return () => {
            isMounted = false;
            const cleanup = async () => {
                if (callObjectRef.current) {
                    await callObjectRef.current.destroy();
                    callObjectRef.current = null;
                }
                if (timerRef.current) {
                    clearInterval(timerRef.current);
                }
            };
            cleanup();
        };
    }, []);

    const initializeCall = async () => {
        try {
            setIsLoading(true);

            // Check if Daily.co is available
            // Note: We use createFrame on the ref to avoid state-based re-renders causing dupes
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

            callObjectRef.current = frame; // Store in ref immediately

            // Hide loading when Daily.co starts loading its UI
            frame.on('loading', () => {
                console.log('📹 Daily.co frame loading...');
                setIsLoading(false); // Hide our loading overlay
            });

            frame.on('loaded', () => {
                console.log('📹 Daily.co frame loaded');
                setIsLoading(false);
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
                setError('Demo Mode Active - Camera Preview');
                setIsLoading(false);
                // Enable demo mode with local camera
                setIsConnected(true);
                startTimer();
                startLocalCamera();
            });

            // Listen for network quality changes
            frame.on('network-quality-change', (event) => {
                const quality = event?.threshold;
                if (quality === 'good' || quality === 'low') {
                    setNetworkQuality(quality === 'low' ? 'poor' : 'good');
                } else if (quality === 'very-low') {
                    setNetworkQuality('poor');
                }
            });

            // Sync mute/video state when Daily.co UI controls are used
            frame.on('participant-updated', (event) => {
                if (event?.participant?.local) {
                    const participant = event.participant;
                    // Sync mute state
                    if (participant.audio !== undefined) {
                        setIsMuted(!participant.audio);
                    }
                    // Sync video state
                    if (participant.video !== undefined) {
                        setIsVideoOff(!participant.video);
                    }
                }
            });

            // Sync chat messages from Daily.co to project chat
            frame.on('app-message', (event) => {
                if (event?.data?.text && socket) {
                    const message = {
                        sender: event.fromId === 'local' ? 'You' : (event.data.name || 'Other'),
                        text: event.data.text,
                        timestamp: new Date().toLocaleTimeString()
                    };
                    setMessages(prev => [...prev, message]);
                }
            });

            setCallFrame(frame);

            // In production, join the real room
            try {
                let roomUrl;

                // If joining existing room via /video/room/:roomName
                if (isJoiningExistingRoom && roomName) {
                    console.log('📹 Joining existing Daily.co room:', roomName);
                    roomUrl = `https://healthsyncnew.daily.co/${roomName}`;
                } else {
                    // STEP 1: Create the room first
                    console.log('📹 Creating Daily.co room for appointment:', appointmentId);
                    const createRes = await fetch(`${API_URL}/video/create-room`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${localStorage.getItem('token')}`
                        },
                        body: JSON.stringify({ appointmentId })
                    });

                    const createData = await createRes.json();
                    console.log('📹 Create room response:', createData);

                    // Use roomUrl from create-room response if available
                    roomUrl = createData.roomUrl || createData.room?.url;

                    // Extract room name from URL for shareable link
                    if (roomUrl) {
                        const roomNameFromUrl = roomUrl.split('/').pop();
                        const currentHost = window.location.origin;
                        setShareableLink(`${currentHost}/video/room/${roomNameFromUrl}`);
                    }

                    // Only try fetching room details for valid MongoDB ObjectIds
                    const isValidObjectId = appointmentId && /^[a-fA-F0-9]{24}$/.test(appointmentId);
                    if (!roomUrl && isValidObjectId) {
                        console.log('📹 Fetching room details...');
                        const roomRes = await fetch(`${API_URL}/video/room/${appointmentId}`, {
                            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
                        });
                        const roomData = await roomRes.json();
                        roomUrl = roomData.roomUrl;
                    }
                }

                if (roomUrl) {
                    console.log('✅ Joining REAL Daily.co room:', roomUrl);
                    // Get user name from localStorage or use default
                    const user = JSON.parse(localStorage.getItem('user') || '{}');
                    const userName = user.firstName ? `${user.firstName} ${user.lastName || ''}`.trim() : (isJoiningExistingRoom ? 'Doctor' : 'Patient');

                    // Join with userName to skip pre-join lobby
                    await frame.join({
                        url: roomUrl,
                        userName: userName,
                        showLeaveButton: false
                    });
                    // Hide loading so Daily.co's pre-join UI is visible
                    setIsLoading(false);
                    setError(null); // Clear any demo mode message
                } else {
                    throw new Error('No video room URL available');
                }
            } catch (joinError) {
                console.error('Join error:', joinError);
                // Fallback to demo mode with local camera
                console.log('Enabling demo mode with local camera...');
                setError('Demo Mode - Real-time video call is simulated');
                setIsLoading(false);
                setIsConnected(true);
                startTimer();
                startLocalCamera();
            }

        } catch (err) {
            console.error('Failed to initialize call:', err);
            setError('Demo Mode Active - Camera Preview');
            setIsLoading(false);
            setIsConnected(true);
            startTimer();
            startLocalCamera();
        }
    };

    const startTimer = () => {
        timerRef.current = setInterval(() => {
            setCallDuration(prev => prev + 1);
        }, 1000);
    };

    // Start local camera for demo mode
    const startLocalCamera = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
            setLocalStream(stream);
            if (localVideoRef.current) {
                localVideoRef.current.srcObject = stream;
            }
        } catch (err) {
            console.log('Camera access denied, using placeholder');
        }
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
        // Also toggle local stream audio
        if (localStream) {
            localStream.getAudioTracks().forEach(track => {
                track.enabled = isMuted; // Toggle to opposite
            });
        }
        setIsMuted(!isMuted);
    }, [callFrame, isMuted, localStream]);

    const toggleVideo = useCallback(async () => {
        if (callFrame) {
            callFrame.setLocalVideo(!isVideoOff);
        }

        // Handle local stream video toggle
        if (localStream) {
            const videoTracks = localStream.getVideoTracks();
            if (isVideoOff) {
                // Turning video ON - check if tracks exist and are active
                if (videoTracks.length === 0 || videoTracks.every(t => t.readyState === 'ended')) {
                    // Need to re-acquire camera
                    try {
                        const newStream = await navigator.mediaDevices.getUserMedia({ video: true });
                        const newVideoTrack = newStream.getVideoTracks()[0];
                        if (newVideoTrack && localVideoRef.current) {
                            localStream.addTrack(newVideoTrack);
                            localVideoRef.current.srcObject = localStream;
                        }
                    } catch (err) {
                        console.error('Could not re-acquire camera:', err);
                    }
                } else {
                    videoTracks.forEach(track => { track.enabled = true; });
                }
            } else {
                // Turning video OFF - just disable tracks (don't stop them)
                videoTracks.forEach(track => { track.enabled = false; });
            }
        }

        setIsVideoOff(!isVideoOff);
    }, [callFrame, isVideoOff, localStream]);

    const handleEndCall = async () => {
        if (timerRef.current) {
            clearInterval(timerRef.current);
        }
        if (callFrame) {
            try {
                await callFrame.leave();
                callFrame.destroy();
            } catch (e) {
                console.log('Call already ended');
            }
        }
        // Stop local stream
        if (localStream) {
            localStream.getTracks().forEach(track => track.stop());
        }
        if (socket) {
            socket.close();
        }
        // Clear active call from sessionStorage
        sessionStorage.removeItem('activeVideoCall');
        // Navigate to summary page
        navigate(`/summary/${appointmentId}`);
    };

    const handleSendMessage = (e) => {
        e.preventDefault();
        if (newMessage.trim()) {
            const message = {
                sender: user?.firstName || 'You',
                message: newMessage,
                timestamp: new Date()
            };

            // Send to project's Socket.io chat
            if (socket) {
                socket.emit('chat-message', {
                    roomId: appointmentId,
                    ...message
                });
            }

            // Also send to Daily.co chat for sync with other participant (only if connected)
            if (callFrame && isConnected) {
                try {
                    callFrame.sendAppMessage({
                        text: newMessage,
                        name: user?.firstName || 'Patient'
                    }, '*'); // '*' sends to all participants
                } catch (err) {
                    console.log('Could not send to Daily.co chat:', err);
                }
            }

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
            {/* Emergency Alert Banner - AI Detection */}
            {emergencyAlert && (
                <div className={`emergency-alert ${emergencyAlert.severity}`}>
                    <div className="emergency-content">
                        <span className="emergency-icon">
                            {emergencyAlert.severity === 'critical' ? '🚨' : '⚠️'}
                        </span>
                        <div className="emergency-text">
                            <strong>{emergencyAlert.message}</strong>
                            <p>Detected: {emergencyAlert.detectedKeywords.join(', ')}</p>
                        </div>
                    </div>
                    <div className="emergency-actions">
                        <a
                            href="tel:112"
                            className="btn btn-emergency"
                        >
                            📞 Call 112
                        </a>
                        <button
                            className="btn btn-secondary btn-sm"
                            onClick={() => setEmergencyAlert(null)}
                        >
                            Dismiss
                        </button>
                    </div>
                </div>
            )}

            {/* Main Content Area - Video + Sidebars */}
            <div className="video-main-content">
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
                                    <p>{(() => { const d = sessionStorage.getItem('appointmentDoctor'); return d ? JSON.parse(d).name : 'Dr. Sarah Johnson'; })()}</p>
                                    <span className="badge badge-success">Connected</span>
                                </div>
                                <div className="local-video-demo">
                                    {localStream && !isVideoOff ? (
                                        <video
                                            ref={localVideoRef}
                                            autoPlay
                                            muted
                                            playsInline
                                            style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '12px', transform: 'scaleX(-1)' }}
                                        />
                                    ) : (
                                        <div className="placeholder-avatar small">
                                            <span>{user?.firstName?.[0] || 'Y'}</span>
                                        </div>
                                    )}
                                    {isMuted && <div className="muted-indicator">🔇</div>}
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
                            onClick={async () => {
                                const nextState = !showTranscription;
                                setShowTranscription(nextState);

                                if (nextState) {
                                    // Start real-time transcription with audio capture
                                    try {
                                        if (transcriptionWsRef.current) {
                                            // Request microphone access
                                            const stream = await navigator.mediaDevices.getUserMedia({
                                                audio: {
                                                    echoCancellation: true,
                                                    noiseSuppression: true,
                                                    sampleRate: 16000
                                                }
                                            });
                                            audioStreamRef.current = stream;

                                            // Emit start-stream to backend to initialize DeepGram
                                            transcriptionWsRef.current.emit('start-stream');

                                            // Use Web Audio API for raw PCM audio (DeepGram compatible)
                                            const audioContext = new (window.AudioContext || window.webkitAudioContext)({
                                                sampleRate: 16000
                                            });
                                            const source = audioContext.createMediaStreamSource(stream);

                                            // ScriptProcessorNode for audio processing (deprecated but widely supported)
                                            const processor = audioContext.createScriptProcessor(4096, 1, 1);

                                            processor.onaudioprocess = (e) => {
                                                const inputData = e.inputBuffer.getChannelData(0);
                                                // Convert float32 to int16 (linear16 for DeepGram)
                                                const int16Data = new Int16Array(inputData.length);
                                                for (let i = 0; i < inputData.length; i++) {
                                                    int16Data[i] = Math.max(-32768, Math.min(32767, Math.floor(inputData[i] * 32768)));
                                                }
                                                if (transcriptionWsRef.current) {
                                                    transcriptionWsRef.current.emit('audio-data', int16Data.buffer);
                                                }
                                            };

                                            source.connect(processor);
                                            processor.connect(audioContext.destination);

                                            // Store refs for cleanup
                                            mediaRecorderRef.current = { processor, audioContext, source };

                                            setIsTranscribing(true);
                                            console.log('🎙️ Live transcription started (PCM audio)');
                                        }
                                    } catch (err) {
                                        console.error('Failed to start transcription:', err);
                                        setShowTranscription(false);
                                    }
                                } else {
                                    // Stop transcription
                                    // Stop Web Audio API processing
                                    if (mediaRecorderRef.current?.processor) {
                                        mediaRecorderRef.current.processor.disconnect();
                                        mediaRecorderRef.current.source.disconnect();
                                        mediaRecorderRef.current.audioContext.close();
                                    }
                                    if (audioStreamRef.current) {
                                        audioStreamRef.current.getTracks().forEach(track => track.stop());
                                    }
                                    if (transcriptionWsRef.current) {
                                        transcriptionWsRef.current.emit('stop-stream');
                                    }
                                    setIsTranscribing(false);
                                    console.log('🎙️ Live transcription stopped');
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

                        {/* Share Link Button - Only show for room creator (patient) */}
                        {shareableLink && !isJoiningExistingRoom && (
                            <button
                                className={`control-btn ${linkCopied ? 'active' : ''}`}
                                onClick={() => {
                                    navigator.clipboard.writeText(shareableLink);
                                    setLinkCopied(true);
                                    setTimeout(() => setLinkCopied(false), 3000);
                                }}
                                title="Copy link for doctor to join"
                            >
                                <span className="control-icon">{linkCopied ? '✅' : '🔗'}</span>
                                <span className="control-label">{linkCopied ? 'Copied!' : 'Share Link'}</span>
                            </button>
                        )}

                        <button
                            className="control-btn end-call"
                            onClick={handleEndCall}
                            title="End call"
                        >
                            <span className="control-icon">📞</span>
                            <span className="control-label">End Call</span>
                        </button>

                        {/* Write Prescription Button - For doctors after/during call */}
                        <button
                            className="control-btn prescription-btn"
                            onClick={() => navigate(`/doctor-prescription/${appointmentId || roomName || 'new'}`)}
                            title="Write prescription for patient"
                        >
                            <span className="control-icon">📋</span>
                            <span className="control-label">Prescription</span>
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
                        <div className="header-actions">
                            {language !== 'en' && (
                                <button
                                    className={`translate-toggle ${isTranslationEnabled ? 'active' : ''}`}
                                    onClick={async () => {
                                        setIsTranslationEnabled(!isTranslationEnabled);
                                        if (!isTranslationEnabled && transcription.length > 0) {
                                            setIsTranslating(true);
                                            const translations = {};
                                            for (const entry of transcription) {
                                                const key = `${entry.speaker}-${entry.time}`;
                                                try {
                                                    translations[key] = await translateText(entry.text, 'en', language);
                                                } catch (e) {
                                                    translations[key] = entry.text;
                                                }
                                            }
                                            setTranslatedTexts(translations);
                                            setIsTranslating(false);
                                        }
                                    }}
                                    title={isTranslationEnabled ? 'Show Original' : 'Translate to Hindi'}
                                >
                                    {isTranslating ? '⏳' : '🌐'} {isTranslationEnabled ? 'Original' : 'Translate'}
                                </button>
                            )}
                            <button className="close-transcription" onClick={() => setShowTranscription(false)}>✕</button>
                        </div>
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
                            transcription.map((entry, idx) => {
                                const entryKey = `${entry.speaker}-${entry.time}`;
                                const translatedText = translatedTexts[entryKey];

                                return (
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
                                        {isTranslationEnabled && translatedText && (
                                            <p className="entry-text translated">
                                                🌐 {translatedText}
                                            </p>
                                        )}
                                    </div>
                                );
                            })
                        )}
                        <div ref={transcriptionEndRef} />
                    </div>

                    {/* Transcript Summary - Dynamically detect medical terms */}
                    {transcription.length > 0 && (() => {
                        const allText = transcription.map(t => t.text).join(' ').toLowerCase();
                        const detectedTerms = {
                            symptoms: MEDICAL_TERMS.symptoms.filter(term => allText.includes(term.toLowerCase())),
                            medications: MEDICAL_TERMS.medications.filter(term => allText.includes(term.toLowerCase())),
                            dosages: MEDICAL_TERMS.dosages.filter(term => allText.includes(term.toLowerCase())),
                            critical: MEDICAL_TERMS.critical.filter(term => allText.includes(term.toLowerCase()))
                        };
                        const hasTerms = Object.values(detectedTerms).some(arr => arr.length > 0);

                        return hasTerms ? (
                            <div className="transcript-summary">
                                <h4>🔍 Key Medical Terms Detected</h4>
                                <div className="summary-tags">
                                    {detectedTerms.symptoms.map(term => (
                                        <span key={term} className="tag symptom">{term}</span>
                                    ))}
                                    {detectedTerms.medications.map(term => (
                                        <span key={term} className="tag medication">{term}</span>
                                    ))}
                                    {detectedTerms.dosages.map(term => (
                                        <span key={term} className="tag dosage">{term}</span>
                                    ))}
                                    {detectedTerms.critical.map(term => (
                                        <span key={term} className="tag critical">{term}</span>
                                    ))}
                                </div>
                            </div>
                        ) : null;
                    })()}
                </div>
            </div>
        </div>
    );
};

export default VideoCall;
