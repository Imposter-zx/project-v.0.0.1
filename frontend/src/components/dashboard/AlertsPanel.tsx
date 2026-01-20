import React, { useState, useEffect } from 'react';
import { Bell, X, AlertTriangle, CheckCircle, Clock } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { formatDistanceToNow } from 'date-fns';
import API_URL from '../../config';

interface Alert {
    id: string;
    type: string;
    message: string;
    seen: boolean;
    createdAt: string;
}

const AlertsPanel: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
    const { token } = useAuth();
    const [alerts, setAlerts] = useState<Alert[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (isOpen && token) {
            fetchAlerts();
        }
    }, [isOpen, token]);

    const fetchAlerts = async () => {
        try {
            const response = await fetch(`${API_URL}/api/energy/alerts`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.ok) {
                const data = await response.json();
                setAlerts(data);
            }
        } catch (error) {
            console.error('Error fetching alerts:', error);
        } finally {
            setLoading(false);
        }
    };

    const markAsRead = async (id: string) => {
        try {
            const response = await fetch(`${API_URL}/api/energy/alerts/${id}/seen`, {
                method: 'PUT',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.ok) {
                setAlerts(prev => prev.map(a => a.id === id ? { ...a, seen: true } : a));
            }
        } catch (error) {
            console.error('Error marking alert as seen:', error);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex justify-end">
            <div className="absolute inset-0 bg-slate-900/20 backdrop-blur-sm" onClick={onClose}></div>
            <div className="relative w-full max-w-sm bg-white h-full shadow-2xl animate-in slide-in-from-right duration-300 flex flex-col">
                <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Bell className="text-primary-600" size={24} />
                        <h2 className="text-xl font-bold text-slate-800">Notifications</h2>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-slate-50 rounded-xl text-slate-400 hover:text-slate-600 transition-colors">
                        <X size={20} />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-6 space-y-4">
                    {loading ? (
                        <div className="flex justify-center py-10">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
                        </div>
                    ) : alerts.length > 0 ? (
                        alerts.map((alert) => (
                            <div 
                                key={alert.id} 
                                className={`p-4 rounded-2xl border transition-all ${
                                    alert.seen ? 'bg-white border-slate-100 opacity-75' : 'bg-slate-50 border-primary-100 shadow-sm'
                                }`}
                                onClick={() => !alert.seen && markAsRead(alert.id)}
                            >
                                <div className="flex gap-4">
                                    <div className={`mt-1 p-2 rounded-xl h-fit ${
                                        alert.type === 'ANOMALY' ? 'bg-rose-100 text-rose-600' : 
                                        alert.type === 'BUDGET_EXCEEDED' ? 'bg-amber-100 text-amber-600' : 'bg-blue-100 text-blue-600'
                                    }`}>
                                        <AlertTriangle size={18} />
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-center justify-between mb-1">
                                            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                                                {alert.type.replace('_', ' ')}
                                            </span>
                                            <div className="flex items-center gap-1 text-[10px] text-slate-400">
                                                <Clock size={10} />
                                                {formatDistanceToNow(new Date(alert.createdAt), { addSuffix: true })}
                                            </div>
                                        </div>
                                        <p className="text-sm text-slate-700 font-medium leading-relaxed">
                                            {alert.message}
                                        </p>
                                        {!alert.seen && (
                                            <button className="mt-3 text-xs font-bold text-primary-600 hover:text-primary-700">
                                                Mark as read
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="text-center py-20">
                            <div className="bg-slate-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                                <CheckCircle className="text-slate-300" size={32} />
                            </div>
                            <p className="text-slate-500 font-medium">No new notifications</p>
                        </div>
                    )}
                </div>

                <div className="p-6 border-t border-slate-100">
                    <button className="w-full py-3 text-sm font-bold text-slate-500 hover:text-primary-600 transition-colors">
                        Clear all notifications
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AlertsPanel;
