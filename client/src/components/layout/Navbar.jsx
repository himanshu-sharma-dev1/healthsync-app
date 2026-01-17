import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';
import NotificationBell from '../NotificationBell';
import LanguageToggle from '../LanguageToggle';
import './Navbar.css';

// Import logo
import healthsyncLogo from '../../assets/images/healthsync_logo_1768411126010.png';

const Navbar = () => {
    const { user, logout, isAuthenticated } = useAuth();
    const { theme, toggleTheme, isDark } = useTheme();
    const { t } = useLanguage();
    const navigate = useNavigate();
    const location = useLocation();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [activeCall, setActiveCall] = useState(null);

    // Check for active video call on location change
    useEffect(() => {
        const checkActiveCall = () => {
            const callData = sessionStorage.getItem('activeVideoCall');
            if (callData) {
                const parsed = JSON.parse(callData);
                // Only show if not already on video call page
                if (!location.pathname.includes('/video/')) {
                    setActiveCall(parsed);
                } else {
                    setActiveCall(null);
                }
            } else {
                setActiveCall(null);
            }
        };
        checkActiveCall();
    }, [location]);

    const handleLogout = () => {
        logout();
        navigate('/');
        setMobileMenuOpen(false);
    };

    const closeMobileMenu = () => {
        setMobileMenuOpen(false);
    };

    return (
        <nav className="navbar">
            <div className="container navbar-container">
                <Link to={isAuthenticated ? "/dashboard" : "/"} className="navbar-brand" onClick={closeMobileMenu}>
                    <img
                        src={healthsyncLogo}
                        alt="HealthSync"
                        className="brand-logo"
                    />
                    <span className="brand-text">{t('appName')}</span>
                </Link>

                <div className={`navbar-links ${mobileMenuOpen ? 'open' : ''}`}>
                    <Link to="/doctors" className="nav-link" onClick={closeMobileMenu}>
                        🩺 {t('findDoctors')}
                    </Link>

                    {isAuthenticated ? (
                        <>
                            <Link to="/intake" className="nav-link nav-cta" onClick={closeMobileMenu}>
                                ➕ {t('bookAppointment')}
                            </Link>
                            <Link to="/appointments" className="nav-link" onClick={closeMobileMenu}>
                                📅 {t('appointments')}
                            </Link>
                            <Link to="/dashboard" className="nav-link" onClick={closeMobileMenu}>
                                📊 {t('dashboard')}
                            </Link>

                            <div className="user-menu">
                                <button className="user-btn">
                                    <span className="user-avatar">
                                        {user?.firstName?.[0]}{user?.lastName?.[0]}
                                    </span>
                                    <span className="user-name">{user?.firstName}</span>
                                    <span className="dropdown-arrow">▼</span>
                                </button>
                                <div className="user-dropdown">
                                    <div className="dropdown-header">
                                        <span className="dropdown-email">{user?.email || 'user@demo.com'}</span>
                                    </div>
                                    <Link to="/profile" onClick={closeMobileMenu}>👤 My Profile</Link>
                                    <Link to="/appointments" onClick={closeMobileMenu}>📋 My Appointments</Link>
                                    <Link to="/dashboard" onClick={closeMobileMenu}>📊 Dashboard</Link>
                                    <div className="dropdown-divider"></div>
                                    <button onClick={handleLogout}>🚪 {t('logout')}</button>
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className="auth-buttons">
                            <Link to="/login" className="btn btn-login" onClick={closeMobileMenu}>
                                🔐 {t('login')}
                            </Link>
                        </div>
                    )}
                </div>

                {/* Navbar Right Actions */}
                <div className="navbar-actions">
                    {/* Return to Call - Prominent position */}
                    {activeCall && (
                        <Link
                            to={`/video/${activeCall.appointmentId}`}
                            className="return-to-call-btn"
                            onClick={closeMobileMenu}
                        >
                            📹 Return to Call
                        </Link>
                    )}

                    {/* Notifications - only show when logged in */}
                    {isAuthenticated && <NotificationBell />}

                    {/* Language Toggle */}
                    <LanguageToggle />

                    {/* Theme Toggle */}
                    <button
                        className="theme-toggle"
                        onClick={toggleTheme}
                        title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
                        aria-label="Toggle theme"
                    >
                        <span className="theme-icon">{isDark ? '☀️' : '🌙'}</span>
                    </button>
                </div>

                {/* Mobile Menu Toggle */}
                <button
                    className="mobile-menu-toggle"
                    onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                    aria-label="Toggle menu"
                    aria-expanded={mobileMenuOpen}
                >
                    <span></span>
                    <span></span>
                    <span></span>
                </button>
            </div>
        </nav>
    );
};

export default Navbar;
