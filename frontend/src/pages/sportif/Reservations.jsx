import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { ENDPOINTS } from '../../config/api';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import toast from 'react-hot-toast';
import '../coach/Dashboard.css';
import '../coach/Reservations.css';

const SportifReservations = () => {
    const [reservations, setReservations] = useState([]);
    const [filter, setFilter] = useState('all');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchReservations();
    }, [filter]);

    const fetchReservations = async () => {
        try {
            const params = filter !== 'all' ? `?status=${filter}` : '';
            const response = await api.get(`${ENDPOINTS.SPORTIFS.RESERVATIONS}${params}`);
            setReservations(response.data.data || []);
        } catch (error) {
            console.error('Error fetching reservations:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = async (id) => {
        if (!confirm('Êtes-vous sûr de vouloir annuler cette réservation ?')) return;
        try {
            await api.put(ENDPOINTS.RESERVATIONS.CANCEL(id));
            toast.success('Réservation annulée');
            fetchReservations();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Erreur lors de l\'annulation');
        }
    };

    const getStatusBadge = (status) => {
        const badges = {
            en_attente: { class: 'badge-warning', text: 'En attente' },
            acceptee: { class: 'badge-success', text: 'Confirmée' },
            refusee: { class: 'badge-error', text: 'Refusée' },
            annulee: { class: 'badge-error', text: 'Annulée' },
            terminee: { class: 'badge-primary', text: 'Terminée' },
        };
        const badge = badges[status] || { class: '', text: status };
        return <span className={`badge ${badge.class}`}>{badge.text}</span>;
    };

    if (loading) {
        return (
            <div className="loading-container">
                <div className="spinner"></div>
            </div>
        );
    }

    return (
        <div className="reservations-page animate-fade-in">
            <div className="page-header-actions">
                <div>
                    <h1>Mes Réservations</h1>
                    <p>Consultez et gérez vos séances</p>
                </div>
                <Link to="/coaches" className="btn btn-primary">
                    Trouver un coach
                </Link>
            </div>

            {/* Filters */}
            <div className="filter-tabs">
                {[
                    { value: 'all', label: 'Toutes' },
                    { value: 'en_attente', label: 'En attente' },
                    { value: 'acceptee', label: 'Confirmées' },
                    { value: 'terminee', label: 'Terminées' },
                ].map((f) => (
                    <button
                        key={f.value}
                        className={`filter-tab ${filter === f.value ? 'active' : ''}`}
                        onClick={() => setFilter(f.value)}
                    >
                        {f.label}
                    </button>
                ))}
            </div>

            {/* Reservations List */}
            {reservations.length > 0 ? (
                <div className="reservations-list">
                    {reservations.map((res) => (
                        <div key={res.id} className="reservation-card card">
                            <div className="reservation-header">
                                <div className="reservation-date">
                                    <span className="day">{format(new Date(res.session_date), 'd')}</span>
                                    <span className="month">{format(new Date(res.session_date), 'MMM', { locale: fr })}</span>
                                </div>
                                <div className="reservation-info">
                                    <h3>Coach {res.coach_first_name} {res.coach_last_name}</h3>
                                    <p>{res.sport_name} • {res.start_time?.substring(0, 5)} - {res.end_time?.substring(0, 5)}</p>
                                </div>
                                <div className="reservation-meta">
                                    {getStatusBadge(res.status)}
                                    <span className="reservation-price">{res.price}€</span>
                                </div>
                            </div>

                            {(res.status === 'en_attente' || res.status === 'acceptee') && (
                                <div className="reservation-actions">
                                    <button
                                        onClick={() => handleCancel(res.id)}
                                        className="btn btn-danger btn-sm"
                                    >
                                        Annuler
                                    </button>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            ) : (
                <div className="empty-state card">
                    <h3>Aucune réservation</h3>
                    <p>Trouvez un coach et réservez votre première séance !</p>
                    <Link to="/coaches" className="btn btn-primary">
                        Trouver un coach
                    </Link>
                </div>
            )}
        </div>
    );
};

export default SportifReservations;
