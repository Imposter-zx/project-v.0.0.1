import React, { useState } from 'react';
import { Zap, Smartphone, Loader2, CheckCircle2 } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../api/axios';

const AddReadingForm: React.FC = () => {
    const queryClient = useQueryClient();
    const [amount, setAmount] = useState('');
    const [deviceId, setDeviceId] = useState('');
    const [success, setSuccess] = useState(false);

    const mutation = useMutation({
        mutationFn: async (newReading: any) => {
            const res = await api.post('/api/energy/reading', newReading);
            return res.data;
        },
        onSuccess: () => {
            setSuccess(true);
            setAmount('');
            setDeviceId('');
            // Invalidate and refetch dashboard data
            queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
            queryClient.invalidateQueries({ queryKey: ['consumption-summary'] });
            setTimeout(() => setSuccess(false), 3000);
        }
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        mutation.mutate({ 
            amount: parseFloat(amount), 
            deviceId,
            timestamp: new Date()
        });
    };

    return (
        <div className="bg-white p-8 rounded-[2rem] border border-slate-200 shadow-sm">
            <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-emerald-100 text-emerald-600 rounded-lg">
                    <Zap size={20} />
                </div>
                <h3 className="text-xl font-bold text-slate-800">Add Energy Reading</h3>
            </div>

            {mutation.error && (
                <div className="bg-rose-50 text-rose-600 p-4 rounded-xl text-sm mb-6 border border-rose-100">
                    {(mutation.error as any).response?.data?.message || mutation.error.message}
                </div>
            )}

            {success && (
                <div className="bg-emerald-50 text-emerald-600 p-4 rounded-xl text-sm mb-6 border border-emerald-100 flex items-center gap-2">
                    <CheckCircle2 size={18} />
                    Reading added successfully!
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-700 ml-1">Consumption (kWh)</label>
                    <div className="relative">
                        <Zap className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input
                            type="number"
                            step="0.01"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-3.5 pl-12 pr-4 outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all font-medium"
                            placeholder="0.00"
                            required
                        />
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-700 ml-1">Device ID (Optional)</label>
                    <div className="relative">
                        <Smartphone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input
                            type="text"
                            value={deviceId}
                            onChange={(e) => setDeviceId(e.target.value)}
                            className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-3.5 pl-12 pr-4 outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all font-medium"
                            placeholder="e.g. SMART-METER-01"
                        />
                    </div>
                </div>

                <button
                    type="submit"
                    disabled={mutation.isPending}
                    className="w-full bg-primary-600 text-white font-bold py-4 rounded-2xl hover:bg-primary-700 transition-all flex items-center justify-center gap-2 disabled:opacity-70 shadow-lg shadow-primary-200"
                >
                    {mutation.isPending ? (
                        <Loader2 className="animate-spin" size={20} />
                    ) : (
                        'Submit Reading'
                    )}
                </button>
            </form>
        </div>
    );
};

export default AddReadingForm;
