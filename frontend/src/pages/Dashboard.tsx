import React from 'react';
import {
    TrendingUp,
    AlertTriangle,
    Zap,
    Calendar,
    CloudLightning,
    Activity,
    ArrowUpRight,
    ArrowDownRight
} from 'lucide-react';
import AddReadingForm from '../components/energy/AddReadingForm';
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    BarChart,
    Bar,
    Cell
} from 'recharts';

const data = [
    { name: 'Mon', consumption: 4000 },
    { name: 'Tue', consumption: 3000 },
    { name: 'Wed', consumption: 2000 },
    { name: 'Thu', consumption: 2780 },
    { name: 'Fri', consumption: 1890 },
    { name: 'Sat', consumption: 2390 },
    { name: 'Sun', consumption: 3490 },
];

import { useAuth } from '../context/AuthContext';

const Dashboard: React.FC = () => {
    const { token } = useAuth();
    const [stats, setStats] = React.useState<any>(null);
    const [chartData, setChartData] = React.useState<any[]>([]);
    const [recommendations, setRecommendations] = React.useState<any[]>([]);
    const [loading, setLoading] = React.useState(true);

    React.useEffect(() => {
        const fetchData = async () => {
            try {
                const [statsRes, summaryRes, recsRes] = await Promise.all([
                    fetch('http://localhost:5000/api/energy/dashboard-stats', {
                        headers: { 'Authorization': `Bearer ${token}` }
                    }),
                    fetch('http://localhost:5000/api/energy/consumption-summary', {
                        headers: { 'Authorization': `Bearer ${token}` }
                    }),
                    fetch('http://localhost:5000/api/energy/recommendations', {
                        headers: { 'Authorization': `Bearer ${token}` }
                    })
                ]);

                if (statsRes.ok && summaryRes.ok && recsRes.ok) {
                    const statsData = await statsRes.json();
                    const summaryData = await summaryRes.json();
                    const recsData = await recsRes.json();
                    setStats(statsData);
                    setChartData(summaryData);
                    setRecommendations(recsData);
                }
            } catch (error) {
                console.error('Error fetching dashboard data:', error);
            } finally {
                setLoading(false);
            }
        };

        if (token) {
            fetchData();
        }
    }, [token]);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-full">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            {/* Welcome Header */}
            <div>
                <h2 className="text-2xl font-bold text-slate-800">Welcome back, Energy Saver! 👋</h2>
                <p className="text-slate-500 mt-1">Here's what's happening with your energy consumption today.</p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    title="Current Usage"
                    value={`${stats?.currentUsage || 0} kWh`}
                    change="Last 24h"
                    trend="neutral"
                    icon={Zap}
                    color="blue"
                />
                <StatCard
                    title="Daily Predict"
                    value={`${stats?.prediction || 'N/A'} kWh`}
                    change="Based on history"
                    trend="neutral"
                    icon={TrendingUp}
                    color="emerald"
                />
                <StatCard
                    title="Monthly Cost"
                    value={`$${((stats?.monthlySpent || 0) * 0.15).toFixed(2)}`}
                    change={`Limit: ${stats?.budgetLimit || 0} kWh`}
                    trend={(stats?.monthlySpent || 0) > (stats?.budgetLimit || 0) ? "up" : "down"}
                    icon={Activity}
                    color="amber"
                    isMoney
                />
                <StatCard
                    title="Alerts"
                    value={`${stats?.alertCount || 0} Active`}
                    change="Immediate action"
                    trend={stats?.alertCount > 0 ? "up" : "neutral"}
                    icon={AlertTriangle}
                    color="rose"
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Chart */}
                <div className="lg:col-span-2 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
                    <div className="flex items-center justify-between mb-8">
                        <h3 className="font-semibold text-slate-800 text-lg">Consumption Trend</h3>
                        <div className="flex gap-2">
                             <div className="bg-primary-50 text-primary-700 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">Last 7 Days</div>
                        </div>
                    </div>
                    <div className="h-80 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={chartData.length > 0 ? chartData : [{name: 'No data', consumption: 0}]}>
                                <defs>
                                    <linearGradient id="colorUsage" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#3d9451" stopOpacity={0.1} />
                                        <stop offset="95%" stopColor="#3d9451" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis
                                    dataKey="name"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: '#64748b', fontSize: 12 }}
                                    dy={10}
                                />
                                <YAxis
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: '#64748b', fontSize: 12 }}
                                />
                                <Tooltip
                                    contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="consumption"
                                    stroke="#3d9451"
                                    strokeWidth={3}
                                    fillOpacity={1}
                                    fill="url(#colorUsage)"
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Right Column: AI Suggestions & Add Reading */}
                <div className="space-y-8">
                    {/* Add Reading Form */}
                    <AddReadingForm onSuccess={() => {
                        // Refresh dashboard data
                        window.location.reload(); 
                    }} />

                    {/* AI Suggestions */}
                    <div className="bg-primary-900 rounded-3xl p-8 text-white relative overflow-hidden flex flex-col justify-between shadow-xl shadow-primary-900/20 h-fit">
                        <div className="relative z-10">
                            <div className="bg-white/10 w-12 h-12 rounded-2xl flex items-center justify-center mb-6 backdrop-blur-sm">
                                <CloudLightning className="text-primary-300" />
                            </div>
                            <h3 className="text-xl font-bold mb-4">AI Recommendations</h3>
                        <div className="space-y-4">
                            {recommendations.length > 0 ? (
                                recommendations.map((rec, idx) => (
                                    <SuggestionItem
                                        key={idx}
                                        text={rec.content}
                                        impact={rec.impactScore > 0.7 ? "High Impact" : rec.impactScore > 0.4 ? "Medium" : "Low"}
                                    />
                                ))
                            ) : (
                                <p className="text-primary-200 text-sm">Analyzing your data for insights...</p>
                            )}
                        </div>
                        </div>

                        <button className="mt-8 bg-white text-primary-900 font-bold py-4 rounded-2xl hover:bg-primary-50 transition-colors relative z-10">
                            View Full Report
                        </button>

                        {/* Abstract decoration */}
                        <div className="absolute -bottom-12 -right-12 w-48 h-48 bg-primary-600/20 rounded-full blur-3xl"></div>
                        <div className="absolute -top-12 -left-12 w-48 h-48 bg-primary-400/10 rounded-full blur-3xl"></div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const StatCard = ({ title, value, change, trend, icon: Icon, color, isMoney }: any) => {
    const colorMap: any = {
        blue: 'bg-blue-50 text-blue-600',
        emerald: 'bg-emerald-50 text-emerald-600',
        amber: 'bg-amber-50 text-amber-600',
        rose: 'bg-rose-50 text-rose-600',
    };

    return (
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow group">
            <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-2xl transition-transform group-hover:scale-110 ${colorMap[color]}`}>
                    <Icon size={24} />
                </div>
                <div className={`flex items-center gap-1 text-sm font-medium ${trend === 'up' ? 'text-rose-500' : trend === 'down' ? 'text-emerald-500' : 'text-slate-400'
                    }`}>
                    {trend === 'up' ? <ArrowUpRight size={16} /> : trend === 'down' ? <ArrowDownRight size={16} /> : null}
                    {change}
                </div>
            </div>
            <p className="text-slate-500 text-sm font-medium">{title}</p>
            <p className="text-2xl font-bold text-slate-800 mt-1">{value}</p>
        </div>
    );
};

const SuggestionItem = ({ text, impact }: any) => (
    <div className="bg-white/5 border border-white/10 p-4 rounded-2xl backdrop-blur-sm">
        <p className="text-sm font-medium text-primary-100">{text}</p>
        <div className="mt-2 text-[10px] font-bold uppercase tracking-wider text-primary-400">
            {impact}
        </div>
    </div>
);

export default Dashboard;
