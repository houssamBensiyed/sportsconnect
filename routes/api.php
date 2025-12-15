<?php

/**
 * SportsConnect API Routes
 * 
 * Route format: $router->method(path, [Controller, action], [middleware])
 */

use App\Controllers\HealthController;
use App\Controllers\AuthController;
use App\Controllers\SportController;
use App\Controllers\CoachController;
use App\Controllers\SportifController;
use App\Controllers\AvailabilityController;
use App\Controllers\ReservationController;
use App\Controllers\ReviewController;
use App\Controllers\NotificationController;
use App\Controllers\PdfController;
use App\Controllers\CsrfController;

// =====================================================
// HEALTH CHECK
// =====================================================

$router->get('/health', [HealthController::class, 'check']);

// =====================================================
// AUTHENTICATION ROUTES
// =====================================================

// Public auth routes
$router->post('/auth/register', [AuthController::class, 'register']);
$router->post('/auth/login', [AuthController::class, 'login']);
$router->post('/auth/forgot-password', [AuthController::class, 'forgotPassword']);
$router->post('/auth/reset-password', [AuthController::class, 'resetPassword']);

// Protected auth routes
$router->get('/auth/me', [AuthController::class, 'me'], ['AuthMiddleware']);
$router->post('/auth/logout', [AuthController::class, 'logout'], ['AuthMiddleware']);
$router->put('/auth/change-password', [AuthController::class, 'changePassword'], ['AuthMiddleware']);
$router->put('/auth/update-email', [AuthController::class, 'updateEmail'], ['AuthMiddleware']);

// =====================================================
// SPORTS ROUTES (Public)
// =====================================================

$router->get('/sports', [SportController::class, 'index']);
$router->get('/sports/categories', [SportController::class, 'categories']);
$router->get('/sports/category/{category}', [SportController::class, 'byCategory']);
$router->get('/sports/{id}', [SportController::class, 'show']);

// =====================================================
// COACHES ROUTES
// =====================================================

// Public coach routes
$router->get('/coaches', [CoachController::class, 'index']);
$router->get('/coaches/cities', [CoachController::class, 'getCities']);
$router->get('/coaches/{id}', [CoachController::class, 'show']);

// Protected coach routes (coach only)
$router->get('/coaches/dashboard', [CoachController::class, 'dashboard'], ['AuthMiddleware']);
$router->put('/coaches/profile', [CoachController::class, 'updateProfile'], ['AuthMiddleware']);
$router->post('/coaches/profile/photo', [CoachController::class, 'uploadPhoto'], ['AuthMiddleware']);

// Coach sports management
$router->get('/coaches/sports', [CoachController::class, 'getSports'], ['AuthMiddleware']);
$router->post('/coaches/sports', [CoachController::class, 'addSport'], ['AuthMiddleware']);
$router->delete('/coaches/sports/{sportId}', [CoachController::class, 'removeSport'], ['AuthMiddleware']);

// Coach certifications management
$router->get('/coaches/certifications', [CoachController::class, 'getCertifications'], ['AuthMiddleware']);
$router->post('/coaches/certifications', [CoachController::class, 'addCertification'], ['AuthMiddleware']);
$router->put('/coaches/certifications/{id}', [CoachController::class, 'updateCertification'], ['AuthMiddleware']);
$router->delete('/coaches/certifications/{id}', [CoachController::class, 'deleteCertification'], ['AuthMiddleware']);

// =====================================================
// SPORTIFS ROUTES (Protected)
// =====================================================

$router->get('/sportifs/profile', [SportifController::class, 'profile'], ['AuthMiddleware']);
$router->put('/sportifs/profile', [SportifController::class, 'updateProfile'], ['AuthMiddleware']);
$router->post('/sportifs/profile/photo', [SportifController::class, 'uploadPhoto'], ['AuthMiddleware']);
$router->get('/sportifs/reservations', [SportifController::class, 'getReservations'], ['AuthMiddleware']);
$router->get('/sportifs/reservations/upcoming', [SportifController::class, 'getUpcomingReservations'], ['AuthMiddleware']);
$router->get('/sportifs/stats', [SportifController::class, 'getStats'], ['AuthMiddleware']);

// =====================================================
// AVAILABILITIES ROUTES
// =====================================================

