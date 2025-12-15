<?php

namespace App\Models;

use App\Core\Database;

class Sportif
{
    private Database $db;
    private string $table = 'sportifs';

    public function __construct()
    {
        $this->db = Database::getInstance();
    }

    public function findById(int $id): ?array
    {
        return $this->db->fetch(
            "SELECT s.*, u.email 
             FROM {$this->table} s
             JOIN users u ON s.user_id = u.id
             WHERE s.id = ?",
            [$id]
        );
    }

    public function findByUserId(int $userId): ?array
    {
        return $this->db->fetch(
            "SELECT s.*, u.email 
             FROM {$this->table} s
             JOIN users u ON s.user_id = u.id
             WHERE s.user_id = ?",
            [$userId]
        );
    }

    public function create(array $data): int
    {
        return $this->db->insert($this->table, [
            'user_id' => $data['user_id'],
            'first_name' => $data['first_name'],
            'last_name' => $data['last_name'],
            'phone' => $data['phone'] ?? null,
            'birth_date' => $data['birth_date'] ?? null,
            'city' => $data['city'] ?? null,
        ]);
    }

    public function update(int $id, array $data): int
    {
        $allowed = [
            'first_name', 'last_name', 'phone',
            'birth_date', 'address', 'city', 'profile_photo'
        ];

        $filtered = array_intersect_key($data, array_flip($allowed));

        if (empty($filtered)) {
            return 0;
        }

        return $this->db->update($this->table, $filtered, 'id = ?', [$id]);
    }

    public function getReservations(int $sportifId, ?string $status = null): array
    {
        $sql = "SELECT res.*, s.name as sport_name,
                       c.first_name as coach_first_name,
                       c.last_name as coach_last_name,
                       c.profile_photo as coach_photo,
                       c.phone as coach_phone
                FROM reservations res
                JOIN sports s ON res.sport_id = s.id
                JOIN coaches c ON res.coach_id = c.id
                WHERE res.sportif_id = ?";

        $params = [$sportifId];

        if ($status) {
            $sql .= " AND res.status = ?";
            $params[] = $status;
        }

        $sql .= " ORDER BY res.session_date DESC, res.start_time DESC";

        return $this->db->fetchAll($sql, $params);
    }

    public function getUpcomingReservations(int $sportifId): array
    {
        return $this->db->fetchAll(
            "SELECT res.*, s.name as sport_name,
                    c.first_name as coach_first_name,
                    c.last_name as coach_last_name,
                    c.profile_photo as coach_photo
             FROM reservations res
             JOIN sports s ON res.sport_id = s.id
             JOIN coaches c ON res.coach_id = c.id
             WHERE res.sportif_id = ?
               AND res.status = 'acceptee'
               AND (res.session_date > CURDATE()
                    OR (res.session_date = CURDATE() AND res.start_time > CURTIME()))
             ORDER BY res.session_date, res.start_time",
            [$sportifId]
        );
    }

    public function getStats(int $sportifId): array
    {
        $stats = $this->db->fetch(
            "SELECT 
                COUNT(*) as total_reservations,
                COUNT(CASE WHEN status = 'terminee' THEN 1 END) as completed,
                COUNT(CASE WHEN status = 'acceptee' THEN 1 END) as upcoming,
                COUNT(CASE WHEN status = 'en_attente' THEN 1 END) as pending,
                COALESCE(SUM(CASE WHEN status = 'terminee' THEN price ELSE 0 END), 0) as total_spent
             FROM reservations
             WHERE sportif_id = ?",
            [$sportifId]
        );

        return [
            'total_reservations' => (int) $stats['total_reservations'],
            'completed_sessions' => (int) $stats['completed'],
            'upcoming_sessions' => (int) $stats['upcoming'],
            'pending_requests' => (int) $stats['pending'],
            'total_spent' => (float) $stats['total_spent'],
        ];
    }

    public function hasCompletedSessionWith(int $sportifId, int $coachId): bool
    {
        $result = $this->db->fetch(
            "SELECT COUNT(*) as count FROM reservations
             WHERE sportif_id = ? AND coach_id = ? AND status = 'terminee'",
            [$sportifId, $coachId]
        );

        return $result['count'] > 0;
    }

    public function delete(int $id): int
    {
        return $this->db->delete($this->table, 'id = ?', [$id]);
    }
}