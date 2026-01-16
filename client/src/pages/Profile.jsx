import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
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
                <div className="profile-header">
                    <div className="profile-avatar">
                        {user.firstName?.[0]}{user.lastName?.[0]}
                    </div>
                    <div className="profile-title">
                        <h1>{t('profileSettings')}</h1>
                        <p className="text-secondary">{t('manageAccount')}</p>
                    </div>
                </div>

                {message && (
                    <div className={`alert ${message.includes('success') ? 'alert-success' : 'alert-error'}`}>
                        {message}
                    </div>
                )}

                <div className="profile-content">
                    {/* Profile Info Card */}
                    <div className="profile-card">
                        <div className="card-header">
                            <h3>Personal Information</h3>
                            {!isEditing && (
                                <button
                                    className="btn btn-secondary btn-sm"
                                    onClick={() => setIsEditing(true)}
                                >
                                    ✏️ Edit
                                </button>
                            )}
                        </div>

                        <form onSubmit={handleSubmit}>
                            <div className="form-grid">
                                <div className="form-group">
                                    <label>First Name</label>
                                    {isEditing ? (
                                        <input
                                            type="text"
                                            name="firstName"
                                            value={formData.firstName}
                                            onChange={handleChange}
                                            className="form-input"
                                        />
                                    ) : (
                                        <p className="form-value">{formData.firstName || '-'}</p>
                                    )}
                                </div>

                                <div className="form-group">
                                    <label>Last Name</label>
                                    {isEditing ? (
                                        <input
                                            type="text"
                                            name="lastName"
                                            value={formData.lastName}
                                            onChange={handleChange}
                                            className="form-input"
                                        />
                                    ) : (
                                        <p className="form-value">{formData.lastName || '-'}</p>
                                    )}
                                </div>

                                <div className="form-group">
                                    <label>Email</label>
                                    <p className="form-value">{formData.email}</p>
                                    <small className="text-muted">Email cannot be changed</small>
                                </div>

                                <div className="form-group">
                                    <label>Phone</label>
                                    {isEditing ? (
                                        <input
                                            type="tel"
                                            name="phone"
                                            value={formData.phone}
                                            onChange={handleChange}
                                            className="form-input"
                                            placeholder="+91 XXXXX XXXXX"
                                        />
                                    ) : (
                                        <p className="form-value">{formData.phone || 'Not provided'}</p>
                                    )}
                                </div>

                                <div className="form-group">
                                    <label>Date of Birth</label>
                                    {isEditing ? (
                                        <input
                                            type="date"
                                            name="dateOfBirth"
                                            value={formData.dateOfBirth}
                                            onChange={handleChange}
                                            className="form-input"
                                        />
                                    ) : (
                                        <p className="form-value">{formData.dateOfBirth || 'Not provided'}</p>
                                    )}
                                </div>

                                <div className="form-group">
                                    <label>Gender</label>
                                    {isEditing ? (
                                        <select
                                            name="gender"
                                            value={formData.gender}
                                            onChange={handleChange}
                                            className="form-input"
                                        >
                                            <option value="">Select</option>
                                            <option value="male">Male</option>
                                            <option value="female">Female</option>
                                            <option value="other">Other</option>
                                        </select>
                                    ) : (
                                        <p className="form-value">{formData.gender || 'Not provided'}</p>
                                    )}
                                </div>
                            </div>

                            <div className="form-group full-width">
                                <label>Address</label>
                                {isEditing ? (
                                    <textarea
                                        name="address"
                                        value={formData.address}
                                        onChange={handleChange}
                                        className="form-input"
                                        rows={2}
                                        placeholder="Enter your address"
                                    />
                                ) : (
                                    <p className="form-value">{formData.address || 'Not provided'}</p>
                                )}
                            </div>

                            <div className="form-group full-width">
                                <label>Emergency Contact</label>
                                {isEditing ? (
                                    <input
                                        type="tel"
                                        name="emergencyContact"
                                        value={formData.emergencyContact}
                                        onChange={handleChange}
                                        className="form-input"
                                        placeholder="Emergency contact number"
                                    />
                                ) : (
                                    <p className="form-value">{formData.emergencyContact || 'Not provided'}</p>
                                )}
                            </div>

                            {isEditing && (
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
                                        className="btn btn-primary"
                                        disabled={isSaving}
                                    >
                                        {isSaving ? 'Saving...' : 'Save Changes'}
                                    </button>
                                </div>
                            )}
                        </form>
                    </div>

                    {/* Account Actions Card */}
                    <div className="profile-card">
                        <div className="card-header">
                            <h3>Account Actions</h3>
                        </div>
                        <div className="account-actions">
                            <button
                                className="action-btn"
                                onClick={() => alert('Password change coming soon!')}
                            >
                                🔒 Change Password
                            </button>
                            <button
                                className="action-btn"
                                onClick={() => alert('Notification preferences coming soon!')}
                            >
                                🔔 Notification Preferences
                            </button>
                            <button
                                className="action-btn danger"
                                onClick={handleLogout}
                            >
                                🚪 Logout
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Profile;
