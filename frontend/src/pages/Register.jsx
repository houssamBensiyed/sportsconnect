import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FiMail, FiLock, FiUser, FiPhone, FiEye, FiEyeOff } from 'react-icons/fi';
import toast from 'react-hot-toast';
import './Auth.css';

const Register = () => {
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        confirmPassword: '',
        role: 'sportif',
        first_name: '',
        last_name: '',
        phone: '',
    });
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const { register } = useAuth();
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (formData.password !== formData.confirmPassword) {
            toast.error('Les mots de passe ne correspondent pas');
            return;
        }

        if (formData.password.length < 8) {
            toast.error('Le mot de passe doit contenir au moins 8 caractères');
            return;
        }

        setLoading(true);

        try {
            const user = await register({
                email: formData.email,
                password: formData.password,
                role: formData.role,
                first_name: formData.first_name,
                last_name: formData.last_name,
                phone: formData.phone,
            });
            toast.success('Inscription réussie !');
            navigate(user.role === 'coach' ? '/coach/dashboard' : '/sportif/dashboard');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Erreur lors de l\'inscription');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-page">
            <div className="container">
                <div className="auth-card glass animate-fade-in">
                    <div className="auth-header">
                        <h1>Inscription</h1>
                        <p>Créez votre compte et commencez votre aventure.</p>
                    </div>

                    <div className="role-selector">
                        <button
                            type="button"
                            className={`role-btn ${formData.role === 'sportif' ? 'active' : ''}`}
                            onClick={() => setFormData({ ...formData, role: 'sportif' })}
                        >
                            <span className="role-icon">🏃</span>
                            <span>Je suis Sportif</span>
                        </button>
                        <button
                            type="button"
                            className={`role-btn ${formData.role === 'coach' ? 'active' : ''}`}
                            onClick={() => setFormData({ ...formData, role: 'coach' })}
                        >
                            <span className="role-icon">👨‍🏫</span>
                            <span>Je suis Coach</span>
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="auth-form">
                        <div className="form-row">
                            <div className="form-group">
                                <label className="form-label">Prénom</label>
                                <div className="input-icon">
                                    <FiUser className="icon" />
                                    <input
                                        type="text"
                                        name="first_name"
                                        value={formData.first_name}
                                        onChange={handleChange}
                                        placeholder="Jean"
                                        className="form-input"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="form-group">
                                <label className="form-label">Nom</label>
                                <div className="input-icon">
                                    <FiUser className="icon" />
                                    <input
                                        type="text"
                                        name="last_name"
                                        value={formData.last_name}
                                        onChange={handleChange}
                                        placeholder="Dupont"
                                        className="form-input"
                                        required
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="form-group">
                            <label className="form-label">Email</label>
                            <div className="input-icon">
                                <FiMail className="icon" />
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    placeholder="votre@email.com"
                                    className="form-input"
                                    required
                                />
                            </div>
                        </div>

                        <div className="form-group">
                            <label className="form-label">Téléphone (optionnel)</label>
                            <div className="input-icon">
                                <FiPhone className="icon" />
                                <input
                                    type="tel"
                                    name="phone"
                                    value={formData.phone}
                                    onChange={handleChange}
                                    placeholder="06 12 34 56 78"
                                    className="form-input"
                                />
                            </div>
                        </div>

                        <div className="form-group">
                            <label className="form-label">Mot de passe</label>
                            <div className="input-icon">
                                <FiLock className="icon" />
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    name="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    placeholder="Min. 8 caractères"
                                    className="form-input"
                                    required
                                />
                                <button
                                    type="button"
                                    className="toggle-password"
                                    onClick={() => setShowPassword(!showPassword)}
                                >
                                    {showPassword ? <FiEyeOff /> : <FiEye />}
                                </button>
                            </div>
                        </div>

                        <div className="form-group">
                            <label className="form-label">Confirmer le mot de passe</label>
                            <div className="input-icon">
                                <FiLock className="icon" />
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    name="confirmPassword"
                                    value={formData.confirmPassword}
                                    onChange={handleChange}
                                    placeholder="Confirmez votre mot de passe"
                                    className="form-input"
                                    required
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            className="btn btn-primary btn-lg w-full"
                            disabled={loading}
                        >
                            {loading ? 'Inscription...' : 'Créer mon Compte'}
                        </button>
                    </form>

                    <div className="auth-footer">
                        <p>
                            Déjà un compte ?{' '}
                            <Link to="/login">Se connecter</Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Register;
