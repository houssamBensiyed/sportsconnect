import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FiMail, FiLock, FiEye, FiEyeOff } from 'react-icons/fi';
import toast from 'react-hot-toast';
import './Auth.css';

const Login = () => {
    const [formData, setFormData] = useState({
        email: '',
        password: '',
    });
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const user = await login(formData.email, formData.password);
            toast.success('Connexion réussie !');
            navigate(user.role === 'coach' ? '/coach/dashboard' : '/sportif/dashboard');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Erreur de connexion');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-page">
            <div className="container">
                <div className="auth-card glass animate-fade-in">
                    <div className="auth-header">
                        <h1>Connexion</h1>
                        <p>Bienvenue ! Connectez-vous à votre compte.</p>
                    </div>

                    <form onSubmit={handleSubmit} className="auth-form">
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
                            <label className="form-label">Mot de passe</label>
                            <div className="input-icon">
                                <FiLock className="icon" />
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    name="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    placeholder="••••••••"
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

                        <div className="auth-options">
                            <Link to="/forgot-password" className="forgot-link">
                                Mot de passe oublié ?
                            </Link>
                        </div>

                        <button
                            type="submit"
                            className="btn btn-primary btn-lg w-full"
                            disabled={loading}
                        >
                            {loading ? 'Connexion...' : 'Se Connecter'}
                        </button>
                    </form>

                    <div className="auth-footer">
                        <p>
                            Pas encore de compte ?{' '}
                            <Link to="/register">Créer un compte</Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;
