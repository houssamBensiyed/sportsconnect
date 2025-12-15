<?php

namespace App\Controllers;

use App\Core\Controller;
use App\Core\Request;
use App\Models\Coach;
use App\Models\Certification;
use App\Models\Sport;
use App\Helpers\Response;
use App\Helpers\Sanitizer;

class CoachController extends Controller
{
    private Coach $coachModel;
    private Certification $certificationModel;
    private Sport $sportModel;

    public function __construct()
    {
        parent::__construct();
        $this->coachModel = new Coach();
        $this->certificationModel = new Certification();
        $this->sportModel = new Sport();
    }

    /**
     * Get all coaches with filters
     * GET /coaches
     */
    public function index(Request $request): void
    {
        $filters = [
            'city' => $request->query('city'),
            'sport_id' => $request->query('sport_id'),
            'is_available' => $request->query('available'),
            'min_rate' => $request->query('min_rate'),
            'max_rate' => $request->query('max_rate'),
            'sort' => $request->query('sort'),
            'page' => $request->query('page') ?: 1,
            'limit' => $request->query('limit') ?: 10,
        ];

        $coaches = $this->coachModel->getAll($filters);
        $total = $this->coachModel->count($filters);

        Response::paginated(
            $coaches,
            $total,
            (int) $filters['page'],
            (int) $filters['limit']
        );
    }

    /**
     * Get single coach profile
     * GET /coaches/{id}
     */
    public function show(Request $request): void
    {
        $id = (int) $request->getParam('id');

        $coach = $this->coachModel->getProfile($id);

        if (!$coach) {
            $this->error('Coach non trouvé', 404);
            return;
        }

        $this->success($coach);
    }

    /**
     * Get coach dashboard stats
     * GET /coaches/dashboard
     */
    public function dashboard(Request $request): void
    {
        $user = $GLOBALS['auth_user'];
        $coach = $this->coachModel->findByUserId($user['id']);

        if (!$coach) {
            $this->error('Profil coach non trouvé', 404);
            return;
        }

        $stats = $this->coachModel->getDashboardStats($coach['id']);
        $nextSession = $this->coachModel->getNextSession($coach['id']);

        $this->success([
            'stats' => $stats,
            'next_session' => $nextSession,
            'profile' => $coach,
        ]);
    }

    /**
     * Update coach profile
     * PUT /coaches/profile
     */
    public function updateProfile(Request $request): void
    {
        $user = $GLOBALS['auth_user'];
        $coach = $this->coachModel->findByUserId($user['id']);

        if (!$coach) {
            $this->error('Profil coach non trouvé', 404);
            return;
        }

        $data = $this->validate($request->getBody(), [
            'first_name' => 'min:2|max:100',
            'last_name' => 'min:2|max:100',
            'phone' => 'phone',
            'bio' => 'max:2000',
            'years_experience' => 'numeric|min:0|max:50',
            'city' => 'max:100',
            'address' => 'max:255',
            'hourly_rate' => 'numeric|min:0',
            'is_available' => 'in:0,1,true,false',
        ]);

        // Convert is_available to boolean
        if (isset($data['is_available'])) {
            $data['is_available'] = in_array($data['is_available'], ['1', 'true', true], true);
        }

        $this->coachModel->update($coach['id'], $data);

        $updatedCoach = $this->coachModel->findById($coach['id']);

        $this->success($updatedCoach, 'Profil mis à jour');
    }

    /**
     * Upload profile photo
     * POST /coaches/profile/photo
     */
    public function uploadPhoto(Request $request): void
    {
        $user = $GLOBALS['auth_user'];
        $coach = $this->coachModel->findByUserId($user['id']);

        if (!$coach) {
            $this->error('Profil coach non trouvé', 404);
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
            $this->error('Type de fichier non autorisé. Utilisez JPG, PNG ou WebP', 400);
            return;
        }

        if ($file['size'] > $maxSize) {
            $this->error('Fichier trop volumineux. Maximum 5MB', 400);
            return;
        }

        // Generate filename
        $extension = pathinfo($file['name'], PATHINFO_EXTENSION);
        $filename = 'coach_' . $coach['id'] . '_' . time() . '.' . $extension;
        $uploadPath = dirname(__DIR__, 2) . '/uploads/profiles/' . $filename;

        // Move file
        if (!move_uploaded_file($file['tmp_name'], $uploadPath)) {
            $this->error('Erreur lors de l\'upload', 500);
            return;
        }

        // Delete old photo if exists
        if ($coach['profile_photo'] && $coach['profile_photo'] !== 'default_coach.png') {
            $oldPath = dirname(__DIR__, 2) . '/uploads/profiles/' . $coach['profile_photo'];
            if (file_exists($oldPath)) {
                unlink($oldPath);
            }
        }

        // Update profile
        $this->coachModel->update($coach['id'], ['profile_photo' => $filename]);

        $this->success(['photo' => $filename], 'Photo mise à jour');
    }

