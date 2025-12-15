import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { ENDPOINTS } from '../config/api';
import { FiSearch, FiMapPin, FiStar, FiFilter, FiX } from 'react-icons/fi';
import './Coaches.css';

const Coaches = () => {
    const [coaches, setCoaches] = useState([]);
    const [sports, setSports] = useState([]);
    const [cities, setCities] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({
        city: '',
        sport_id: '',
        available: '',
        sort: 'rating',
    });
    const [showFilters, setShowFilters] = useState(false);

    useEffect(() => {
        fetchInitialData();
    }, []);

    useEffect(() => {
        fetchCoaches();
    }, [filters]);

    const fetchInitialData = async () => {
        try {
            const [sportsRes, citiesRes] = await Promise.all([
                api.get(ENDPOINTS.SPORTS.LIST),
                api.get(ENDPOINTS.COACHES.CITIES),
            ]);
            setSports(sportsRes.data.data || []);
            setCities(citiesRes.data.data || []);
        } catch (error) {
            console.error('Error fetching data:', error);
        }
    };

    const fetchCoaches = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            if (filters.city) params.append('city', filters.city);
            if (filters.sport_id) params.append('sport_id', filters.sport_id);
            if (filters.available) params.append('available', filters.available);
            if (filters.sort) params.append('sort', filters.sort);

            const response = await api.get(`${ENDPOINTS.COACHES.LIST}?${params}`);
            setCoaches(response.data.data || []);
        } catch (error) {
            console.error('Error fetching coaches:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleFilterChange = (field, value) => {
        setFilters({ ...filters, [field]: value });
    };

    const clearFilters = () => {
        setFilters({ city: '', sport_id: '', available: '', sort: 'rating' });
    };

    const hasActiveFilters = filters.city || filters.sport_id || filters.available;

    return (
        <div className="coaches-page">
            <div className="container">
                {/* Header */}
                <div className="page-header">
                    <h1>Trouver un Coach</h1>
                    <p>Découvrez nos coachs professionnels certifiés</p>
                </div>

                {/* Filters */}
                <div className="filters-bar glass">
                    <div className="filters-main">
                        <div className="filter-group">
                            <FiMapPin className="filter-icon" />
                            <select
                                value={filters.city}
                                onChange={(e) => handleFilterChange('city', e.target.value)}
                                className="filter-select"
                            >
                                <option value="">Toutes les villes</option>
                                {cities.map((c) => (
                                    <option key={c.city} value={c.city}>{c.city}</option>
                                ))}
                            </select>
                        </div>

                        <div className="filter-group">
                            <FiSearch className="filter-icon" />
                            <select
                                value={filters.sport_id}
                                onChange={(e) => handleFilterChange('sport_id', e.target.value)}
                                className="filter-select"
                            >
                                <option value="">Tous les sports</option>
                                {sports.map((s) => (
                                    <option key={s.id} value={s.id}>{s.name}</option>
                                ))}
                            </select>
                        </div>

                        <div className="filter-group">
                            <select
                                value={filters.sort}
                                onChange={(e) => handleFilterChange('sort', e.target.value)}
                                className="filter-select"
                            >
                                <option value="rating">Mieux notés</option>
                                <option value="experience">Plus expérimentés</option>
                                <option value="price_asc">Prix croissant</option>
                                <option value="price_desc">Prix décroissant</option>
                            </select>
                        </div>

                        {hasActiveFilters && (
                            <button onClick={clearFilters} className="clear-filters-btn">
                                <FiX size={16} /> Effacer
                            </button>
                        )}
                    </div>

                    <button
                        className="mobile-filter-btn"
                        onClick={() => setShowFilters(!showFilters)}
                    >
                        <FiFilter size={20} />
                    </button>
                </div>

                {/* Results */}
                <div className="results-info">
                    <span>{coaches.length} coach{coaches.length !== 1 ? 's' : ''} trouvé{coaches.length !== 1 ? 's' : ''}</span>
                </div>

                {/* Coaches Grid */}
                {loading ? (
                    <div className="loading-container">
                        <div className="spinner"></div>
                    </div>
                ) : coaches.length > 0 ? (
                    <div className="coaches-grid">
                        {coaches.map((coach) => (
                            <CoachCard key={coach.id} coach={coach} />
                        ))}
                    </div>
                ) : (
                    <div className="no-results">
                        <p>Aucun coach trouvé pour ces critères.</p>
                        <button onClick={clearFilters} className="btn btn-outline">
                            Réinitialiser les filtres
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

const CoachCard = ({ coach }) => {
    const getImageUrl = (photo) => {
        if (!photo) return null;
        return `http://localhost:8000/uploads/profiles/${photo}`;
    };

    return (
        <Link to={`/coaches/${coach.id}`} className="coach-card card">
            <div className="coach-avatar">
                {coach.profile_photo ? (
                    <img src={getImageUrl(coach.profile_photo)} alt={coach.first_name} />
                ) : (
                    <div className="avatar-placeholder">👨‍🏫</div>
                )}
                {coach.is_available && <span className="available-badge">Disponible</span>}
            </div>

            <div className="coach-info">
                <h3 className="coach-name">{coach.first_name} {coach.last_name}</h3>

                <div className="coach-location">
                    <FiMapPin size={14} />
                    <span>{coach.city || 'Non renseigné'}</span>
                </div>

                {coach.sports && (
                    <div className="coach-sports">
                        {coach.sports.split(',').slice(0, 3).map((sport, i) => (
                            <span key={i} className="sport-tag">{sport.trim()}</span>
                        ))}
                    </div>
                )}

                <div className="coach-meta">
                    <div className="coach-rating">
                        <FiStar className="star-icon" />
                        <span>{coach.avg_rating ? parseFloat(coach.avg_rating).toFixed(1) : '—'}</span>
                        <span className="reviews-count">({coach.reviews_count || 0})</span>
                    </div>

                    <div className="coach-price">
                        <span className="price">{coach.hourly_rate ? `${coach.hourly_rate}€` : '—'}</span>
                        <span className="unit">/h</span>
                    </div>
                </div>
            </div>
        </Link>
    );
};

export default Coaches;
