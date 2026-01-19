import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
    LayoutDashboard,
    Zap,
    Leaf,
    BarChart3,
    Bell,
    User,
    LogOut,
    Settings,
    ShieldAlert,
    Wallet
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

import AlertsPanel from '../dashboard/AlertsPanel';

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [isAlertsOpen, setIsAlertsOpen] = React.useState(false);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const navItems = [
        { icon: LayoutDashboard, label: 'Dashboard', path: '/' },
        { icon: BarChart3, label: 'Analysis', path: '/history' },
        { icon: Wallet, label: 'Budget', path: '/budget' },
        { icon: Leaf, label: 'Sustainability', path: '/sustainability' },
        { icon: User, label: 'Settings', path: '/settings' },
    ];

    if (user?.role === 'ADMIN') {
        navItems.push({ icon: ShieldAlert, label: 'Admin', path: '/admin' });
    }

    return (
        <div className="flex h-screen bg-slate-50 font-sans">
            {/* Sidebar */}
            <aside className="w-64 bg-white border-r border-slate-200 flex flex-col">
                <div className="p-6 flex items-center gap-3">
                    <div className="p-2 bg-primary-600 rounded-lg text-white">
                        <Zap size={24} fill="currentColor" />
                    </div>
                    <span className="text-xl font-bold text-slate-800 tracking-tight">
                        Green<span className="text-primary-600">Energy</span>
                    </span>
                </div>

                <nav className="flex-1 px-4 py-4 space-y-2">
                    {navItems.map((item) => (
                        <Link
                            key={item.label}
                            to={item.path}
                            className="flex items-center gap-3 px-4 py-3 text-slate-600 hover:bg-primary-50 hover:text-primary-600 rounded-xl transition-all duration-200 group"
                        >
                            <item.icon size={20} className="group-hover:scale-110 transition-transform" />
                            <span className="font-medium">{item.label}</span>
                        </Link>
                    ))}
                </nav>

                <div className="p-4 border-t border-slate-100">
                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-3 w-full px-4 py-3 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all duration-200"
                    >
                        <LogOut size={20} />
                        <span className="font-medium">Logout</span>
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 flex flex-col overflow-hidden">
                {/* Header */}
                <header className="h-16 bg-white/80 backdrop-blur-md border-b border-slate-200 px-8 flex items-center justify-between sticky top-0 z-10">
                    <h1 className="text-lg font-semibold text-slate-700">Overview</h1>

                    <div className="flex items-center gap-6">
                        <button 
                            onClick={() => setIsAlertsOpen(true)}
                            className="relative p-2 text-slate-500 hover:bg-slate-100 rounded-full transition-colors"
                        >
                            <Bell size={20} />
                            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
                        </button>
                        <div className="flex items-center gap-3 pl-6 border-l border-slate-200">
                            <div className="text-right">
                                <p className="text-sm font-semibold text-slate-800">{user?.profile?.name || 'User'}</p>
                                <p className="text-xs text-slate-500 capitalize">{user?.role.toLowerCase()}</p>
                            </div>
                            <div className="w-10 h-10 bg-primary-100 text-primary-700 rounded-full flex items-center justify-center font-bold">
                                {user?.profile?.name?.[0] || 'U'}
                            </div>
                        </div>
                    </div>
                </header>

                {/* Page Content */}
                <div className="flex-1 overflow-y-auto p-8 bg-[#F8FAFC]">
                    {children}
                </div>
            </main>

            <AlertsPanel isOpen={isAlertsOpen} onClose={() => setIsAlertsOpen(false)} />
        </div>
    );
};

export default Layout;
