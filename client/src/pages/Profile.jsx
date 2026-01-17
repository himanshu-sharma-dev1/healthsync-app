import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { authService } from '../services/api';
import { useLanguage } from '../context/LanguageContext';
import './Profile.css';

const Profile = () => {
    const { user, logout } = useAuth();
    const { t } = useLanguage();
    const navigate = useNavigate();

    const [isEditing, setIsEditing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [message, setMessage] = useState('');

    // Modal states
    const [showPasswordModal, setShowPasswordModal] = useState(false);
    const [showNotificationModal, setShowNotificationModal] = useState(false);
    const [passwordData, setPasswordData] = useState({ current: '', new: '', confirm: '' });
    const [notifications, setNotifications] = useState({
        appointments: true,
        reminders: true,
        promotions: false,
        email: true,
        sms: false
    });

    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        dateOfBirth: '',
        gender: '',
        address: '',
        emergencyContact: ''
    });

    // Calculate account age in days
    const accountCreatedDate = new Date('2025-12-05'); // Demo date
    const today = new Date();
    const accountAgeDays = Math.floor((today - accountCreatedDate) / (1000 * 60 * 60 * 24));

    // Load user data
    useEffect(() => {
        if (user) {
            setFormData({
                firstName: user.firstName || '',
                lastName: user.lastName || '',
                email: user.email || '',
                phone: user.phone || '',
                dateOfBirth: user.dateOfBirth || '',
                gender: user.gender || '',
                address: user.address || '',
                emergencyContact: user.emergencyContact || ''
            });
        }
    }, [user]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSaving(true);
        setMessage('');

        try {
            await authService.updateProfile(formData);
            setMessage('Profile updated successfully!');
            setIsEditing(false);
        } catch (error) {
            setMessage(error.message || 'Failed to update profile');
        } finally {
            setIsSaving(false);
        }
    };

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    const handlePasswordChange = async (e) => {
        e.preventDefault();
        if (passwordData.new !== passwordData.confirm) {
            setMessage('New passwords do not match');
            return;
        }
        if (passwordData.new.length < 6) {
            setMessage('Password must be at least 6 characters');
            return;
        }

        try {
            // Call API to change password
            await authService.changePassword({
                currentPassword: passwordData.current,
                newPassword: passwordData.new
            });
            setMessage('Password changed successfully!');
            setShowPasswordModal(false);
            setPasswordData({ current: '', new: '', confirm: '' });
        } catch (error) {
            setMessage(error.message || 'Failed to change password');
        }
    };

    const handleNotificationSave = () => {
        setMessage('Notification preferences saved!');
        setShowNotificationModal(false);
    };

    if (!user) {
        return (
            <div className="profile-page">
                <div className="container">
                    <div className="not-logged-in">
                        <h2>Please log in to view your profile</h2>
                        <button onClick={() => navigate('/login')} className="btn btn-primary">
                            Go to Login
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="profile-page">
            <div className="container">
                {/* Page Header */}
                <div className="page-hero-section">
                    <h1>👤 My Profile</h1>
                    <p>Manage your account and view your health statistics</p>
                </div>

                {message && (
                    <div className={`alert ${message.includes('success') ? 'alert-success' : 'alert-error'}`}>
                        {message}
                    </div>
                )}

                {/* Two-Column Layout */}
                <div className="profile-layout">
                    {/* Left Sidebar */}
                    <div className="profile-sidebar">
                        <div className="profile-sidebar-card">
                            {/* Avatar with Active Badge */}
                            <div className="profile-avatar-section">
                                <div className="profile-avatar-large">
                                    {user.firstName?.[0]}
                                    <span className="active-badge">Active</span>
                                </div>
                            </div>

                            <h2 className="profile-name">{user.firstName} {user.lastName}</h2>
                            <p className="profile-email">{user.email}</p>

                            <button
                                className="btn btn-edit-profile"
                                onClick={() => setIsEditing(!isEditing)}
                            >
                                ✏️ Edit Profile
                            </button>

                            <div className="profile-meta">
                                <div className="meta-item">
                                    <span className="meta-icon">📅</span>
                                    <span className="meta-label">Member Since</span>
                                    <span className="meta-value">December 5, 2025</span>
                                </div>
                                <div className="meta-item">
                                    <span className="meta-icon">⏱️</span>
                                    <span className="meta-label">Account Age</span>
                                    <span className="meta-value">{accountAgeDays} days</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Content */}
                    <div className="profile-content-right">
                        {/* Health Statistics */}
                        <div className="profile-section">
                            <h3 className="section-title">📊 Your Health Statistics</h3>
                            <div className="stats-grid">
                                <div className="stat-card stat-blue">
                                    <span className="stat-icon">🩺</span>
                                    <span className="stat-number">5</span>
                                    <span className="stat-label">Total Appointments</span>
                                </div>
                                <div className="stat-card stat-teal">
                                    <span className="stat-icon">💬</span>
                                    <span className="stat-number">12</span>
                                    <span className="stat-label">Chat Sessions</span>
                                </div>
                                <div className="stat-card stat-orange">
                                    <span className="stat-icon">📋</span>
                                    <span className="stat-number">3</span>
                                    <span className="stat-label">Prescriptions</span>
                                </div>
                                <div className="stat-card stat-purple">
                                    <span className="stat-icon">🏆</span>
                                    <span className="stat-number">Active</span>
                                    <span className="stat-label">Status</span>
                                </div>
                            </div>
                        </div>

                        {/* Quick Actions */}
                        <div className="profile-section">
                            <h3 className="section-title">⚡ Quick Actions</h3>
                            <div className="quick-actions">
                                <Link to="/intake" className="action-pill action-green">🆕 Book Appointment</Link>
                                <Link to="/appointments" className="action-pill action-blue">📅 View Appointments</Link>
                                <Link to="/doctors" className="action-pill action-teal">🩺 Find Doctors</Link>
                                <Link to="/dashboard" className="action-pill action-purple">📊 Dashboard</Link>
                            </div>
                        </div>

                        {/* Edit Form (shown when editing) */}
                        {isEditing && (
                            <div className="profile-section profile-edit-card">
                                <h3 className="section-title">✏️ Edit Information</h3>
                                <form onSubmit={handleSubmit}>
                                    <div className="form-grid">
                                        <div className="form-group">
                                            <label>First Name</label>
                                            <input
                                                type="text"
                                                name="firstName"
                                                value={formData.firstName}
                                                onChange={handleChange}
                                                className="form-input form-input-dark"
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label>Last Name</label>
                                            <input
                                                type="text"
                                                name="lastName"
                                                value={formData.lastName}
                                                onChange={handleChange}
                                                className="form-input form-input-dark"
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label>Phone</label>
                                            <input
                                                type="tel"
                                                name="phone"
                                                value={formData.phone}
                                                onChange={handleChange}
                                                className="form-input form-input-dark"
                                                placeholder="+91 XXXXX XXXXX"
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label>Date of Birth</label>
                                            <input
                                                type="date"
                                                name="dateOfBirth"
                                                value={formData.dateOfBirth}
                                                onChange={handleChange}
                                                className="form-input form-input-dark"
                                            />
                                        </div>
                                    </div>
                                    <div className="form-actions">
                                        <button
                                            type="button"
                                            className="btn btn-secondary"
                                            onClick={() => setIsEditing(false)}
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            type="submit"
                                            className="btn btn-primary btn-gradient"
                                            disabled={isSaving}
                                        >
                                            {isSaving ? 'Saving...' : '💾 Save Changes'}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        )}

                        {/* Account Actions */}
                        <div className="profile-section">
                            <h3 className="section-title">⚙️ Account Settings</h3>
                            <div className="account-actions-grid">
                                <button className="action-btn-modern" onClick={() => setShowPasswordModal(true)}>
                                    🔒 Change Password
                                </button>
                                <button className="action-btn-modern" onClick={() => setShowNotificationModal(true)}>
                                    🔔 Notifications
                                </button>
                                <button className="action-btn-modern danger" onClick={handleLogout}>
                                    🚪 Logout
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Password Change Modal */}
            {showPasswordModal && (
                <div className="modal-overlay" onClick={() => setShowPasswordModal(false)}>
                    <div className="modal-content" onClick={e => e.stopPropagation()}>
                        <h3>🔒 Change Password</h3>
                        <form onSubmit={handlePasswordChange}>
                            <div className="form-group">
                                <label>Current Password</label>
                                <input
                                    type="password"
                                    className="form-input form-input-dark"
                                    value={passwordData.current}
                                    onChange={(e) => setPasswordData({ ...passwordData, current: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>New Password</label>
                                <input
                                    type="password"
                                    className="form-input form-input-dark"
                                    value={passwordData.new}
                                    onChange={(e) => setPasswordData({ ...passwordData, new: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>Confirm New Password</label>
                                <input
                                    type="password"
                                    className="form-input form-input-dark"
                                    value={passwordData.confirm}
                                    onChange={(e) => setPasswordData({ ...passwordData, confirm: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="modal-actions">
                                <button type="button" className="btn btn-secondary" onClick={() => setShowPasswordModal(false)}>
                                    Cancel
                                </button>
                                <button type="submit" className="btn btn-primary">
                                    Update Password
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Notifications Modal */}
            {showNotificationModal && (
                <div className="modal-overlay" onClick={() => setShowNotificationModal(false)}>
                    <div className="modal-content" onClick={e => e.stopPropagation()}>
                        <h3>🔔 Notification Preferences</h3>
                        <div className="notification-options">
                            <label className="toggle-option">
                                <span>📅 Appointment Reminders</span>
                                <input
                                    type="checkbox"
                                    checked={notifications.appointments}
                                    onChange={(e) => setNotifications({ ...notifications, appointments: e.target.checked })}
                                />
                            </label>
                            <label className="toggle-option">
                                <span>⏰ 1-Hour Reminders</span>
                                <input
                                    type="checkbox"
                                    checked={notifications.reminders}
                                    onChange={(e) => setNotifications({ ...notifications, reminders: e.target.checked })}
                                />
                            </label>
                            <label className="toggle-option">
                                <span>📧 Email Notifications</span>
                                <input
                                    type="checkbox"
                                    checked={notifications.email}
                                    onChange={(e) => setNotifications({ ...notifications, email: e.target.checked })}
                                />
                            </label>
                            <label className="toggle-option">
                                <span>📱 SMS Notifications</span>
                                <input
                                    type="checkbox"
                                    checked={notifications.sms}
                                    onChange={(e) => setNotifications({ ...notifications, sms: e.target.checked })}
                                />
                            </label>
                            <label className="toggle-option">
                                <span>🎁 Promotional Offers</span>
                                <input
                                    type="checkbox"
                                    checked={notifications.promotions}
                                    onChange={(e) => setNotifications({ ...notifications, promotions: e.target.checked })}
                                />
                            </label>
                        </div>
                        <div className="modal-actions">
                            <button className="btn btn-secondary" onClick={() => setShowNotificationModal(false)}>
                                Cancel
                            </button>
                            <button className="btn btn-primary" onClick={handleNotificationSave}>
                                Save Preferences
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Profile;
