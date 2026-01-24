import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/axios';

interface User {
    id: string;
    email: string;
    role: 'ADMIN' | 'COMPANY' | 'INDIVIDUAL';
    profile: {
        name: string;
    };
}

interface AuthContextType {
    user: User | null;
    isAuthenticated: boolean;
    login: (user: User) => void;
    logout: () => void;
    updateUser: (user: User) => void;
    loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const checkAuth = async () => {
            try {
                const response = await api.get('/api/auth/profile');
                if (response.data) {
                    setUser(response.data.user || response.data);
                }
            } catch (error) {
                console.error('Not authenticated');
            } finally {
                setLoading(false);
            }
        };
        checkAuth();
    }, []);

    const login = (newUser: User) => {
        setUser(newUser);
    };

    const logout = async () => {
        try {
            await api.post('/api/auth/logout');
            setUser(null);
        } catch (error) {
            console.error('Logout failed');
        }
    };

    const updateUser = (newUser: User) => {
        setUser(newUser);
    };

    return (
        <AuthContext.Provider value={{ user, isAuthenticated: !!user, login, logout, updateUser, loading }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
