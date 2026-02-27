import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        try {
            const token = localStorage.getItem('aegis_token');
            if (token) setIsAuthenticated(true);
        } catch {
            console.warn("localStorage is not available.");
        } finally {
            setLoading(false);
        }
    }, []);

    const loginAuth = (token) => {
        try {
            if (token) localStorage.setItem('aegis_token', token);
            setIsAuthenticated(true);
        } catch {
            setIsAuthenticated(true);
        }
    };

    const logoutAuth = () => {
        try {
            localStorage.removeItem('aegis_token');
        } finally {
            setIsAuthenticated(false);
        }
    };

    return (
        <AuthContext.Provider value={{ isAuthenticated, loading, loginAuth, logoutAuth }}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
