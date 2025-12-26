import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { ENDPOINTS } from '../config/api';
import { Filter, MapPin, ArrowUpRight } from 'lucide-react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';

// Fitness/sports themed Unsplash images
const coachImages = [
    '1571019614242-c5c5dee9f50a', // gym
    '1534438327276-14e5300c3a48', // weights
    '1517836357463-d25dfeac3438', // training
    '1571019613454-1cb2f99b2d8b', // crossfit
    '1544367567-0f2fcb009e0b', // yoga
    '1552674605-db6ffd4facb5', // running
    '1581009146145-b5ef050c149a', // boxing
    '1549060279-7e168fcee0c2', // fitness
    '1574680096145-d05b474e2155', // gym workout
    '1533681904893-cdf01d0efb3a', // sports
    '1518611012118-696072aa579a', // athlete
    '1579758629938-03607ccdbaba', // muscle
];

const getCoachImage = (coachId) => {
    return coachImages[coachId % coachImages.length];
};

const Coaches = () => {
    const [coaches, setCoaches] = useState([]);
    const [sports, setSports] = useState([]);
    const [cities, setCities] = useState([]);
    const [filters, setFilters] = useState({ city: '', sport_id: '', available: '', sort: 'rating' });
    const [loading, setLoading] = useState(true);

    const containerRef = useRef(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [s, c] = await Promise.all([
                    api.get(ENDPOINTS.SPORTS.LIST),
                    api.get(ENDPOINTS.COACHES.CITIES)
                ]);
                setSports(s.data.data || []);
                setCities(c.data.data || []);
            } catch (e) {
                console.error(e);
            }
        };
        fetchData();
    }, []);

    useEffect(() => {
        const fetchCoaches = async () => {
            setLoading(true);
            try {
                const params = new URLSearchParams(filters);
                const res = await api.get(`${ENDPOINTS.COACHES.LIST}?${params}`);
                setCoaches(res.data.data || []);
            } catch (e) {
                console.error(e);
            } finally {
                setLoading(false);
            }
        };
        fetchCoaches();
    }, [filters]);

    // GSAP Animations for cards when data loads
    useGSAP(() => {
        if (!loading && coaches.length > 0) {
            gsap.from(".coach-card", {
                y: 40,
                opacity: 0,
                duration: 0.6,
                stagger: 0.08,
                ease: "expo.out"
            });
        }
    }, [loading, coaches]);

    return (
        <div ref={containerRef} className="bg-black min-h-screen pt-28 pb-20 px-4 sm:px-6 lg:px-8">
            <div className="max-w-[1600px] mx-auto">

                {/* Header & Filters */}
                <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end mb-16 gap-8 border-b border-zinc-900 pb-8">
                    <div>
                        <h1 className="text-5xl md:text-7xl font-bold text-white tracking-tighter mb-4">ROSTER.</h1>
                        <p className="text-zinc-500 text-lg max-w-md font-light">Sélection des meilleurs profils.</p>
                    </div>

                    <div className="flex flex-wrap items-center gap-4 w-full lg:w-auto">
                        <div className="relative flex-grow lg:flex-grow-0">
                            <select
                                className="w-full appearance-none bg-black border border-zinc-800 text-white pl-4 pr-10 py-3 text-sm font-medium tracking-wide focus:border-white transition-colors rounded-none"
                                onChange={(e) => setFilters({ ...filters, sport_id: e.target.value })}
                            >
                                <option value="">Tous les sports</option>
                                {sports.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                            </select>
                            <Filter size={14} className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-zinc-500" />
                        </div>

                        <div className="relative flex-grow lg:flex-grow-0">
                            <select
                                className="w-full appearance-none bg-black border border-zinc-800 text-white pl-4 pr-10 py-3 text-sm font-medium tracking-wide focus:border-white transition-colors rounded-none"
                                onChange={(e) => setFilters({ ...filters, city: e.target.value })}
                            >
                                <option value="">Toutes les villes</option>
                                {cities.map(c => <option key={c.city} value={c.city}>{c.city}</option>)}
                            </select>
                            <MapPin size={14} className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-zinc-500" />
                        </div>
                    </div>
                </div>

                {/* Grid */}
                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-px bg-zinc-900 border border-zinc-900">
                        {[1, 2, 3, 4].map(i => <div key={i} className="aspect-[3/4] bg-black animate-pulse" />)}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {coaches.map(coach => (
                            <Link
                                key={coach.id}
                                to={`/coaches/${coach.id}`}
                                className="coach-card group relative aspect-[3/4] overflow-hidden bg-zinc-900 border border-zinc-800 hover:border-zinc-600 transition-colors"
                            >
                                {/* Image */}
                                <div className="absolute inset-0 grayscale group-hover:grayscale-0 transition-all duration-700">
                                    <img
                                        src={`https://images.unsplash.com/photo-${getCoachImage(coach.id)}?w=400&h=600&fit=crop`}
                                        alt={coach.first_name}
                                        className="w-full h-full object-cover"
                                        onError={(e) => {
                                            e.target.src = `https://ui-avatars.com/api/?name=${coach.first_name}+${coach.last_name}&size=400&background=18181b&color=fff&bold=true`;
                                        }}
                                    />
                                </div>

                                {/* Overlay Gradient - STRICT BLACK */}
                                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent opacity-90" />

                                {/* Info */}
                                <div className="absolute inset-x-0 bottom-0 p-6">
                                    <div className="flex justify-between items-end mb-2">
                                        <h3 className="text-2xl font-bold text-white tracking-tight uppercase">
                                            {coach.first_name} <br /> {coach.last_name}
                                        </h3>
                                        <ArrowUpRight className="text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                                    </div>
                                    <p className="text-zinc-500 text-xs font-mono uppercase tracking-widest mb-4">{coach.city}</p>

                                    <div className="h-px w-full bg-zinc-800 mb-4" />

                                    <div className="flex justify-between items-center text-sm font-medium text-zinc-300">
                                        <span>{coach.sports?.split(',')[0]}</span>
                                        <span>{coach.hourly_rate}€ /H</span>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Coaches;
