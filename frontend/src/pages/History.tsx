import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { 
    History as HistoryIcon, 
    ChevronRight,
    Loader2
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import API_URL from '../config';

const History: React.FC = () => {
    const { token } = useAuth();
    const [readings, setReadings] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchReadings = async () => {
            try {
                const response = await fetch(`${API_URL}/api/energy/readings`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (!response.ok) throw new Error('Failed to fetch readings');
                const data = await response.json();
                setReadings(data);
            } catch (err: any) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        if (token) fetchReadings();
    }, [token]);

    const handleDownloadReport = async () => {
        try {
            const response = await fetch(`${API_URL}/api/energy/report`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const blob = await response.json(); // Wait, the backend returns PDF stream
            // Correction: the backend pipes the PDF. Frontend should handle it as a blob.
        } catch (error) {
            console.error('Error downloading report:', error);
        }
    };

    // Better download function
    const downloadPDF = () => {
        window.open(`${API_URL}/api/energy/report?token=${token}`, '_blank');
    };

    if (loading) return (
        <div className="flex items-center justify-center h-full">
            <Loader2 className="animate-spin text-primary-600" size={32} />
        </div>
    );

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            <div className="flex items-center justify-between">
                <div>
                    <div className="flex items-center gap-2 text-slate-500 mb-2">
                        <Link to="/" className="hover:text-primary-600 transition-colors">Dashboard</Link>
                        <span>/</span>
                        <span className="text-slate-800 font-medium">Consumption History</span>
                    </div>
                    <h2 className="text-2xl font-bold text-slate-800">Energy Consumption Logs</h2>
                </div>
                <button 
                    onClick={downloadPDF}
                    className="bg-primary-600 text-white px-6 py-3 rounded-2xl font-bold flex items-center gap-2 hover:bg-primary-700 transition-all shadow-lg shadow-primary-200"
                >
                    <Download size={20} />
                    Export PDF Report
                </button>
            </div>

            <div className="bg-white rounded-[2rem] border border-slate-200 overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-slate-50 border-b border-slate-200">
                                <th className="px-8 py-5 text-sm font-semibold text-slate-600">Timestamp</th>
                                <th className="px-8 py-5 text-sm font-semibold text-slate-600">Amount (kWh)</th>
                                <th className="px-8 py-5 text-sm font-semibold text-slate-600">Device Source</th>
                                <th className="px-8 py-5 text-sm font-semibold text-slate-600 text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {readings.length > 0 ? (
                                readings.map((reading) => (
                                    <tr key={reading.id} className="hover:bg-slate-50/50 transition-colors group">
                                        <td className="px-8 py-5">
                                            <div className="flex items-center gap-3">
                                                <div className="p-2 bg-slate-100 text-slate-500 rounded-lg group-hover:bg-primary-50 group-hover:text-primary-600 transition-colors">
                                                    <Calendar size={16} />
                                                </div>
                                                <div>
                                                    <p className="text-sm font-semibold text-slate-800">
                                                        {format(new Date(reading.timestamp), 'MMM dd, yyyy')}
                                                    </p>
                                                    <p className="text-xs text-slate-500">
                                                        {format(new Date(reading.timestamp), 'hh:mm a')}
                                                    </p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-5">
                                            <div className="flex items-center gap-2">
                                                <Zap size={14} className="text-amber-500" />
                                                <span className="text-sm font-bold text-slate-800">{reading.amount} <span className="text-xs font-normal text-slate-500">kWh</span></span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-5">
                                            <span className="px-3 py-1 bg-slate-100 text-slate-600 rounded-full text-xs font-medium">
                                                {reading.deviceId || 'Manual Entry'}
                                            </span>
                                        </td>
                                        <td className="px-8 py-5 text-right">
                                            <button className="text-slate-400 hover:text-slate-600 transition-colors font-semibold text-sm">
                                                View Details
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={4} className="px-8 py-24 text-center">
                                        <div className="flex flex-col items-center max-w-xs mx-auto">
                                            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                                                <HistoryIcon className="text-slate-300" size={32} />
                                            </div>
                                            <h3 className="text-lg font-bold text-slate-800 mb-1">No data yet</h3>
                                            <p className="text-slate-500 text-sm mb-6 leading-relaxed">
                                                Your energy logs will appear here once you start adding readings.
                                            </p>
                                            <Link to="/" className="text-primary-600 font-bold text-sm bg-primary-50 px-6 py-2 rounded-xl hover:bg-primary-100 transition-colors">
                                                Go to Dashboard
                                            </Link>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination (Mock) */}
                <div className="px-8 py-6 bg-slate-50 flex items-center justify-between border-t border-slate-200">
                    <p className="text-sm text-slate-500">Showing {readings.length} results</p>
                    <div className="flex items-center gap-2">
                        <button className="p-2 rounded-xl border border-slate-200 bg-white text-slate-400 hover:text-slate-600 disabled:opacity-50">
                            <ChevronLeft size={20} />
                        </button>
                        <button className="p-2 rounded-xl border border-slate-200 bg-white text-slate-400 hover:text-slate-600 disabled:opacity-50">
                            <ChevronRight size={20} />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default History;
