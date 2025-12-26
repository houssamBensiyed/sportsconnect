import { useState, useEffect } from 'react';
import api from '../../services/api';
import { ENDPOINTS } from '../../config/api';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { Clock, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';

const SportifReservations = () => {
    const [reservations, setReservations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchReservations = async () => {
            try {
                const res = await api.get(ENDPOINTS.RESERVATIONS.STUDENT);
                setReservations(res.data.data || []);
                setError(null);
            } catch (e) {
                console.error('Error fetching reservations:', e);
                setError(e.response?.data?.message || e.message || 'Erreur de chargement');
            } finally {
                setLoading(false);
            }
        };
        fetchReservations();
    }, []);

    useGSAP(() => {
        if (!loading && reservations.length > 0) {
            gsap.from(".reservation-card", {
                y: 20,
                opacity: 0,
                duration: 0.5,
                stagger: 0.1,
                ease: "expo.out"
            });
        }
    }, [loading, reservations]);

    if (loading) {
        return (
            <div className="max-w-4xl mx-auto">
                <h1 className="text-4xl font-bold text-white tracking-tighter mb-8">MES SESSIONS.</h1>
                <div className="p-12 border border-zinc-800 text-center text-zinc-500">
                    Chargement...
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="max-w-4xl mx-auto">
                <h1 className="text-4xl font-bold text-white tracking-tighter mb-8">MES SESSIONS.</h1>
                <div className="p-8 border border-red-900 bg-red-950/20 text-center">
                    <AlertCircle className="w-8 h-8 text-red-500 mx-auto mb-4" />
                    <p className="text-red-400 font-medium mb-2">Erreur de chargement</p>
                    <p className="text-zinc-500 text-sm">{error}</p>
                    <button
                        onClick={() => window.location.reload()}
                        className="mt-4 px-4 py-2 bg-zinc-900 text-white border border-zinc-700 hover:bg-zinc-800 transition-colors text-sm"
                    >
                        Réessayer
                    </button>
                </div>
            </div>
        );
    }

    // Helper to format status in French
    const getStatusLabel = (status) => {
        const labels = {
            'en_attente': 'En attente',
            'acceptee': 'Confirmée',
            'refusee': 'Refusée',
            'annulee': 'Annulée',
            'terminee': 'Terminée',
        };
        return labels[status] || status;
    };

    const getStatusStyle = (status) => {
        if (status === 'acceptee' || status === 'terminee') {
            return 'border-green-900 text-green-500 bg-green-900/10';
        }
        if (status === 'refusee' || status === 'annulee') {
            return 'border-red-900 text-red-500 bg-red-900/10';
        }
        return 'border-yellow-900 text-yellow-500 bg-yellow-900/10';
    };

    return (
        <div className="max-w-4xl mx-auto">
            <h1 className="text-4xl font-bold text-white tracking-tighter mb-8">MES SESSIONS.</h1>

            <div className="space-y-4">
                {reservations.length > 0 ? reservations.map((res) => (
                    <div key={res.id} className="reservation-card p-6 border border-zinc-800 bg-black flex flex-col md:flex-row justify-between items-start md:items-center gap-4 hover:border-zinc-600 transition-colors">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-zinc-900 border border-zinc-800 flex items-center justify-center font-bold text-white text-xl">
                                {format(new Date(res.session_date), 'dd')}
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-white tracking-tight uppercase">Session {res.sport_name}</h3>
                                <p className="text-zinc-500 font-mono text-sm flex items-center gap-2">
                                    <Clock size={14} /> {res.start_time?.substring(0, 5)} • avec {res.coach_first_name} {res.coach_last_name}
                                </p>
                            </div>
                        </div>

                        <div>
                            <span className={`inline-block px-3 py-1 text-xs font-bold uppercase tracking-widest border ${getStatusStyle(res.status)}`}>
                                {getStatusLabel(res.status)}
                            </span>
                        </div>
                    </div>
                )) : (
                    <div className="p-12 border border-zinc-800 border-dashed text-center text-zinc-500">
                        Aucune réservation.
                    </div>
                )}
            </div>
        </div>
    );
};

export default SportifReservations;
