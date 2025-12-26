import { useState, useEffect } from 'react';
import api from '../../services/api';
import { ENDPOINTS } from '../../config/api';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { Clock, User, Check, X } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import toast from 'react-hot-toast';

const CoachReservations = () => {
    const [reservations, setReservations] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchReservations = async () => {
        try {
            const res = await api.get(ENDPOINTS.RESERVATIONS.TEACHER);
            setReservations(res.data.data || []);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchReservations();
    }, []);

    useGSAP(() => {
        if (!loading) {
            gsap.from(".reservation-row", {
                y: 10,
                opacity: 0,
                duration: 0.4,
                stagger: 0.05,
                ease: "expo.out"
            });
        }
    }, [loading]);

    const handleAction = async (id, status) => {
        try {
            await api.put(ENDPOINTS.RESERVATIONS.UPDATE_STATUS(id), { status });
            toast.success(`Statut mis à jour: ${status}`);
            fetchReservations();
        } catch {
            toast.error('Erreur mise à jour');
        }
    };

    if (loading) return <div className="text-white">Chargement...</div>;

    return (
        <div className="max-w-6xl mx-auto">
            <h1 className="text-4xl font-bold text-white tracking-tighter mb-8">RÉSERVATIONS.</h1>

            <div className="border border-zinc-800 bg-black overflow-hidden">
                <table className="w-full text-left">
                    <thead>
                        <tr className="border-b border-zinc-800 bg-zinc-950">
                            <th className="p-6 text-xs font-mono text-zinc-500 uppercase tracking-widest font-normal">Sportif</th>
                            <th className="p-6 text-xs font-mono text-zinc-500 uppercase tracking-widest font-normal">Date & Heure</th>
                            <th className="p-6 text-xs font-mono text-zinc-500 uppercase tracking-widest font-normal">Sport</th>
                            <th className="p-6 text-xs font-mono text-zinc-500 uppercase tracking-widest font-normal">Statut</th>
                            <th className="p-6 text-xs font-mono text-zinc-500 uppercase tracking-widest font-normal text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {reservations.map((res) => (
                            <tr key={res.id} className="reservation-row border-b border-zinc-800 last:border-0 hover:bg-zinc-900/30 transition-colors">
                                <td className="p-6">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 bg-zinc-800 rounded-full flex items-center justify-center text-zinc-400">
                                            <User size={14} />
                                        </div>
                                        <span className="font-bold text-white">{res.sportif_name}</span>
                                    </div>
                                </td>
                                <td className="p-6">
                                    <div className="flex items-center gap-2 text-zinc-300 font-mono text-sm">
                                        <Clock size={14} className="text-zinc-600" />
                                        {format(new Date(res.reservation_date), 'dd/MM - HH:mm')}
                                    </div>
                                </td>
                                <td className="p-6 text-sm text-zinc-300 font-bold uppercase">{res.sport_name}</td>
                                <td className="p-6">
                                    <span className={`inline-block px-2 py-1 text-[10px] font-bold uppercase tracking-widest border ${res.status === 'confirmed' ? 'border-green-900 text-green-500 bg-green-900/10' :
                                            res.status === 'cancelled' ? 'border-red-900 text-red-500 bg-red-900/10' :
                                                'border-yellow-900 text-yellow-500 bg-yellow-900/10'
                                        }`}>
                                        {res.status}
                                    </span>
                                </td>
                                <td className="p-6 text-right">
                                    <div className="flex justify-end gap-2">
                                        {res.status === 'pending' && (
                                            <>
                                                <button
                                                    onClick={() => handleAction(res.id, 'confirmed')}
                                                    className="p-2 border border-zinc-800 text-green-500 hover:bg-green-900/20 hover:border-green-900 transition-colors"
                                                >
                                                    <Check size={16} />
                                                </button>
                                                <button
                                                    onClick={() => handleAction(res.id, 'cancelled')}
                                                    className="p-2 border border-zinc-800 text-red-500 hover:bg-red-900/20 hover:border-red-900 transition-colors"
                                                >
                                                    <X size={16} />
                                                </button>
                                            </>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {reservations.length === 0 && (
                    <div className="p-12 text-center text-zinc-500">Aucune réservation trouvée.</div>
                )}
            </div>
        </div>
    );
};

export default CoachReservations;
