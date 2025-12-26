import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { Save } from 'lucide-react';
import toast from 'react-hot-toast';

const SportifSettings = () => {
    const { user } = useAuth();
    const [formData, setFormData] = useState({
        first_name: '',
        last_name: '',
        phone: ''
    });

    useEffect(() => {
        setFormData({
            first_name: user?.first_name || '',
            last_name: user?.last_name || '',
            phone: user?.phone || ''
        });
    }, [user]);

    useGSAP(() => {
        gsap.from("form", {
            y: 20,
            opacity: 0,
            duration: 0.6,
            ease: "expo.out"
        });
    }, []);

    const handleSubmit = (e) => {
        e.preventDefault();
        toast.success('Profil mis à jour');
    };

    return (
        <div className="max-w-2xl mx-auto">
            <h1 className="text-4xl font-bold text-white tracking-tighter mb-8">PARAMÈTRES.</h1>

            <form onSubmit={handleSubmit} className="border border-zinc-800 bg-black p-8 space-y-6">
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

                <div>
                    <label className="block text-xs font-mono text-zinc-500 uppercase mb-2">Téléphone</label>
                    <input
                        type="tel"
                        value={formData.phone}
                        onChange={e => setFormData({ ...formData, phone: e.target.value })}
                        className="w-full bg-black border border-zinc-800 text-white p-3 focus:border-white outline-none transition-colors"
                    />
                </div>

                <div className="pt-4">
                    <button type="submit" className="w-full py-4 bg-white text-black font-bold uppercase tracking-wider hover:bg-zinc-200 transition-colors flex items-center justify-center gap-2">
                        <Save size={18} /> Enregistrer
                    </button>
                </div>
            </form>
        </div>
    );
};

export default SportifSettings;
