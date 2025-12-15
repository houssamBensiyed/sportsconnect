import { useState, useEffect } from 'react';
import api from '../../services/api';
import { ENDPOINTS } from '../../config/api';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import toast from 'react-hot-toast';
import '../coach/Dashboard.css';
import './Reservations.css';

const CoachReservations = () => {
    const [reservations, setReservations] = useState([]);
    const [filter, setFilter] = useState('all');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchReservations();
    }, [filter]);

    const fetchReservations = async () => {
        try {
            const params = filter !== 'all' ? `?status=${filter}` : '';
            const response = await api.get(`${ENDPOINTS.RESERVATIONS.COACH}${params}`);
            setReservations(response.data.data || []);
        } catch (error) {
            console.error('Error fetching reservations:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleAction = async (id, action) => {
        try {
            const endpoint =
                action === 'accept' ? ENDPOINTS.RESERVATIONS.ACCEPT(id) :
                    action === 'refuse' ? ENDPOINTS.RESERVATIONS.REFUSE(id) :
                        ENDPOINTS.RESERVATIONS.COMPLETE(id);

            await api.put(endpoint);
            toast.success(
                action === 'accept' ? 'Réservation acceptée' :
                    action === 'refuse' ? 'Réservation refusée' :
                        'Séance terminée'
            );
            fetchReservations();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Erreur');
        }
    };

    const getStatusBadge = (status) => {
        const badges = {
            en_attente: { class: 'badge-warning', text: 'En attente' },
            acceptee: { class: 'badge-success', text: 'Acceptée' },
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
                    <h1>Réservations</h1>
                    <p>Gérez vos demandes et séances</p>
                </div>
            </div>

            {/* Filters */}
            <div className="filter-tabs">
                {[
                    { value: 'all', label: 'Toutes' },
                    { value: 'en_attente', label: 'En attente' },
                    { value: 'acceptee', label: 'Acceptées' },
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
                                    <h3>{res.first_name} {res.last_name}</h3>
                                    <p>{res.sport_name} • {res.start_time?.substring(0, 5)} - {res.end_time?.substring(0, 5)}</p>
                                    {res.notes_sportif && (
                                        <p className="reservation-notes">"{res.notes_sportif}"</p>
                                    )}
                                </div>
                                <div className="reservation-meta">
                                    {getStatusBadge(res.status)}
                                    <span className="reservation-price">{res.price}€</span>
                                </div>
                            </div>

                            {res.status === 'en_attente' && (
                                <div className="reservation-actions">
                                    <button
                                        onClick={() => handleAction(res.id, 'accept')}
                                        className="btn btn-success btn-sm"
                                    >
                                        Accepter
                                    </button>
                                    <button
                                        onClick={() => handleAction(res.id, 'refuse')}
                                        className="btn btn-danger btn-sm"
                                    >
                                        Refuser
                                    </button>
                                </div>
                            )}

                            {res.status === 'acceptee' && new Date(res.session_date) <= new Date() && (
                                <div className="reservation-actions">
                                    <button
                                        onClick={() => handleAction(res.id, 'complete')}
                                        className="btn btn-primary btn-sm"
                                    >
                                        Marquer comme terminée
                                    </button>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            ) : (
                <div className="empty-state card">
                    <h3>Aucune réservation</h3>
                    <p>Vous n'avez pas encore de réservations {filter !== 'all' && 'avec ce statut'}</p>
                </div>
            )}
        </div>
    );
};

export default CoachReservations;
