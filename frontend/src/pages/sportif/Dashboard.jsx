import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Calendar, Award, Clock } from 'lucide-react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';

const SportifDashboard = () => {
    const { user } = useAuth();

    useGSAP(() => {
        gsap.from(".dashboard-item", {
            y: 20,
            opacity: 0,
            duration: 0.5,
            stagger: 0.1,
            ease: "expo.out"
        });
    }, []);

    return (
        <div>
            <div className="flex flex-col md:flex-row justify-between items-end mb-12 border-b border-zinc-900 pb-8">
                <div>
                    <h1 className="text-4xl font-bold text-white tracking-tighter mb-2">BONJOUR, {user?.first_name}.</h1>
                    <p className="text-zinc-500 font-mono text-sm uppercase tracking-widest">Prêt pour votre prochaine session ?</p>
                </div>
                <div className="mt-4 md:mt-0">
                    <Link to="/coaches" className="px-6 py-3 bg-white text-black font-bold text-sm uppercase tracking-wider hover:bg-zinc-200 transition-colors inline-block">
                        Trouver un coach
                    </Link>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Upcoming */}
                <div className="dashboard-item lg:col-span-2 border border-zinc-800 bg-black p-8">
                    <div className="flex items-center gap-3 mb-8">
                        <Calendar size={20} className="text-white" />
                        <h2 className="text-xl font-bold text-white tracking-tight">SESSIONS À VENIR</h2>
                    </div>

                    {/* Empty State Mock */}
                    <div className="flex flex-col items-center justify-center py-12 text-center">
                        <div className="w-16 h-16 bg-zinc-900 rounded-full flex items-center justify-center mb-4">
                            <Clock size={24} className="text-zinc-600" />
                        </div>
                        <p className="text-zinc-400 font-medium mb-2">Aucune session programmée</p>
                        <p className="text-zinc-600 text-sm max-w-xs">Vos futures séances d'entraînement apparaîtront ici.</p>
                    </div>
                </div>

                {/* Stats / Goals */}
                <div className="dashboard-item border border-zinc-800 bg-black p-8">
                    <div className="flex items-center gap-3 mb-8">
                        <Award size={20} className="text-white" />
                        <h2 className="text-xl font-bold text-white tracking-tight">PROGRESSION</h2>
                    </div>

                    <div className="space-y-6">
                        <div>
                            <div className="flex justify-between text-xs font-bold uppercase tracking-widest mb-2">
                                <span className="text-zinc-500">Séances ce mois</span>
                                <span className="text-white">3 / 10</span>
                            </div>
                            <div className="h-1 bg-zinc-900 w-full overflow-hidden">
                                <div className="h-full bg-white w-[30%]" />
                            </div>
                        </div>

                        <div>
                            <div className="flex justify-between text-xs font-bold uppercase tracking-widest mb-2">
                                <span className="text-zinc-500">Dépenses</span>
                                <span className="text-white">150€</span>
                            </div>
                            <div className="h-1 bg-zinc-900 w-full overflow-hidden">
                                <div className="h-full bg-zinc-500 w-[15%]" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SportifDashboard;
