import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { ENDPOINTS } from '../config/api';
import { useAuth } from '../context/AuthContext';
import { FiMapPin, FiStar, FiCalendar, FiClock, FiAward, FiCheck } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import './CoachProfile.css';

const CoachProfile = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { isAuthenticated, isSportif } = useAuth();
    const [coach, setCoach] = useState(null);
    const [availabilities, setAvailabilities] = useState([]);
    const [availableDates, setAvailableDates] = useState([]);
    const [selectedDate, setSelectedDate] = useState(null);
    const [selectedSlot, setSelectedSlot] = useState(null);
    const [selectedSport, setSelectedSport] = useState(null);
    const [notes, setNotes] = useState('');
    const [loading, setLoading] = useState(true);
    const [booking, setBooking] = useState(false);
    const [activeTab, setActiveTab] = useState('about');

    useEffect(() => {
        fetchCoachProfile();
        fetchAvailableDates();
    }, [id]);

    useEffect(() => {
        if (selectedDate) {
            fetchAvailabilities();
        }
    }, [selectedDate]);

    const fetchCoachProfile = async () => {
        try {
            const response = await api.get(ENDPOINTS.COACHES.SHOW(id));
            setCoach(response.data.data);
            if (response.data.data.sports?.length > 0) {
                setSelectedSport(response.data.data.sports[0].id);
            }
        } catch (error) {
            toast.error('Coach non trouvé');
            navigate('/coaches');
        } finally {
            setLoading(false);
        }
    };

    const fetchAvailableDates = async () => {
        try {
            const response = await api.get(ENDPOINTS.AVAILABILITIES.DATES(id));
            setAvailableDates(response.data.data || []);
        } catch (error) {
            console.error('Error fetching dates:', error);
        }
    };

    const fetchAvailabilities = async () => {
        try {
            const response = await api.get(
                `${ENDPOINTS.AVAILABILITIES.BY_COACH(id)}?date=${selectedDate}`
            );
            setAvailabilities(response.data.data || []);
        } catch (error) {
            console.error('Error fetching slots:', error);
        }
    };

    const handleBooking = async () => {
        if (!isAuthenticated) {
            toast.error('Connectez-vous pour réserver');
            navigate('/login');
            return;
        }

        if (!isSportif) {
            toast.error('Seuls les sportifs peuvent réserver');
            return;
        }

        if (!selectedSlot || !selectedSport) {
            toast.error('Sélectionnez un créneau et un sport');
            return;
        }

        setBooking(true);
        try {
            await api.post(ENDPOINTS.RESERVATIONS.CREATE, {
                coach_id: parseInt(id),
                availability_id: selectedSlot.id,
                sport_id: selectedSport,
                notes: notes,
            });
            toast.success('Réservation envoyée !');
            navigate('/sportif/reservations');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Erreur lors de la réservation');
        } finally {
            setBooking(false);
        }
    };

    if (loading) {
        return (
            <div className="loading-container" style={{ minHeight: '60vh' }}>
                <div className="spinner"></div>
            </div>
        );
    }

    if (!coach) return null;

    const getImageUrl = (photo) => {
        if (!photo) return null;
        return `http://localhost:8000/uploads/profiles/${photo}`;
    };

    return (
        <div className="coach-profile-page">
            <div className="container">
                <div className="profile-layout">
                    {/* Left Column - Profile Info */}
                    <div className="profile-main">
                        {/* Hero Card */}
                        <div className="profile-hero card">
                            <div className="hero-content">
                                <div className="profile-avatar-lg">
                                    {coach.profile_photo ? (
                                        <img src={getImageUrl(coach.profile_photo)} alt={coach.first_name} />
                                    ) : (
                                        <span className="avatar-placeholder-lg">👨‍🏫</span>
                                    )}
                                </div>

                                <div className="profile-header-info">
                                    <h1>{coach.first_name} {coach.last_name}</h1>

                                    <div className="profile-meta">
                                        <span className="meta-item">
                                            <FiMapPin /> {coach.city || 'Non renseigné'}
                                        </span>
                                        <span className="meta-item">
                                            <FiAward /> {coach.years_experience || 0} ans d'expérience
                                        </span>
                                        <span className="meta-item rating">
                                            <FiStar className="star-filled" />
                                            {coach.avg_rating ? parseFloat(coach.avg_rating).toFixed(1) : '—'}
                                            <span className="muted">({coach.total_reviews || 0} avis)</span>
                                        </span>
                                    </div>

                                    <div className="profile-sports">
                                        {coach.sports?.map((sport) => (
                                            <span key={sport.id} className="sport-badge">
                                                {sport.name}
                                            </span>
                                        ))}
                                    </div>
                                </div>

                                <div className="profile-price">
                                    <span className="price-value">{coach.hourly_rate || '—'}€</span>
                                    <span className="price-unit">/séance</span>
                                </div>
                            </div>
                        </div>

                        {/* Tabs */}
                        <div className="profile-tabs">
                            <button
                                className={`tab-btn ${activeTab === 'about' ? 'active' : ''}`}
                                onClick={() => setActiveTab('about')}
                            >
                                À propos
                            </button>
                            <button
                                className={`tab-btn ${activeTab === 'reviews' ? 'active' : ''}`}
                                onClick={() => setActiveTab('reviews')}
                            >
                                Avis ({coach.total_reviews || 0})
                            </button>
                            <button
                                className={`tab-btn ${activeTab === 'certifications' ? 'active' : ''}`}
                                onClick={() => setActiveTab('certifications')}
                            >
                                Certifications
                            </button>
                        </div>

                        {/* Tab Content */}
                        <div className="tab-content card">
                            {activeTab === 'about' && (
                                <div className="about-content">
                                    <h3>Biographie</h3>
                                    <p>{coach.bio || 'Aucune description disponible.'}</p>
                                </div>
                            )}

                            {activeTab === 'reviews' && (
                                <div className="reviews-content">
                                    {coach.reviews?.length > 0 ? (
                                        coach.reviews.map((review) => (
                                            <div key={review.id} className="review-item">
                                                <div className="review-header">
                                                    <div className="reviewer-info">
                                                        <span className="reviewer-name">
                                                            {review.first_name} {review.last_name?.charAt(0)}.
                                                        </span>
                                                        <span className="review-date">
                                                            {format(new Date(review.created_at), 'dd MMM yyyy', { locale: fr })}
                                                        </span>
                                                    </div>
                                                    <div className="review-rating">
                                                        {[...Array(5)].map((_, i) => (
                                                            <FiStar
                                                                key={i}
                                                                className={i < review.rating ? 'star-filled' : 'star-empty'}
                                                            />
                                                        ))}
                                                    </div>
                                                </div>
                                                <p className="review-comment">{review.comment}</p>
                                                {review.coach_response && (
                                                    <div className="coach-response">
                                                        <strong>Réponse du coach:</strong>
                                                        <p>{review.coach_response}</p>
                                                    </div>
                                                )}
                                            </div>
                                        ))
                                    ) : (
                                        <p className="no-data">Aucun avis pour le moment.</p>
                                    )}
                                </div>
                            )}

                            {activeTab === 'certifications' && (
                                <div className="certifications-content">
                                    {coach.certifications?.length > 0 ? (
                                        coach.certifications.map((cert) => (
                                            <div key={cert.id} className="cert-item">
                                                <FiCheck className="cert-icon" />
                                                <div className="cert-info">
                                                    <span className="cert-name">{cert.name}</span>
                                                    <span className="cert-org">
                                                        {cert.organization} • {cert.year_obtained}
                                                    </span>
                                                </div>
                                                {cert.is_verified && (
                                                    <span className="verified-badge">Vérifié</span>
                                                )}
                                            </div>
                                        ))
                                    ) : (
                                        <p className="no-data">Aucune certification renseignée.</p>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Right Column - Booking */}
                    <div className="booking-sidebar">
                        <div className="booking-card card">
                            <h3>Réserver une séance</h3>

                            {/* Sport Selection */}
                            {coach.sports?.length > 0 && (
                                <div className="form-group">
                                    <label className="form-label">Sport</label>
                                    <select
                                        value={selectedSport || ''}
                                        onChange={(e) => setSelectedSport(parseInt(e.target.value))}
                                        className="form-input"
                                    >
                                        {coach.sports.map((sport) => (
                                            <option key={sport.id} value={sport.id}>{sport.name}</option>
                                        ))}
                                    </select>
                                </div>
                            )}

                            {/* Date Selection */}
                            <div className="form-group">
                                <label className="form-label">
                                    <FiCalendar /> Date
                                </label>
                                <select
                                    value={selectedDate || ''}
                                    onChange={(e) => {
                                        setSelectedDate(e.target.value);
                                        setSelectedSlot(null);
                                    }}
                                    className="form-input"
                                >
                                    <option value="">Choisir une date</option>
                                    {availableDates.map((d) => (
                                        <option key={d.available_date} value={d.available_date}>
                                            {format(new Date(d.available_date), 'EEEE d MMMM', { locale: fr })}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Time Slots */}
                            {selectedDate && (
                                <div className="form-group">
                                    <label className="form-label">
                                        <FiClock /> Créneau
                                    </label>
                                    <div className="time-slots">
                                        {availabilities.length > 0 ? (
                                            availabilities.map((slot) => (
                                                <button
                                                    key={slot.id}
                                                    type="button"
                                                    className={`time-slot ${selectedSlot?.id === slot.id ? 'selected' : ''}`}
                                                    onClick={() => setSelectedSlot(slot)}
                                                >
                                                    {slot.start_time.substring(0, 5)} - {slot.end_time.substring(0, 5)}
                                                </button>
                                            ))
                                        ) : (
                                            <p className="no-slots">Aucun créneau disponible</p>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Notes */}
                            <div className="form-group">
                                <label className="form-label">Message (optionnel)</label>
                                <textarea
                                    value={notes}
                                    onChange={(e) => setNotes(e.target.value)}
                                    placeholder="Décrivez vos objectifs ou besoins..."
                                    className="form-input form-textarea"
                                    rows={3}
                                />
                            </div>

                            {/* Summary */}
                            {selectedSlot && (
                                <div className="booking-summary">
                                    <div className="summary-row">
                                        <span>Prix</span>
                                        <span className="summary-price">{coach.hourly_rate}€</span>
                                    </div>
                                </div>
                            )}

                            <button
                                onClick={handleBooking}
                                disabled={!selectedSlot || booking}
                                className="btn btn-primary btn-lg w-full"
                            >
                                {booking ? 'Envoi...' : 'Envoyer la demande'}
                            </button>

                            <p className="booking-note">
                                Le coach confirmera votre demande sous 24h
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CoachProfile;
