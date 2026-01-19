import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Layout from './components/layout/Layout';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Register from './pages/Register';
import History from './pages/History';
import BudgetSettings from './pages/BudgetSettings';
import Sustainability from './pages/Sustainability';
import Profile from './pages/Profile';
import { Toaster } from 'react-hot-toast';

const PrivateRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { token, loading } = useAuth();

    if (loading) return <div className="h-screen flex items-center justify-center">Loading...</div>;

    return token ? <>{children}</> : <Navigate to="/login" />;
};

function App() {
    return (
        <AuthProvider>
            <Toaster position="top-right" />
            <Router>
                <Routes>
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />
                    <Route
                        path="/"
                        element={
                            <PrivateRoute>
                                <Layout>
                                    <Dashboard />
                                </Layout>
                            </PrivateRoute>
                        }
                    />
                    <Route
                        path="/history"
                        element={
                            <PrivateRoute>
                                <Layout>
                                    <History />
                                </Layout>
                            </PrivateRoute>
                        }
                    />
                    <Route
                        path="/budget"
                        element={
                            <PrivateRoute>
                                <Layout>
                                    <BudgetSettings />
                                </Layout>
                            </PrivateRoute>
                        }
                    />
                    <Route
                        path="/sustainability"
                        element={
                            <PrivateRoute>
                                <Layout>
                                    <Sustainability />
                                </Layout>
                            </PrivateRoute>
                        }
                    />
                    <Route
                        path="/settings"
                        element={
                            <PrivateRoute>
                                <Layout>
                                    <Profile />
                                </Layout>
                            </PrivateRoute>
                        }
                    />
                    <Route path="*" element={<Navigate to="/" />} />
                </Routes>
            </Router>
        </AuthProvider>
    );
}

export default App;
