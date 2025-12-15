<?php

namespace App\Controllers;

use App\Core\Controller;
use App\Core\Request;
use App\Models\Sportif;
use App\Helpers\Response;

class SportifController extends Controller
{
    private Sportif $sportifModel;

    public function __construct()
    {
        parent::__construct();
        $this->sportifModel = new Sportif();
    }

    /**
     * Get sportif profile
     * GET /sportifs/profile
     */
    public function profile(Request $request): void
    {
        $user = $GLOBALS['auth_user'];
        $sportif = $this->sportifModel->findByUserId($user['id']);

        if (!$sportif) {
            $this->error('Profil non trouvé', 404);
            return;
        }

        $stats = $this->sportifModel->getStats($sportif['id']);

        $this->success([
            'profile' => $sportif,
            'stats' => $stats,
        ]);
    }

    /**
     * Update sportif profile
     * PUT /sportifs/profile
     */
    public function updateProfile(Request $request): void
    {
        $user = $GLOBALS['auth_user'];
        $sportif = $this->sportifModel->findByUserId($user['id']);

        if (!$sportif) {
            $this->error('Profil non trouvé', 404);
            return;
        }

        $data = $this->validate($request->getBody(), [
            'first_name' => 'min:2|max:100',
            'last_name' => 'min:2|max:100',
            'phone' => 'phone',
            'birth_date' => 'date',
            'city' => 'max:100',
            'address' => 'max:255',
        ]);

        $this->sportifModel->update($sportif['id'], $data);

        $updatedSportif = $this->sportifModel->findById($sportif['id']);

        $this->success($updatedSportif, 'Profil mis à jour');
    }

    /**
     * Upload profile photo
     * POST /sportifs/profile/photo
     */
    public function uploadPhoto(Request $request): void
    {
        $user = $GLOBALS['auth_user'];
        $sportif = $this->sportifModel->findByUserId($user['id']);

        if (!$sportif) {
            $this->error('Profil non trouvé', 404);
            return;
        }

        $file = $request->getFile('photo');

        if (!$file || $file['error'] !== UPLOAD_ERR_OK) {
            $this->error('Aucun fichier uploadé', 400);
            return;
        }

        // Validate file
        $allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
        $maxSize = 5 * 1024 * 1024; // 5MB

        if (!in_array($file['type'], $allowedTypes)) {
            $this->error('Type de fichier non autorisé', 400);
            return;
        }

        if ($file['size'] > $maxSize) {
            $this->error('Fichier trop volumineux. Maximum 5MB', 400);
            return;
        }

        // Generate filename
        $extension = pathinfo($file['name'], PATHINFO_EXTENSION);
        $filename = 'sportif_' . $sportif['id'] . '_' . time() . '.' . $extension;
        $uploadPath = dirname(__DIR__, 2) . '/uploads/profiles/' . $filename;

        if (!move_uploaded_file($file['tmp_name'], $uploadPath)) {
            $this->error('Erreur lors de l\'upload', 500);
            return;
        }

        // Delete old photo
        if ($sportif['profile_photo'] && $sportif['profile_photo'] !== 'default_avatar.png') {
            $oldPath = dirname(__DIR__, 2) . '/uploads/profiles/' . $sportif['profile_photo'];
            if (file_exists($oldPath)) {
                unlink($oldPath);
            }
        }

        $this->sportifModel->update($sportif['id'], ['profile_photo' => $filename]);

        $this->success(['photo' => $filename], 'Photo mise à jour');
    }

    /**
     * Get sportif reservations
     * GET /sportifs/reservations
     */
    public function getReservations(Request $request): void
    {
        $user = $GLOBALS['auth_user'];
        $sportif = $this->sportifModel->findByUserId($user['id']);

        if (!$sportif) {
            $this->error('Profil non trouvé', 404);
            return;
        }

        $status = $request->query('status');
        $reservations = $this->sportifModel->getReservations($sportif['id'], $status);

        $this->success($reservations);
    }

    /**
     * Get upcoming reservations
     * GET /sportifs/reservations/upcoming
     */
    public function getUpcomingReservations(Request $request): void
    {
        $user = $GLOBALS['auth_user'];
        $sportif = $this->sportifModel->findByUserId($user['id']);

        if (!$sportif) {
            $this->error('Profil non trouvé', 404);
            return;
        }

        $reservations = $this->sportifModel->getUpcomingReservations($sportif['id']);

        $this->success($reservations);
    }

    /**
     * Get sportif stats
     * GET /sportifs/stats
     */
    public function getStats(Request $request): void
    {
        $user = $GLOBALS['auth_user'];
        $sportif = $this->sportifModel->findByUserId($user['id']);

        if (!$sportif) {
            $this->error('Profil non trouvé', 404);
            return;
        }

        $stats = $this->sportifModel->getStats($sportif['id']);

        $this->success($stats);
    }
}
