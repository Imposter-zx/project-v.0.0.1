import React, { useState } from 'react';
import { Target, AlertCircle, Loader2, Save } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../api/axios';
import toast from 'react-hot-toast';

const BudgetSettings: React.FC = () => {
    const queryClient = useQueryClient();

    const { data: stats, isLoading } = useQuery({
        queryKey: ['dashboard-stats'],
        queryFn: async () => {
            const res = await api.get('/api/energy/dashboard-stats');
            return res.data;
        }
    });

    const [limit, setLimit] = useState('');

    React.useEffect(() => {
        if (stats?.budgetLimit) {
            setLimit(stats.budgetLimit.toString());
        }
    }, [stats]);

    const mutation = useMutation({
        mutationFn: async (newLimit: number) => {
            const res = await api.post('/api/energy/budget', { limit: newLimit });
            return res.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
            toast.success('Budget limit updated!');
        },
        onError: () => {
            toast.error('Failed to update budget');
        }
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        mutation.mutate(parseFloat(limit));
    };

    if (isLoading) return (
        <div className="flex items-center justify-center h-full">
            <Loader2 className="animate-spin text-primary-600" size={32} />
        </div>
    );

    return (
        <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-700">
            <div>
                <h2 className="text-2xl font-bold text-slate-800">Budget & Goals</h2>
                <p className="text-slate-500 mt-1">Set limits to control your energy spending and environmental footprint.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="bg-white rounded-[2.5rem] p-10 border border-slate-200 shadow-sm space-y-8">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-primary-100 text-primary-600 rounded-lg">
                            <Target size={20} />
                        </div>
                        <h3 className="text-xl font-bold text-slate-800">Monthly Limit</h3>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-slate-700 ml-1">Target Threshold (kWh)</label>
                            <input
                                type="number"
                                value={limit}
                                onChange={(e) => setLimit(e.target.value)}
                                className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-4 px-6 outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all font-bold text-lg"
                                placeholder="0.00"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={mutation.isPending}
                            className="w-full bg-primary-600 text-white font-bold py-4 rounded-2xl hover:bg-primary-700 transition-all flex items-center justify-center gap-2 disabled:opacity-70 shadow-lg shadow-primary-200"
                        >
                            {mutation.isPending ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
                            Update Monthly Goal
                        </button>
                    </form>
                </div>

                <div className="space-y-6">
                    <div className="bg-amber-50 rounded-[2.5rem] p-8 border border-amber-100">
                        <div className="flex items-start gap-4">
                            <div className="p-3 bg-white rounded-2xl shrink-0">
                                <AlertCircle className="text-amber-500" size={24} />
                            </div>
                            <div>
                                <h4 className="font-bold text-amber-900 mb-1">Smart Alerts</h4>
                                <p className="text-amber-700 text-sm leading-relaxed">
                                    We'll notify you automatically when you reach 80% of your monthly threshold.
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-slate-50 rounded-[2.5rem] p-8 border border-slate-200">
                         <h4 className="font-bold text-slate-800 mb-4">Current Progress</h4>
                         <div className="space-y-4">
                             <div className="flex justify-between items-end mb-1">
                                 <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Spent this month</span>
                                 <span className="text-sm font-black text-slate-800">{stats?.monthlySpent || 0} / {stats?.budgetLimit || 0} kWh</span>
                             </div>
                             <div className="w-full bg-slate-200 h-3 rounded-full overflow-hidden">
                                 <div 
                                    className="h-full bg-primary-500 rounded-full transition-all duration-1000"
                                    style={{ width: `${Math.min(100, ((stats?.monthlySpent || 0) / (stats?.budgetLimit || 1)) * 100)}%` }}
                                 ></div>
                             </div>
                         </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BudgetSettings;
