import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import './Auth.css';

// Import images
import healthsyncLogo from '../assets/images/healthsync_logo_1768411126010.png';
import heroIllustration from '../assets/images/hero_illustration_1768411058198.png';

const Login = () => {
    const { t } = useLanguage();
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const { login } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            await login(formData.email, formData.password);
            // Redirect to origin page if available, otherwise dashboard
            const from = location.state?.from?.pathname || '/dashboard';
            navigate(from, { replace: true });
        } catch (err) {
            setError(err.message || 'Invalid email or password');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-page auth-page-split">
            {/* Hero Visual Panel */}
            <div className="auth-visual">
                <img src={heroIllustration} alt="Telehealth Consultation" className="auth-hero-img" />
                <div className="auth-visual-content">
                    <h2>{t('heroTitle')}</h2>
                    <p>{t('heroSubtitle')}</p>
                </div>
            </div>

            <div className="auth-container">
                <div className="auth-card">
                    <div className="auth-header">
                        <Link to="/" className="auth-logo">
                            <img src={healthsyncLogo} alt="HealthSync" className="auth-logo-img" />
                        </Link>
                        <h1>👋 {t('welcomeBack')}</h1>
                        <p>{t('signInToAccess')}</p>
                    </div>

                    {error && (
                        <div className="alert alert-error">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="auth-form">
                        <div className="form-group">
                            <label className="form-label">📧 Email</label>
                            <input
                                type="email"
                                name="email"
                                className="form-input"
                                placeholder="Enter email"
                                value={formData.email}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label">🔒 Password</label>
                            <input
                                type="password"
                                name="password"
                                className="form-input"
                                placeholder="Enter password"
                                value={formData.password}
                                onChange={handleChange}
                                required
                            />
                            <div className="forgot-link">
                                <Link to="#">Forgot Password?</Link>
                            </div>
                        </div>

                        <button type="submit" className="btn btn-primary btn-lg w-full" disabled={loading}>
                            {loading ? <span className="spinner"></span> : '🚀 Sign In'}
                        </button>
                    </form>

                    <div className="auth-footer">
                        <p>
                            Don&apos;t have an account?{' '}
                            <Link to="/register">Sign Up</Link>
                        </p>
                    </div>

                    {/* Demo credentials for hackathon */}
                    <div className="demo-credentials">
                        <p><strong>Demo Credentials:</strong></p>
                        <p>Patient: patient@demo.com / password123</p>
                        <p>Doctor: doctor@demo.com / password123</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;
