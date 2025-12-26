import { useState, useEffect, useRef } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { Menu, X, User, LogOut, ChevronRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';

const MainLayout = () => {
    const [isScrolled, setIsScrolled] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const { isAuthenticated, user, logout } = useAuth();
    const location = useLocation();

    // GSAP Refs
    const menuRef = useRef(null);
    const menuTimeline = useRef(null);

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 50);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    useGSAP(() => {
        if (!menuRef.current) return;

        if (mobileMenuOpen) {
            gsap.to(menuRef.current, {
                x: '0%',
                duration: 0.3,
                ease: "expo.out"
            });
        } else {
            gsap.to(menuRef.current, {
                x: '100%',
                duration: 0.3,
                ease: "expo.in"
            });
        }
    }, [mobileMenuOpen]);

    return (
        <div className="min-h-screen bg-black text-zinc-50 relative selection:bg-zinc-800">
            {/* Navbar - Sharp & Solid */}
            <header
                className={`fixed top-0 left-0 right-0 z-[100] transition-colors duration-300 border-b ${isScrolled
                    ? 'bg-black border-zinc-800 py-4'
                    : 'bg-transparent border-transparent py-6'
                    }`}
            >
                <div className="container mx-auto px-6 lg:px-8">
                    <nav className="flex items-center justify-between">
                        {/* Logo */}
                        <Link to="/" className="text-2xl font-bold tracking-tighter text-white z-50 relative mix-blend-difference">
                            PRO.<span className="text-zinc-500">CONNECT</span>
                        </Link>

                        {/* Desktop Nav */}
                        <div className="hidden md:flex items-center gap-1">
                            <Link to="/coaches" className={`px-4 py-2 text-sm font-bold uppercase tracking-wider transition-colors hover:text-white ${location.pathname === '/coaches' ? 'text-white' : 'text-zinc-500'}`}>
                                Coachs
                            </Link>
                            <Link to="/about" className="px-4 py-2 text-sm font-bold uppercase tracking-wider text-zinc-500 hover:text-white transition-colors">
                                À propos
                            </Link>

                            <div className="w-px h-4 bg-zinc-800 mx-4" />

                            {isAuthenticated ? (
                                <div className="flex items-center gap-6">
                                    <Link
                                        to={user?.role === 'coach' ? '/coach/dashboard' : '/sportif/dashboard'}
                                        className="text-sm font-bold uppercase tracking-wider text-white hover:text-zinc-300 transition-colors flex items-center gap-2"
                                    >
                                        <User size={16} />
                                        <span>Compte</span>
                                    </Link>
                                    <button onClick={logout} className="text-zinc-500 hover:text-red-500 transition-colors">
                                        <LogOut size={16} />
                                    </button>
                                </div>
                            ) : (
                                <div className="flex items-center gap-4">
                                    <Link to="/login" className="px-4 py-2 text-sm font-bold uppercase tracking-wider text-white hover:text-zinc-300 transition-colors">
                                        Login
                                    </Link>
                                    <Link
                                        to="/register"
                                        className="px-6 py-2 bg-white text-black text-sm font-bold uppercase tracking-wider hover:bg-zinc-200 transition-colors"
                                    >
                                        Join
                                    </Link>
                                </div>
                            )}
                        </div>

                        {/* Mobile Menu Toggle */}
                        <button
                            className="md:hidden z-50 text-white p-2 relative"
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                        >
                            {mobileMenuOpen ? <X /> : <Menu />}
                        </button>
                    </nav>
                </div>
            </header>

            {/* Mobile Menu Overlay - GSAP Controlled */}
            <div
                ref={menuRef}
                className="fixed inset-0 z-[90] bg-black flex flex-col justify-center px-8 translate-x-full"
            >
                <div className="space-y-8">
                    <Link onClick={() => setMobileMenuOpen(false)} to="/coaches" className="flex items-center justify-between text-4xl font-bold text-white tracking-tighter uppercase border-b border-zinc-900 pb-4">
                        Coachs <ChevronRight className="text-zinc-800" />
                    </Link>
                    {isAuthenticated ? (
                        <>
                            <Link onClick={() => setMobileMenuOpen(false)} to={user?.role === 'coach' ? '/coach/dashboard' : '/sportif/dashboard'} className="flex items-center justify-between text-4xl font-bold text-white tracking-tighter uppercase border-b border-zinc-900 pb-4">
                                Dashboard <ChevronRight className="text-zinc-800" />
                            </Link>
                            <button onClick={() => { logout(); setMobileMenuOpen(false); }} className="text-left text-xl font-bold uppercase tracking-wider text-red-600 pt-4">
                                Déconnexion
                            </button>
                        </>
                    ) : (
                        <div className="flex flex-col gap-6 pt-8">
                            <Link onClick={() => setMobileMenuOpen(false)} to="/login" className="text-2xl font-bold text-zinc-500 uppercase tracking-wider">Connexion</Link>
                            <Link onClick={() => setMobileMenuOpen(false)} to="/register" className="text-5xl font-bold text-white uppercase tracking-tighter">Rejoindre</Link>
                        </div>
                    )}
                </div>
            </div>

            {/* Page Content */}
            <main>
                <Outlet />
            </main>

            {/* Footer */}
            <footer className="border-t border-zinc-900 bg-black pt-24 pb-12">
                <div className="container mx-auto px-6 lg:px-8">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-16 gap-8">
                        <div>
                            <h2 className="text-2xl font-bold text-white tracking-tighter mb-2">PRO.CONNECT</h2>
                            <p className="text-zinc-600 text-sm max-w-sm uppercase tracking-wider">Performance Infrastructure.</p>
                        </div>
                        <div className="flex gap-8 text-sm font-bold uppercase tracking-wider">
                            <a href="#" className="text-zinc-600 hover:text-white transition-colors">Instagram</a>
                            <a href="#" className="text-zinc-600 hover:text-white transition-colors">Twitter</a>
                            <a href="#" className="text-zinc-600 hover:text-white transition-colors">LinkedIn</a>
                        </div>
                    </div>
                    <div className="flex flex-col md:flex-row justify-between items-center text-[10px] text-zinc-700 uppercase tracking-widest border-t border-zinc-900 pt-8 font-mono">
                        <p>© 2024 SPORTSCONNECT INC.</p>
                        <div className="flex gap-8 mt-4 md:mt-0">
                            <a href="#" className="hover:text-zinc-500">Privacy</a>
                            <a href="#" className="hover:text-zinc-500">Terms</a>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default MainLayout;
