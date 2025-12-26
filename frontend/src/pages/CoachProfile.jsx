import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { ENDPOINTS } from '../config/api';
import { useAuth } from '../context/AuthContext';
import { MapPin, Star } from 'lucide-react';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';

// Fitness/sports themed Unsplash images
const coachImages = [
    '1571019614242-c5c5dee9f50a',
    '1534438327276-14e5300c3a48',
    '1517836357463-d25dfeac3438',
    '1571019613454-1cb2f99b2d8b',
    '1544367567-0f2fcb009e0b',
    '1552674605-db6ffd4facb5',
    '1581009146145-b5ef050c149a',
    '1549060279-7e168fcee0c2',
];

const getCoachImage = (coachId) => coachImages[coachId % coachImages.length];

const CoachProfile = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { isAuthenticated, isSportif } = useAuth();
    const [coach, setCoach] = useState(null);
    const [availableDates, setAvailableDates] = useState([]);
    const [selectedDate, setSelectedDate] = useState(null);
    const [availabilities, setAvailabilities] = useState([]);
    const [selectedSlot, setSelectedSlot] = useState(null);
    const [selectedSport, setSelectedSport] = useState(null);
    const [loading, setLoading] = useState(true);

    const containerRef = useRef(null);

    useEffect(() => {
        const fetch = async () => {
            try {
                const res = await api.get(ENDPOINTS.COACHES.SHOW(id));
                setCoach(res.data.data);
                if (res.data.data.sports?.[0]) setSelectedSport(res.data.data.sports[0].id);

                const dates = await api.get(ENDPOINTS.AVAILABILITIES.DATES(id));
                setAvailableDates(dates.data.data || []);
            } catch (e) {
                navigate('/coaches');
            } finally {
                setLoading(false);
            }
        };
        fetch();
    }, [id]);

    useEffect(() => {
        if (selectedDate) {
            api.get(`${ENDPOINTS.AVAILABILITIES.BY_COACH(id)}?date=${selectedDate}`)
                .then(res => setAvailabilities(res.data.data || []));
        }
    }, [selectedDate]);

    // GSAP Animations
    useGSAP(() => {
        if (!loading && coach) {
            gsap.from(".profile-animate", {
                y: 30,
                opacity: 0,
                duration: 0.6,
                stagger: 0.1,
                ease: "expo.out"
            });
        }
    }, [loading, coach]);

    const handleBooking = async () => {
        if (!isAuthenticated || !isSportif) return toast.error('Connexion sportifs requise.');
        if (!selectedSlot) return toast.error('Sélection créneau requise.');

        try {
            await api.post(ENDPOINTS.RESERVATIONS.CREATE, {
                coach_id: parseInt(id),
                availability_id: selectedSlot.id,
                sport_id: selectedSport,
                notes: 'Réservation express'
            });
            toast.success('Réservé.');
            navigate('/sportif/dashboard');
        } catch (e) {
            toast.error('Erreur.');
        }
    };

    if (loading || !coach) return <div className="min-h-screen bg-black" />;

    return (
        <div ref={containerRef} className="min-h-screen bg-black text-white pt-24 pb-20">
            <div className="container mx-auto px-6 lg:px-8 max-w-[1400px]">

                {/* Header - Sharp Layout */}
                <div className="profile-animate grid grid-cols-1 lg:grid-cols-12 gap-12 mb-20 border-b border-zinc-900 pb-12">
                    <div className="lg:col-span-4">
                        <div className="aspect-square bg-zinc-900 border border-zinc-800 grayscale overflow-hidden">
                            <img
                                src={`https://images.unsplash.com/photo-${getCoachImage(parseInt(id))}?w=600&h=600&fit=crop`}
                                alt={coach.first_name}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                    e.target.src = `https://ui-avatars.com/api/?name=${coach.first_name}+${coach.last_name}&size=600&background=18181b&color=fff&bold=true`;
                                }}
                            />
                        </div>
                    </div>

                    <div className="lg:col-span-8 flex flex-col justify-between">
                        <div>
                            <div className="flex items-center gap-4 mb-2">
                                <h1 className="text-6xl font-bold tracking-tighter uppercase">{coach.first_name} <br /> {coach.last_name}</h1>
                            </div>
                            <div className="flex gap-6 text-zinc-500 font-mono text-sm uppercase tracking-widest mb-8">
                                <span className="flex items-center gap-2"><MapPin size={14} /> {coach.city}</span>
                                <span className="flex items-center gap-2"><Star size={14} /> {parseFloat(coach.avg_rating).toFixed(1)} / 5.0</span>
                            </div>
                            <div className="prose prose-invert max-w-2xl">
                                <p className="text-xl text-zinc-300 font-light leading-relaxed">{coach.bio}</p>
                            </div>
                        </div>

                        <div className="flex gap-2 mt-8">
                            {coach.sports?.map(s => (
                                <span key={s.id} className="px-4 py-2 border border-zinc-700 text-sm font-bold uppercase tracking-wide hover:bg-white hover:text-black transition-colors cursor-default">
                                    {s.name}
                                </span>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Booking Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">

                    {/* Reviews Column */}
                    <div className="profile-animate">
                        <h2 className="text-2xl font-bold tracking-tight mb-8">AVIS CLIENTS</h2>
                        <div className="space-y-6">
                            {coach.reviews?.map(review => (
                                <div key={review.id} className="p-6 border border-zinc-800 bg-zinc-950/50">
                                    <div className="flex justify-between items-center mb-4">
                                        <span className="font-bold text-white">{review.first_name} {review.last_name[0]}.</span>
                                        <div className="flex gap-px">
                                            {[...Array(5)].map((_, i) => (
                                                <div key={i} className={`w-1 h-4 ${i < review.rating ? 'bg-white' : 'bg-zinc-800'}`} />
                                            ))}
                                        </div>
                                    </div>
                                    <p className="text-zinc-400 text-sm leading-relaxed">{review.comment}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Booking Module - Sharp */}
                    <div className="profile-animate border border-zinc-800 bg-zinc-950 p-8">
                        <h2 className="text-2xl font-bold tracking-tight mb-8 flex justify-between">
                            RÉSERVATION <span className="font-mono text-zinc-500">{coach.hourly_rate}€/SESSION</span>
                        </h2>

                        <div className="space-y-6">
                            <div>
                                <label className="block text-xs font-mono text-zinc-500 uppercase mb-2">DATE</label>
                                <select
                                    className="w-full bg-black border border-zinc-800 text-white p-3 rounded-none focus:border-white transition-colors appearance-none"
                                    onChange={(e) => { setSelectedDate(e.target.value); setSelectedSlot(null); }}
                                >
                                    <option value="">CHOISIR UNE DATE</option>
                                    {availableDates.map(d => (
                                        <option key={d.available_date} value={d.available_date}>
                                            {format(new Date(d.available_date), 'dd/MM/yyyy')}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {selectedDate && (
                                <div className="grid grid-cols-3 gap-2">
                                    {availabilities.map(slot => (
                                        <button
                                            key={slot.id}
                                            onClick={() => setSelectedSlot(slot)}
                                            className={`p-3 text-sm font-mono border ${selectedSlot?.id === slot.id
                                                ? 'bg-white text-black border-white'
                                                : 'bg-black text-zinc-400 border-zinc-800 hover:border-zinc-500'
                                                }`}
                                        >
                                            {slot.start_time.substring(0, 5)}
                                        </button>
                                    ))}
                                </div>
                            )}

                            <button
                                onClick={handleBooking}
                                disabled={!selectedSlot}
                                className="w-full py-4 bg-blue-600 hover:bg-blue-500 text-white font-bold uppercase tracking-wider disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                CONFIRMER
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CoachProfile;
