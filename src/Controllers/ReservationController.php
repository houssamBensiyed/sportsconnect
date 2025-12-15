<?php

namespace App\Controllers;

use App\Core\Controller;
use App\Core\Request;
use App\Models\Reservation;
use App\Models\Availability;
use App\Models\Coach;
use App\Models\Sportif;
use App\Models\Sport;
use App\Models\Notification;
use App\Models\User;
use App\Services\EmailService;
use App\Helpers\Response;

class ReservationController extends Controller
{
    private Reservation $reservationModel;
    private Availability $availabilityModel;
    private Coach $coachModel;
    private Sportif $sportifModel;
    private Sport $sportModel;

    public function __construct()
    {
        parent::__construct();
        $this->reservationModel = new Reservation();
        $this->availabilityModel = new Availability();
        $this->coachModel = new Coach();
        $this->sportifModel = new Sportif();
        $this->sportModel = new Sport();
    }

    /**
     * Get reservation details
     * GET /reservations/{id}
     */
    public function show(Request $request): void
    {
        $user = $GLOBALS['auth_user'];
        $id = (int) $request->getParam('id');

        $reservation = $this->reservationModel->findById($id);

        if (!$reservation) {
            $this->error('Réservation non trouvée', 404);
            return;
        }

        // Check authorization
        if ($user['role'] === 'sportif') {
            $sportif = $this->sportifModel->findByUserId($user['id']);
            if (!$this->reservationModel->belongsToSportif($id, $sportif['id'])) {
                $this->error('Accès non autorisé', 403);
                return;
            }
        } else {
            $coach = $this->coachModel->findByUserId($user['id']);
            if (!$this->reservationModel->belongsToCoach($id, $coach['id'])) {
                $this->error('Accès non autorisé', 403);
                return;
            }
        }

        $this->success($reservation);
    }

    /**
     * Create reservation (sportif only)
     * POST /reservations
     */
    public function store(Request $request): void
    {
        $user = $GLOBALS['auth_user'];

        if ($user['role'] !== 'sportif') {
            $this->error('Seuls les sportifs peuvent créer des réservations', 403);
            return;
        }

        $sportif = $this->sportifModel->findByUserId($user['id']);

        $data = $this->validate($request->getBody(), [
            'coach_id' => 'required|numeric',
            'availability_id' => 'required|numeric',
            'sport_id' => 'required|numeric',
            'notes' => 'max:1000',
        ]);

        // Verify coach exists
        $coach = $this->coachModel->findById((int) $data['coach_id']);
        if (!$coach) {
            $this->error('Coach non trouvé', 404);
            return;
        }

        // Verify availability exists and is not booked
        $availability = $this->availabilityModel->findById((int) $data['availability_id']);
        if (!$availability) {
            $this->error('Créneau non trouvé', 404);
            return;
        }

        if ($availability['coach_id'] != $data['coach_id']) {
            $this->error('Ce créneau n\'appartient pas à ce coach', 400);
            return;
        }

        if ($availability['is_booked']) {
            $this->error('Ce créneau n\'est plus disponible', 409);
            return;
        }

        // Verify sport exists
        $sport = $this->sportModel->findById((int) $data['sport_id']);
        if (!$sport) {
            $this->error('Sport non trouvé', 404);
            return;
        }

        // Create reservation
        $reservationId = $this->reservationModel->create([
            'sportif_id' => $sportif['id'],
            'coach_id' => (int) $data['coach_id'],
            'availability_id' => (int) $data['availability_id'],
            'sport_id' => (int) $data['sport_id'],
            'session_date' => $availability['available_date'],
            'start_time' => $availability['start_time'],
            'end_time' => $availability['end_time'],
            'notes_sportif' => $data['notes'] ?? null,
            'price' => $coach['hourly_rate'],
        ]);

        // Mark availability as booked
        $this->availabilityModel->markAsBooked((int) $data['availability_id']);

        // Send notification to coach
        $formattedDate = date('d/m/Y', strtotime($availability['available_date']));
        Notification::notifyNewReservation($coach['user_id'], $reservationId, $formattedDate);

        $reservation = $this->reservationModel->findById($reservationId);

        $this->success($reservation, 'Réservation créée avec succès', 201);
    }

