import { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';
import { ENDPOINTS } from '../config/api';

const AuthContext = createContext(null);

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within AuthProvider');
    }
    return context;
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        checkAuth();
    }, []);

    const checkAuth = async () => {
        const token = localStorage.getItem('token');
        if (!token) {
            setLoading(false);
            return;
        }

        try {
            const response = await api.get(ENDPOINTS.AUTH.ME);
            setUser(response.data.data);
        } catch (error) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
        } finally {
            setLoading(false);
        }
    };

    const login = async (email, password) => {
        const response = await api.post(ENDPOINTS.AUTH.LOGIN, { email, password });
        const { user, token } = response.data.data;

        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));
        setUser(user);

        return user;
    };

    const register = async (data) => {
        const response = await api.post(ENDPOINTS.AUTH.REGISTER, data);
        const { user, token } = response.data.data;

        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));
        setUser(user);

        return user;
    };

    const logout = async () => {
        try {
            await api.post(ENDPOINTS.AUTH.LOGOUT);
        } catch (error) {
            // Ignore logout errors
        }

        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
    };

    const value = {
        user,
        loading,
        isAuthenticated: !!user,
        isCoach: user?.role === 'coach',
        isSportif: user?.role === 'sportif',
        login,
        register,
        logout,
        checkAuth,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

export default AuthContext;
