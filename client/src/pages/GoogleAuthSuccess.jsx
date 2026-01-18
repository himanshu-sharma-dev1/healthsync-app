// Google OAuth Success Callback Handler
import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const GoogleAuthSuccess = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const { setUser } = useAuth();
    const [error, setError] = useState(null);

    useEffect(() => {
        const token = searchParams.get('token');

        if (token) {
            try {
                // Save token to localStorage
                localStorage.setItem('token', token);

                // Decode token to get user info (basic decode, not verification)
                const base64Url = token.split('.')[1];
                const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
                const payload = JSON.parse(window.atob(base64));

                // Fetch full user data
                fetchUserData(token);
            } catch (err) {
                console.error('Token processing error:', err);
                setError('Failed to process authentication token');
                setTimeout(() => navigate('/login?error=token_error'), 2000);
            }
        } else {
            setError('No authentication token received');
            setTimeout(() => navigate('/login?error=no_token'), 2000);
        }
    }, [searchParams, navigate]);

    const fetchUserData = async (token) => {
        try {
            const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';
            const response = await fetch(`${API_URL}/auth/me`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.ok) {
                const userData = await response.json();
                setUser(userData);

                // Redirect based on role
                if (userData.role === 'doctor') {
                    navigate('/doctor-dashboard');
                } else {
                    navigate('/dashboard');
                }
            } else {
                throw new Error('Failed to fetch user data');
            }
        } catch (err) {
            console.error('User fetch error:', err);
            // Still redirect to dashboard, auth context will handle
            navigate('/dashboard');
        }
    };

    if (error) {
        return (
            <div style={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                height: '50vh',
                color: '#ef4444'
            }}>
                <p>❌ {error}</p>
                <p>Redirecting to login...</p>
            </div>
        );
    }

    return (
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            height: '50vh',
            color: 'var(--text-primary)'
        }}>
            <div className="spinner" style={{ marginBottom: '1rem' }}></div>
            <p>🔐 Completing Google Sign-In...</p>
        </div>
    );
};

export default GoogleAuthSuccess;
