import React, { useState } from 'react';
import { User as UserIcon, Mail, MapPin, FileText, Loader2, Save, Award } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../api/axios';
import toast from 'react-hot-toast';

const Profile: React.FC = () => {
    const { updateUser } = useAuth();
    const queryClient = useQueryClient();

    const { data: profile, isLoading } = useQuery({
        queryKey: ['profile'],
        queryFn: async () => {
            const res = await api.get('/api/auth/profile');
            return res.data;
        }
    });

    const [name, setName] = useState('');
    const [bio, setBio] = useState('');
    const [location, setLocation] = useState('');

    // Update local state when profile data arrives
    React.useEffect(() => {
        if (profile) {
            setName(profile.name || '');
            setBio(profile.bio || '');
            setLocation(profile.location || '');
        }
    }, [profile]);

    const mutation = useMutation({
        mutationFn: async (updatedData: any) => {
            const res = await api.put('/api/auth/profile', updatedData);
            return res.data;
        },
        onSuccess: (data) => {
            updateUser(data);
            queryClient.invalidateQueries({ queryKey: ['profile'] });
            toast.success('Profile updated successfully!');
        },
        onError: () => {
            toast.error('Failed to update profile');
        }
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        mutation.mutate({ name, bio, location });
    };

    if (isLoading) return (
        <div className="flex items-center justify-center h-full">
            <Loader2 className="animate-spin text-primary-600" size={32} />
        </div>
    );

    return (
        <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-700">
            <div>
                <h2 className="text-2xl font-bold text-slate-800">Account Settings</h2>
                <p className="text-slate-500 mt-1">Manage your professional profile and account preferences.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2">
                    <form onSubmit={handleSubmit} className="bg-white rounded-[2.5rem] p-10 border border-slate-200 shadow-sm space-y-8">
                        <div className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-slate-700 ml-1">Full Name</label>
                                <div className="relative">
                                    <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                    <input
                                        type="text"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-3.5 pl-12 pr-4 outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all font-medium"
                                        placeholder="Your Name"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-slate-700 ml-1">Email Address</label>
                                    <div className="relative">
                                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                                        <input
                                            type="email"
                                            value={profile?.user?.email || ''}
                                            disabled
                                            className="w-full bg-slate-50 border border-transparent rounded-2xl py-3.5 pl-12 pr-4 text-slate-400 font-medium cursor-not-allowed"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-slate-700 ml-1">Location</label>
                                    <div className="relative">
                                        <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                        <input
                                            type="text"
                                            value={location}
                                            onChange={(e) => setLocation(e.target.value)}
                                            className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-3.5 pl-12 pr-4 outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all font-medium"
                                            placeholder="City, Country"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-slate-700 ml-1">Bio / About</label>
                                <div className="relative">
                                    <FileText className="absolute left-4 top-4 text-slate-400" size={18} />
                                    <textarea
                                        value={bio}
                                        onChange={(e) => setBio(e.target.value)}
                                        rows={4}
                                        className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-3.5 pl-12 pr-4 outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all font-medium resize-none"
                                        placeholder="Write a few lines about yourself..."
                                    />
                                </div>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={mutation.isPending}
                            className="w-full bg-slate-900 text-white font-bold py-4 rounded-2xl hover:bg-slate-800 transition-all flex items-center justify-center gap-2 disabled:opacity-70 shadow-xl shadow-slate-200"
                        >
                            {mutation.isPending ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
                            Save Changes
                        </button>
                    </form>
                </div>

                <div className="space-y-8">
                    <div className="bg-emerald-50 rounded-[2.5rem] p-8 border border-emerald-100">
                        <h4 className="font-bold text-emerald-800 mb-2">Sustainable Badge</h4>
                        <p className="text-emerald-600 text-sm leading-relaxed mb-6">
                            You've earned the <strong>Green Pioneer</strong> badge for 6 months of consistent tracking!
                        </p>
                        <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-md shadow-emerald-200/50">
                             <Award className="text-emerald-500" size={32} />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Profile;
