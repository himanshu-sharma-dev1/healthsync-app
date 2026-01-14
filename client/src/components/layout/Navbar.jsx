import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './Navbar.css';

const Navbar = () => {
    const { user, logout, isAuthenticated } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    return (
        <nav className="navbar">
            <div className="container navbar-container">
                <Link to="/" className="navbar-brand">
                    <span className="brand-icon">🏥</span>
                    <span className="brand-text">HealthSync</span>
                </Link>

                <div className="navbar-links">
                    <Link to="/doctors" className="nav-link">Find Doctors</Link>

                    {isAuthenticated ? (
                        <>
                            <Link to="/appointments" className="nav-link">My Appointments</Link>
                            <Link to="/dashboard" className="nav-link">Dashboard</Link>

                            <div className="user-menu">
                                <button className="user-btn">
                                    <span className="user-avatar">
                                        {user?.firstName?.[0]}{user?.lastName?.[0]}
                                    </span>
                                    <span className="user-name">{user?.firstName}</span>
                                </button>
                                <div className="user-dropdown">
                                    <Link to="/profile">Profile Settings</Link>
                                    <button onClick={handleLogout}>Logout</button>
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className="auth-buttons">
                            <Link to="/login" className="btn btn-secondary btn-sm">Login</Link>
                            <Link to="/register" className="btn btn-primary btn-sm">Sign Up</Link>
                        </div>
                    )}
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
