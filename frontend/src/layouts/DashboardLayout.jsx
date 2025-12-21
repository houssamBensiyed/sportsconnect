import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
    FiHome, FiCalendar, FiList, FiSettings, FiLogOut,
    FiBell, FiMenu, FiX, FiUser
} from 'react-icons/fi';
import { useState, useEffect } from 'react';
import api from '../services/api';
import { ENDPOINTS } from '../config/api';
import './DashboardLayout.css';

const DashboardLayout = () => {
    const { user, logout, isCoach } = useAuth();
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [notificationCount, setNotificationCount] = useState(0);
    const location = useLocation();
    const navigate = useNavigate();

    useEffect(() => {
        fetchNotificationCount();
    }, []);

    const fetchNotificationCount = async () => {
        try {
            const response = await api.get(ENDPOINTS.NOTIFICATIONS.COUNT);
            setNotificationCount(response.data.data.count);
        } catch (error) {
            console.error('Error fetching notifications:', error);
        }
    };

    const handleLogout = async () => {
        await logout();
        navigate('/');
    };

    const coachLinks = [
        { path: '/coach/dashboard', icon: FiHome, label: 'Tableau de bord' },
        { path: '/coach/availabilities', icon: FiCalendar, label: 'Disponibilités' },
        { path: '/coach/reservations', icon: FiList, label: 'Réservations' },
        { path: '/coach/settings', icon: FiSettings, label: 'Paramètres' },
    ];

    const sportifLinks = [
        { path: '/sportif/dashboard', icon: FiHome, label: 'Tableau de bord' },
        { path: '/sportif/reservations', icon: FiList, label: 'Mes Réservations' },
        { path: '/sportif/settings', icon: FiSettings, label: 'Paramètres' },
    ];

    const links = isCoach ? coachLinks : sportifLinks;

    return (
        <div className="dashboard-layout">
            {/* Sidebar */}
            <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
                <div className="sidebar-header">
                    <Link to="/" className="sidebar-logo">
                        <span className="logo-icon">🏃</span>
                        <span className="logo-text">SportsConnect</span>
                    </Link>
                    <button
                        className="sidebar-close"
                        onClick={() => setSidebarOpen(false)}
                    >
                        <FiX size={24} />
                    </button>
                </div>

                <div className="sidebar-user">
                    <div className="user-avatar">
                        {user?.profile?.profile_photo ? (
                            <img
                                src={`http://localhost:8080/uploads/profiles/${user.profile.profile_photo}`}
                                alt="Profile"
                            />
                        ) : (
                            <FiUser size={24} />
                        )}
                    </div>
                    <div className="user-info">
                        <span className="user-name">
                            {user?.profile?.first_name} {user?.profile?.last_name}
                        </span>
                        <span className="user-role">
                            {isCoach ? 'Coach' : 'Sportif'}
                        </span>
                    </div>
                </div>

                <nav className="sidebar-nav">
                    {links.map((link) => (
                        <Link
                            key={link.path}
                            to={link.path}
                            className={`sidebar-link ${location.pathname === link.path ? 'active' : ''}`}
                            onClick={() => setSidebarOpen(false)}
                        >
                            <link.icon size={20} />
                            <span>{link.label}</span>
                        </Link>
                    ))}
                </nav>

                <div className="sidebar-footer">
                    <button onClick={handleLogout} className="sidebar-link logout-btn">
                        <FiLogOut size={20} />
                        <span>Déconnexion</span>
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <div className="dashboard-main">
                <header className="dashboard-header glass">
                    <button
                        className="menu-toggle"
                        onClick={() => setSidebarOpen(true)}
                    >
                        <FiMenu size={24} />
                    </button>

                    <div className="header-actions">
                        <button className="notification-btn">
                            <FiBell size={20} />
                            {notificationCount > 0 && (
                                <span className="notification-badge">{notificationCount}</span>
                            )}
                        </button>
                    </div>
                </header>

                <main className="dashboard-content">
                    <Outlet />
                </main>
            </div>

            {/* Overlay */}
            {sidebarOpen && (
                <div
                    className="sidebar-overlay"
                    onClick={() => setSidebarOpen(false)}
                />
            )}
        </div>
    );
};

export default DashboardLayout;
