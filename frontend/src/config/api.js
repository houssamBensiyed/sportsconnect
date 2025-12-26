// API Configuration
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';

export default API_BASE_URL;

export const ENDPOINTS = {
    // Auth
    AUTH: {
        REGISTER: '/auth/register',
        LOGIN: '/auth/login',
        ME: '/auth/me',
        LOGOUT: '/auth/logout',
        FORGOT_PASSWORD: '/auth/forgot-password',
        RESET_PASSWORD: '/auth/reset-password',
        CHANGE_PASSWORD: '/auth/change-password',
    },

    // Sports
    SPORTS: {
        LIST: '/sports',
        CATEGORIES: '/sports/categories',
        BY_CATEGORY: (cat) => `/sports/category/${cat}`,
        SHOW: (id) => `/sports/${id}`,
    },

    // Coaches
    COACHES: {
        LIST: '/coaches',
        CITIES: '/coaches/cities',
        SHOW: (id) => `/coaches/${id}`,
        DASHBOARD: '/coaches/dashboard',
        UPDATE_PROFILE: '/coaches/profile',
        UPLOAD_PHOTO: '/coaches/profile/photo',
        SPORTS: '/coaches/sports',
        ADD_SPORT: '/coaches/sports',
        REMOVE_SPORT: (id) => `/coaches/sports/${id}`,
        CERTIFICATIONS: '/coaches/certifications',
    },

    // Sportifs
    SPORTIFS: {
        PROFILE: '/sportifs/profile',
        UPDATE_PROFILE: '/sportifs/profile',
        UPLOAD_PHOTO: '/sportifs/profile/photo',
        RESERVATIONS: '/sportifs/reservations',
        UPCOMING: '/sportifs/reservations/upcoming',
        STATS: '/sportifs/stats',
    },

    // Availabilities
    AVAILABILITIES: {
        BY_COACH: (id) => `/availabilities/coach/${id}`,
        DATES: (id) => `/availabilities/coach/${id}/dates`,
        LIST: '/availabilities',
        CREATE: '/availabilities',
        CREATE_BULK: '/availabilities/bulk',
        UPDATE: (id) => `/availabilities/${id}`,
        DELETE: (id) => `/availabilities/${id}`,
    },

    // Reservations
    RESERVATIONS: {
        SHOW: (id) => `/reservations/${id}`,
        CREATE: '/reservations',
        CANCEL: (id) => `/reservations/${id}/cancel`,
        ACCEPT: (id) => `/reservations/${id}/accept`,
        REFUSE: (id) => `/reservations/${id}/refuse`,
        COMPLETE: (id) => `/reservations/${id}/complete`,
        COACH: '/reservations/coach',
        TEACHER: '/reservations/coach',
        STUDENT: '/sportifs/reservations',
        PENDING: '/reservations/pending',
        TODAY: '/reservations/today',
        UPDATE_STATUS: (id) => `/reservations/${id}/status`,
    },

    // Reviews
    REVIEWS: {
        BY_COACH: (id) => `/reviews/coach/${id}`,
        LIST: '/reviews',
        MY_REVIEWS: '/reviews/my-reviews',
        CREATE: '/reviews',
        UPDATE: (id) => `/reviews/${id}`,
        DELETE: (id) => `/reviews/${id}`,
        RESPOND: (id) => `/reviews/${id}/response`,
    },

    // Notifications
    NOTIFICATIONS: {
        LIST: '/notifications',
        UNREAD: '/notifications/unread',
        COUNT: '/notifications/count',
        MARK_READ: (id) => `/notifications/${id}/read`,
        MARK_ALL_READ: '/notifications/read-all',
        DELETE: (id) => `/notifications/${id}`,
    },

    // Health
    HEALTH: '/health',
};
