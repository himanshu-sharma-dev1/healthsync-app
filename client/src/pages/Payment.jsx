import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { appointmentService } from '../services/api';
import './Payment.css';

// Import images
import doctorFemale from '../assets/images/doctor_avatar_female_1768411074828.png';
import paymentSecure from '../assets/images/payment_secure_1768411142589.png';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

const Payment = () => {
    const { appointmentId } = useParams();
    const navigate = useNavigate();
    const { isAuthenticated, user } = useAuth();
    const { t } = useLanguage();

    const [appointment, setAppointment] = useState(null);
    const [loading, setLoading] = useState(true);
    const [processing, setProcessing] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    useEffect(() => {
        fetchAppointment();
    }, [appointmentId]);

    const fetchAppointment = async () => {
        try {
            const response = await appointmentService.getById(appointmentId);
            setAppointment(response.appointment);
        } catch (err) {
            // Demo appointment for testing
            setAppointment({
                _id: appointmentId,
                doctor: {
                    firstName: 'Sarah',
                    lastName: 'Johnson',
                    specialty: 'Cardiologist',
                    consultationFee: 800
                },
                scheduledDate: new Date().toISOString().split('T')[0],
                scheduledTime: '10:00',
                type: 'video',
                status: 'scheduled'
            });
        } finally {
            setLoading(false);
        }
    };

    // REAL Square Checkout - Redirects to Square's hosted payment page
    const handleSquareCheckout = async () => {
        setProcessing(true);
        setError('');

        try {
            const response = await fetch(`${API_URL}/payments/create-checkout`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({
                    appointmentId,
                    doctorName: `${appointment?.doctor?.firstName} ${appointment?.doctor?.lastName}`,
                    specialty: appointment?.doctor?.specialty,
                    amount: appointment?.doctor?.consultationFee || 800,
                    patientEmail: user?.email,
                    appointmentDate: appointment?.scheduledDate,
                    appointmentTime: appointment?.scheduledTime
                })
            });

            const data = await response.json();

            if (data.success && data.checkoutUrl) {
                setSuccess('Redirecting to Square payment page...');
                console.log('✅ Square checkout URL:', data.checkoutUrl);

                // Redirect to Square's hosted checkout page
                window.location.href = data.checkoutUrl;
            } else if (data.redirectUrl) {
                // Demo fallback
                navigate(data.redirectUrl);
            } else {
                setError(data.error || 'Failed to create checkout session');
            }
        } catch (err) {
            console.error('Checkout error:', err);
            setError('Failed to connect to payment service. Please try again.');
        } finally {
            setProcessing(false);
        }
    };

    // Stripe Checkout - Redirects to Stripe's hosted payment page
    const handleStripeCheckout = async () => {
        setProcessing(true);
        setError('');

        try {
            const response = await fetch(`${API_URL}/stripe/create-session`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({
                    appointmentId,
                    doctorName: `Dr. ${appointment?.doctor?.firstName} ${appointment?.doctor?.lastName}`,
                    amount: appointment?.doctor?.consultationFee || 800,
                    patientEmail: user?.email
                })
            });

            const data = await response.json();

            if (data.success && data.url) {
                setSuccess('Redirecting to Stripe payment page...');
                // Save doctor info before redirect
                sessionStorage.setItem('appointmentDoctor', JSON.stringify({
                    name: `Dr. ${appointment.doctor.firstName} ${appointment.doctor.lastName}`,
                    specialty: appointment?.doctor?.specialty || 'Cardiologist',
                    time: appointment?.scheduledTime || '10:00 AM'
                }));
                window.location.href = data.url;
            } else {
                setError(data.message || 'Failed to create Stripe checkout session');
            }
        } catch (err) {
            console.error('Stripe checkout error:', err);
            setError('Failed to connect to Stripe. Please try again.');
        } finally {
            setProcessing(false);
        }
    };

    // Demo Skip - For testing only
    const handleDemoSkip = async () => {
        setProcessing(true);

        // Save doctor info for waiting room and video call pages
        sessionStorage.setItem('appointmentDoctor', JSON.stringify({
            name: appointment?.doctor?.firstName
                ? `Dr. ${appointment.doctor.firstName} ${appointment.doctor.lastName}`
                : 'Dr. Sarah Johnson',
            specialty: appointment?.doctor?.specialty || 'Cardiologist',
            time: appointment?.scheduledTime || '10:00 AM'
        }));

        try {
            // Call demo payment endpoint
            const response = await fetch(`${API_URL}/payments/create`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({
                    appointmentId,
                    amount: appointment?.doctor?.consultationFee || 800,
                    demoMode: true
                })
            });

            const data = await response.json();
            if (data.success) {
                setSuccess('Demo payment successful! Redirecting...');
                setTimeout(() => {
                    navigate(`/waiting-room/${appointmentId}`);
                }, 1000);
            }
        } catch (err) {
            // Still proceed for demo
            navigate(`/waiting-room/${appointmentId}`);
        } finally {
            setProcessing(false);
        }
    };

    if (!isAuthenticated) {
        return (
            <div className="payment-page">
                <div className="container">
                    <div className="auth-required">
                        <h2>Login Required</h2>
                        <p>Please login to complete your payment.</p>
                        <button onClick={() => navigate('/login')} className="btn btn-primary">
                            Login
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="payment-page">
                <div className="container">
                    <div className="loading-state">
                        <div className="spinner"></div>
                        <p>Loading payment details...</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="payment-page">
            <div className="container">
                <div className="payment-layout">
                    {/* Order Summary */}
                    <div className="order-summary">
                        <h2>{t('orderSummary')}</h2>

                        <div className="appointment-card">
                            <div className="doc-info">
                                <img src={doctorFemale} alt="Doctor" className="doc-avatar-img" />
                                <div>
                                    <h4>Dr. {appointment?.doctor?.firstName} {appointment?.doctor?.lastName}</h4>
                                    <p>{appointment?.doctor?.specialty}</p>
                                </div>
                            </div>

                            <div className="apt-details">
                                <div className="detail-row">
                                    <span>📅 {t('date')}</span>
                                    <span>{new Date(appointment?.scheduledDate).toLocaleDateString('en-US', {
                                        weekday: 'long',
                                        month: 'long',
                                        day: 'numeric'
                                    })}</span>
                                </div>
                                <div className="detail-row">
                                    <span>⏰ {t('time')}</span>
                                    <span>{appointment?.scheduledTime}</span>
                                </div>
                                <div className="detail-row">
                                    <span>📹 {t('type')}</span>
                                    <span>{t('videoConsultation')}</span>
                                </div>
                            </div>
                        </div>

                        <div className="price-breakdown">
                            <div className="price-row">
                                <span>{t('consultationFee')}</span>
                                <span>₹{appointment?.doctor?.consultationFee}</span>
                            </div>
                            <div className="price-row">
                                <span>{t('platformFee')}</span>
                                <span>₹0</span>
                            </div>
                            <div className="price-row total">
                                <span>{t('total')}</span>
                                <span>₹{appointment?.doctor?.consultationFee}</span>
                            </div>
                        </div>

                        <div className="secure-badge">
                            <img src={paymentSecure} alt="Secure Payment" className="secure-badge-img" />
                            <div>
                                <span className="secure-title">🔒 {t('securePaymentBadge')}</span>
                                <span className="secure-text">{t('poweredBySquare')}</span>
                            </div>
                        </div>
                    </div>

                    {/* Payment Options */}
                    <div className="payment-form-container">
                        <h2>{t('completePayment')}</h2>

                        {error && (
                            <div className="alert alert-error">{error}</div>
                        )}

                        {success && (
                            <div className="alert alert-success">{success}</div>
                        )}

                        {/* Real Square Payment */}
                        <div className="payment-option primary animate-fadeIn">
                            <div className="option-header">
                                <span className="option-icon">💳</span>
                                <div>
                                    <h3>{t('payWithSquare')}</h3>
                                    <p>{t('secureCardPayment')}</p>
                                </div>
                            </div>

                            <button
                                className="btn btn-primary btn-lg w-full pay-btn"
                                onClick={handleSquareCheckout}
                                disabled={processing}
                            >
                                {processing ? (
                                    <>
                                        <span className="spinner-small"></span>
                                        Processing...
                                    </>
                                ) : (
                                    <>
                                        <span>💳</span>
                                        Pay ₹{appointment?.doctor?.consultationFee} Securely
                                    </>
                                )}
                            </button>

                            <div className="payment-features">
                                <span>✓ {t('creditDebitCards')}</span>
                                <span>✓ {t('applePay')}</span>
                                <span>✓ {t('googlePay')}</span>
                            </div>
                        </div>

                        <div className="divider">
                            <span>or</span>
                        </div>

                        {/* Stripe Payment - Alternative */}
                        <div className="payment-option stripe animate-fadeIn">
                            <div className="option-header">
                                <span className="option-icon">💎</span>
                                <div>
                                    <h3>Pay with Stripe</h3>
                                    <p>Secure international payment gateway</p>
                                </div>
                            </div>

                            <button
                                className="btn btn-stripe btn-lg w-full"
                                onClick={handleStripeCheckout}
                                disabled={processing}
                            >
                                {processing ? (
                                    <>
                                        <span className="spinner-small"></span>
                                        Processing...
                                    </>
                                ) : (
                                    <>
                                        <span>💎</span>
                                        Pay ₹{appointment?.doctor?.consultationFee} with Stripe
                                    </>
                                )}
                            </button>

                            <div className="payment-features">
                                <span>✓ All Cards</span>
                                <span>✓ UPI</span>
                                <span>✓ Net Banking</span>
                            </div>
                        </div>

                        <div className="divider">
                            <span>or</span>
                        </div>

                        {/* Demo Mode for Testing */}
                        <div className="payment-option secondary">
                            <div className="option-header">
                                <span className="option-icon">🎭</span>
                                <div>
                                    <h3>{t('demoMode')}</h3>
                                    <p>{t('skipPaymentDesc')}</p>
                                </div>
                            </div>

                            <button
                                className="btn btn-secondary btn-lg w-full"
                                onClick={handleDemoSkip}
                                disabled={processing}
                            >
                                {t('skipPayment')}
                            </button>
                        </div>

                        {/* Test Card Info */}
                        <div className="test-card-info">
                            <h4>🧪 {t('sandboxTestCards')}</h4>
                            <p>Use these on Square's checkout page:</p>
                            <ul>
                                <li><strong>Visa:</strong> 4532 0151 1283 0366</li>
                                <li><strong>Mastercard:</strong> 5425 2334 3010 9903</li>
                                <li>CVV: Any 3 digits | Expiry: Any future date</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Payment;
