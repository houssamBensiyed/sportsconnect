import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import { ENDPOINTS } from '../../config/api';
import { Users, Calendar, DollarSign, Activity } from 'lucide-react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';

const StatCard = ({ icon: Icon, label, value, subtext, delay }) => {
    useGSAP(() => {
        gsap.from(`.stat-${label.replace(/\s/g, '')}`, {
            y: 20,
            opacity: 0,
            duration: 0.5,
            delay: delay,
            ease: "expo.out"
        });
    }, []);

    return (
        <div className={`stat-${label.replace(/\s/g, '')} p-6 border border-zinc-800 bg-black hover:border-zinc-700 transition-colors`}>
            <div className="flex items-center justify-between mb-4">
                <span className="text-zinc-500 font-mono text-xs uppercase tracking-widest">{label}</span>
                <Icon size={20} className="text-white" />
            </div>
            <p className="text-3xl font-bold text-white tracking-tight mb-1">{value || 0}</p>
            {subtext && <p className="text-xs text-zinc-600">{subtext}</p>}
        </div>
    );
};

const CoachDashboard = () => {
    const { user } = useAuth();
    const [stats, setStats] = useState({
        totalClients: 0,
        monthlyRevenue: 0,
        pendingRequests: 0,
        upcomingSessions: 0
    });

    useEffect(() => {
        // Mock stats for now - replace with real API if available
        setStats({
            totalClients: 12,
            monthlyRevenue: 2450,
            pendingRequests: 3,
            upcomingSessions: 8
        });
    }, []);

    return (
        <div>
            <h1 className="text-4xl font-bold text-white tracking-tighter mb-8">OVERVIEW.</h1>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                <StatCard
                    icon={Users}
                    label="Clients Actifs"
                    value={stats.totalClients}
                    subtext="+2 depuis le mois dernier"
                    delay={0}
                />
                <StatCard
                    icon={DollarSign}
                    label="Revenus Mensuels"
                    value={`${stats.monthlyRevenue}€`}
                    subtext="Objectif : 3000€"
                    delay={0.1}
                />
                <StatCard
                    icon={Calendar}
                    label="Sessions à venir"
                    value={stats.upcomingSessions}
                    subtext="Prochaine dans 2h"
                    delay={0.2}
                />
                <StatCard
                    icon={Activity}
                    label="Demandes"
                    value={stats.pendingRequests}
                    subtext="En attente de validation"
                    delay={0.3}
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Recent Activity Mock */}
                <div className="border border-zinc-800 bg-black p-8">
                    <h2 className="text-xl font-bold text-white tracking-tight mb-6">ACTIVITÉ RÉCENTE</h2>
                    <div className="space-y-4">
                        {[1, 2, 3].map((_, i) => (
                            <div key={i} className="flex items-center justify-between py-3 border-b border-zinc-900 last:border-0 hover:bg-zinc-900/20 px-2 transition-colors">
                                <span className="text-sm text-zinc-300">Nouvelle réservation de <strong>Thomas P.</strong></span>
                                <span className="text-xs font-mono text-zinc-600">IL Y A 2H</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="border border-zinc-800 bg-black p-8">
                    <h2 className="text-xl font-bold text-white tracking-tight mb-6">ACTIONS RAPIDES</h2>
                    <div className="grid grid-cols-2 gap-4">
                        <button className="p-4 border border-zinc-800 text-sm font-bold uppercase tracking-wide hover:bg-white hover:text-black transition-colors text-zinc-400">
                            Ajouter Dispo
                        </button>
                        <button className="p-4 border border-zinc-800 text-sm font-bold uppercase tracking-wide hover:bg-white hover:text-black transition-colors text-zinc-400">
                            Voir Planning
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CoachDashboard;
