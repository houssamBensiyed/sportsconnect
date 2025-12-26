import { useState, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';

const Register = () => {
    const [formData, setFormData] = useState({
        first_name: '',
        last_name: '',
        email: '',
        password: '',
        role: 'sportif',
    });
    const { register } = useAuth();
    const navigate = useNavigate();
    const formRef = useRef(null);

    useGSAP(() => {
        gsap.from(formRef.current.querySelectorAll('.form-item'), {
            y: 30,
            opacity: 0,
            duration: 0.5,
            stagger: 0.08,
            ease: "expo.out"
        });
    }, { scope: formRef });

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await register(formData);
            toast.success('Compte créé');
            navigate('/login');
        } catch (error) {
            toast.error('Erreur lors de l\'inscription');
        }
    };

    return (
        <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2 bg-black">
            {/* Left - Visual */}
            <div className="hidden lg:flex items-center justify-center bg-zinc-900 border-r border-zinc-800 relative overflow-hidden">
                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1517836357463-d25dfeac3438?q=80&w=2000&auto=format&fit=crop')] bg-cover bg-center grayscale opacity-50" />
                <div className="relative z-10 text-center">
                    <div className="text-[120px] font-bold text-white leading-none tracking-tighter mix-blend-difference">JOIN</div>
                    <div className="text-[120px] font-bold text-white leading-none tracking-tighter mix-blend-difference">ELITE</div>
                </div>
            </div>

            {/* Right - Form */}
            <div ref={formRef} className="flex items-center justify-center p-8 lg:p-16">
                <div className="w-full max-w-md">
                    <h1 className="form-item text-4xl font-bold text-white tracking-tighter mb-8">INSCRIPTION.</h1>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="form-item grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-mono text-zinc-500 uppercase mb-2">Prénom</label>
                                <input
                                    type="text"
                                    value={formData.first_name}
                                    onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                                    className="w-full bg-black border border-zinc-800 text-white p-4 focus:border-white outline-none transition-colors"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-mono text-zinc-500 uppercase mb-2">Nom</label>
                                <input
                                    type="text"
                                    value={formData.last_name}
                                    onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                                    className="w-full bg-black border border-zinc-800 text-white p-4 focus:border-white outline-none transition-colors"
                                    required
                                />
                            </div>
                        </div>

                        <div className="form-item">
                            <label className="block text-xs font-mono text-zinc-500 uppercase mb-2">Email</label>
                            <input
                                type="email"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                className="w-full bg-black border border-zinc-800 text-white p-4 focus:border-white outline-none transition-colors"
                                required
                            />
                        </div>

                        <div className="form-item">
                            <label className="block text-xs font-mono text-zinc-500 uppercase mb-2">Mot de passe</label>
                            <input
                                type="password"
                                value={formData.password}
                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                className="w-full bg-black border border-zinc-800 text-white p-4 focus:border-white outline-none transition-colors"
                                required
                            />
                        </div>

                        <div className="form-item">
                            <label className="block text-xs font-mono text-zinc-500 uppercase mb-2">Je suis</label>
                            <div className="grid grid-cols-2 gap-4">
                                <button
                                    type="button"
                                    onClick={() => setFormData({ ...formData, role: 'sportif' })}
                                    className={`p-4 border text-sm uppercase tracking-wider font-bold transition-all ${formData.role === 'sportif' ? 'bg-white text-black border-white' : 'bg-black text-zinc-500 border-zinc-800'
                                        }`}
                                >
                                    Sportif
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setFormData({ ...formData, role: 'coach' })}
                                    className={`p-4 border text-sm uppercase tracking-wider font-bold transition-all ${formData.role === 'coach' ? 'bg-white text-black border-white' : 'bg-black text-zinc-500 border-zinc-800'
                                        }`}
                                >
                                    Coach
                                </button>
                            </div>
                        </div>

                        <button type="submit" className="form-item w-full py-4 bg-blue-600 hover:bg-blue-500 text-white font-bold uppercase tracking-wider transition-colors flex items-center justify-center gap-2">
                            Créer mon compte
                        </button>
                    </form>

                    <p className="form-item mt-8 text-center text-zinc-500 text-sm">
                        Déjà un compte ? <Link to="/login" className="text-white hover:underline underline-offset-4">Connexion</Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Register;
