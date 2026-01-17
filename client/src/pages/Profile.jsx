import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { authService } from '../services/api';
import { useLanguage } from '../context/LanguageContext';
import './Profile.css';

const Profile = () => {
    const { user, logout, refreshUser } = useAuth();
    const { t } = useLanguage();
    const navigate = useNavigate();

    const [isEditing, setIsEditing] = useState(false);
    const [isEditingMedical, setIsEditingMedical] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [message, setMessage] = useState('');

    // Medical profile data
    const [medicalData, setMedicalData] = useState({
        bloodType: 'O+',
        height: '175',
        weight: '72',
        emergencyContact: '+91 98765 43210',
        allergies: 'Penicillin, Peanuts',
        conditions: 'Mild anxiety'
    });

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
            await refreshUser(); // Refresh user data to update UI
            setMessage('Profile updated successfully!');
            setIsEditing(false);
        } catch (error) {
            setMessage(error.message || 'Failed to update profile');
        } finally {
            setIsSaving(false);
        }
    };

    const handleMedicalChange = (e) => {
        const { name, value } = e.target;
        setMedicalData(prev => ({ ...prev, [name]: value }));
    };

    const handleMedicalSubmit = async (e) => {
        e.preventDefault();
        setIsSaving(true);
        setMessage('');

        try {
            await authService.updateProfile({
                bloodType: medicalData.bloodType,
                height: medicalData.height + ' cm',
                weight: medicalData.weight + ' kg',
                emergencyContact: medicalData.emergencyContact,
                allergies: medicalData.allergies.split(',').map(a => a.trim()),
                conditions: medicalData.conditions.split(',').map(c => c.trim())
            });
            setMessage('Medical profile updated successfully!');
            setIsEditingMedical(false);
        } catch (error) {
            setMessage(error.message || 'Failed to update medical profile');
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
                                onClick={() => {
                                    setIsEditing(true);
                                    document.getElementById('edit-section')?.scrollIntoView({ behavior: 'smooth' });
                                }}
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

                        {/* Medical Profile Section */}
                        <div className="profile-section">
                            <div className="section-header-row">
                                <h3 className="section-title">📋 Medical Profile</h3>
                                <button
                                    className="btn btn-secondary btn-sm"
                                    onClick={() => setIsEditingMedical(!isEditingMedical)}
                                >
                                    {isEditingMedical ? 'Cancel' : 'Edit Medical Info'}
                                </button>
                            </div>

                            {!isEditingMedical ? (
                                <>
                                    <div className="medical-profile-grid">
                                        <div className="medical-item">
                                            <span className="medical-label">GENDER</span>
                                            <span className="medical-value">{user?.gender ? user.gender.charAt(0).toUpperCase() + user.gender.slice(1) : 'Not set'}</span>
                                        </div>
                                        <div className="medical-item">
                                            <span className="medical-label">AGE</span>
                                            <span className="medical-value">
                                                {user?.dateOfBirth
                                                    ? Math.floor((new Date() - new Date(user.dateOfBirth)) / (365.25 * 24 * 60 * 60 * 1000)) + ' yrs'
                                                    : 'Not set'}
                                            </span>
                                        </div>
                                        <div className="medical-item">
                                            <span className="medical-label">BLOOD TYPE</span>
                                            <span className="medical-value blood-type">{medicalData.bloodType}</span>
                                        </div>
                                        <div className="medical-item">
                                            <span className="medical-label">HEIGHT</span>
                                            <span className="medical-value">{medicalData.height} cm</span>
                                        </div>
                                        <div className="medical-item">
                                            <span className="medical-label">WEIGHT</span>
                                            <span className="medical-value">{medicalData.weight} kg</span>
                                        </div>
                                        <div className="medical-item">
                                            <span className="medical-label">EMERGENCY CONTACT</span>
                                            <span className="medical-value">{medicalData.emergencyContact}</span>
                                        </div>
                                    </div>
                                    <div className="medical-tags">
                                        <div className="tag-group">
                                            <span className="tag-label">⚠️ Allergies:</span>
                                            {medicalData.allergies.split(',').map((a, i) => (
                                                <span key={i} className="tag allergy">{a.trim()}</span>
                                            ))}
                                        </div>
                                        <div className="tag-group">
                                            <span className="tag-label">🏥 Conditions:</span>
                                            {medicalData.conditions.split(',').map((c, i) => (
                                                <span key={i} className="tag condition">{c.trim()}</span>
                                            ))}
                                        </div>
                                    </div>
                                </>
                            ) : (
                                <form onSubmit={handleMedicalSubmit} className="medical-edit-form">
                                    <div className="form-grid">
                                        <div className="form-group">
                                            <label>Blood Type</label>
                                            <select
                                                name="bloodType"
                                                value={medicalData.bloodType}
                                                onChange={handleMedicalChange}
                                                className="form-input form-input-dark"
                                            >
                                                <option value="">Select</option>
                                                <option value="A+">A+</option>
                                                <option value="A-">A-</option>
                                                <option value="B+">B+</option>
                                                <option value="B-">B-</option>
                                                <option value="AB+">AB+</option>
                                                <option value="AB-">AB-</option>
                                                <option value="O+">O+</option>
                                                <option value="O-">O-</option>
                                            </select>
                                        </div>
                                        <div className="form-group">
                                            <label>Height (cm)</label>
                                            <input
                                                type="number"
                                                name="height"
                                                value={medicalData.height}
                                                onChange={handleMedicalChange}
                                                className="form-input form-input-dark"
                                                placeholder="175"
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label>Weight (kg)</label>
                                            <input
                                                type="number"
                                                name="weight"
                                                value={medicalData.weight}
                                                onChange={handleMedicalChange}
                                                className="form-input form-input-dark"
                                                placeholder="72"
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label>Emergency Contact</label>
                                            <input
                                                type="tel"
                                                name="emergencyContact"
                                                value={medicalData.emergencyContact}
                                                onChange={handleMedicalChange}
                                                className="form-input form-input-dark"
                                                placeholder="+91 XXXXX XXXXX"
                                            />
                                        </div>
                                    </div>
                                    <div className="form-group" style={{ marginTop: 'var(--space-md)' }}>
                                        <label>Allergies (comma separated)</label>
                                        <input
                                            type="text"
                                            name="allergies"
                                            value={medicalData.allergies}
                                            onChange={handleMedicalChange}
                                            className="form-input form-input-dark"
                                            placeholder="Penicillin, Peanuts"
                                        />
                                    </div>
                                    <div className="form-group" style={{ marginTop: 'var(--space-md)' }}>
                                        <label>Medical Conditions (comma separated)</label>
                                        <input
                                            type="text"
                                            name="conditions"
                                            value={medicalData.conditions}
                                            onChange={handleMedicalChange}
                                            className="form-input form-input-dark"
                                            placeholder="Mild anxiety, Hypertension"
                                        />
                                    </div>
                                    <div className="form-actions">
                                        <button
                                            type="button"
                                            className="btn btn-secondary"
                                            onClick={() => setIsEditingMedical(false)}
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            type="submit"
                                            className="btn btn-primary btn-gradient"
                                            disabled={isSaving}
                                        >
                                            {isSaving ? 'Saving...' : '💾 Save Medical Info'}
                                        </button>
                                    </div>
                                </form>
                            )}
                        </div>

                        {/* Edit Form (shown when editing) */}
                        {isEditing && (
                            <div id="edit-section" className="profile-section profile-edit-card">
                                <h3 className="section-title">✏️ Edit Personal Information</h3>
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
                                            <label>Gender</label>
                                            <select
                                                name="gender"
                                                value={formData.gender}
                                                onChange={handleChange}
                                                className="form-input form-input-dark"
                                            >
                                                <option value="">Select Gender</option>
                                                <option value="male">Male</option>
                                                <option value="female">Female</option>
                                                <option value="other">Other</option>
                                            </select>
                                        </div>
                                        <div className="form-group">
                                            <label>Date of Birth</label>
                                            <input
                                                type="date"
                                                name="dateOfBirth"
                                                value={formData.dateOfBirth ? formData.dateOfBirth.split('T')[0] : ''}
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