    /**
     * Cancel reservation
     * PUT /reservations/{id}/cancel
     */
    public function cancel(Request $request): void
    {
        $user = $GLOBALS['auth_user'];
        $id = (int) $request->getParam('id');

        $reservation = $this->reservationModel->findById($id);

        if (!$reservation) {
            $this->error('Réservation non trouvée', 404);
            return;
        }

        // Check authorization and determine who's cancelling
        $cancelledBy = null;
        $notifyUserId = null;

        if ($user['role'] === 'sportif') {
            $sportif = $this->sportifModel->findByUserId($user['id']);
            if (!$this->reservationModel->belongsToSportif($id, $sportif['id'])) {
                $this->error('Accès non autorisé', 403);
                return;
            }
            $cancelledBy = 'sportif';
            $coach = $this->coachModel->findById($reservation['coach_id']);
            $notifyUserId = $coach['user_id'];
        } else {
            $coach = $this->coachModel->findByUserId($user['id']);
            if (!$this->reservationModel->belongsToCoach($id, $coach['id'])) {
                $this->error('Accès non autorisé', 403);
                return;
            }
            $cancelledBy = 'coach';
            $sportif = $this->sportifModel->findById($reservation['sportif_id']);
            $userModel = new User();
            $sportifUser = $userModel->findById($sportif['user_id']);
            $notifyUserId = $sportifUser['id'];
        }

        // Check if can be cancelled
        if (!$this->reservationModel->canBeCancelled($id)) {
            $this->error('Cette réservation ne peut pas être annulée', 400);
            return;
        }

        $reason = $request->input('reason');
        $this->reservationModel->cancel($id, $cancelledBy, $reason);

        // Send notification
        $formattedDate = date('d/m/Y', strtotime($reservation['session_date']));
        Notification::notifyReservationCancelled($notifyUserId, $id, $formattedDate);

        $this->success(null, 'Réservation annulée');
    }

    /**
     * Accept reservation (coach only)
     * PUT /reservations/{id}/accept
     */
    public function accept(Request $request): void
    {
        $user = $GLOBALS['auth_user'];

        if ($user['role'] !== 'coach') {
            $this->error('Seuls les coachs peuvent accepter des réservations', 403);
            return;
        }

        $id = (int) $request->getParam('id');
        $coach = $this->coachModel->findByUserId($user['id']);

        if (!$this->reservationModel->belongsToCoach($id, $coach['id'])) {
            $this->error('Réservation non trouvée', 404);
            return;
        }

        $reservation = $this->reservationModel->findById($id);

        if ($reservation['status'] !== 'en_attente') {
            $this->error('Cette réservation ne peut pas être acceptée', 400);
            return;
        }

        $this->reservationModel->accept($id);

        // Notify sportif
        $sportif = $this->sportifModel->findById($reservation['sportif_id']);
        $formattedDate = date('d/m/Y', strtotime($reservation['session_date']));
        Notification::notifyReservationAccepted($sportif['user_id'], $id, $formattedDate);

        $this->success(null, 'Réservation acceptée');
    }

    /**
     * Refuse reservation (coach only)
     * PUT /reservations/{id}/refuse
     */
    public function refuse(Request $request): void
    {
        $user = $GLOBALS['auth_user'];

        if ($user['role'] !== 'coach') {
            $this->error('Seuls les coachs peuvent refuser des réservations', 403);
            return;
        }

        $id = (int) $request->getParam('id');
        $coach = $this->coachModel->findByUserId($user['id']);

        if (!$this->reservationModel->belongsToCoach($id, $coach['id'])) {
            $this->error('Réservation non trouvée', 404);
            return;
        }

        $reservation = $this->reservationModel->findById($id);

        if ($reservation['status'] !== 'en_attente') {
            $this->error('Cette réservation ne peut pas être refusée', 400);
            return;
        }

        $reason = $request->input('reason');
        $this->reservationModel->refuse($id, $reason);

        // Notify sportif
        $sportif = $this->sportifModel->findById($reservation['sportif_id']);
        $formattedDate = date('d/m/Y', strtotime($reservation['session_date']));
        Notification::notifyReservationRefused($sportif['user_id'], $id, $formattedDate);

        $this->success(null, 'Réservation refusée');
    }