// Public availability routes
$router->get('/availabilities/coach/{coachId}', [AvailabilityController::class, 'getByCoach']);
$router->get('/availabilities/coach/{coachId}/dates', [AvailabilityController::class, 'getAvailableDates']);

// Protected availability routes (coach only)
$router->get('/availabilities', [AvailabilityController::class, 'index'], ['AuthMiddleware']);
$router->post('/availabilities', [AvailabilityController::class, 'store'], ['AuthMiddleware']);
$router->post('/availabilities/bulk', [AvailabilityController::class, 'storeBulk'], ['AuthMiddleware']);
$router->put('/availabilities/{id}', [AvailabilityController::class, 'update'], ['AuthMiddleware']);
$router->delete('/availabilities/{id}', [AvailabilityController::class, 'destroy'], ['AuthMiddleware']);
$router->delete('/availabilities/date/{date}', [AvailabilityController::class, 'destroyByDate'], ['AuthMiddleware']);

// =====================================================
// RESERVATIONS ROUTES
// =====================================================

// Protected reservation routes
$router->get('/reservations/{id}', [ReservationController::class, 'show'], ['AuthMiddleware']);
$router->post('/reservations', [ReservationController::class, 'store'], ['AuthMiddleware']);
$router->put('/reservations/{id}/cancel', [ReservationController::class, 'cancel'], ['AuthMiddleware']);
$router->put('/reservations/{id}/notes', [ReservationController::class, 'updateNotes'], ['AuthMiddleware']);

// Coach-specific reservation routes
$router->get('/reservations/coach', [ReservationController::class, 'coachReservations'], ['AuthMiddleware']);
$router->get('/reservations/pending', [ReservationController::class, 'pending'], ['AuthMiddleware']);
$router->get('/reservations/today', [ReservationController::class, 'today'], ['AuthMiddleware']);
$router->put('/reservations/{id}/accept', [ReservationController::class, 'accept'], ['AuthMiddleware']);
$router->put('/reservations/{id}/refuse', [ReservationController::class, 'refuse'], ['AuthMiddleware']);
$router->put('/reservations/{id}/complete', [ReservationController::class, 'complete'], ['AuthMiddleware']);

// =====================================================
// REVIEWS ROUTES
// =====================================================

// Public review routes
$router->get('/reviews/coach/{coachId}', [ReviewController::class, 'getByCoach']);

// Protected review routes
$router->get('/reviews', [ReviewController::class, 'index'], ['AuthMiddleware']);
$router->get('/reviews/my-reviews', [ReviewController::class, 'myReviews'], ['AuthMiddleware']);
$router->post('/reviews', [ReviewController::class, 'store'], ['AuthMiddleware']);
$router->put('/reviews/{id}', [ReviewController::class, 'update'], ['AuthMiddleware']);
$router->delete('/reviews/{id}', [ReviewController::class, 'destroy'], ['AuthMiddleware']);
$router->post('/reviews/{id}/response', [ReviewController::class, 'addResponse'], ['AuthMiddleware']);

// =====================================================
// NOTIFICATIONS ROUTES (Protected)
// =====================================================

$router->get('/notifications', [NotificationController::class, 'index'], ['AuthMiddleware']);
$router->get('/notifications/unread', [NotificationController::class, 'unread'], ['AuthMiddleware']);
$router->get('/notifications/count', [NotificationController::class, 'count'], ['AuthMiddleware']);
$router->put('/notifications/{id}/read', [NotificationController::class, 'markAsRead'], ['AuthMiddleware']);
$router->put('/notifications/read-all', [NotificationController::class, 'markAllAsRead'], ['AuthMiddleware']);
$router->delete('/notifications/{id}', [NotificationController::class, 'destroy'], ['AuthMiddleware']);

// =====================================================
// PDF GENERATION ROUTES (Protected)
// =====================================================

$router->get('/pdf/reservation/{id}', [PdfController::class, 'reservation'], ['AuthMiddleware']);
$router->get('/pdf/invoice/{id}', [PdfController::class, 'invoice'], ['AuthMiddleware']);
$router->get('/pdf/coach-report', [PdfController::class, 'coachReport'], ['AuthMiddleware']);
$router->get('/pdf/sportif-history', [PdfController::class, 'sportifHistory'], ['AuthMiddleware']);

// =====================================================
// CSRF TOKEN ROUTE
// =====================================================

$router->get('/csrf-token', [CsrfController::class, 'generate']);
