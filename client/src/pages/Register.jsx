import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Auth.css';

const Register = () => {
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        confirmPassword: '',
        role: 'patient',
        phone: '',
        specialty: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const { register } = useAuth();
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match');
            setLoading(false);
            return;
        }

        try {
            const { confirmPassword, ...userData } = formData;
            await register(userData);
            navigate('/dashboard');
        } catch (err) {
            setError(err.message || 'Registration failed');
        } finally {
            setLoading(false);
        }
    };

    const specialties = [
        'General Physician',
        'Cardiologist',
        'Dermatologist',
        'Orthopedic',
        'Pediatrician',
        'Psychiatrist',
        'Neurologist',
        'Gynecologist',
        'ENT Specialist',
        'Ophthalmologist'
    ];

    return (
        <div className="auth-page">
            <div className="auth-container">
                <div className="auth-card auth-card-lg">
                    <div className="auth-header">
                        <Link to="/" className="auth-logo">
                            <span>🏥</span> HealthSync
                        </Link>
                        <h1>Create Account</h1>
                        <p>Join HealthSync for instant healthcare access</p>
                    </div>

                    {error && (
                        <div className="alert alert-error">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="auth-form">
                        {/* Role Selection */}
                        <div className="role-selection">
                            <label
                                className={`role-option ${formData.role === 'patient' ? 'active' : ''}`}
                            >
                                <input
                                    type="radio"
                                    name="role"
                                    value="patient"
                                    checked={formData.role === 'patient'}
                                    onChange={handleChange}
                                />
                                <span className="role-icon">🧑‍🦱</span>
                                <span className="role-label">I'm a Patient</span>
                            </label>

                            <label
                                className={`role-option ${formData.role === 'doctor' ? 'active' : ''}`}
                            >
                                <input
                                    type="radio"
                                    name="role"
                                    value="doctor"
                                    checked={formData.role === 'doctor'}
                                    onChange={handleChange}
                                />
                                <span className="role-icon">👨‍⚕️</span>
                                <span className="role-label">I'm a Doctor</span>
                            </label>
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <label className="form-label">First Name</label>
                                <input
                                    type="text"
                                    name="firstName"
                                    className="form-input"
                                    placeholder="John"
                                    value={formData.firstName}
                                    onChange={handleChange}
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label className="form-label">Last Name</label>
                                <input
                                    type="text"
                                    name="lastName"
                                    className="form-input"
                                    placeholder="Doe"
                                    value={formData.lastName}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                        </div>

                        <div className="form-group">
                            <label className="form-label">Email Address</label>
                            <input
                                type="email"
                                name="email"
                                className="form-input"
                                placeholder="you@example.com"
                                value={formData.email}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label">Phone Number</label>
                            <input
                                type="tel"
                                name="phone"
                                className="form-input"
                                placeholder="+91 98765 43210"
                                value={formData.phone}
                                onChange={handleChange}
                            />
                        </div>

                        {formData.role === 'doctor' && (
                            <div className="form-group">
                                <label className="form-label">Specialty</label>
                                <select
                                    name="specialty"
                                    className="form-input"
                                    value={formData.specialty}
                                    onChange={handleChange}
                                    required
                                >
                                    <option value="">Select your specialty</option>
                                    {specialties.map(spec => (
                                        <option key={spec} value={spec}>{spec}</option>
                                    ))}
                                </select>
                            </div>
                        )}

                        <div className="form-row">
                            <div className="form-group">
                                <label className="form-label">Password</label>
                                <input
                                    type="password"
                                    name="password"
                                    className="form-input"
                                    placeholder="••••••••"
                                    value={formData.password}
                                    onChange={handleChange}
                                    required
                                    minLength={6}
                                />
                            </div>

                            <div className="form-group">
                                <label className="form-label">Confirm Password</label>
                                <input
                                    type="password"
                                    name="confirmPassword"
                                    className="form-input"
                                    placeholder="••••••••"
                                    value={formData.confirmPassword}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                        </div>

                        <button type="submit" className="btn btn-primary btn-lg w-full" disabled={loading}>
                            {loading ? <span className="spinner"></span> : 'Create Account'}
                        </button>
                    </form>

                    <div className="auth-footer">
                        <p>
                            Already have an account?{' '}
                            <Link to="/login">Sign in</Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Register;
