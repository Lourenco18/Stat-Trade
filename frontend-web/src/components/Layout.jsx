import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../stores/authStore';
import { Menu, LogOut, BarChart3, TrendingUp, BookOpen, Lightbulb, Settings, Wallet } from 'lucide-react';

export default function Layout({ children }) {
    const navigate = useNavigate();
    const logout = useAuthStore((state) => state.logout);
    const user = useAuthStore((state) => state.user);
    const [sidebarOpen, setSidebarOpen] = useState(true);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const navItems = [
        { icon: BarChart3, label: 'Dashboard', path: '/dashboard' },
        { icon: Wallet, label: 'Accounts', path: '/accounts' },
        { icon: TrendingUp, label: 'My Trades', path: '/trades' },
        { icon: BookOpen, label: 'Diary', path: '/diary' },
        { icon: Lightbulb, label: 'AI Insights', path: '/insights' },
        { icon: Settings, label: 'Settings', path: '/settings' }
    ];

    return (
        <div className="flex h-screen bg-gray-100">
            {/* Sidebar */}
            <div className={`${sidebarOpen ? 'w-64' : 'w-20'} bg-gray-900 text-white transition-all duration-300 flex flex-col`}>
                <div className="p-4 border-b border-gray-800">
                    <div className="flex items-center justify-between">
                        {sidebarOpen && <h1 className="text-xl font-bold">Stat-Trade</h1>}
                        <button
                            onClick={() => setSidebarOpen(!sidebarOpen)}
                            className="p-1 hover:bg-gray-800 rounded"
                        >
                            <Menu size={20} />
                        </button>
                    </div>
                </div>

                <nav className="flex-1 p-4">
                    {navItems.map((item) => (
                        <button
                            key={item.path}
                            onClick={() => navigate(item.path)}
                            className="w-full flex items-center gap-4 p-3 hover:bg-gray-800 rounded-lg transition mb-2"
                        >
                            <item.icon size={20} />
                            {sidebarOpen && <span>{item.label}</span>}
                        </button>
                    ))}
                </nav>

                <div className="p-4 border-t border-gray-800">
                    {sidebarOpen && (
                        <div className="mb-4">
                            <p className="text-sm text-gray-400">Hello,</p>
                            <p className="font-semibold truncate">{user?.firstName || user?.email}</p>
                        </div>
                    )}
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center justify-center gap-2 p-3 bg-red-600 hover:bg-red-700 rounded-lg transition"
                    >
                        <LogOut size={20} />
                        {sidebarOpen && <span>Logout</span>}
                    </button>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 overflow-auto">
                <div className="p-8">
                    {children}
                </div>
            </div>
        </div>
    );
}
