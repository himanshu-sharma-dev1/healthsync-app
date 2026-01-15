import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { paymentService, appointmentService } from '../services/api';
import './Payment.css';

const Payment = () => {
    const { appointmentId } = useParams();
    const navigate = useNavigate();
    const { isAuthenticated } = useAuth();

    const [appointment, setAppointment] = useState(null);
    const [loading, setLoading] = useState(true);
    const [processing, setProcessing] = useState(false);
    const [paymentMethod, setPaymentMethod] = useState('card');
    const [cardDetails, setCardDetails] = useState({
        cardNumber: '',
        expiry: '',
        cvv: '',
        name: ''
    });
    const [error, setError] = useState('');

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

    const handleCardChange = (e) => {
        let { name, value } = e.target;

        // Format card number with spaces
        if (name === 'cardNumber') {
            value = value.replace(/\D/g, '').slice(0, 16);
            value = value.replace(/(\d{4})/g, '$1 ').trim();
        }

        // Format expiry as MM/YY
        if (name === 'expiry') {
            value = value.replace(/\D/g, '').slice(0, 4);
            if (value.length > 2) {
                value = value.slice(0, 2) + '/' + value.slice(2);
            }
        }

        // Limit CVV to 3-4 digits
        if (name === 'cvv') {
            value = value.replace(/\D/g, '').slice(0, 4);
        }

        setCardDetails({ ...cardDetails, [name]: value });
    };

    const handlePayment = async (e) => {
        e.preventDefault();

        if (paymentMethod === 'card') {
            if (!cardDetails.cardNumber || !cardDetails.expiry || !cardDetails.cvv || !cardDetails.name) {
                setError('Please fill in all card details');
                return;
            }
        }

        setProcessing(true);
        setError('');

        try {
            // Simulate payment processing
            await new Promise(resolve => setTimeout(resolve, 2000));

            // Call payment API
            await paymentService.create({
                appointmentId,
                amount: appointment?.doctor?.consultationFee || 800,
                method: paymentMethod
            });

            // Navigate to waiting room
            navigate(`/waiting-room/${appointmentId}`);
        } catch (err) {
            // For demo, navigate anyway after showing success
            setTimeout(() => {
                navigate(`/waiting-room/${appointmentId}`);
            }, 1000);
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
                        <h2>Order Summary</h2>

                        <div className="appointment-card">
                            <div className="doc-info">
                                <div className="doc-avatar">
                                    {appointment?.doctor?.firstName?.[0]}{appointment?.doctor?.lastName?.[0]}
                                </div>
                                <div>
                                    <h4>Dr. {appointment?.doctor?.firstName} {appointment?.doctor?.lastName}</h4>
                                    <p>{appointment?.doctor?.specialty}</p>
                                </div>
                            </div>

                            <div className="apt-details">
                                <div className="detail-row">
                                    <span>📅 Date</span>
                                    <span>{new Date(appointment?.scheduledDate).toLocaleDateString('en-US', {
                                        weekday: 'long',
                                        month: 'long',
                                        day: 'numeric'
                                    })}</span>
                                </div>
                                <div className="detail-row">
                                    <span>⏰ Time</span>
                                    <span>{appointment?.scheduledTime}</span>
                                </div>
                                <div className="detail-row">
                                    <span>📹 Type</span>
                                    <span>Video Consultation</span>
                                </div>
                            </div>
                        </div>

                        <div className="price-breakdown">
                            <div className="price-row">
                                <span>Consultation Fee</span>
                                <span>₹{appointment?.doctor?.consultationFee}</span>
                            </div>
                            <div className="price-row">
                                <span>Platform Fee</span>
                                <span>₹0</span>
                            </div>
                            <div className="price-row total">
                                <span>Total</span>
                                <span>₹{appointment?.doctor?.consultationFee}</span>
                            </div>
                        </div>

                        <div className="secure-badge">
                            <span>🔒</span>
                            <span>Secure Payment Protected by 256-bit SSL</span>
                        </div>
                    </div>

                    {/* Payment Form */}
                    <div className="payment-form-container">
                        <h2>Payment Method</h2>

                        {error && (
                            <div className="alert alert-error">{error}</div>
                        )}

                        {/* Payment Method Selection */}
                        <div className="payment-methods">
                            <label className={`method-option ${paymentMethod === 'card' ? 'selected' : ''}`}>
                                <input
                                    type="radio"
                                    name="paymentMethod"
                                    value="card"
                                    checked={paymentMethod === 'card'}
                                    onChange={(e) => setPaymentMethod(e.target.value)}
                                />
                                <span className="method-icon">💳</span>
                                <span>Credit/Debit Card</span>
                            </label>

                            <label className={`method-option ${paymentMethod === 'upi' ? 'selected' : ''}`}>
                                <input
                                    type="radio"
                                    name="paymentMethod"
                                    value="upi"
                                    checked={paymentMethod === 'upi'}
                                    onChange={(e) => setPaymentMethod(e.target.value)}
                                />
                                <span className="method-icon">📱</span>
                                <span>UPI</span>
                            </label>

                            <label className={`method-option ${paymentMethod === 'netbanking' ? 'selected' : ''}`}>
                                <input
                                    type="radio"
                                    name="paymentMethod"
                                    value="netbanking"
                                    checked={paymentMethod === 'netbanking'}
                                    onChange={(e) => setPaymentMethod(e.target.value)}
                                />
                                <span className="method-icon">🏦</span>
                                <span>Net Banking</span>
                            </label>
                        </div>

                        {/* Card Details Form */}
                        {paymentMethod === 'card' && (
                            <form onSubmit={handlePayment} className="card-form animate-fadeIn">
                                <div className="form-group">
                                    <label className="form-label">Cardholder Name</label>
                                    <input
                                        type="text"
                                        name="name"
                                        className="form-input"
                                        placeholder="John Doe"
                                        value={cardDetails.name}
                                        onChange={handleCardChange}
                                        required
                                    />
                                </div>

                                <div className="form-group">
                                    <label className="form-label">Card Number</label>
                                    <input
                                        type="text"
                                        name="cardNumber"
                                        className="form-input"
                                        placeholder="4242 4242 4242 4242"
                                        value={cardDetails.cardNumber}
                                        onChange={handleCardChange}
                                        required
                                    />
                                </div>

                                <div className="form-row">
                                    <div className="form-group">
                                        <label className="form-label">Expiry Date</label>
                                        <input
                                            type="text"
                                            name="expiry"
                                            className="form-input"
                                            placeholder="MM/YY"
                                            value={cardDetails.expiry}
                                            onChange={handleCardChange}
                                            required
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">CVV</label>
                                        <input
                                            type="text"
                                            name="cvv"
                                            className="form-input"
                                            placeholder="123"
                                            value={cardDetails.cvv}
                                            onChange={handleCardChange}
                                            required
                                        />
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    className="btn btn-primary btn-lg w-full pay-btn"
                                    disabled={processing}
                                >
                                    {processing ? (
                                        <>
                                            <span className="spinner"></span>
                                            Processing...
                                        </>
                                    ) : (
                                        `Pay ₹${appointment?.doctor?.consultationFee}`
                                    )}
                                </button>
                            </form>
                        )}

                        {/* UPI Form */}
                        {paymentMethod === 'upi' && (
                            <form onSubmit={handlePayment} className="upi-form animate-fadeIn">
                                <div className="form-group">
                                    <label className="form-label">UPI ID</label>
                                    <input
                                        type="text"
                                        className="form-input"
                                        placeholder="yourname@upi"
                                        required
                                    />
                                </div>
                                <button
                                    type="submit"
                                    className="btn btn-primary btn-lg w-full pay-btn"
                                    disabled={processing}
                                >
                                    {processing ? 'Processing...' : `Pay ₹${appointment?.doctor?.consultationFee}`}
                                </button>
                            </form>
                        )}

                        {/* Net Banking */}
                        {paymentMethod === 'netbanking' && (
                            <div className="netbanking-form animate-fadeIn">
                                <p className="text-secondary mb-md">Select your bank:</p>
                                <div className="bank-grid">
                                    {['SBI', 'HDFC', 'ICICI', 'Axis', 'Kotak', 'Other'].map(bank => (
                                        <button key={bank} className="bank-option" onClick={handlePayment}>
                                            {bank}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Demo Notice */}
                        <div className="demo-notice">
                            <p><strong>Demo Mode:</strong> Use any test card details to proceed.</p>
                            <p>Test Card: 4242 4242 4242 4242</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Payment;