    /**
     * Complete reservation (coach only)
     * PUT /reservations/{id}/complete
     */
    public function complete(Request $request): void
    {
        $user = $GLOBALS['auth_user'];

        if ($user['role'] !== 'coach') {
            $this->error('Seuls les coachs peuvent marquer une séance comme terminée', 403);
            return;
        }

        $id = (int) $request->getParam('id');
        $coach = $this->coachModel->findByUserId($user['id']);

        if (!$this->reservationModel->belongsToCoach($id, $coach['id'])) {
            $this->error('Réservation non trouvée', 404);
            return;
        }

        $reservation = $this->reservationModel->findById($id);

        if ($reservation['status'] !== 'acceptee') {
            $this->error('Cette réservation ne peut pas être marquée comme terminée', 400);
            return;
        }

        $this->reservationModel->complete($id);

        $this->success(null, 'Séance marquée comme terminée');
    }

    /**
     * Get coach reservations (coach only)
     * GET /reservations/coach
     */
    public function coachReservations(Request $request): void
    {
        $user = $GLOBALS['auth_user'];

        if ($user['role'] !== 'coach') {
            $this->error('Accès non autorisé', 403);
            return;
        }

        $coach = $this->coachModel->findByUserId($user['id']);

        $filters = [
            'status' => $request->query('status'),
            'date' => $request->query('date'),
            'from_date' => $request->query('from_date'),
            'to_date' => $request->query('to_date'),
        ];

        $reservations = $this->reservationModel->getByCoach($coach['id'], $filters);

        $this->success($reservations);
    }

    /**
     * Get pending reservations (coach only)
     * GET /reservations/pending
     */
    public function pending(Request $request): void
    {
        $user = $GLOBALS['auth_user'];

        if ($user['role'] !== 'coach') {
            $this->error('Accès non autorisé', 403);
            return;
        }

        $coach = $this->coachModel->findByUserId($user['id']);
        $reservations = $this->reservationModel->getPending($coach['id']);

        $this->success($reservations);
    }

    /**
     * Get today's sessions (coach only)
     * GET /reservations/today
     */
    public function today(Request $request): void
    {
        $user = $GLOBALS['auth_user'];

        if ($user['role'] !== 'coach') {
            $this->error('Accès non autorisé', 403);
            return;
        }

        $coach = $this->coachModel->findByUserId($user['id']);
        $reservations = $this->reservationModel->getTodaySessions($coach['id']);

        $this->success($reservations);
    }

    /**
     * Update sportif notes
     * PUT /reservations/{id}/notes
     */
    public function updateNotes(Request $request): void
    {
        $user = $GLOBALS['auth_user'];
        $id = (int) $request->getParam('id');

        $data = $this->validate($request->getBody(), [
            'notes' => 'required|max:1000',
        ]);

        if ($user['role'] === 'sportif') {
            $sportif = $this->sportifModel->findByUserId($user['id']);
            if (!$this->reservationModel->belongsToSportif($id, $sportif['id'])) {
                $this->error('Réservation non trouvée', 404);
                return;
            }
            $this->reservationModel->update($id, ['notes_sportif' => $data['notes']]);
        } else {
            $coach = $this->coachModel->findByUserId($user['id']);
            if (!$this->reservationModel->belongsToCoach($id, $coach['id'])) {
                $this->error('Réservation non trouvée', 404);
                return;
            }
            $this->reservationModel->update($id, ['notes_coach' => $data['notes']]);
        }

        $this->success(null, 'Notes mises à jour');
    }
}
