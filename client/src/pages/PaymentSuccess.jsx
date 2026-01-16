import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import './PaymentSuccess.css';

const PaymentSuccess = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const [verifying, setVerifying] = useState(true);
    const [verified, setVerified] = useState(false);

    const appointmentId = searchParams.get('appointmentId');
    const transactionId = searchParams.get('transactionId');

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
        } catch (error) {
            console.error('Payment verification failed:', error);
        } finally {
            setVerifying(false);
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
                            <li>📧 A confirmation email has been sent to your registered email</li>
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
