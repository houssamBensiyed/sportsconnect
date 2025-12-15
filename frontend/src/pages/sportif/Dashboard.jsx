import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { ENDPOINTS } from '../../config/api';
import { useAuth } from '../../context/AuthContext';
import { FiCalendar, FiClock, FiDollarSign, FiSearch } from 'react-icons/fi';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import '../coach/Dashboard.css';

const SportifDashboard = () => {
    const { user } = useAuth();
    const [stats, setStats] = useState(null);
    const [upcomingSessions, setUpcomingSessions] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            const [profileRes, upcomingRes] = await Promise.all([
                api.get(ENDPOINTS.SPORTIFS.PROFILE),
                api.get(ENDPOINTS.SPORTIFS.UPCOMING),
            ]);

            setStats(profileRes.data.data.stats);
            setUpcomingSessions(upcomingRes.data.data || []);
        } catch (error) {
            console.error('Error fetching dashboard:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="loading-container">
                <div className="spinner"></div>
            </div>
        );
    }

    return (
        <div className="dashboard animate-fade-in">
            <div className="dashboard-header">
                <h1>Bonjour, {user?.profile?.first_name} 👋</h1>
                <p>Bienvenue sur votre espace sportif</p>
            </div>

            {/* Stats Cards */}
            <div className="stats-grid">
                <div className="stat-card">
                    <div className="stat-icon today">
                        <FiCalendar />
                    </div>
                    <div className="stat-info">
                        <span className="stat-value">{stats?.upcoming_sessions || 0}</span>
                        <span className="stat-label">Séances à venir</span>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-icon pending">
                        <FiClock />
                    </div>
                    <div className="stat-info">
                        <span className="stat-value">{stats?.pending_requests || 0}</span>
                        <span className="stat-label">En attente</span>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-icon completed">
                        <FiCalendar />
                    </div>
                    <div className="stat-info">
                        <span className="stat-value">{stats?.completed_sessions || 0}</span>
                        <span className="stat-label">Séances terminées</span>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-icon earnings">
                        <FiDollarSign />
                    </div>
                    <div className="stat-info">
                        <span className="stat-value">{stats?.total_spent || 0}€</span>
                        <span className="stat-label">Total dépensé</span>
                    </div>
                </div>
            </div>

            <div className="dashboard-grid">
                {/* Upcoming Sessions */}
                <div className="dashboard-section card">
                    <h2>Prochaines séances</h2>
                    {upcomingSessions.length > 0 ? (
                        <div className="session-list">
                            {upcomingSessions.slice(0, 5).map((session) => (
                                <div key={session.id} className="session-item">
                                    <div className="session-time">
                                        {session.start_time?.substring(0, 5)}
                                    </div>
                                    <div className="session-info">
                                        <span className="session-name">
                                            {session.coach_first_name} {session.coach_last_name}
                                        </span>
                                        <span className="session-sport">
                                            {session.sport_name} • {format(new Date(session.session_date), 'dd/MM/yyyy')}
                                        </span>
                                    </div>
                                    <span className="session-price">{session.price}€</span>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="empty-state">
                            <p>Aucune séance prévue</p>
                            <Link to="/coaches" className="btn btn-primary btn-sm">
                                <FiSearch /> Trouver un coach
                            </Link>
                        </div>
                    )}
                </div>

                {/* Quick Actions */}
                <div className="dashboard-section card">
                    <h2>Actions rapides</h2>
                    <div className="quick-actions">
                        <Link to="/coaches" className="quick-action-btn">
                            <FiSearch size={24} />
                            <span>Trouver un coach</span>
                        </Link>
                        <Link to="/sportif/reservations" className="quick-action-btn">
                            <FiCalendar size={24} />
                            <span>Mes réservations</span>
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SportifDashboard;
