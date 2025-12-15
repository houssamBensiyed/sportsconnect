<?php

namespace App\Models;

use App\Core\Database;

class Review
{
    private Database $db;
    private string $table = 'reviews';

    public function __construct()
    {
        $this->db = Database::getInstance();
    }

    public function findById(int $id): ?array
    {
        return $this->db->fetch(
            "SELECT r.*, 
                    sp.first_name, sp.last_name, sp.profile_photo
             FROM {$this->table} r
             JOIN sportifs sp ON r.sportif_id = sp.id
             WHERE r.id = ?",
            [$id]
        );
    }

    public function findByReservation(int $reservationId): ?array
    {
        return $this->db->fetch(
            "SELECT * FROM {$this->table} WHERE reservation_id = ?",
            [$reservationId]
        );
    }

    public function create(array $data): int
    {
        return $this->db->insert($this->table, [
            'reservation_id' => $data['reservation_id'],
            'sportif_id' => $data['sportif_id'],
            'coach_id' => $data['coach_id'],
            'rating' => $data['rating'],
            'comment' => $data['comment'] ?? null,
        ]);
    }

    public function update(int $id, array $data): int
    {
        $allowed = ['rating', 'comment', 'is_visible', 'coach_response'];
        $filtered = array_intersect_key($data, array_flip($allowed));

        return $this->db->update($this->table, $filtered, 'id = ?', [$id]);
    }

    public function getByCoach(int $coachId, bool $visibleOnly = true): array
    {
        $sql = "SELECT r.*, 
                       sp.first_name, sp.last_name, sp.profile_photo,
                       s.name as sport_name
                FROM {$this->table} r
                JOIN sportifs sp ON r.sportif_id = sp.id
                JOIN reservations res ON r.reservation_id = res.id
                JOIN sports s ON res.sport_id = s.id
                WHERE r.coach_id = ?";

        if ($visibleOnly) {
            $sql .= " AND r.is_visible = 1";
        }

        $sql .= " ORDER BY r.created_at DESC";

        return $this->db->fetchAll($sql, [$coachId]);
    }

    public function getBySportif(int $sportifId): array
    {
        return $this->db->fetchAll(
            "SELECT r.*, 
                    c.first_name as coach_first_name, 
                    c.last_name as coach_last_name
             FROM {$this->table} r
             JOIN coaches c ON r.coach_id = c.id
             WHERE r.sportif_id = ?
             ORDER BY r.created_at DESC",
            [$sportifId]
        );
    }

    public function getCoachStats(int $coachId): array
    {
        $stats = $this->db->fetch(
            "SELECT 
                COUNT(*) as total,
                COALESCE(AVG(rating), 0) as average,
                COUNT(CASE WHEN rating = 5 THEN 1 END) as five_stars,
                COUNT(CASE WHEN rating = 4 THEN 1 END) as four_stars,
                COUNT(CASE WHEN rating = 3 THEN 1 END) as three_stars,
                COUNT(CASE WHEN rating = 2 THEN 1 END) as two_stars,
                COUNT(CASE WHEN rating = 1 THEN 1 END) as one_star
             FROM {$this->table}
             WHERE coach_id = ? AND is_visible = 1",
            [$coachId]
        );

        return [
            'total_reviews' => (int) $stats['total'],
            'average_rating' => round((float) $stats['average'], 1),
            'distribution' => [
                5 => (int) $stats['five_stars'],
                4 => (int) $stats['four_stars'],
                3 => (int) $stats['three_stars'],
                2 => (int) $stats['two_stars'],
                1 => (int) $stats['one_star'],
            ],
        ];
    }

    public function addCoachResponse(int $id, string $response): int
    {
        return $this->db->update(
            $this->table,
            ['coach_response' => $response],
            'id = ?',
            [$id]
        );
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

    public function delete(int $id): int
    {
        return $this->db->delete($this->table, 'id = ?', [$id]);
    }
}