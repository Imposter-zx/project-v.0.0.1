import React, { useState, useEffect } from 'react';
import { User, Mail, MapPin, FileText, Save, Loader2, Camera, Shield } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const Profile: React.FC = () => {
    const { token, user: authUser, updateUser } = useAuth();
    const [profile, setProfile] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    
    // Form state
    const [name, setName] = useState('');
    const [bio, setBio] = useState('');
    const [location, setLocation] = useState('');

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const response = await fetch('http://localhost:5000/api/auth/profile', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (response.ok) {
                    const data = await response.json();
                    setProfile(data);
                    setName(data.name || '');
                    setBio(data.bio || '');
                    setLocation(data.location || '');
                }
            } catch (error) {
                console.error('Error fetching profile:', error);
            } finally {
                setLoading(false);
            }
        };

        if (token) fetchProfile();
    }, [token]);

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);

        try {
            const response = await fetch('http://localhost:5000/api/auth/profile', {
                method: 'PUT',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ name, bio, location }),
            });

            if (response.ok) {
                const updatedProfile = await response.json();
                toast.success('Profile updated successfully!');
                if (authUser) {
                    updateUser({
                        ...authUser,
                        profile: { name: updatedProfile.name }
                    });
                }
            } else {
                throw new Error('Failed to update profile');
            }
        } catch (err: any) {
            toast.error(err.message);
        } finally {
            setSaving(false);
        }
    };

    if (loading) return (
        <div className="flex items-center justify-center h-full">
            <Loader2 className="animate-spin text-primary-600" size={32} />
        </div>
    );

    return (
        <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-700">
            <div>
                <h2 className="text-2xl font-bold text-slate-800">Account Settings</h2>
                <p className="text-slate-500 mt-1">Manage your public profile and account preferences.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Left: Avatar & Role */}
                <div className="space-y-6">
                    <div className="bg-white p-8 rounded-[2rem] border border-slate-200 shadow-sm flex flex-col items-center text-center">
                        <div className="relative mb-6">
                            <div className="w-32 h-32 bg-slate-100 rounded-full flex items-center justify-center text-slate-300 border-4 border-white shadow-lg overflow-hidden">
                                {profile?.avatar ? (
                                    <img src={profile.avatar} alt="Avatar" className="w-full h-full object-cover" />
                                ) : (
                                    <User size={64} />
                                )}
                            </div>
                            <button className="absolute bottom-0 right-0 p-2.5 bg-primary-600 text-white rounded-full border-4 border-white hover:bg-primary-700 transition-colors shadow-md">
                                <Camera size={18} />
                            </button>
                        </div>
                        <h3 className="text-xl font-bold text-slate-800">{profile?.name || 'User'}</h3>
                        <p className="text-slate-500 text-sm mb-4">{profile?.user?.email}</p>
                        <div className="px-4 py-1.5 bg-primary-50 text-primary-600 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-2">
                            <Shield size={14} />
                            {profile?.user?.role} Account
                        </div>
                    </div>

                    <div className="bg-slate-900 p-6 rounded-[2rem] text-white">
                        <h4 className="font-bold mb-2">Security Tip</h4>
                        <p className="text-slate-400 text-sm leading-relaxed">
                            Keep your profile information accurate to receive better energy saving recommendations.
                        </p>
                    </div>
                </div>

                {/* Right: Form */}
                <div className="md:col-span-2 bg-white p-10 rounded-[2rem] border border-slate-200 shadow-sm">
                    <form onSubmit={handleSave} className="space-y-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-slate-700 ml-1">Full Name</label>
                                <div className="relative">
                                    <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                    <input
                                        type="text"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-3.5 pl-12 pr-4 outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all font-medium"
                                        placeholder="Your name"
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
                            <label className="text-sm font-semibold text-slate-700 ml-1">Bio</label>
                            <div className="relative">
                                <div className="absolute left-4 top-4 text-slate-400">
                                    <FileText size={18} />
                                </div>
                                <textarea
                                    value={bio}
                                    onChange={(e) => setBio(e.target.value)}
                                    rows={4}
                                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-3.5 pl-12 pr-4 outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all font-medium resize-none"
                                    placeholder="Tell us about yourself..."
                                />
                            </div>
                        </div>

                        <div className="pt-4 flex items-center justify-between border-t border-slate-100">
                            <p className="text-xs text-slate-400">
                                Last updated: {new Date(profile?.updatedAt || Date.now()).toLocaleDateString()}
                            </p>
                            <button
                                type="submit"
                                disabled={saving}
                                className="bg-primary-600 text-white font-bold px-8 py-3.5 rounded-2xl hover:bg-primary-700 transition-all flex items-center gap-2 disabled:opacity-70 shadow-lg shadow-primary-200"
                            >
                                {saving ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
                                Save Changes
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Profile;
