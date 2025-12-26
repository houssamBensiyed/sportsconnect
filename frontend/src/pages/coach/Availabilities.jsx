import { useState, useEffect } from 'react';
import api from '../../services/api';
import { ENDPOINTS } from '../../config/api';
import toast from 'react-hot-toast';
import { Plus, X, Calendar } from 'lucide-react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { format, addDays, startOfWeek } from 'date-fns';
import { fr } from 'date-fns/locale';

const CoachAvailabilities = () => {
    const [availabilities, setAvailabilities] = useState([]);
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
    const [newSlot, setNewSlot] = useState({ start_time: '', end_time: '' });

    useGSAP(() => {
        gsap.from(".availability-card", {
            y: 20,
            opacity: 0,
            duration: 0.4,
            stagger: 0.05,
            ease: "expo.out"
        });
    }, [availabilities]);

    const fetchAvailabilities = async () => {
        try {
            // In a real app, filtering by date would be here
            const res = await api.get(ENDPOINTS.AVAILABILITIES.LIST);
            setAvailabilities(res.data.data || []);
        } catch (error) {
            console.error(error);
        }
    };

    useEffect(() => {
        fetchAvailabilities();
    }, [selectedDate]);

    const handleAdd = async (e) => {
        e.preventDefault();
        try {
            await api.post(ENDPOINTS.AVAILABILITIES.CREATE, {
                ...newSlot,
                available_date: selectedDate
            });
            toast.success('Créneau ajouté');
            fetchAvailabilities();
            setNewSlot({ start_time: '', end_time: '' });
        } catch (error) {
            toast.error('Erreur ajout');
        }
    };

    const handleDelete = async (id) => {
        try {
            await api.delete(ENDPOINTS.AVAILABILITIES.DELETE(id));
            toast.success('Supprimé');
            fetchAvailabilities();
        } catch (error) {
            toast.error('Erreur suppression');
        }
    };

    return (
        <div className="max-w-5xl mx-auto">
            <h1 className="text-4xl font-bold text-white tracking-tighter mb-8">DISPONIBILITÉS.</h1>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Add Form */}
                <div className="border border-zinc-800 bg-black p-8">
                    <h2 className="text-xl font-bold text-white tracking-tight mb-6 flex items-center gap-2">
                        <Plus size={20} /> AJOUTER
                    </h2>

                    <form onSubmit={handleAdd} className="space-y-6">
                        <div>
                            <label className="block text-xs font-mono text-zinc-500 uppercase mb-2">Date</label>
                            <input
                                type="date"
                                value={selectedDate}
                                onChange={(e) => setSelectedDate(e.target.value)}
                                className="w-full bg-black border border-zinc-800 text-white p-3 focus:border-white outline-none transition-colors appearance-none"
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-mono text-zinc-500 uppercase mb-2">Début</label>
                                <input
                                    type="time"
                                    value={newSlot.start_time}
                                    onChange={(e) => setNewSlot({ ...newSlot, start_time: e.target.value })}
                                    className="w-full bg-black border border-zinc-800 text-white p-3 focus:border-white outline-none transition-colors appearance-none"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-mono text-zinc-500 uppercase mb-2">Fin</label>
                                <input
                                    type="time"
                                    value={newSlot.end_time}
                                    onChange={(e) => setNewSlot({ ...newSlot, end_time: e.target.value })}
                                    className="w-full bg-black border border-zinc-800 text-white p-3 focus:border-white outline-none transition-colors appearance-none"
                                />
                            </div>
                        </div>
                        <button type="submit" className="w-full py-4 bg-white text-black font-bold uppercase tracking-wider hover:bg-zinc-200 transition-colors">
                            Confirmer
                        </button>
                    </form>
                </div>

                {/* List */}
                <div className="lg:col-span-2">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {availabilities.filter(a => a.available_date === selectedDate).length > 0 ? (
                            availabilities
                                .filter(a => a.available_date === selectedDate)
                                .map((slot) => (
                                    <div key={slot.id} className="availability-card p-6 border border-zinc-800 bg-black flex justify-between items-center group hover:border-zinc-600 transition-colors">
                                        <div>
                                            <p className="text-2xl font-bold text-white tracking-tight">
                                                {slot.start_time.substring(0, 5)} - {slot.end_time.substring(0, 5)}
                                            </p>
                                            <p className="text-xs font-mono text-zinc-500 uppercase flex items-center gap-1 mt-1">
                                                <Calendar size={12} /> {format(new Date(slot.available_date), 'dd/MM/yyyy')}
                                            </p>
                                        </div>
                                        <button
                                            onClick={() => handleDelete(slot.id)}
                                            className="w-10 h-10 flex items-center justify-center border border-zinc-800 text-zinc-500 hover:text-red-500 hover:border-red-500 hover:bg-black transition-all"
                                        >
                                            <X size={18} />
                                        </button>
                                    </div>
                                ))
                        ) : (
                            <div className="col-span-full py-12 text-center border border-zinc-800 border-dashed">
                                <p className="text-zinc-500">Aucun créneau pour cette date.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CoachAvailabilities;
