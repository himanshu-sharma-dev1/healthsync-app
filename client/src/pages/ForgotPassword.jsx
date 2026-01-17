import { useState } from 'react';
import { Link } from 'react-router-dom';
import './Auth.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const response = await fetch(`${API_URL}/auth/forgot-password`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email })
            });

            const data = await response.json();

            if (response.ok) {
                setSubmitted(true);
            } else {
                setError(data.message || 'Failed to send reset email');
            }
        } catch (err) {
            setError('Network error. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    if (submitted) {
        return (
            <div className="auth-page auth-centered">
                <div className="auth-card-centered">
                    <div className="auth-header">
                        <span className="success-icon">📧</span>
                        <h1>Check Your Email</h1>
                        <p>We've sent a password reset link to <strong>{email}</strong></p>
                    </div>
                    <div className="reset-instructions">
                        <ul>
                            <li>Check your inbox (and spam folder)</li>
                            <li>Click the reset link in the email</li>
                            <li>Create a new password</li>
                        </ul>
                    </div>
                    <Link to="/login" className="btn btn-primary w-full">
                        ← Back to Login
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="auth-page auth-centered">
            <div className="auth-hero-section">
                <h1>🔐 Forgot Password?</h1>
                <p>No worries! Enter your email and we'll send you a reset link.</p>
            </div>

            <div className="auth-card-centered">
                <form onSubmit={handleSubmit} className="auth-form">
                    {error && <div className="alert alert-error">{error}</div>}

                    <div className="form-group">
                        <label className="form-label">Email Address</label>
                        <input
                            type="email"
                            className="form-input form-input-dark"
                            placeholder="Enter your email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        className="btn btn-gradient w-full"
                        disabled={loading || !email}
                    >
                        {loading ? (
                            <>
                                <span className="spinner"></span>
                                Sending...
                            </>
                        ) : (
                            '📧 Send Reset Link'
                        )}
                    </button>
                </form>

                <div className="auth-footer">
                    <p>
                        Remember your password?{' '}
                        <Link to="/login">Back to Login</Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default ForgotPassword;