    /**
     * Get coach sports
     * GET /coaches/sports
     */
    public function getSports(Request $request): void
    {
        $user = $GLOBALS['auth_user'];
        $coach = $this->coachModel->findByUserId($user['id']);

        if (!$coach) {
            $this->error('Profil coach non trouvé', 404);
            return;
        }

        $sports = $this->coachModel->getSports($coach['id']);

        $this->success($sports);
    }

    /**
     * Add sport to coach
     * POST /coaches/sports
     */
    public function addSport(Request $request): void
    {
        $user = $GLOBALS['auth_user'];
        $coach = $this->coachModel->findByUserId($user['id']);

        if (!$coach) {
            $this->error('Profil coach non trouvé', 404);
            return;
        }

        $data = $this->validate($request->getBody(), [
            'sport_id' => 'required|numeric',
            'level' => 'required|in:debutant,intermediaire,avance,expert',
        ]);

        // Verify sport exists
        $sport = $this->sportModel->findById((int) $data['sport_id']);
        if (!$sport) {
            $this->error('Sport non trouvé', 404);
            return;
        }

        $this->coachModel->addSport($coach['id'], (int) $data['sport_id'], $data['level']);

        $this->success(null, 'Sport ajouté', 201);
    }

    /**
     * Remove sport from coach
     * DELETE /coaches/sports/{sportId}
     */
    public function removeSport(Request $request): void
    {
        $user = $GLOBALS['auth_user'];
        $coach = $this->coachModel->findByUserId($user['id']);

        if (!$coach) {
            $this->error('Profil coach non trouvé', 404);
            return;
        }

        $sportId = (int) $request->getParam('sportId');

        $this->coachModel->removeSport($coach['id'], $sportId);

        $this->success(null, 'Sport supprimé');
    }

    /**
     * Get coach certifications
     * GET /coaches/certifications
     */
    public function getCertifications(Request $request): void
    {
        $user = $GLOBALS['auth_user'];
        $coach = $this->coachModel->findByUserId($user['id']);

        if (!$coach) {
            $this->error('Profil coach non trouvé', 404);
            return;
        }

        $certifications = $this->certificationModel->getByCoach($coach['id']);

        $this->success($certifications);
    }

    /**
     * Add certification
     * POST /coaches/certifications
     */
    public function addCertification(Request $request): void
    {
        $user = $GLOBALS['auth_user'];
        $coach = $this->coachModel->findByUserId($user['id']);

        if (!$coach) {
            $this->error('Profil coach non trouvé', 404);
            return;
        }

        $data = $this->validate($request->getBody(), [
            'name' => 'required|min:2|max:255',
            'organization' => 'max:255',
            'year_obtained' => 'numeric|min:1950|max:2030',
        ]);

        $data['coach_id'] = $coach['id'];

        $id = $this->certificationModel->create($data);

        $this->success(['id' => $id], 'Certification ajoutée', 201);
    }

    /**
     * Update certification
     * PUT /coaches/certifications/{id}
     */
    public function updateCertification(Request $request): void
    {
        $user = $GLOBALS['auth_user'];
        $coach = $this->coachModel->findByUserId($user['id']);
        $certId = (int) $request->getParam('id');

        if (!$coach) {
            $this->error('Profil coach non trouvé', 404);
            return;
        }

        if (!$this->certificationModel->belongsToCoach($certId, $coach['id'])) {
            $this->error('Certification non trouvée', 404);
            return;
        }

        $data = $this->validate($request->getBody(), [
            'name' => 'min:2|max:255',
            'organization' => 'max:255',
            'year_obtained' => 'numeric|min:1950|max:2030',
        ]);

        $this->certificationModel->update($certId, $data);

        $this->success(null, 'Certification mise à jour');
    }

    /**
     * Delete certification
     * DELETE /coaches/certifications/{id}
     */
    public function deleteCertification(Request $request): void
    {
        $user = $GLOBALS['auth_user'];
        $coach = $this->coachModel->findByUserId($user['id']);
        $certId = (int) $request->getParam('id');

        if (!$coach) {
            $this->error('Profil coach non trouvé', 404);
            return;
        }

        if (!$this->certificationModel->belongsToCoach($certId, $coach['id'])) {
            $this->error('Certification non trouvée', 404);
            return;
        }

        $this->certificationModel->delete($certId);

        $this->success(null, 'Certification supprimée');
    }

    /**
     * Get available cities
     * GET /coaches/cities
     */
    public function getCities(Request $request): void
    {
        $cities = $this->coachModel->getCities();

        $this->success($cities);
    }
}
