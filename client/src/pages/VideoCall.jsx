import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import DailyIframe from '@daily-co/daily-js';
import { io } from 'socket.io-client';
import './VideoCall.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';
const SOCKET_URL = API_URL.replace('/api', '');

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

    // Transcription states
    const [transcription, setTranscription] = useState([]);
    const [isTranscribing, setIsTranscribing] = useState(false);

    const videoContainerRef = useRef(null);
    const timerRef = useRef(null);
    const chatEndRef = useRef(null);

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
        </div>
    );
};

export default VideoCall;
