<?php

namespace App\Models;

use App\Core\Database;

class Availability
{
    private Database $db;
    private string $table = 'availabilities';

    public function __construct()
    {
        $this->db = Database::getInstance();
    }

    public function findById(int $id): ?array
    {
        return $this->db->fetch(
            "SELECT * FROM {$this->table} WHERE id = ?",
            [$id]
        );
    }

    public function getByCoach(int $coachId, ?string $fromDate = null, ?string $toDate = null): array
    {
        $sql = "SELECT * FROM {$this->table} WHERE coach_id = ?";
        $params = [$coachId];

        if ($fromDate) {
            $sql .= " AND available_date >= ?";
            $params[] = $fromDate;
        }

        if ($toDate) {
            $sql .= " AND available_date <= ?";
            $params[] = $toDate;
        }

        $sql .= " ORDER BY available_date, start_time";

        return $this->db->fetchAll($sql, $params);
    }

    public function getAvailable(int $coachId, ?string $date = null): array
    {
        $sql = "SELECT * FROM {$this->table} 
                WHERE coach_id = ? AND is_booked = 0";
        $params = [$coachId];

        if ($date) {
            $sql .= " AND available_date = ?";
            $params[] = $date;
        } else {
            $sql .= " AND available_date >= CURDATE()";
        }

        $sql .= " ORDER BY available_date, start_time";

        return $this->db->fetchAll($sql, $params);
    }

    public function getAvailableDates(int $coachId): array
    {
        return $this->db->fetchAll(
            "SELECT DISTINCT available_date 
             FROM {$this->table}
             WHERE coach_id = ? 
               AND is_booked = 0 
               AND available_date >= CURDATE()
             ORDER BY available_date
             LIMIT 30",
            [$coachId]
        );
    }

    public function create(array $data): int
    {
        return $this->db->insert($this->table, [
            'coach_id' => $data['coach_id'],
            'available_date' => $data['available_date'],
            'start_time' => $data['start_time'],
            'end_time' => $data['end_time'],
            'is_recurring' => isset($data['is_recurring']) ? (int)$data['is_recurring'] : 0,
            'recurring_day' => $data['recurring_day'] ?? null,
        ]);
    }

    public function createBulk(int $coachId, array $slots): int
    {
        $count = 0;

        foreach ($slots as $slot) {
            // Check for overlap
            if (!$this->hasOverlap($coachId, $slot['date'], $slot['start_time'], $slot['end_time'])) {
                $this->create([
                    'coach_id' => $coachId,
                    'available_date' => $slot['date'],
                    'start_time' => $slot['start_time'],
                    'end_time' => $slot['end_time'],
                ]);
                $count++;
            }
        }

        return $count;
    }

    public function update(int $id, array $data): int
    {
        $allowed = ['available_date', 'start_time', 'end_time', 'is_booked', 'is_recurring', 'recurring_day'];
        $filtered = array_intersect_key($data, array_flip($allowed));

        return $this->db->update($this->table, $filtered, 'id = ?', [$id]);
    }

    public function markAsBooked(int $id): int
    {
        return $this->db->update(
            $this->table,
            ['is_booked' => 1],
            'id = ?',
            [$id]
        );
    }

    public function markAsAvailable(int $id): int
    {
        return $this->db->update(
            $this->table,
            ['is_booked' => 0],
            'id = ?',
            [$id]
        );
    }

    public function delete(int $id): int
    {
        return $this->db->delete($this->table, 'id = ? AND is_booked = 0', [$id]);
    }

    public function deleteByCoachAndDate(int $coachId, string $date): int
    {
        return $this->db->delete(
            $this->table,
            'coach_id = ? AND available_date = ? AND is_booked = 0',
            [$coachId, $date]
        );
    }

    public function hasOverlap(int $coachId, string $date, string $startTime, string $endTime, ?int $excludeId = null): bool
    {
        $sql = "SELECT COUNT(*) as count FROM {$this->table}
                WHERE coach_id = ?
                  AND available_date = ?
                  AND ((start_time < ? AND end_time > ?)
                       OR (start_time < ? AND end_time > ?)
                       OR (start_time >= ? AND end_time <= ?))";

        $params = [$coachId, $date, $endTime, $startTime, $endTime, $startTime, $startTime, $endTime];

        if ($excludeId) {
            $sql .= " AND id != ?";
            $params[] = $excludeId;
        }

        $result = $this->db->fetch($sql, $params);
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
}