import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './VideoCall.css';

const VideoCall = () => {
    const { appointmentId } = useParams();
    const { user } = useAuth();
    const navigate = useNavigate();

    const [isConnected, setIsConnected] = useState(false);
    const [isMuted, setIsMuted] = useState(false);
    const [isVideoOff, setIsVideoOff] = useState(false);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [showChat, setShowChat] = useState(false);
    const [callDuration, setCallDuration] = useState(0);

    const localVideoRef = useRef(null);
    const remoteVideoRef = useRef(null);
    const timerRef = useRef(null);

    useEffect(() => {
        // Simulate connection for demo
        setTimeout(() => {
            setIsConnected(true);
            startTimer();
        }, 2000);

        return () => {
            if (timerRef.current) {
                clearInterval(timerRef.current);
            }
        };
    }, []);

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

    const handleEndCall = () => {
        if (timerRef.current) {
            clearInterval(timerRef.current);
        }
        navigate('/appointments');
    };

    const handleSendMessage = (e) => {
        e.preventDefault();
        if (newMessage.trim()) {
            setMessages([
                ...messages,
                {
                    id: Date.now(),
                    sender: user?.firstName || 'You',
                    text: newMessage,
                    timestamp: new Date().toLocaleTimeString()
                }
            ]);
            setNewMessage('');
        }
    };

    return (
        <div className="video-call-page">
            {/* Main Video Area */}
            <div className="video-container">
                {/* Remote Video (Doctor/Patient) */}
                <div className="remote-video">
                    {!isConnected ? (
                        <div className="connecting-overlay">
                            <div className="spinner"></div>
                            <p>Connecting to your doctor...</p>
                        </div>
                    ) : (
                        <div className="video-placeholder">
                            <div className="placeholder-avatar">👨‍⚕️</div>
                            <p>Dr. Sarah Johnson</p>
                            <span className="badge badge-success">Connected</span>
                        </div>
                    )}
                    <video ref={remoteVideoRef} autoPlay playsInline />
                </div>

                {/* Local Video (Self) */}
                <div className={`local-video ${isVideoOff ? 'video-off' : ''}`}>
                    {isVideoOff ? (
                        <div className="video-off-placeholder">
                            <span>{user?.firstName?.[0]}{user?.lastName?.[0] || 'Y'}</span>
                        </div>
                    ) : (
                        <div className="video-placeholder small">
                            <span>🧑‍🦱</span>
                        </div>
                    )}
                    <video ref={localVideoRef} autoPlay playsInline muted />
                </div>

                {/* Call Info */}
                <div className="call-info">
                    <span className="call-duration">{formatDuration(callDuration)}</span>
                    <span className="call-status">
                        {isConnected ? '🟢 Connected' : '🟡 Connecting...'}
                    </span>
                </div>

                {/* Controls */}
                <div className="video-controls">
                    <button
                        className={`control-btn ${isMuted ? 'active' : ''}`}
                        onClick={() => setIsMuted(!isMuted)}
                        title={isMuted ? 'Unmute' : 'Mute'}
                    >
                        {isMuted ? '🔇' : '🎤'}
                    </button>

                    <button
                        className={`control-btn ${isVideoOff ? 'active' : ''}`}
                        onClick={() => setIsVideoOff(!isVideoOff)}
                        title={isVideoOff ? 'Turn on camera' : 'Turn off camera'}
                    >
                        {isVideoOff ? '📵' : '📹'}
                    </button>

                    <button
                        className="control-btn"
                        onClick={() => setShowChat(!showChat)}
                        title="Toggle chat"
                    >
                        💬
                    </button>

                    <button
                        className="control-btn end-call"
                        onClick={handleEndCall}
                        title="End call"
                    >
                        📞
                    </button>
                </div>
            </div>

            {/* Chat Sidebar */}
            {showChat && (
                <div className="chat-sidebar">
                    <div className="chat-header">
                        <h3>Chat</h3>
                        <button onClick={() => setShowChat(false)}>✕</button>
                    </div>

                    <div className="chat-messages">
                        {messages.length === 0 ? (
                            <p className="no-messages">No messages yet</p>
                        ) : (
                            messages.map((msg) => (
                                <div key={msg.id} className="chat-message">
                                    <span className="message-sender">{msg.sender}</span>
                                    <p className="message-text">{msg.text}</p>
                                    <span className="message-time">{msg.timestamp}</span>
                                </div>
                            ))
                        )}
                    </div>

                    <form className="chat-input" onSubmit={handleSendMessage}>
                        <input
                            type="text"
                            placeholder="Type a message..."
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                        />
                        <button type="submit">Send</button>
                    </form>
                </div>
            )}
        </div>
    );
};

export default VideoCall;
