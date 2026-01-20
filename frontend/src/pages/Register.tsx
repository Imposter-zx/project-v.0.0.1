import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Zap, Mail, Lock, User, ArrowRight, Loader2, Building2, UserCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import API_URL from '../config';

const Register: React.FC = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState<'INDIVIDUAL' | 'COMPANY'>('INDIVIDUAL');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);

        try {
            const response = await fetch(`${API_URL}/api/auth/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, email, password, role }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Registration failed');
            }

            login(data.user, data.token);
            navigate('/');
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center p-4 py-12">
            <div className="w-full max-w-md">
                {/* Logo */}
                <div className="flex justify-center mb-8">
                    <div className="bg-primary-600 p-3 rounded-2xl shadow-lg shadow-primary-200">
                        <Zap className="text-white" size={32} />
                    </div>
                </div>

                {/* Card */}
                <div className="bg-white p-8 rounded-[2rem] shadow-xl shadow-slate-200/50 border border-slate-100">
                    <div className="text-center mb-8">
                        <h1 className="text-2xl font-bold text-slate-800">Create account</h1>
                        <p className="text-slate-500 mt-2">Join GreenEnergy and start saving today</p>
                    </div>

                    {error && (
                        <div className="bg-rose-50 text-rose-600 p-4 rounded-xl text-sm mb-6 border border-rose-100 animate-in fade-in slide-in-from-top-2">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-5">
                        {/* Role Selection */}
                        <div className="grid grid-cols-2 gap-4 mb-6">
                            <button
                                type="button"
                                onClick={() => setRole('INDIVIDUAL')}
                                className={`flex flex-col items-center justify-center p-4 rounded-2xl border-2 transition-all ${
                                    role === 'INDIVIDUAL' 
                                    ? 'border-primary-500 bg-primary-50 text-primary-700' 
                                    : 'border-slate-100 bg-slate-50 text-slate-500 hover:border-slate-200'
                                }`}
                            >
                                <UserCircle size={24} className="mb-2" />
                                <span className="text-xs font-bold uppercase tracking-wider">Individual</span>
                            </button>
                            <button
                                type="button"
                                onClick={() => setRole('COMPANY')}
                                className={`flex flex-col items-center justify-center p-4 rounded-2xl border-2 transition-all ${
                                    role === 'COMPANY' 
                                    ? 'border-primary-500 bg-primary-50 text-primary-700' 
                                    : 'border-slate-100 bg-slate-50 text-slate-500 hover:border-slate-200'
                                }`}
                            >
                                <Building2 size={24} className="mb-2" />
                                <span className="text-xs font-bold uppercase tracking-wider">Company</span>
                            </button>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-slate-700 ml-1">Full Name</label>
                            <div className="relative">
                                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-3.5 pl-12 pr-4 outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all"
                                    placeholder="John Doe"
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-slate-700 ml-1">Email Address</label>
                            <div className="relative">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-3.5 pl-12 pr-4 outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all"
                                    placeholder="name@company.com"
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-slate-700 ml-1">Password</label>
                            <div className="relative">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-3.5 pl-12 pr-4 outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all"
                                    placeholder="••••••••"
                                    required
                                    minLength={6}
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-slate-900 text-white font-bold py-4 rounded-2xl hover:bg-slate-800 transition-all flex items-center justify-center gap-2 group disabled:opacity-70 mt-4"
                        >
                            {isLoading ? (
                                <Loader2 className="animate-spin" size={20} />
                            ) : (
                                <>
                                    Create Account
                                    <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                                </>
                            )}
                        </button>
                    </form>

                    <div className="mt-8 text-center text-slate-500 text-sm">
                        Already have an account?{' '}
                        <Link to="/login" className="text-primary-600 font-bold hover:text-primary-700">
                            Sign in instead
                        </Link>
                    </div>
                </div>

                <p className="text-center mt-8 text-slate-400 text-xs">
                    By joining, you agree to our Terms of Service and Privacy Policy.
                </p>
            </div>
        </div>
    );
};

export default Register;
