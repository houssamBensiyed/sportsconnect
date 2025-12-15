<?php

namespace App\Controllers;

use App\Core\Controller;
use App\Core\Request;
use App\Models\Availability;
use App\Models\Coach;
use App\Helpers\Response;

class AvailabilityController extends Controller
{
    private Availability $availabilityModel;
    private Coach $coachModel;

    public function __construct()
    {
        parent::__construct();
        $this->availabilityModel = new Availability();
        $this->coachModel = new Coach();
    }

    /**
     * Get coach availabilities (public)
     * GET /availabilities/coach/{coachId}
     */
    public function getByCoach(Request $request): void
    {
        $coachId = (int) $request->getParam('coachId');
        $date = $request->query('date');

        $availabilities = $this->availabilityModel->getAvailable($coachId, $date);

        $this->success($availabilities);
    }

    /**
     * Get available dates for a coach (public)
     * GET /availabilities/coach/{coachId}/dates
     */
    public function getAvailableDates(Request $request): void
    {
        $coachId = (int) $request->getParam('coachId');

        $dates = $this->availabilityModel->getAvailableDates($coachId);

        $this->success($dates);
    }

    /**
     * Get own availabilities (coach only)
     * GET /availabilities
     */
    public function index(Request $request): void
    {
        $user = $GLOBALS['auth_user'];

        if ($user['role'] !== 'coach') {
            $this->error('Accès non autorisé', 403);
            return;
        }

        $coach = $this->coachModel->findByUserId($user['id']);

        $fromDate = $request->query('from_date') ?: date('Y-m-d');
        $toDate = $request->query('to_date');

        $availabilities = $this->availabilityModel->getByCoach($coach['id'], $fromDate, $toDate);

        $this->success($availabilities);
    }

    /**
     * Create availability (coach only)
     * POST /availabilities
     */
    public function store(Request $request): void
    {
        $user = $GLOBALS['auth_user'];

        if ($user['role'] !== 'coach') {
            $this->error('Accès non autorisé', 403);
            return;
        }

        $coach = $this->coachModel->findByUserId($user['id']);

        $data = $this->validate($request->getBody(), [
            'date' => 'required|date',
            'start_time' => 'required',
            'end_time' => 'required',
        ]);

        // Validate date is in the future
        if (strtotime($data['date']) < strtotime(date('Y-m-d'))) {
            $this->error('La date doit être dans le futur', 400);
            return;
        }

        // Validate time order
        if (strtotime($data['start_time']) >= strtotime($data['end_time'])) {
            $this->error('L\'heure de fin doit être après l\'heure de début', 400);
            return;
        }

        // Check for overlap
        if ($this->availabilityModel->hasOverlap($coach['id'], $data['date'], $data['start_time'], $data['end_time'])) {
            $this->error('Ce créneau chevauche une disponibilité existante', 409);
            return;
        }

        $id = $this->availabilityModel->create([
            'coach_id' => $coach['id'],
            'available_date' => $data['date'],
            'start_time' => $data['start_time'],
            'end_time' => $data['end_time'],
        ]);

        $availability = $this->availabilityModel->findById($id);

        $this->success($availability, 'Disponibilité créée', 201);
    }

    /**
     * Create bulk availabilities (coach only)
     * POST /availabilities/bulk
     */
    public function storeBulk(Request $request): void
    {
        $user = $GLOBALS['auth_user'];

        if ($user['role'] !== 'coach') {
            $this->error('Accès non autorisé', 403);
            return;
        }

        $coach = $this->coachModel->findByUserId($user['id']);
        $slots = $request->input('slots');

        if (!$slots || !is_array($slots)) {
            $this->error('Créneaux invalides', 400);
            return;
        }

        // Validate each slot
        foreach ($slots as $slot) {
            if (!isset($slot['date'], $slot['start_time'], $slot['end_time'])) {
                $this->error('Chaque créneau doit avoir date, start_time et end_time', 400);
                return;
            }

            if (strtotime($slot['date']) < strtotime(date('Y-m-d'))) {
                $this->error('Toutes les dates doivent être dans le futur', 400);
                return;
            }
        }

        $count = $this->availabilityModel->createBulk($coach['id'], $slots);

        $this->success(['created' => $count], "{$count} créneaux créés", 201);
    }

    /**
     * Update availability (coach only)
     * PUT /availabilities/{id}
     */
    public function update(Request $request): void
    {
        $user = $GLOBALS['auth_user'];
        $id = (int) $request->getParam('id');

        if ($user['role'] !== 'coach') {
            $this->error('Accès non autorisé', 403);
            return;
        }

        $coach = $this->coachModel->findByUserId($user['id']);

        if (!$this->availabilityModel->belongsToCoach($id, $coach['id'])) {
            $this->error('Disponibilité non trouvée', 404);
            return;
        }

        $availability = $this->availabilityModel->findById($id);

        if ($availability['is_booked']) {
            $this->error('Impossible de modifier une disponibilité réservée', 400);
            return;
        }

        $data = $this->validate($request->getBody(), [
            'date' => 'date',
            'start_time' => '',
            'end_time' => '',
        ]);

        $updateData = [];

        if (isset($data['date'])) {
            if (strtotime($data['date']) < strtotime(date('Y-m-d'))) {
                $this->error('La date doit être dans le futur', 400);
                return;
            }
            $updateData['available_date'] = $data['date'];
        }

        if (isset($data['start_time'])) {
            $updateData['start_time'] = $data['start_time'];
        }

        if (isset($data['end_time'])) {
            $updateData['end_time'] = $data['end_time'];
        }

        // Check for overlap
        $checkDate = $updateData['available_date'] ?? $availability['available_date'];
        $checkStart = $updateData['start_time'] ?? $availability['start_time'];
        $checkEnd = $updateData['end_time'] ?? $availability['end_time'];

        if ($this->availabilityModel->hasOverlap($coach['id'], $checkDate, $checkStart, $checkEnd, $id)) {
            $this->error('Ce créneau chevauche une disponibilité existante', 409);
            return;
        }

        $this->availabilityModel->update($id, $updateData);

        $this->success(null, 'Disponibilité mise à jour');
    }

    /**
     * Delete availability (coach only)
     * DELETE /availabilities/{id}
     */
    public function destroy(Request $request): void
    {
        $user = $GLOBALS['auth_user'];
        $id = (int) $request->getParam('id');

        if ($user['role'] !== 'coach') {
            $this->error('Accès non autorisé', 403);
            return;
        }

        $coach = $this->coachModel->findByUserId($user['id']);

        if (!$this->availabilityModel->belongsToCoach($id, $coach['id'])) {
            $this->error('Disponibilité non trouvée', 404);
            return;
        }

        $availability = $this->availabilityModel->findById($id);

        if ($availability['is_booked']) {
            $this->error('Impossible de supprimer une disponibilité réservée', 400);
            return;
        }

        $this->availabilityModel->delete($id);

        $this->success(null, 'Disponibilité supprimée');
    }

    /**
     * Delete all availabilities for a date (coach only)
     * DELETE /availabilities/date/{date}
     */
    public function destroyByDate(Request $request): void
    {
        $user = $GLOBALS['auth_user'];
        $date = $request->getParam('date');

        if ($user['role'] !== 'coach') {
            $this->error('Accès non autorisé', 403);
            return;
        }

        $coach = $this->coachModel->findByUserId($user['id']);

        $deleted = $this->availabilityModel->deleteByCoachAndDate($coach['id'], $date);

        $this->success(['deleted' => $deleted], "{$deleted} créneaux supprimés");
    }
}
