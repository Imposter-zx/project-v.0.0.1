import React, { useState, useEffect } from 'react';
import { Leaf, TreeDeciduous, Wind, CloudRain, Droplets, Globe, Loader2, Award } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import API_URL from '../config';

const Sustainability: React.FC = () => {
    const { token } = useAuth();
    const [metrics, setMetrics] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchMetrics = async () => {
            try {
                const response = await fetch(`${API_URL}/api/energy/sustainability`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (response.ok) {
                    const data = await response.json();
                    setMetrics(data);
                }
            } catch (error) {
                console.error('Error fetching sustainability metrics:', error);
            } finally {
                setLoading(false);
            }
        };

        if (token) fetchMetrics();
    }, [token]);

    if (loading) return (
        <div className="flex items-center justify-center h-full">
            <Loader2 className="animate-spin text-emerald-600" size={32} />
        </div>
    );

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-slate-800">Environmental Impact</h2>
                    <p className="text-slate-500 mt-1">Measuring your contribution to a greener planet.</p>
                </div>
                <div className="bg-emerald-100 text-emerald-700 px-6 py-2 rounded-full font-bold text-sm flex items-center gap-2">
                    <Award size={18} />
                    Eco Explorer Level 1
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Main Score Card */}
                <div className="md:col-span-2 bg-gradient-to-br from-emerald-600 to-teal-700 rounded-[2.5rem] p-10 text-white shadow-xl shadow-emerald-200 relative overflow-hidden">
                    <div className="relative z-10">
                        <h3 className="text-emerald-100 font-bold uppercase tracking-widest text-sm mb-8">Carbon Offset Summary</h3>
                        <div className="flex items-end gap-4 mb-10">
                            <span className="text-7xl font-black">{metrics?.co2Saved.toFixed(1)}</span>
                            <span className="text-2xl font-bold mb-3">kg CO₂ Saved</span>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-8 pt-8 border-t border-white/10">
                            <div className="flex items-start gap-4">
                                <div className="p-3 bg-white/10 rounded-2xl backdrop-blur-sm">
                                    <TreeDeciduous size={24} />
                                </div>
                                <div>
                                    <p className="text-emerald-100 text-sm font-medium">Trees Equivalent</p>
                                    <p className="text-xl font-bold">{metrics?.treesEquivalent} Trees</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-4">
                                <div className="p-3 bg-white/10 rounded-2xl backdrop-blur-sm">
                                    <Globe size={24} />
                                </div>
                                <div>
                                    <p className="text-emerald-100 text-sm font-medium">Impact Level</p>
                                    <p className="text-xl font-bold">{metrics?.impactLevel}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Background decorations */}
                    <div className="absolute -bottom-20 -right-20 w-80 h-80 bg-white/5 rounded-full"></div>
                    <div className="absolute top-10 right-20 opacity-20">
                        <Leaf size={180} />
                    </div>
                </div>

                {/* Footprint Card */}
                <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm flex flex-col justify-between">
                    <div>
                        <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl w-fit mb-6">
                            <Wind size={24} />
                        </div>
                        <h3 className="text-xl font-bold text-slate-800 mb-2">Carbon Footprint</h3>
                        <p className="text-slate-500 text-sm leading-relaxed mb-8">
                            Based on your total consumption of <span className="font-bold text-slate-800">{metrics?.totalKWh} kWh</span>, 
                            your current estimated footprint is:
                        </p>
                        <div className="flex items-baseline gap-2">
                            <span className="text-4xl font-black text-slate-800">{metrics?.carbonFootprint.toFixed(1)}</span>
                            <span className="text-slate-400 font-bold">kg CO₂e</span>
                        </div>
                    </div>
                    
                    <div className="mt-8 pt-6 border-t border-slate-100">
                        <button className="w-full bg-slate-900 text-white font-bold py-4 rounded-2xl hover:bg-slate-800 transition-all">
                            How it's calculated
                        </button>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <MetricCard icon={CloudRain} label="Methane Reduced" value="0.4 kg" color="text-sky-600" bgColor="bg-sky-50" />
                <MetricCard icon={Droplets} label="Water Conserved" value="12 L" color="text-blue-600" bgColor="bg-blue-50" />
                <MetricCard icon={Wind} label="Clean Air Impact" value="High" color="text-amber-600" bgColor="bg-amber-50" />
                <MetricCard icon={Leaf} label="Plastic Offset" value="2.1 kg" color="text-emerald-600" bgColor="bg-emerald-50" />
            </div>
        </div>
    );
};

const MetricCard: React.FC<{ icon: any, label: string, value: string, color: string, bgColor: string }> = ({ icon: Icon, label, value, color, bgColor }) => (
    <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:border-emerald-200 hover:shadow-md transition-all group">
        <div className={`p-3 rounded-2xl w-fit mb-4 group-hover:scale-110 transition-transform ${bgColor} ${color}`}>
            <Icon size={20} />
        </div>
        <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-1">{label}</p>
        <p className="text-lg font-black text-slate-800">{value}</p>
    </div>
);

export default Sustainability;
