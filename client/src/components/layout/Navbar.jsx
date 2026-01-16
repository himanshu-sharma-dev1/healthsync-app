import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
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
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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
                <Link to="/" className="navbar-brand" onClick={closeMobileMenu}>
                    <img
                        src={healthsyncLogo}
                        alt="HealthSync"
                        className="brand-logo"
                    />
                    <span className="brand-text">{t('appName')}</span>
                </Link>

                <div className={`navbar-links ${mobileMenuOpen ? 'open' : ''}`}>
                    <Link to="/doctors" className="nav-link" onClick={closeMobileMenu}>
                        {t('findDoctors')}
                    </Link>

                    {isAuthenticated ? (
                        <>
                            <Link to="/intake" className="nav-link nav-cta" onClick={closeMobileMenu}>
                                {t('bookAppointment')}
                            </Link>
                            <Link to="/appointments" className="nav-link" onClick={closeMobileMenu}>
                                {t('appointments')}
                            </Link>
                            <Link to="/dashboard" className="nav-link" onClick={closeMobileMenu}>
                                {t('dashboard')}
                            </Link>

                            <div className="user-menu">
                                <button className="user-btn">
                                    <span className="user-avatar">
                                        {user?.firstName?.[0]}{user?.lastName?.[0]}
                                    </span>
                                    <span className="user-name">{user?.firstName}</span>
                                </button>
                                <div className="user-dropdown">
                                    <Link to="/profile" onClick={closeMobileMenu}>{t('settings')}</Link>
                                    <button onClick={handleLogout}>{t('logout')}</button>
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className="auth-buttons">
                            <Link to="/login" className="btn btn-secondary btn-sm" onClick={closeMobileMenu}>
                                {t('login')}
                            </Link>
                            <Link to="/register" className="btn btn-primary btn-sm" onClick={closeMobileMenu}>
                                {t('register')}
                            </Link>
                        </div>
                    )}
                </div>

                {/* Navbar Right Actions */}
                <div className="navbar-actions">
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
