import React, { useState, useEffect } from 'react';
import { Wallet, Target, Zap, TrendingUp, AlertCircle, Loader2, Save } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const BudgetSettings: React.FC = () => {
    const { token } = useAuth();
    const [limit, setLimit] = useState('');
    const [stats, setStats] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    useEffect(() => {
        const fetchBudget = async () => {
            try {
                const response = await fetch('http://localhost:5000/api/energy/dashboard-stats', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (response.ok) {
                    const data = await response.json();
                    setStats(data);
                    setLimit(data.budgetLimit?.toString() || '');
                }
            } catch (error) {
                console.error('Error fetching budget:', error);
            } finally {
                setLoading(false);
            }
        };

        if (token) fetchBudget();
    }, [token]);

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        setMessage(null);

        try {
            const response = await fetch('http://localhost:5000/api/energy/budget', {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ limit: parseFloat(limit) }),
            });

            if (response.ok) {
                setMessage({ type: 'success', text: 'Budget updated successfully!' });
                // Update stats locally
                setStats((prev: any) => ({ ...prev, budgetLimit: parseFloat(limit) }));
            } else {
                throw new Error('Failed to update budget');
            }
        } catch (err: any) {
            setMessage({ type: 'error', text: err.message });
        } finally {
            setSaving(false);
        }
    };

    if (loading) return (
        <div className="flex items-center justify-center h-full">
            <Loader2 className="animate-spin text-primary-600" size={32} />
        </div>
    );

    const percent = stats?.budgetLimit > 0 ? (stats.monthlySpent / stats.budgetLimit) * 100 : 0;
    const isExceeded = percent > 100;

    return (
        <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-700">
            <div>
                <h2 className="text-2xl font-bold text-slate-800">Budget Management</h2>
                <p className="text-slate-500 mt-1">Set targets to control your energy spending.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Current Status Card */}
                <div className="md:col-span-2 space-y-8">
                    <div className="bg-white p-8 rounded-[2rem] border border-slate-200 shadow-sm relative overflow-hidden">
                        <div className="flex items-center justify-between mb-8">
                            <h3 className="text-xl font-bold text-slate-800">Monthly Progress</h3>
                            <span className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider ${
                                isExceeded ? 'bg-rose-100 text-rose-600' : 'bg-emerald-100 text-emerald-600'
                            }`}>
                                {isExceeded ? 'Limit Exceeded' : 'On Track'}
                            </span>
                        </div>

                        <div className="space-y-6">
                            <div className="flex justify-between items-end">
                                <div>
                                    <p className="text-slate-500 text-sm font-medium mb-1">Current Consumption</p>
                                    <p className="text-4xl font-black text-slate-800">{stats?.monthlySpent} <span className="text-lg font-normal text-slate-400">kWh</span></p>
                                </div>
                                <div className="text-right">
                                    <p className="text-slate-500 text-sm font-medium mb-1">Monthly Goal</p>
                                    <p className="text-lg font-bold text-slate-600">{stats?.budgetLimit || 0} kWh</p>
                                </div>
                            </div>

                            <div className="relative h-4 w-full bg-slate-100 rounded-full overflow-hidden">
                                <div 
                                    className={`absolute top-0 left-0 h-full transition-all duration-1000 ease-out rounded-full ${
                                        isExceeded ? 'bg-rose-500' : 'bg-primary-500'
                                    }`}
                                    style={{ width: `${Math.min(percent, 100)}%` }}
                                ></div>
                            </div>

                            <div className="flex justify-between text-xs font-bold text-slate-400 uppercase tracking-widest">
                                <span>0%</span>
                                <span>{percent.toFixed(1)}% of budget used</span>
                                <span>100%</span>
                            </div>
                        </div>

                        {/* Decoration */}
                        <div className="absolute top-0 right-0 p-8 opacity-[0.03]">
                            <Target size={120} />
                        </div>
                    </div>

                    <div className="bg-primary-50 p-6 rounded-[2rem] border border-primary-100 flex gap-4">
                        <div className="p-3 bg-white rounded-2xl text-primary-600 h-fit shadow-sm">
                            <TrendingUp size={24} />
                        </div>
                        <div>
                            <h4 className="font-bold text-primary-900 mb-1">Savings Insight</h4>
                            <p className="text-sm text-primary-700 leading-relaxed">
                                Based on your current usage, you're projected to spend 
                                <span className="font-bold underline mx-1">${(stats.monthlySpent * 0.15 * 1.2).toFixed(2)}</span>
                                this month. Try lowering your limit to save more!
                            </p>
                        </div>
                    </div>
                </div>

                {/* Settings Form */}
                <div className="bg-white p-8 rounded-[2rem] border border-slate-200 shadow-sm h-fit">
                    <div className="flex items-center gap-3 mb-8">
                        <div className="p-2 bg-slate-100 text-slate-600 rounded-lg">
                            <Wallet size={20} />
                        </div>
                        <h3 className="text-lg font-bold text-slate-800">Set Monthly Limit</h3>
                    </div>

                    {message && (
                        <div className={`p-4 rounded-xl text-sm mb-6 border flex items-center gap-2 ${
                            message.type === 'success' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-rose-50 text-rose-600 border-rose-100'
                        }`}>
                            {message.type === 'error' && <AlertCircle size={16} />}
                            {message.text}
                        </div>
                    )}

                    <form onSubmit={handleSave} className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-slate-700 ml-1">Energy limit (kWh)</label>
                            <div className="relative">
                                <Zap className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                <input
                                    type="number"
                                    value={limit}
                                    onChange={(e) => setLimit(e.target.value)}
                                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-3.5 pl-12 pr-4 outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all font-bold"
                                    placeholder="Enter limit"
                                    required
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={saving}
                            className="w-full bg-slate-900 text-white font-bold py-4 rounded-2xl hover:bg-slate-800 transition-all flex items-center justify-center gap-2 disabled:opacity-70 shadow-lg shadow-slate-200"
                        >
                            {saving ? (
                                <Loader2 className="animate-spin" size={20} />
                            ) : (
                                <>
                                    <Save size={18} />
                                    Save Changes
                                </>
                            )}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default BudgetSettings;
