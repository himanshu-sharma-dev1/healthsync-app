import { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/api';

const AuthContext = createContext(null);

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        checkAuth();
    }, []);

    const checkAuth = async () => {
        const token = localStorage.getItem('token');
        if (token) {
            try {
                const response = await authService.getMe();
                setUser(response.user);
            } catch (err) {
                localStorage.removeItem('token');
            }
        }
        setLoading(false);
    };

    const login = async (email, password) => {
        try {
            setError(null);
            const response = await authService.login(email, password);
            localStorage.setItem('token', response.token);
            setUser(response.user);
            return response;
        } catch (err) {
            setError(err.message || 'Login failed');
            throw err;
        }
    };

    const register = async (userData) => {
        try {
            setError(null);
            const response = await authService.register(userData);
            localStorage.setItem('token', response.token);
            setUser(response.user);
            return response;
        } catch (err) {
            setError(err.message || 'Registration failed');
            throw err;
        }
    };

    const logout = () => {
        localStorage.removeItem('token');
        setUser(null);
    };

    const value = {
        user,
        loading,
        error,
        login,
        register,
        logout,
        isAuthenticated: !!user
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

export default AuthContext;
