import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import useAuthStore from './stores/authStore';
import Layout from './components/Layout';
import Register from './pages/Register';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Trades from './pages/Trades';
import Diary from './pages/Diary';
import Insights from './pages/Insights';
import Settings from './pages/Settings';
import Accounts from './pages/Accounts';
import './index.css';

function App() {
    const token = useAuthStore((state) => state.token);

    return (
        <BrowserRouter>
            <Routes>
                {/* Public Routes */}
                <Route path="/register" element={<Register />} />
                <Route path="/login" element={<Login />} />

                {/* Protected Routes */}
                {token ? (
                    <Route
                        path="/*"
                        element={
                            <Layout>
                                <Routes>
                                    <Route path="/dashboard" element={<Dashboard />} />
                                    <Route path="/accounts" element={<Accounts />} />
                                    <Route path="/trades" element={<Trades />} />
                                    <Route path="/diary" element={<Diary />} />
                                    <Route path="/insights" element={<Insights />} />
                                    <Route path="/settings" element={<Settings />} />
                                    <Route path="/" element={<Navigate to="/dashboard" />} />
                                </Routes>
                            </Layout>
                        }
                    />
                ) : (
                    <Route path="*" element={<Navigate to="/login" />} />
                )}
            </Routes>
        </BrowserRouter>
    );
}

export default App;
