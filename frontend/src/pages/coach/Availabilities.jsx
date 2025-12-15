import { useState, useEffect } from 'react';
import api from '../../services/api';
import { ENDPOINTS } from '../../config/api';
import { FiPlus, FiTrash2, FiCalendar } from 'react-icons/fi';
import { format, addDays } from 'date-fns';
import { fr } from 'date-fns/locale';
import toast from 'react-hot-toast';
import '../coach/Dashboard.css';
import './Availabilities.css';

const CoachAvailabilities = () => {
    const [availabilities, setAvailabilities] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState({
        date: format(addDays(new Date(), 1), 'yyyy-MM-dd'),
        start_time: '09:00',
        end_time: '10:00',
    });

    useEffect(() => {
        fetchAvailabilities();
    }, []);

    const fetchAvailabilities = async () => {
        try {
            const response = await api.get(ENDPOINTS.AVAILABILITIES.LIST);
            setAvailabilities(response.data.data || []);
        } catch (error) {
            console.error('Error fetching availabilities:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await api.post(ENDPOINTS.AVAILABILITIES.CREATE, formData);
            toast.success('Créneau créé !');
            setShowModal(false);
            fetchAvailabilities();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Erreur lors de la création');
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('Supprimer ce créneau ?')) return;
        try {
            await api.delete(ENDPOINTS.AVAILABILITIES.DELETE(id));
            toast.success('Créneau supprimé');
            fetchAvailabilities();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Erreur lors de la suppression');
        }
    };

    // Group availabilities by date
    const groupedAvailabilities = availabilities.reduce((acc, slot) => {
        const date = slot.available_date;
        if (!acc[date]) acc[date] = [];
        acc[date].push(slot);
        return acc;
    }, {});

    if (loading) {
        return (
            <div className="loading-container">
                <div className="spinner"></div>
            </div>
        );
    }

    return (
        <div className="availabilities-page animate-fade-in">
            <div className="page-header-actions">
                <div>
                    <h1>Mes Disponibilités</h1>
                    <p>Gérez vos créneaux de disponibilité</p>
                </div>
                <button onClick={() => setShowModal(true)} className="btn btn-primary">
                    <FiPlus /> Ajouter un créneau
                </button>
            </div>

            {Object.keys(groupedAvailabilities).length > 0 ? (
                <div className="availability-list">
                    {Object.entries(groupedAvailabilities)
                        .sort(([a], [b]) => new Date(a) - new Date(b))
                        .map(([date, slots]) => (
                            <div key={date} className="availability-group card">
                                <div className="group-header">
                                    <FiCalendar />
                                    <span>{format(new Date(date), 'EEEE d MMMM yyyy', { locale: fr })}</span>
                                </div>
                                <div className="slots-grid">
                                    {slots
                                        .sort((a, b) => a.start_time.localeCompare(b.start_time))
                                        .map((slot) => (
                                            <div
                                                key={slot.id}
                                                className={`slot-item ${slot.is_booked ? 'booked' : ''}`}
                                            >
                                                <span className="slot-time">
                                                    {slot.start_time.substring(0, 5)} - {slot.end_time.substring(0, 5)}
                                                </span>
                                                {slot.is_booked ? (
                                                    <span className="slot-status">Réservé</span>
                                                ) : (
                                                    <button
                                                        onClick={() => handleDelete(slot.id)}
                                                        className="slot-delete"
                                                        title="Supprimer"
                                                    >
                                                        <FiTrash2 size={16} />
                                                    </button>
                                                )}
                                            </div>
                                        ))}
                                </div>
                            </div>
                        ))}
                </div>
            ) : (
                <div className="empty-state card">
                    <FiCalendar size={48} />
                    <h3>Aucune disponibilité</h3>
                    <p>Ajoutez des créneaux pour recevoir des réservations</p>
                    <button onClick={() => setShowModal(true)} className="btn btn-primary">
                        <FiPlus /> Ajouter un créneau
                    </button>
                </div>
            )}

            {/* Modal */}
            {showModal && (
                <div className="modal-overlay" onClick={() => setShowModal(false)}>
                    <div className="modal card" onClick={(e) => e.stopPropagation()}>
                        <h2>Nouveau créneau</h2>
                        <form onSubmit={handleSubmit}>
                            <div className="form-group">
                                <label className="form-label">Date</label>
                                <input
                                    type="date"
                                    value={formData.date}
                                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                                    min={format(addDays(new Date(), 1), 'yyyy-MM-dd')}
                                    className="form-input"
                                    required
                                />
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label className="form-label">Début</label>
                                    <input
                                        type="time"
                                        value={formData.start_time}
                                        onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
                                        className="form-input"
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Fin</label>
                                    <input
                                        type="time"
                                        value={formData.end_time}
                                        onChange={(e) => setFormData({ ...formData, end_time: e.target.value })}
                                        className="form-input"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="modal-actions">
                                <button type="button" onClick={() => setShowModal(false)} className="btn btn-secondary">
                                    Annuler
                                </button>
                                <button type="submit" className="btn btn-primary">
                                    Créer
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CoachAvailabilities;
