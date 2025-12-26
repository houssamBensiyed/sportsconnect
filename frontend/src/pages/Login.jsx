import { useState, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { ArrowRight } from 'lucide-react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const { login } = useAuth();
    const navigate = useNavigate();
    const formRef = useRef(null);

    useGSAP(() => {
        gsap.from(formRef.current.querySelectorAll('.form-item'), {
            y: 30,
            opacity: 0,
            duration: 0.5,
            stagger: 0.1,
            ease: "expo.out"
        });
    }, { scope: formRef });

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await login(email, password);
            toast.success('Connexion réussie');
            navigate('/');
        } catch (error) {
            toast.error('Identifiants invalides');
        }
    };

    return (
        <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2 bg-black">
            {/* Left - Form */}
            <div ref={formRef} className="flex items-center justify-center p-8 lg:p-16 border-r border-zinc-900">
                <div className="w-full max-w-md">
                    <h1 className="form-item text-4xl font-bold text-white tracking-tighter mb-2">LOGIN.</h1>
                    <p className="form-item text-zinc-500 mb-8">Accédez à votre espace performance.</p>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="form-item">
                            <label className="block text-xs font-mono text-zinc-500 uppercase mb-2">Email</label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full bg-black border border-zinc-800 text-white p-4 focus:border-white outline-none transition-colors"
                                required
                            />
                        </div>
                        <div className="form-item">
                            <label className="block text-xs font-mono text-zinc-500 uppercase mb-2">Mot de passe</label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full bg-black border border-zinc-800 text-white p-4 focus:border-white outline-none transition-colors"
                                required
                            />
                        </div>

                        <button type="submit" className="form-item w-full py-4 bg-white text-black font-bold uppercase tracking-wider hover:bg-zinc-200 transition-colors flex items-center justify-center gap-2">
                            Se connecter <ArrowRight size={16} />
                        </button>
                    </form>

                    <p className="form-item mt-8 text-center text-zinc-500 text-sm">
                        Pas encore membre ? <Link to="/register" className="text-white hover:underline underline-offset-4">Inscription</Link>
                    </p>
                </div>
            </div>

            {/* Right - Visual */}
            <div className="hidden lg:flex items-center justify-center bg-zinc-900 border-l border-zinc-800 relative overflow-hidden">
                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=2000&auto=format&fit=crop')] bg-cover bg-center grayscale opacity-50" />
                <div className="relative z-10 text-center">
                    <div className="text-[120px] font-bold text-white leading-none tracking-tighter mix-blend-difference">FOCUS</div>
                </div>
            </div>
        </div>
    );
};

export default Login;
