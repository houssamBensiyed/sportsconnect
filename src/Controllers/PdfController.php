<?php

namespace App\Controllers;

use App\Core\Controller;
use App\Core\Request;
use App\Models\Reservation;
use App\Models\Coach;
use App\Models\Sportif;
use App\Models\User;
use App\Services\PdfService;

class PdfController extends Controller
{
    private PdfService $pdfService;
    private Reservation $reservationModel;
    private Coach $coachModel;
    private Sportif $sportifModel;

    public function __construct()
    {
        parent::__construct();
        $this->pdfService = new PdfService();
        $this->reservationModel = new Reservation();
        $this->coachModel = new Coach();
        $this->sportifModel = new Sportif();
    }

    /**
     * Generate reservation confirmation PDF
     * GET /pdf/reservation/{id}
     */
    public function reservation(Request $request): void
    {
        $user = $GLOBALS['auth_user'];
        $id = (int) $request->getParam('id');

        $reservation = $this->reservationModel->findById($id);

        if (!$reservation) {
            $this->error('Réservation non trouvée', 404);
            return;
        }

        // Check authorization
        $authorized = false;

        if ($user['role'] === 'sportif') {
            $sportif = $this->sportifModel->findByUserId($user['id']);
            $authorized = $this->reservationModel->belongsToSportif($id, $sportif['id']);
        } else {
            $coach = $this->coachModel->findByUserId($user['id']);
            $authorized = $this->reservationModel->belongsToCoach($id, $coach['id']);
        }

        if (!$authorized) {
            $this->error('Accès non autorisé', 403);
            return;
        }

        $pdf = $this->pdfService->generateReservationConfirmation($reservation);

        header('Content-Type: application/pdf');
        header('Content-Disposition: attachment; filename="reservation_' . $id . '.pdf"');
        header('Content-Length: ' . strlen($pdf));

        echo $pdf;
        exit;
    }

    /**
     * Generate invoice PDF
     * GET /pdf/invoice/{id}
     */
    public function invoice(Request $request): void
    {
        $user = $GLOBALS['auth_user'];
        $id = (int) $request->getParam('id');

        $reservation = $this->reservationModel->findById($id);

        if (!$reservation) {
            $this->error('Réservation non trouvée', 404);
            return;
        }

        // Only completed reservations can have invoices
        if ($reservation['status'] !== 'terminee') {
            $this->error('Facture disponible uniquement pour les séances terminées', 400);
            return;
        }

        // Check authorization
        $authorized = false;
        $sportif = null;
        $coach = null;

        if ($user['role'] === 'sportif') {
            $sportif = $this->sportifModel->findByUserId($user['id']);
            $authorized = $this->reservationModel->belongsToSportif($id, $sportif['id']);
            $coach = $this->coachModel->findById($reservation['coach_id']);
        } else {
            $coach = $this->coachModel->findByUserId($user['id']);
            $authorized = $this->reservationModel->belongsToCoach($id, $coach['id']);
            $sportif = $this->sportifModel->findById($reservation['sportif_id']);
        }

        if (!$authorized) {
            $this->error('Accès non autorisé', 403);
            return;
        }

        $pdf = $this->pdfService->generateInvoice($reservation, $coach, $sportif);

        header('Content-Type: application/pdf');
        header('Content-Disposition: attachment; filename="facture_' . $id . '.pdf"');
        header('Content-Length: ' . strlen($pdf));

        echo $pdf;
        exit;
    }

    /**
     * Generate coach activity report
     * GET /pdf/coach-report
     */
    public function coachReport(Request $request): void
    {
        $user = $GLOBALS['auth_user'];

        if ($user['role'] !== 'coach') {
            $this->error('Accès réservé aux coachs', 403);
            return;
        }

        $coach = $this->coachModel->findByUserId($user['id']);
        $stats = $this->coachModel->getDashboardStats($coach['id']);
        $reservations = $this->reservationModel->getByCoach($coach['id']);

        $pdf = $this->pdfService->generateCoachReport($coach, $stats, $reservations);

        header('Content-Type: application/pdf');
        header('Content-Disposition: attachment; filename="rapport_coach_' . date('Y-m-d') . '.pdf"');
        header('Content-Length: ' . strlen($pdf));

        echo $pdf;
        exit;
    }

    /**
     * Generate sportif session history
     * GET /pdf/sportif-history
     */
    public function sportifHistory(Request $request): void
    {
        $user = $GLOBALS['auth_user'];

        if ($user['role'] !== 'sportif') {
            $this->error('Accès réservé aux sportifs', 403);
            return;
        }

        $sportif = $this->sportifModel->findByUserId($user['id']);
        $reservations = $this->sportifModel->getReservations($sportif['id']);
        $stats = $this->sportifModel->getStats($sportif['id']);

        $pdf = $this->pdfService->generateSportifHistory($sportif, $reservations, $stats);

        header('Content-Type: application/pdf');
        header('Content-Disposition: attachment; filename="historique_' . date('Y-m-d') . '.pdf"');
        header('Content-Length: ' . strlen($pdf));

        echo $pdf;
        exit;
    }
}
