import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import { ENDPOINTS } from '../../config/api';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { Save } from 'lucide-react';
import toast from 'react-hot-toast';

const CoachSettings = () => {
    const { user } = useAuth();
    const [formData, setFormData] = useState({
        first_name: '',
        last_name: '',
        bio: '',
        hourly_rate: '',
        city: ''
    });

    useEffect(() => {
        // Mock fetch user details or use 'user' from context if fully populated
        setFormData({
            first_name: user?.first_name || '',
            last_name: user?.last_name || '',
            bio: user?.bio || '',
            hourly_rate: user?.hourly_rate || '',
            city: user?.city || ''
        });
    }, [user]);

    useGSAP(() => {
        gsap.from(".settings-section", {
            y: 20,
            opacity: 0,
            duration: 0.5,
            stagger: 0.1,
            ease: "expo.out"
        });
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            // Update endpoint logic here
            toast.success('Profil mis à jour');
        } catch (error) {
            toast.error('Erreur mise à jour');
        }
    };

    return (
        <div className="max-w-2xl mx-auto">
            <h1 className="text-4xl font-bold text-white tracking-tighter mb-8">PARAMÈTRES.</h1>

            <form onSubmit={handleSubmit} className="space-y-8">
                {/* Personal Info */}
                <div className="settings-section border border-zinc-800 bg-black p-8">
                    <h2 className="text-xl font-bold text-white tracking-tight mb-6">INFORMATIONS</h2>
                    <div className="grid grid-cols-2 gap-6">
                        <div>
                            <label className="block text-xs font-mono text-zinc-500 uppercase mb-2">Prénom</label>
                            <input
                                type="text"
                                value={formData.first_name}
                                onChange={e => setFormData({ ...formData, first_name: e.target.value })}
                                className="w-full bg-black border border-zinc-800 text-white p-3 focus:border-white outline-none transition-colors"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-mono text-zinc-500 uppercase mb-2">Nom</label>
                            <input
                                type="text"
                                value={formData.last_name}
                                onChange={e => setFormData({ ...formData, last_name: e.target.value })}
                                className="w-full bg-black border border-zinc-800 text-white p-3 focus:border-white outline-none transition-colors"
                            />
                        </div>
                    </div>
                </div>

                {/* Professional Info */}
                <div className="settings-section border border-zinc-800 bg-black p-8">
                    <h2 className="text-xl font-bold text-white tracking-tight mb-6">PROFIL PRO</h2>
                    <div className="space-y-6">
                        <div>
                            <label className="block text-xs font-mono text-zinc-500 uppercase mb-2">Bio</label>
                            <textarea
                                value={formData.bio}
                                onChange={e => setFormData({ ...formData, bio: e.target.value })}
                                rows={4}
                                className="w-full bg-black border border-zinc-800 text-white p-3 focus:border-white outline-none transition-colors resize-none"
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-6">
                            <div>
                                <label className="block text-xs font-mono text-zinc-500 uppercase mb-2">Taux Horaire (€)</label>
                                <input
                                    type="number"
                                    value={formData.hourly_rate}
                                    onChange={e => setFormData({ ...formData, hourly_rate: e.target.value })}
                                    className="w-full bg-black border border-zinc-800 text-white p-3 focus:border-white outline-none transition-colors"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-mono text-zinc-500 uppercase mb-2">Ville</label>
                                <input
                                    type="text"
                                    value={formData.city}
                                    onChange={e => setFormData({ ...formData, city: e.target.value })}
                                    className="w-full bg-black border border-zinc-800 text-white p-3 focus:border-white outline-none transition-colors"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="settings-section">
                    <button type="submit" className="w-full py-4 bg-white text-black font-bold uppercase tracking-wider hover:bg-zinc-200 transition-colors flex items-center justify-center gap-2">
                        <Save size={18} /> Enregistrer
                    </button>
                </div>
            </form>
        </div>
    );
};

export default CoachSettings;
