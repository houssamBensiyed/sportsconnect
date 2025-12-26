import { useState, useRef } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
    LayoutDashboard,
    Calendar,
    Settings,
    LogOut,
    ChevronRight,
    User,
    Menu,
    X
} from 'lucide-react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';

const DashboardLayout = () => {
    const { user, logout } = useAuth();
    const location = useLocation();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    // Refs for GSAP
    const sidebarRef = useRef(null);
    const contentRef = useRef(null);

    // Initial enter animation
    useGSAP(() => {
        gsap.from(sidebarRef.current, {
            x: -20,
            opacity: 0,
            duration: 0.6,
            ease: "expo.out"
        });
        gsap.from(contentRef.current, {
            y: 20,
            opacity: 0,
            duration: 0.6,
            ease: "expo.out",
            delay: 0.1
        });
    }, { scope: sidebarRef });

    const menuItems = user?.role === 'coach' ? [
        { icon: LayoutDashboard, label: 'Dashboard', path: '/coach/dashboard' },
        { icon: Calendar, label: 'Disponibilités', path: '/coach/availabilities' },
        { icon: User, label: 'Réservations', path: '/coach/reservations' },
        { icon: Settings, label: 'Paramètres', path: '/coach/settings' },
    ] : [
        { icon: LayoutDashboard, label: 'Dashboard', path: '/sportif/dashboard' },
        { icon: Calendar, label: 'Réservations', path: '/sportif/reservations' },
        { icon: Settings, label: 'Paramètres', path: '/sportif/settings' },
    ];

    return (
        <div className="min-h-screen bg-black text-white selection:bg-zinc-800 flex">

            {/* Sidebar (Desktop) */}
            <aside ref={sidebarRef} className="hidden lg:flex flex-col w-72 border-r border-zinc-900 bg-black fixed h-full z-20">
                <div className="p-8 border-b border-zinc-900">
                    <Link to="/" className="text-2xl font-bold tracking-tighter text-white block">
                        PRO.<span className="text-zinc-600">CONNECT</span>
                    </Link>
                    <p className="text-xs font-mono text-zinc-500 mt-2 uppercase tracking-widest">Espace {user?.role}</p>
                </div>

                <nav className="flex-1 p-6 space-y-2">
                    {menuItems.map((item) => {
                        const isActive = location.pathname === item.path;
                        return (
                            <Link
                                key={item.path}
                                to={item.path}
                                className={`flex items-center gap-4 px-4 py-3 text-sm font-bold uppercase tracking-wider transition-all border ${isActive
                                        ? 'bg-white text-black border-white'
                                        : 'text-zinc-500 border-transparent hover:text-white hover:bg-zinc-900/50'
                                    }`}
                            >
                                <item.icon size={18} />
                                {item.label}
                            </Link>
                        );
                    })}
                </nav>

                <div className="p-6 border-t border-zinc-900">
                    <div className="flex items-center gap-4 mb-6 px-4">
                        <div className="w-10 h-10 bg-zinc-900 border border-zinc-800 flex items-center justify-center font-bold text-zinc-500">
                            {user?.first_name?.[0]}
                        </div>
                        <div className="flex-1 overflow-hidden">
                            <p className="text-sm font-bold text-white truncate">{user?.first_name} {user?.last_name}</p>
                            <p className="text-xs text-zinc-600 truncate">{user?.email}</p>
                        </div>
                    </div>
                    <button
                        onClick={logout}
                        className="w-full flex items-center justify-center gap-2 px-4 py-3 text-red-500 text-xs font-bold uppercase tracking-widest hover:bg-zinc-900/50 transition-colors border border-transparent hover:border-zinc-900"
                    >
                        <LogOut size={16} /> Déconnexion
                    </button>
                </div>
            </aside>

            {/* Mobile Header */}
            <div className="lg:hidden fixed top-0 w-full bg-black border-b border-zinc-900 z-50 px-6 py-4 flex justify-between items-center">
                <Link to="/" className="text-xl font-bold tracking-tighter text-white">
                    PRO.<span className="text-zinc-600">CONNECT</span>
                </Link>
                <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="text-white">
                    {mobileMenuOpen ? <X /> : <Menu />}
                </button>
            </div>

            {/* Mobile Menu Overlay */}
            {mobileMenuOpen && (
                <div className="lg:hidden fixed inset-0 z-40 bg-black pt-24 px-6">
                    <nav className="space-y-4">
                        {menuItems.map((item) => (
                            <Link
                                key={item.path}
                                to={item.path}
                                onClick={() => setMobileMenuOpen(false)}
                                className="flex items-center justify-between text-2xl font-bold uppercase tracking-tighter text-white border-b border-zinc-900 pb-4"
                            >
                                <span className="flex items-center gap-4">
                                    <item.icon /> {item.label}
                                </span>
                                <ChevronRight className="text-zinc-800" />
                            </Link>
                        ))}
                        <button
                            onClick={logout}
                            className="w-full text-left text-xl font-bold uppercase tracking-tighter text-red-600 pt-4"
                        >
                            Déconnexion
                        </button>
                    </nav>
                </div>
            )}

            {/* Main Content */}
            <main ref={contentRef} className="flex-1 lg:ml-72 bg-black min-h-screen p-6 lg:p-12 pt-24 lg:pt-12">
                <Outlet />
            </main>
        </div>
    );
};

export default DashboardLayout;
