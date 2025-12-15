import { Link } from 'react-router-dom';
import { FiArrowRight, FiUsers, FiCalendar, FiStar, FiShield } from 'react-icons/fi';
import './Home.css';

const Home = () => {
    const features = [
        {
            icon: FiUsers,
            title: 'Coachs Certifiés',
            description: 'Accédez à des coachs professionnels vérifiés et qualifiés dans tous les sports.',
        },
        {
            icon: FiCalendar,
            title: 'Réservation Facile',
            description: 'Réservez vos séances en quelques clics selon vos disponibilités.',
        },
        {
            icon: FiStar,
            title: 'Avis Vérifiés',
            description: 'Consultez les avis authentiques des sportifs pour choisir votre coach.',
        },
        {
            icon: FiShield,
            title: 'Paiement Sécurisé',
            description: 'Transactions sécurisées et garantie satisfaction.',
        },
    ];

    const stats = [
        { value: '500+', label: 'Coachs Actifs' },
        { value: '10k+', label: 'Séances Réalisées' },
        { value: '4.8', label: 'Note Moyenne' },
        { value: '50+', label: 'Sports Disponibles' },
    ];

    return (
        <div className="home">
            {/* Hero Section */}
            <section className="hero">
                <div className="container">
                    <div className="hero-content animate-fade-in">
                        <span className="hero-badge">🏆 La plateforme #1 en France</span>
                        <h1 className="hero-title">
                            Trouvez le <span className="gradient-text">Coach Parfait</span> pour Atteindre vos Objectifs
                        </h1>
                        <p className="hero-description">
                            Connectez-vous avec des coachs professionnels certifiés.
                            Réservez des séances personnalisées et progressez à votre rythme.
                        </p>
                        <div className="hero-actions">
                            <Link to="/coaches" className="btn btn-primary btn-lg">
                                Trouver un Coach <FiArrowRight />
                            </Link>
                            <Link to="/register" className="btn btn-outline btn-lg">
                                Devenir Coach
                            </Link>
                        </div>
                    </div>

                    <div className="hero-visual">
                        <div className="hero-card glass animate-slide-in">
                            <div className="hero-card-header">
                                <span className="avatar-placeholder">👨‍🏫</span>
                                <div>
                                    <h4>Thomas Martin</h4>
                                    <p>Coach Football • Paris</p>
                                </div>
                            </div>
                            <div className="hero-card-stats">
                                <span>⭐ 4.9 (127 avis)</span>
                                <span>💪 10 ans d'expérience</span>
                            </div>
                            <div className="hero-card-price">
                                <span className="price">45€</span>
                                <span className="unit">/séance</span>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Stats Section */}
            <section className="stats-section">
                <div className="container">
                    <div className="stats-grid">
                        {stats.map((stat, index) => (
                            <div key={index} className="stat-item">
                                <span className="stat-value">{stat.value}</span>
                                <span className="stat-label">{stat.label}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="features-section">
                <div className="container">
                    <div className="section-header">
                        <h2 className="section-title">Pourquoi Choisir SportsConnect ?</h2>
                        <p className="section-description">
                            Une plateforme conçue pour vous accompagner dans votre parcours sportif.
                        </p>
                    </div>

                    <div className="features-grid">
                        {features.map((feature, index) => (
                            <div key={index} className="feature-card card">
                                <div className="feature-icon">
                                    <feature.icon size={28} />
                                </div>
                                <h3 className="feature-title">{feature.title}</h3>
                                <p className="feature-description">{feature.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="cta-section">
                <div className="container">
                    <div className="cta-card glass">
                        <h2>Prêt à Commencer ?</h2>
                        <p>Rejoignez des milliers de sportifs qui ont déjà transformé leur pratique.</p>
                        <div className="cta-actions">
                            <Link to="/register" className="btn btn-primary btn-lg">
                                Créer un Compte Gratuit
                            </Link>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default Home;
