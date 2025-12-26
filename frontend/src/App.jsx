import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';

// Layouts
import MainLayout from './layouts/MainLayout';
import DashboardLayout from './layouts/DashboardLayout';

// Public Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Coaches from './pages/Coaches';
import CoachProfile from './pages/CoachProfile';
import PageTransition from './components/PageTransition';

// Protected Pages
import CoachDashboard from './pages/coach/Dashboard';
import CoachAvailabilities from './pages/coach/Availabilities';
import CoachReservations from './pages/coach/Reservations';
import CoachSettings from './pages/coach/Settings';

import SportifDashboard from './pages/sportif/Dashboard';
import SportifReservations from './pages/sportif/Reservations';
import SportifSettings from './pages/sportif/Settings';

import './index.css';

// Protected Route Component
const ProtectedRoute = ({ children, role }) => {
  const { isAuthenticated, user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (role && user?.role !== role) {
    return <Navigate to={user?.role === 'coach' ? '/coach/dashboard' : '/sportif/dashboard'} replace />;
  }

  return children;
};

function AppRoutes() {
  const { isAuthenticated, user } = useAuth();

  return (
    <Routes>
      {/* Public Routes */}
      <Route element={<MainLayout />}>
        <Route path="/" element={<PageTransition><Home /></PageTransition>} />
        <Route path="/coaches" element={<PageTransition><Coaches /></PageTransition>} />
        <Route path="/coaches/:id" element={<PageTransition><CoachProfile /></PageTransition>} />
        <Route
          path="/login"
          element={isAuthenticated ? <Navigate to={user?.role === 'coach' ? '/coach/dashboard' : '/sportif/dashboard'} /> : <PageTransition><Login /></PageTransition>}
        />
        <Route
          path="/register"
          element={isAuthenticated ? <Navigate to={user?.role === 'coach' ? '/coach/dashboard' : '/sportif/dashboard'} /> : <PageTransition><Register /></PageTransition>}
        />
      </Route>

      {/* Coach Routes */}
      <Route path="/coach" element={
        <ProtectedRoute role="coach">
          <DashboardLayout />
        </ProtectedRoute>
      }>
        <Route path="dashboard" element={<PageTransition><CoachDashboard /></PageTransition>} />
        <Route path="availabilities" element={<PageTransition><CoachAvailabilities /></PageTransition>} />
        <Route path="reservations" element={<PageTransition><CoachReservations /></PageTransition>} />
        <Route path="settings" element={<PageTransition><CoachSettings /></PageTransition>} />
      </Route>

      {/* Sportif Routes */}
      <Route path="/sportif" element={
        <ProtectedRoute role="sportif">
          <DashboardLayout />
        </ProtectedRoute>
      }>
        <Route path="dashboard" element={<PageTransition><SportifDashboard /></PageTransition>} />
        <Route path="reservations" element={<PageTransition><SportifReservations /></PageTransition>} />
        <Route path="settings" element={<PageTransition><SportifSettings /></PageTransition>} />
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <AppRoutes />
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#1e293b',
              color: '#f1f5f9',
              border: '1px solid rgba(148, 163, 184, 0.2)',
            },
            success: {
              iconTheme: { primary: '#10b981', secondary: '#fff' },
            },
            error: {
              iconTheme: { primary: '#ef4444', secondary: '#fff' },
            },
          }}
        />
      </AuthProvider>
    </Router>
  );
}

export default App;
