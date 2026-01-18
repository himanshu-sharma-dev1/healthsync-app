import { useState, useRef, useEffect } from 'react';
import './AIChatbot.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

const AIChatbot = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        {
            role: 'assistant',
            content: '👋 Hi! I\'m HealthSync AI. I can help you understand your symptoms and guide you to the right doctor. How can I help you today?'
        }
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [analysis, setAnalysis] = useState(null);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSend = async () => {
        if (!input.trim() || isLoading) return;

        const userMessage = input.trim();
        setInput('');
        setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
        setIsLoading(true);
        setAnalysis(null);

        try {
            // First, analyze symptoms for structured data
            const analyzeRes = await fetch(`${API_URL}/ai/analyze-symptoms`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ symptoms: userMessage })
            });
            const analyzeData = await analyzeRes.json();

            if (analyzeData.success && analyzeData.analysis) {
                setAnalysis(analyzeData.analysis);
            }

            // Then get conversational response
            const chatRes = await fetch(`${API_URL}/ai/health-chat`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    message: userMessage,
                    conversationHistory: messages.slice(-6).map(m => ({
                        role: m.role,
                        content: m.content
                    }))
                })
            });
            const chatData = await chatRes.json();

            if (chatData.success) {
                setMessages(prev => [...prev, {
                    role: 'assistant',
                    content: chatData.reply
                }]);
            } else {
                throw new Error('Failed to get response');
            }
        } catch (error) {
            console.error('Chat error:', error);
            setMessages(prev => [...prev, {
                role: 'assistant',
                content: '😔 I apologize, I\'m having trouble connecting. For urgent health concerns, please call 112 or visit your nearest hospital.'
            }]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    const getUrgencyColor = (level) => {
        if (level >= 4) return '#ef4444';
        if (level >= 3) return '#f59e0b';
        return '#10b981';
    };

    const getUrgencyEmoji = (level) => {
        if (level >= 4) return '🚨';
        if (level >= 3) return '⚠️';
        return '✅';
    };

    return (
        <>
            {/* Floating Chat Button */}
            {!isOpen && (
                <button
                    className="chatbot-fab"
                    onClick={() => setIsOpen(true)}
                    aria-label="Open AI Health Assistant"
                >
                    <span className="fab-icon">🤖</span>
                    <span className="fab-pulse"></span>
                </button>
            )}

            {/* Chat Window */}
            {isOpen && (
                <div className="chatbot-container">
                    <div className="chatbot-header">
                        <div className="header-info">
                            <span className="header-icon">🤖</span>
                            <div>
                                <h3>HealthSync AI</h3>
                                <span className="status">Powered by Groq</span>
                            </div>
                        </div>
                        <button
                            className="close-btn"
                            onClick={() => setIsOpen(false)}
                        >
                            ✕
                        </button>
                    </div>

                    <div className="chatbot-messages">
                        {messages.map((msg, idx) => (
                            <div
                                key={idx}
                                className={`message ${msg.role}`}
                            >
                                {msg.role === 'assistant' && (
                                    <span className="avatar">🤖</span>
                                )}
                                <div className="message-content">
                                    {msg.content}
                                </div>
                                {msg.role === 'user' && (
                                    <span className="avatar">👤</span>
                                )}
                            </div>
                        ))}

                        {/* Analysis Card */}
                        {analysis && (
                            <div className="analysis-card">
                                <div
                                    className="urgency-badge"
                                    style={{ backgroundColor: getUrgencyColor(analysis.urgencyLevel) }}
                                >
                                    {getUrgencyEmoji(analysis.urgencyLevel)} Urgency: {analysis.urgencyLevel}/5
                                </div>

                                <div className="analysis-section">
                                    <h4>🩺 Possible Conditions</h4>
                                    <ul>
                                        {analysis.possibleConditions?.map((c, i) => (
                                            <li key={i}>{c}</li>
                                        ))}
                                    </ul>
                                </div>

                                <div className="analysis-section">
                                    <h4>👨‍⚕️ Recommended Specialist</h4>
                                    <p className="specialist">{analysis.recommendedSpecialist}</p>
                                </div>

                                {analysis.immediateAdvice && (
                                    <div className="analysis-section advice">
                                        <h4>💡 Immediate Advice</h4>
                                        <p>{analysis.immediateAdvice}</p>
                                    </div>
                                )}

                                <a
                                    href={`/doctors?specialty=${encodeURIComponent(analysis.recommendedSpecialist)}`}
                                    className="book-btn"
                                >
                                    📅 Find {analysis.recommendedSpecialist}
                                </a>

                                <p className="disclaimer">{analysis.disclaimer}</p>
                            </div>
                        )}

                        {isLoading && (
                            <div className="message assistant">
                                <span className="avatar">🤖</span>
                                <div className="message-content typing">
                                    <span></span>
                                    <span></span>
                                    <span></span>
                                </div>
                            </div>
                        )}

                        <div ref={messagesEndRef} />
                    </div>

                    <div className="chatbot-input">
                        <textarea
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyPress={handleKeyPress}
                            placeholder="Describe your symptoms..."
                            rows={1}
                            disabled={isLoading}
                        />
                        <button
                            onClick={handleSend}
                            disabled={!input.trim() || isLoading}
                            className="send-btn"
                        >
                            {isLoading ? '⏳' : '📤'}
                        </button>
                    </div>
                </div>
            )}
        </>
    );
};

export default AIChatbot;
