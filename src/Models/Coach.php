<?php

namespace App\Models;

use App\Core\Database;

class Coach
{
    private Database $db;
    private string $table = 'coaches';

    public function __construct()
    {
        $this->db = Database::getInstance();
    }

    public function findById(int $id): ?array
    {
        return $this->db->fetch(
            "SELECT c.*, u.email 
             FROM {$this->table} c
             JOIN users u ON c.user_id = u.id
             WHERE c.id = ?",
            [$id]
        );
    }

    public function findByUserId(int $userId): ?array
    {
        return $this->db->fetch(
            "SELECT c.*, u.email 
             FROM {$this->table} c
             JOIN users u ON c.user_id = u.id
             WHERE c.user_id = ?",
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
            'bio' => $data['bio'] ?? null,
            'years_experience' => $data['years_experience'] ?? 0,
            'city' => $data['city'] ?? null,
            'hourly_rate' => $data['hourly_rate'] ?? 0,
        ]);
    }

    public function update(int $id, array $data): int
    {
        $allowed = [
            'first_name', 'last_name', 'phone', 'bio',
            'profile_photo', 'years_experience', 'address',
            'city', 'hourly_rate', 'is_available'
        ];

        $filtered = array_intersect_key($data, array_flip($allowed));

        if (empty($filtered)) {
            return 0;
        }

        return $this->db->update($this->table, $filtered, 'id = ?', [$id]);
    }

    public function getAll(array $filters = []): array
    {
        $sql = "SELECT c.*, u.email,
                GROUP_CONCAT(DISTINCT s.name) as sports,
                COALESCE(AVG(r.rating), 0) as avg_rating,
                COUNT(DISTINCT r.id) as reviews_count
                FROM {$this->table} c
                JOIN users u ON c.user_id = u.id
                LEFT JOIN coach_sports cs ON c.id = cs.coach_id
                LEFT JOIN sports s ON cs.sport_id = s.id
                LEFT JOIN reviews r ON c.id = r.coach_id AND r.is_visible = 1
                WHERE u.is_active = 1";

        $params = [];

        if (!empty($filters['city'])) {
            $sql .= " AND c.city = ?";
            $params[] = $filters['city'];
        }

        if (!empty($filters['sport_id'])) {
            $sql .= " AND cs.sport_id = ?";
            $params[] = $filters['sport_id'];
        }

        if (!empty($filters['is_available'])) {
            $sql .= " AND c.is_available = 1";
        }

        if (!empty($filters['min_rate'])) {
            $sql .= " AND c.hourly_rate >= ?";
            $params[] = $filters['min_rate'];
        }

        if (!empty($filters['max_rate'])) {
            $sql .= " AND c.hourly_rate <= ?";
            $params[] = $filters['max_rate'];
        }

        $sql .= " GROUP BY c.id";

        if (!empty($filters['sort'])) {
            switch ($filters['sort']) {
                case 'rating':
                    $sql .= " ORDER BY avg_rating DESC";
                    break;
                case 'experience':
                    $sql .= " ORDER BY c.years_experience DESC";
                    break;
                case 'price_asc':
                    $sql .= " ORDER BY c.hourly_rate ASC";
                    break;
                case 'price_desc':
                    $sql .= " ORDER BY c.hourly_rate DESC";
                    break;
                default:
                    $sql .= " ORDER BY c.created_at DESC";
            }
        } else {
            $sql .= " ORDER BY c.created_at DESC";
        }

        // Pagination
        $page = (int) ($filters['page'] ?? 1);
        $limit = (int) ($filters['limit'] ?? 10);
        $offset = ($page - 1) * $limit;

        $sql .= " LIMIT {$limit} OFFSET {$offset}";

        return $this->db->fetchAll($sql, $params);
    }

    public function count(array $filters = []): int
    {
        $sql = "SELECT COUNT(DISTINCT c.id) as total
                FROM {$this->table} c
                JOIN users u ON c.user_id = u.id
                LEFT JOIN coach_sports cs ON c.id = cs.coach_id
                WHERE u.is_active = 1";

        $params = [];

        if (!empty($filters['city'])) {
            $sql .= " AND c.city = ?";
            $params[] = $filters['city'];
        }

        if (!empty($filters['sport_id'])) {
            $sql .= " AND cs.sport_id = ?";
            $params[] = $filters['sport_id'];
        }

        if (!empty($filters['is_available'])) {
            $sql .= " AND c.is_available = 1";
        }

        $result = $this->db->fetch($sql, $params);
        return (int) $result['total'];
    }

    public function getProfile(int $id): ?array
    {
        $coach = $this->findById($id);

        if (!$coach) {
            return null;
        }

        // Get sports
        $coach['sports'] = $this->db->fetchAll(
            "SELECT s.*, cs.level
             FROM sports s
             JOIN coach_sports cs ON s.id = cs.sport_id
             WHERE cs.coach_id = ?",
            [$id]
        );

        // Get certifications
        $coach['certifications'] = $this->db->fetchAll(
            "SELECT * FROM certifications WHERE coach_id = ? ORDER BY year_obtained DESC",
            [$id]
        );

        // Get reviews
        $coach['reviews'] = $this->db->fetchAll(
            "SELECT r.*, sp.first_name, sp.last_name, sp.profile_photo
             FROM reviews r
             JOIN sportifs sp ON r.sportif_id = sp.id
             WHERE r.coach_id = ? AND r.is_visible = 1
             ORDER BY r.created_at DESC
             LIMIT 10",
            [$id]
        );

        // Get stats
        $stats = $this->db->fetch(
            "SELECT 
                COALESCE(AVG(rating), 0) as avg_rating,
                COUNT(*) as total_reviews
             FROM reviews 
             WHERE coach_id = ? AND is_visible = 1",
            [$id]
        );

        $coach['avg_rating'] = round((float) $stats['avg_rating'], 1);
        $coach['total_reviews'] = (int) $stats['total_reviews'];

        return $coach;
    }

    public function getDashboardStats(int $coachId): array
    {
        $stats = $this->db->fetch(
            "SELECT 
                COUNT(CASE WHEN status = 'en_attente' THEN 1 END) as pending,
                COUNT(CASE WHEN status = 'acceptee' AND session_date = CURDATE() THEN 1 END) as today,
                COUNT(CASE WHEN status = 'acceptee' AND session_date = DATE_ADD(CURDATE(), INTERVAL 1 DAY) THEN 1 END) as tomorrow,
                COUNT(CASE WHEN status = 'terminee' THEN 1 END) as completed,
                COALESCE(SUM(CASE WHEN status = 'terminee' THEN price ELSE 0 END), 0) as earnings
             FROM reservations
             WHERE coach_id = ?",
            [$coachId]
        );

        return [
            'pending_requests' => (int) $stats['pending'],
            'today_sessions' => (int) $stats['today'],
            'tomorrow_sessions' => (int) $stats['tomorrow'],
            'completed_sessions' => (int) $stats['completed'],
            'total_earnings' => (float) $stats['earnings'],
        ];
    }

    public function getNextSession(int $coachId): ?array
    {
        return $this->db->fetch(
            "SELECT res.*, s.name as sport_name,
                    sp.first_name, sp.last_name, sp.phone, sp.profile_photo
             FROM reservations res
             JOIN sports s ON res.sport_id = s.id
             JOIN sportifs sp ON res.sportif_id = sp.id
             WHERE res.coach_id = ?
               AND res.status = 'acceptee'
               AND (res.session_date > CURDATE()
                    OR (res.session_date = CURDATE() AND res.start_time > CURTIME()))
             ORDER BY res.session_date, res.start_time
             LIMIT 1",
            [$coachId]
        );
    }

    public function addSport(int $coachId, int $sportId, string $level = 'intermediaire'): int
    {
        // Check if already exists
        $exists = $this->db->fetch(
            "SELECT id FROM coach_sports WHERE coach_id = ? AND sport_id = ?",
            [$coachId, $sportId]
        );

        if ($exists) {
            return $this->db->update(
                'coach_sports',
                ['level' => $level],
                'coach_id = ? AND sport_id = ?',
                [$coachId, $sportId]
            );
        }

        return $this->db->insert('coach_sports', [
            'coach_id' => $coachId,
            'sport_id' => $sportId,
            'level' => $level,
        ]);
    }

    public function removeSport(int $coachId, int $sportId): int
    {
        return $this->db->delete(
            'coach_sports',
            'coach_id = ? AND sport_id = ?',
            [$coachId, $sportId]
        );
    }

    public function getSports(int $coachId): array
    {
        return $this->db->fetchAll(
            "SELECT s.*, cs.level
             FROM sports s
             JOIN coach_sports cs ON s.id = cs.sport_id
             WHERE cs.coach_id = ?",
            [$coachId]
        );
    }

    public function getCities(): array
    {
        return $this->db->fetchAll(
            "SELECT DISTINCT city FROM {$this->table} 
             WHERE city IS NOT NULL AND city != '' 
             ORDER BY city"
        );
    }
}