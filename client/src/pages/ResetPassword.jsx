import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import './Auth.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

const ResetPassword = () => {
    const { token } = useParams();
    const navigate = useNavigate();

    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [verifying, setVerifying] = useState(true);
    const [tokenValid, setTokenValid] = useState(false);
    const [email, setEmail] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    // Verify token on mount
    useEffect(() => {
        const verifyToken = async () => {
            try {
                const response = await fetch(`${API_URL}/auth/verify-reset-token/${token}`);
                const data = await response.json();

                if (data.valid) {
                    setTokenValid(true);
                    setEmail(data.email);
                } else {
                    setError(data.message || 'Invalid or expired reset link');
                }
            } catch (err) {
                setError('Failed to verify reset link');
            } finally {
                setVerifying(false);
            }
        };

        if (token) {
            verifyToken();
        }
    }, [token]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (password !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        if (password.length < 6) {
            setError('Password must be at least 6 characters');
            return;
        }

        setLoading(true);

        try {
            const response = await fetch(`${API_URL}/auth/reset-password`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ token, newPassword: password })
            });

            const data = await response.json();

            if (response.ok) {
                setSuccess(true);
                setTimeout(() => navigate('/login'), 3000);
            } else {
                setError(data.message || 'Failed to reset password');
            }
        } catch (err) {
            setError('Network error. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    // Loading state
    if (verifying) {
        return (
            <div className="auth-page auth-centered">
                <div className="auth-card-centered">
                    <div className="auth-header">
                        <span className="spinner"></span>
                        <h1>Verifying Reset Link...</h1>
                    </div>
                </div>
            </div>
        );
    }

    // Invalid token
    if (!tokenValid) {
        return (
            <div className="auth-page auth-centered">
                <div className="auth-card-centered">
                    <div className="auth-header">
                        <span className="error-icon">❌</span>
                        <h1>Invalid Reset Link</h1>
                        <p>{error || 'This password reset link is invalid or has expired.'}</p>
                    </div>
                    <Link to="/forgot-password" className="btn btn-primary w-full">
                        Request New Reset Link
                    </Link>
                </div>
            </div>
        );
    }

    // Success state
    if (success) {
        return (
            <div className="auth-page auth-centered">
                <div className="auth-card-centered">
                    <div className="auth-header">
                        <span className="success-icon">✅</span>
                        <h1>Password Reset!</h1>
                        <p>Your password has been successfully changed.</p>
                        <p className="text-secondary">Redirecting to login...</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="auth-page auth-centered">
            <div className="auth-hero-section">
                <h1>🔐 Create New Password</h1>
                <p>Resetting password for <strong>{email}</strong></p>
            </div>

            <div className="auth-card-centered">
                <form onSubmit={handleSubmit} className="auth-form">
                    {error && <div className="alert alert-error">{error}</div>}

                    <div className="form-group">
                        <label className="form-label">New Password</label>
                        <input
                            type="password"
                            className="form-input form-input-dark"
                            placeholder="Enter new password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            minLength={6}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label">Confirm Password</label>
                        <input
                            type="password"
                            className="form-input form-input-dark"
                            placeholder="Confirm new password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        className="btn btn-gradient w-full"
                        disabled={loading || !password || !confirmPassword}
                    >
                        {loading ? (
                            <>
                                <span className="spinner"></span>
                                Resetting...
                            </>
                        ) : (
                            '🔐 Reset Password'
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default ResetPassword;
