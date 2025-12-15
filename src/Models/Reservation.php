<?php

namespace App\Models;

use App\Core\Database;

class Reservation
{
    private Database $db;
    private string $table = 'reservations';

    public function __construct()
    {
        $this->db = Database::getInstance();
    }

    public function findById(int $id): ?array
    {
        return $this->db->fetch(
            "SELECT res.*, 
                    s.name as sport_name, s.icon as sport_icon,
                    c.first_name as coach_first_name, c.last_name as coach_last_name,
                    c.profile_photo as coach_photo, c.phone as coach_phone,
                    sp.first_name as sportif_first_name, sp.last_name as sportif_last_name,
                    sp.profile_photo as sportif_photo, sp.phone as sportif_phone
             FROM {$this->table} res
             JOIN sports s ON res.sport_id = s.id
             JOIN coaches c ON res.coach_id = c.id
             JOIN sportifs sp ON res.sportif_id = sp.id
             WHERE res.id = ?",
            [$id]
        );
    }

    public function create(array $data): int
    {
        return $this->db->insert($this->table, [
            'sportif_id' => $data['sportif_id'],
            'coach_id' => $data['coach_id'],
            'availability_id' => $data['availability_id'],
            'sport_id' => $data['sport_id'],
            'session_date' => $data['session_date'],
            'start_time' => $data['start_time'],
            'end_time' => $data['end_time'],
            'notes_sportif' => $data['notes_sportif'] ?? null,
            'price' => $data['price'],
        ]);
    }

    public function update(int $id, array $data): int
    {
        $allowed = ['status', 'notes_sportif', 'notes_coach', 'cancelled_by', 'cancellation_reason'];
        $filtered = array_intersect_key($data, array_flip($allowed));

        return $this->db->update($this->table, $filtered, 'id = ?', [$id]);
    }

    public function updateStatus(int $id, string $status): int
    {
        return $this->db->update(
            $this->table,
            ['status' => $status],
            'id = ?',
            [$id]
        );
    }

    public function getByCoach(int $coachId, array $filters = []): array
    {
        $sql = "SELECT res.*, 
                       s.name as sport_name,
                       sp.first_name, sp.last_name, sp.profile_photo, sp.phone
                FROM {$this->table} res
                JOIN sports s ON res.sport_id = s.id
                JOIN sportifs sp ON res.sportif_id = sp.id
                WHERE res.coach_id = ?";

        $params = [$coachId];

        if (!empty($filters['status'])) {
            $sql .= " AND res.status = ?";
            $params[] = $filters['status'];
        }

        if (!empty($filters['date'])) {
            $sql .= " AND res.session_date = ?";
            $params[] = $filters['date'];
        }

        if (!empty($filters['from_date'])) {
            $sql .= " AND res.session_date >= ?";
            $params[] = $filters['from_date'];
        }

        if (!empty($filters['to_date'])) {
            $sql .= " AND res.session_date <= ?";
            $params[] = $filters['to_date'];
        }

        $sql .= " ORDER BY res.session_date DESC, res.start_time DESC";

        return $this->db->fetchAll($sql, $params);
    }

    public function getBySportif(int $sportifId, array $filters = []): array
    {
        $sql = "SELECT res.*, 
                       s.name as sport_name,
                       c.first_name as coach_first_name, 
                       c.last_name as coach_last_name,
                       c.profile_photo as coach_photo
                FROM {$this->table} res
                JOIN sports s ON res.sport_id = s.id
                JOIN coaches c ON res.coach_id = c.id
                WHERE res.sportif_id = ?";

        $params = [$sportifId];

        if (!empty($filters['status'])) {
            $sql .= " AND res.status = ?";
            $params[] = $filters['status'];
        }

        $sql .= " ORDER BY res.session_date DESC, res.start_time DESC";

        return $this->db->fetchAll($sql, $params);
    }

    public function getPending(int $coachId): array
    {
        return $this->getByCoach($coachId, ['status' => 'en_attente']);
    }

    public function getTodaySessions(int $coachId): array
    {
        return $this->db->fetchAll(
            "SELECT res.*, s.name as sport_name,
                    sp.first_name, sp.last_name, sp.phone
             FROM {$this->table} res
             JOIN sports s ON res.sport_id = s.id
             JOIN sportifs sp ON res.sportif_id = sp.id
             WHERE res.coach_id = ?
               AND res.session_date = CURDATE()
               AND res.status = 'acceptee'
             ORDER BY res.start_time",
            [$coachId]
        );
    }

    public function accept(int $id): int
    {
        return $this->updateStatus($id, 'acceptee');
    }

    public function refuse(int $id, ?string $reason = null): int
    {
        $data = ['status' => 'refusee'];

        if ($reason) {
            $data['notes_coach'] = $reason;
        }

        // Free up the availability
        $reservation = $this->findById($id);
        if ($reservation) {
            $this->db->update(
                'availabilities',
                ['is_booked' => false],
                'id = ?',
                [$reservation['availability_id']]
            );
        }

        return $this->update($id, $data);
    }

    public function cancel(int $id, string $cancelledBy, ?string $reason = null): int
    {
        $data = [
            'status' => 'annulee',
            'cancelled_by' => $cancelledBy,
        ];

        if ($reason) {
            $data['cancellation_reason'] = $reason;
        }

        // Free up the availability
        $reservation = $this->findById($id);
        if ($reservation) {
            $this->db->update(
                'availabilities',
                ['is_booked' => false],
                'id = ?',
                [$reservation['availability_id']]
            );
        }

        return $this->update($id, $data);
    }

    public function complete(int $id): int
    {
        return $this->updateStatus($id, 'terminee');
    }

    public function belongsToSportif(int $id, int $sportifId): bool
    {
        $result = $this->db->fetch(
            "SELECT COUNT(*) as count FROM {$this->table} WHERE id = ? AND sportif_id = ?",
            [$id, $sportifId]
        );
        return $result['count'] > 0;
    }

    public function belongsToCoach(int $id, int $coachId): bool
    {
        $result = $this->db->fetch(
            "SELECT COUNT(*) as count FROM {$this->table} WHERE id = ? AND coach_id = ?",
            [$id, $coachId]
        );
        return $result['count'] > 0;
    }

    public function canBeCancelled(int $id): bool
    {
        $reservation = $this->findById($id);

        if (!$reservation) {
            return false;
        }

        if (!in_array($reservation['status'], ['en_attente', 'acceptee'])) {
            return false;
        }

        // Check if session is in the future
        $sessionDateTime = $reservation['session_date'] . ' ' . $reservation['start_time'];
        return strtotime($sessionDateTime) > time();
    }

    public function hasReview(int $id): bool
    {
        $result = $this->db->fetch(
            "SELECT COUNT(*) as count FROM reviews WHERE reservation_id = ?",
            [$id]
        );
        return $result['count'] > 0;
    }
}