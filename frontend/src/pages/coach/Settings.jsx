import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import { ENDPOINTS } from '../../config/api';
import toast from 'react-hot-toast';
import '../coach/Dashboard.css';
import './Settings.css';

const CoachSettings = () => {
    const { user, checkAuth } = useAuth();
    const [formData, setFormData] = useState({
        first_name: '',
        last_name: '',
        phone: '',
        bio: '',
        city: '',
        hourly_rate: '',
        years_experience: '',
        is_available: true,
    });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (user?.profile) {
            setFormData({
                first_name: user.profile.first_name || '',
                last_name: user.profile.last_name || '',
                phone: user.profile.phone || '',
                bio: user.profile.bio || '',
                city: user.profile.city || '',
                hourly_rate: user.profile.hourly_rate || '',
                years_experience: user.profile.years_experience || '',
                is_available: user.profile.is_available ?? true,
            });
        }
    }, [user]);

    const handleChange = (e) => {
        const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
        setFormData({ ...formData, [e.target.name]: value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await api.put(ENDPOINTS.COACHES.UPDATE_PROFILE, formData);
            toast.success('Profil mis à jour !');
            checkAuth();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Erreur lors de la mise à jour');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="settings-page animate-fade-in">
            <h1>Paramètres</h1>
            <p className="page-subtitle">Gérez votre profil et vos préférences</p>

            <form onSubmit={handleSubmit} className="settings-form card">
                <h2>Informations personnelles</h2>

                <div className="form-row">
                    <div className="form-group">
                        <label className="form-label">Prénom</label>
                        <input
                            type="text"
                            name="first_name"
                            value={formData.first_name}
                            onChange={handleChange}
                            className="form-input"
                        />
                    </div>
                    <div className="form-group">
                        <label className="form-label">Nom</label>
                        <input
                            type="text"
                            name="last_name"
                            value={formData.last_name}
                            onChange={handleChange}
                            className="form-input"
                        />
                    </div>
                </div>

                <div className="form-row">
                    <div className="form-group">
                        <label className="form-label">Téléphone</label>
                        <input
                            type="tel"
                            name="phone"
                            value={formData.phone}
                            onChange={handleChange}
                            className="form-input"
                        />
                    </div>
                    <div className="form-group">
                        <label className="form-label">Ville</label>
                        <input
                            type="text"
                            name="city"
                            value={formData.city}
                            onChange={handleChange}
                            className="form-input"
                        />
                    </div>
                </div>

                <div className="form-group">
                    <label className="form-label">Bio</label>
                    <textarea
                        name="bio"
                        value={formData.bio}
                        onChange={handleChange}
                        className="form-input form-textarea"
                        rows={4}
                        placeholder="Décrivez votre expérience et votre approche..."
                    />
                </div>

                <h2>Informations professionnelles</h2>

                <div className="form-row">
                    <div className="form-group">
                        <label className="form-label">Tarif horaire (€)</label>
                        <input
                            type="number"
                            name="hourly_rate"
                            value={formData.hourly_rate}
                            onChange={handleChange}
                            className="form-input"
                            min="0"
                        />
                    </div>
                    <div className="form-group">
                        <label className="form-label">Années d'expérience</label>
                        <input
                            type="number"
                            name="years_experience"
                            value={formData.years_experience}
                            onChange={handleChange}
                            className="form-input"
                            min="0"
                        />
                    </div>
                </div>

                <div className="form-group">
                    <label className="checkbox-label">
                        <input
                            type="checkbox"
                            name="is_available"
                            checked={formData.is_available}
                            onChange={handleChange}
                        />
                        <span>Disponible pour des réservations</span>
                    </label>
                </div>

                <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={loading}
                >
                    {loading ? 'Enregistrement...' : 'Enregistrer les modifications'}
                </button>
            </form>
        </div>
    );
};

export default CoachSettings;
