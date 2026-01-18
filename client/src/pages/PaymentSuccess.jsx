import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import './PaymentSuccess.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

const PaymentSuccess = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const [verifying, setVerifying] = useState(true);
    const [verified, setVerified] = useState(false);
    const [emailSent, setEmailSent] = useState(false);
    const [emailError, setEmailError] = useState(null);

    const appointmentId = searchParams.get('appointmentId');
    const transactionId = searchParams.get('transactionId');
    const doctorName = searchParams.get('doctor') || 'Dr. Sarah Johnson';
    const specialty = searchParams.get('specialty') || 'General Physician';
    const date = searchParams.get('date') || new Date().toLocaleDateString();
    const time = searchParams.get('time') || '10:00 AM';

    useEffect(() => {
        verifyPayment();
    }, []);

    const verifyPayment = async () => {
        try {
            // Simulate verification delay
            await new Promise(resolve => setTimeout(resolve, 2000));

            // In production, verify with backend
            // const response = await fetch(`/api/payments/verify/${transactionId}`);

            setVerified(true);

            // Auto-send confirmation email after successful payment
            sendConfirmationEmail();
        } catch (error) {
            console.error('Payment verification failed:', error);
        } finally {
            setVerifying(false);
        }
    };

    const sendConfirmationEmail = async () => {
        try {
            // Get email from localStorage or prompt
            const storedUser = localStorage.getItem('healthsync_user');
            let userEmail = storedUser ? JSON.parse(storedUser)?.email : null;

            if (!userEmail) {
                userEmail = prompt('Enter your email for confirmation:', 'hs1132sharma7@gmail.com');
            }

            if (!userEmail) return;

            const response = await fetch(`${API_URL}/appointments/test-email`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: userEmail,
                    doctorName,
                    specialty,
                    date,
                    time
                })
            });

            const data = await response.json();
            if (data.success) {
                setEmailSent(true);
                console.log('📧 Confirmation email sent to:', userEmail);
            } else {
                setEmailError(data.message);
            }
        } catch (error) {
            console.error('Failed to send email:', error);
            setEmailError('Failed to send confirmation email');
        }
    };

    if (verifying) {
        return (
            <div className="payment-success-page">
                <div className="container">
                    <div className="success-card verifying">
                        <div className="spinner-large"></div>
                        <h2>Verifying Payment...</h2>
                        <p>Please wait while we confirm your payment.</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="payment-success-page">
            <div className="container">
                <div className="success-card">
                    <div className="success-icon">✓</div>
                    <h1>Payment Successful!</h1>
                    <p className="success-message">
                        Your appointment has been confirmed and payment received.
                    </p>

                    <div className="payment-details">
                        <div className="detail-row">
                            <span>Transaction ID</span>
                            <span className="mono">{transactionId || `TXN${Date.now()}`}</span>
                        </div>
                        <div className="detail-row">
                            <span>Appointment ID</span>
                            <span className="mono">{appointmentId || 'N/A'}</span>
                        </div>
                        <div className="detail-row">
                            <span>Amount Paid</span>
                            <span className="amount">₹500.00</span>
                        </div>
                        <div className="detail-row">
                            <span>Payment Method</span>
                            <span>Card / UPI</span>
                        </div>
                        <div className="detail-row">
                            <span>Status</span>
                            <span className="status-badge success">Confirmed</span>
                        </div>
                    </div>

                    {/* Download Receipt Button */}
                    <button
                        className="btn btn-secondary receipt-btn"
                        onClick={() => {
                            const receipt = `
HEALTHSYNC PAYMENT RECEIPT
==========================
Date: ${new Date().toLocaleDateString()}
Time: ${new Date().toLocaleTimeString()}

Transaction ID: ${transactionId || `TXN${Date.now()}`}
Appointment ID: ${appointmentId || 'N/A'}
Amount Paid: ₹500.00
Payment Status: CONFIRMED

Thank you for choosing HealthSync!
                            `.trim();
                            const blob = new Blob([receipt], { type: 'text/plain' });
                            const url = URL.createObjectURL(blob);
                            const a = document.createElement('a');
                            a.href = url;
                            a.download = `receipt-${transactionId || Date.now()}.txt`;
                            a.click();
                            URL.revokeObjectURL(url);
                        }}
                    >
                        📄 Download Receipt
                    </button>

                    <div className="next-steps">
                        <h3>What's Next?</h3>
                        <ul>
                            <li style={{ color: emailSent ? '#10b981' : emailError ? '#ef4444' : '#f59e0b' }}>
                                {emailSent ? '✅ Confirmation email sent!' :
                                    emailError ? `❌ ${emailError}` :
                                        '⏳ Sending confirmation email...'}
                            </li>
                            <li>📅 Add the appointment to your calendar</li>
                            <li>🎥 Join the waiting room 5 minutes before your scheduled time</li>
                            <li>📝 Keep your symptoms and questions ready</li>
                        </ul>
                    </div>

                    <div className="action-buttons">
                        {appointmentId && appointmentId !== 'new' ? (
                            <Link
                                to={`/waiting-room/${appointmentId}`}
                                className="btn btn-primary btn-lg"
                            >
                                Go to Waiting Room
                            </Link>
                        ) : (
                            <Link to="/appointments" className="btn btn-primary btn-lg">
                                View My Appointments
                            </Link>
                        )}
                        <Link to="/" className="btn btn-secondary">
                            Return to Home
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PaymentSuccess;
