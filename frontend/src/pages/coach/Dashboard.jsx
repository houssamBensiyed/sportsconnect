import { useState, useEffect } from 'react';
import api from '../../services/api';
import { ENDPOINTS } from '../../config/api';
import { useAuth } from '../../context/AuthContext';
import { FiCalendar, FiClock, FiDollarSign, FiUsers, FiCheck } from 'react-icons/fi';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import './Dashboard.css';

const CoachDashboard = () => {
    const { user } = useAuth();
    const [stats, setStats] = useState(null);
    const [nextSession, setNextSession] = useState(null);
    const [pendingRequests, setPendingRequests] = useState([]);
    const [todaySessions, setTodaySessions] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            const [dashboardRes, pendingRes, todayRes] = await Promise.all([
                api.get(ENDPOINTS.COACHES.DASHBOARD),
                api.get(ENDPOINTS.RESERVATIONS.PENDING),
                api.get(ENDPOINTS.RESERVATIONS.TODAY),
            ]);

            const data = dashboardRes.data.data;
            setStats(data.stats);
            setNextSession(data.next_session);
            setPendingRequests(pendingRes.data.data || []);
            setTodaySessions(todayRes.data.data || []);
        } catch (error) {
            console.error('Error fetching dashboard:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleAccept = async (id) => {
        try {
            await api.put(ENDPOINTS.RESERVATIONS.ACCEPT(id));
            fetchDashboardData();
        } catch (error) {
            console.error('Error accepting:', error);
        }
    };

    const handleRefuse = async (id) => {
        try {
            await api.put(ENDPOINTS.RESERVATIONS.REFUSE(id));
            fetchDashboardData();
        } catch (error) {
            console.error('Error refusing:', error);
        }
    };

    const handleComplete = async (id) => {
        try {
            await api.put(ENDPOINTS.RESERVATIONS.COMPLETE(id));
            fetchDashboardData();
        } catch (error) {
            console.error('Error completing:', error);
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
                <p>Voici le résumé de votre activité</p>
            </div>

            {/* Stats Cards */}
            <div className="stats-grid">
                <div className="stat-card">
                    <div className="stat-icon pending">
                        <FiClock />
                    </div>
                    <div className="stat-info">
                        <span className="stat-value">{stats?.pending_requests || 0}</span>
                        <span className="stat-label">Demandes en attente</span>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-icon today">
                        <FiCalendar />
                    </div>
                    <div className="stat-info">
                        <span className="stat-value">{stats?.today_sessions || 0}</span>
                        <span className="stat-label">Séances aujourd'hui</span>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-icon completed">
                        <FiUsers />
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
                        <span className="stat-value">{stats?.total_earnings || 0}€</span>
                        <span className="stat-label">Revenus totaux</span>
                    </div>
                </div>
            </div>

            <div className="dashboard-grid">
                {/* Pending Requests */}
                <div className="dashboard-section card">
                    <h2>Demandes en attente</h2>
                    {pendingRequests.length > 0 ? (
                        <div className="request-list">
                            {pendingRequests.map((req) => (
                                <div key={req.id} className="request-item">
                                    <div className="request-info">
                                        <span className="request-name">
                                            {req.first_name} {req.last_name}
                                        </span>
                                        <span className="request-details">
                                            {format(new Date(req.session_date), 'EEEE d MMMM', { locale: fr })} •
                                            {req.start_time?.substring(0, 5)} - {req.end_time?.substring(0, 5)}
                                        </span>
                                        <span className="request-sport">{req.sport_name}</span>
                                    </div>
                                    <div className="request-actions">
                                        <button
                                            onClick={() => handleAccept(req.id)}
                                            className="btn btn-success btn-sm"
                                        >
                                            Accepter
                                        </button>
                                        <button
                                            onClick={() => handleRefuse(req.id)}
                                            className="btn btn-danger btn-sm"
                                        >
                                            Refuser
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="empty-state">Aucune demande en attente</p>
                    )}
                </div>

                {/* Today's Sessions */}
                <div className="dashboard-section card">
                    <h2>Séances du jour</h2>
                    {todaySessions.length > 0 ? (
                        <div className="session-list">
                            {todaySessions.map((session) => (
                                <div key={session.id} className="session-item">
                                    <div className="session-time">
                                        {session.start_time?.substring(0, 5)}
                                    </div>
                                    <div className="session-info">
                                        <span className="session-name">
                                            {session.first_name} {session.last_name}
                                        </span>
                                        <span className="session-sport">{session.sport_name}</span>
                                    </div>
                                    <button
                                        onClick={() => handleComplete(session.id)}
                                        className="btn btn-outline btn-sm"
                                    >
                                        <FiCheck /> Terminer
                                    </button>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="empty-state">Aucune séance prévue aujourd'hui</p>
                    )}
                </div>
            </div>

            {/* Next Session Preview */}
            {nextSession && (
                <div className="next-session card">
                    <h3>Prochaine séance</h3>
                    <div className="next-session-content">
                        <div className="next-session-date">
                            <FiCalendar />
                            <span>{format(new Date(nextSession.session_date), 'EEEE d MMMM yyyy', { locale: fr })}</span>
                        </div>
                        <div className="next-session-details">
                            <p>
                                <strong>{nextSession.first_name} {nextSession.last_name}</strong>
                            </p>
                            <p>{nextSession.sport_name} • {nextSession.start_time?.substring(0, 5)} - {nextSession.end_time?.substring(0, 5)}</p>
                            {nextSession.notes_sportif && (
                                <p className="session-notes">"{nextSession.notes_sportif}"</p>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CoachDashboard;
