<?php

namespace App\Controllers;

use App\Core\Controller;
use App\Core\Request;
use App\Models\Review;
use App\Models\Reservation;
use App\Models\Coach;
use App\Models\Sportif;
use App\Models\Notification;
use App\Helpers\Response;

class ReviewController extends Controller
{
    private Review $reviewModel;
    private Reservation $reservationModel;
    private Coach $coachModel;
    private Sportif $sportifModel;

    public function __construct()
    {
        parent::__construct();
        $this->reviewModel = new Review();
        $this->reservationModel = new Reservation();
        $this->coachModel = new Coach();
        $this->sportifModel = new Sportif();
    }

    /**
     * Get coach reviews (public)
     * GET /reviews/coach/{coachId}
     */
    public function getByCoach(Request $request): void
    {
        $coachId = (int) $request->getParam('coachId');

        $reviews = $this->reviewModel->getByCoach($coachId);
        $stats = $this->reviewModel->getCoachStats($coachId);

        $this->success([
            'reviews' => $reviews,
            'stats' => $stats,
        ]);
    }

    /**
     * Get own reviews (coach only)
     * GET /reviews
     */
    public function index(Request $request): void
    {
        $user = $GLOBALS['auth_user'];

        if ($user['role'] !== 'coach') {
            $this->error('Accès non autorisé', 403);
            return;
        }

        $coach = $this->coachModel->findByUserId($user['id']);

        $reviews = $this->reviewModel->getByCoach($coach['id'], false);
        $stats = $this->reviewModel->getCoachStats($coach['id']);

        $this->success([
            'reviews' => $reviews,
            'stats' => $stats,
        ]);
    }

    /**
     * Create review (sportif only)
     * POST /reviews
     */
    public function store(Request $request): void
    {
        $user = $GLOBALS['auth_user'];

        if ($user['role'] !== 'sportif') {
            $this->error('Seuls les sportifs peuvent laisser des avis', 403);
            return;
        }

        $sportif = $this->sportifModel->findByUserId($user['id']);

        $data = $this->validate($request->getBody(), [
            'reservation_id' => 'required|numeric',
            'rating' => 'required|numeric|min:1|max:5',
            'comment' => 'max:2000',
        ]);

        $reservationId = (int) $data['reservation_id'];

        // Verify reservation exists and belongs to sportif
        if (!$this->reservationModel->belongsToSportif($reservationId, $sportif['id'])) {
            $this->error('Réservation non trouvée', 404);
            return;
        }

        $reservation = $this->reservationModel->findById($reservationId);

        // Verify reservation is completed
        if ($reservation['status'] !== 'terminee') {
            $this->error('Vous ne pouvez laisser un avis que pour une séance terminée', 400);
            return;
        }

        // Verify no review exists
        if ($this->reservationModel->hasReview($reservationId)) {
            $this->error('Vous avez déjà laissé un avis pour cette séance', 409);
            return;
        }

        $reviewId = $this->reviewModel->create([
            'reservation_id' => $reservationId,
            'sportif_id' => $sportif['id'],
            'coach_id' => $reservation['coach_id'],
            'rating' => (int) $data['rating'],
            'comment' => $data['comment'] ?? null,
        ]);

        // Notify coach
        $coach = $this->coachModel->findById($reservation['coach_id']);
        Notification::notifyNewReview($coach['user_id'], $reviewId, (int) $data['rating']);

        $review = $this->reviewModel->findById($reviewId);

        $this->success($review, 'Avis publié', 201);
    }

    /**
     * Update review (sportif only)
     * PUT /reviews/{id}
     */
    public function update(Request $request): void
    {
        $user = $GLOBALS['auth_user'];
        $id = (int) $request->getParam('id');

        if ($user['role'] !== 'sportif') {
            $this->error('Accès non autorisé', 403);
            return;
        }

        $sportif = $this->sportifModel->findByUserId($user['id']);

        if (!$this->reviewModel->belongsToSportif($id, $sportif['id'])) {
            $this->error('Avis non trouvé', 404);
            return;
        }

        $data = $this->validate($request->getBody(), [
            'rating' => 'numeric|min:1|max:5',
            'comment' => 'max:2000',
        ]);

        $this->reviewModel->update($id, $data);

        $this->success(null, 'Avis mis à jour');
    }

    /**
     * Delete review (sportif only)
     * DELETE /reviews/{id}
     */
    public function destroy(Request $request): void
    {
        $user = $GLOBALS['auth_user'];
        $id = (int) $request->getParam('id');

        if ($user['role'] !== 'sportif') {
            $this->error('Accès non autorisé', 403);
            return;
        }

        $sportif = $this->sportifModel->findByUserId($user['id']);

        if (!$this->reviewModel->belongsToSportif($id, $sportif['id'])) {
            $this->error('Avis non trouvé', 404);
            return;
        }

        $this->reviewModel->delete($id);

        $this->success(null, 'Avis supprimé');
    }

    /**
     * Add coach response to review (coach only)
     * POST /reviews/{id}/response
     */
    public function addResponse(Request $request): void
    {
        $user = $GLOBALS['auth_user'];
        $id = (int) $request->getParam('id');

        if ($user['role'] !== 'coach') {
            $this->error('Accès non autorisé', 403);
            return;
        }

        $coach = $this->coachModel->findByUserId($user['id']);

        if (!$this->reviewModel->belongsToCoach($id, $coach['id'])) {
            $this->error('Avis non trouvé', 404);
            return;
        }

        $data = $this->validate($request->getBody(), [
            'response' => 'required|max:1000',
        ]);

        $this->reviewModel->addCoachResponse($id, $data['response']);

        $this->success(null, 'Réponse ajoutée');
    }

    /**
     * Get sportif's reviews
     * GET /reviews/my-reviews
     */
    public function myReviews(Request $request): void
    {
        $user = $GLOBALS['auth_user'];

        if ($user['role'] !== 'sportif') {
            $this->error('Accès non autorisé', 403);
            return;
        }

        $sportif = $this->sportifModel->findByUserId($user['id']);
        $reviews = $this->reviewModel->getBySportif($sportif['id']);

        $this->success($reviews);
    }
}
