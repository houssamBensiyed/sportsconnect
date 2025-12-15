import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import { ENDPOINTS } from '../../config/api';
import toast from 'react-hot-toast';
import '../coach/Dashboard.css';
import '../coach/Settings.css';

const SportifSettings = () => {
    const { user, checkAuth } = useAuth();
    const [formData, setFormData] = useState({
        first_name: '',
        last_name: '',
        phone: '',
        birth_date: '',
        city: '',
        address: '',
    });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (user?.profile) {
            setFormData({
                first_name: user.profile.first_name || '',
                last_name: user.profile.last_name || '',
                phone: user.profile.phone || '',
                birth_date: user.profile.birth_date || '',
                city: user.profile.city || '',
                address: user.profile.address || '',
            });
        }
    }, [user]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await api.put(ENDPOINTS.SPORTIFS.UPDATE_PROFILE, formData);
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
            <p className="page-subtitle">Gérez votre profil</p>

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
                        <label className="form-label">Date de naissance</label>
                        <input
                            type="date"
                            name="birth_date"
                            value={formData.birth_date}
                            onChange={handleChange}
                            className="form-input"
                        />
                    </div>
                </div>

                <div className="form-row">
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
                    <div className="form-group">
                        <label className="form-label">Adresse</label>
                        <input
                            type="text"
                            name="address"
                            value={formData.address}
                            onChange={handleChange}
                            className="form-input"
                        />
                    </div>
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

export default SportifSettings;
