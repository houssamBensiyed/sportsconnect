import { Outlet, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FiMenu, FiX, FiUser, FiLogOut } from 'react-icons/fi';
import { useState } from 'react';
import './MainLayout.css';

const MainLayout = () => {
    const { isAuthenticated, user, logout } = useAuth();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const location = useLocation();

    const handleLogout = async () => {
        await logout();
        setMobileMenuOpen(false);
    };

    return (
        <div className="main-layout">
            <header className="header glass">
                <div className="container">
                    <nav className="nav">
                        <Link to="/" className="logo">
                            <span className="logo-icon">🏃</span>
                            <span className="logo-text">SportsConnect</span>
                        </Link>

                        <div className={`nav-links ${mobileMenuOpen ? 'open' : ''}`}>
                            <Link
                                to="/coaches"
                                className={`nav-link ${location.pathname === '/coaches' ? 'active' : ''}`}
                                onClick={() => setMobileMenuOpen(false)}
                            >
                                Trouver un Coach
                            </Link>

                            {isAuthenticated ? (
                                <>
                                    <Link
                                        to={user?.role === 'coach' ? '/coach/dashboard' : '/sportif/dashboard'}
                                        className="nav-link"
                                        onClick={() => setMobileMenuOpen(false)}
                                    >
                                        <FiUser /> Mon Espace
                                    </Link>
                                    <button onClick={handleLogout} className="nav-link nav-btn">
                                        <FiLogOut /> Déconnexion
                                    </button>
                                </>
                            ) : (
                                <>
                                    <Link
                                        to="/login"
                                        className="nav-link"
                                        onClick={() => setMobileMenuOpen(false)}
                                    >
                                        Connexion
                                    </Link>
                                    <Link
                                        to="/register"
                                        className="btn btn-primary"
                                        onClick={() => setMobileMenuOpen(false)}
                                    >
                                        Inscription
                                    </Link>
                                </>
                            )}
                        </div>

                        <button
                            className="mobile-menu-btn"
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                        >
                            {mobileMenuOpen ? <FiX size={24} /> : <FiMenu size={24} />}
                        </button>
                    </nav>
                </div>
            </header>

            <main className="main-content">
                <Outlet />
            </main>

            <footer className="footer">
                <div className="container">
                    <div className="footer-content">
                        <div className="footer-brand">
                            <span className="logo-icon">🏃</span>
                            <span>SportsConnect</span>
                        </div>
                        <p className="footer-text">
                            La plateforme de mise en relation entre sportifs et coachs professionnels.
                        </p>
                        <p className="footer-copyright">
                            © 2024 SportsConnect. Tous droits réservés.
                        </p>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default MainLayout;
