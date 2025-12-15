<?php

namespace App\Models;

use App\Core\Database;

class Sport
{
    private Database $db;
    private string $table = 'sports';

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

    public function findByName(string $name): ?array
    {
        return $this->db->fetch(
            "SELECT * FROM {$this->table} WHERE name = ?",
            [$name]
        );
    }

    public function getAll(bool $activeOnly = true): array
    {
        $sql = "SELECT * FROM {$this->table}";

        if ($activeOnly) {
            $sql .= " WHERE is_active = 1";
        }

        $sql .= " ORDER BY name ASC";

        return $this->db->fetchAll($sql);
    }

    public function getByCategory(string $category): array
    {
        return $this->db->fetchAll(
            "SELECT * FROM {$this->table} 
             WHERE category = ? AND is_active = 1 
             ORDER BY name",
            [$category]
        );
    }

    public function getCategories(): array
    {
        return $this->db->fetchAll(
            "SELECT DISTINCT category FROM {$this->table} 
             WHERE is_active = 1 
             ORDER BY category"
        );
    }

    public function getWithCoachCount(): array
    {
        return $this->db->fetchAll(
            "SELECT s.*, COUNT(DISTINCT cs.coach_id) as coach_count
             FROM {$this->table} s
             LEFT JOIN coach_sports cs ON s.id = cs.sport_id
             LEFT JOIN coaches c ON cs.coach_id = c.id
             LEFT JOIN users u ON c.user_id = u.id AND u.is_active = 1
             WHERE s.is_active = 1
             GROUP BY s.id
             ORDER BY coach_count DESC, s.name ASC"
        );
    }

    public function create(array $data): int
    {
        return $this->db->insert($this->table, [
            'name' => $data['name'],
            'description' => $data['description'] ?? null,
            'icon' => $data['icon'] ?? 'sports.png',
            'category' => $data['category'] ?? 'autre',
        ]);
    }

    public function update(int $id, array $data): int
    {
        $allowed = ['name', 'description', 'icon', 'category', 'is_active'];
        $filtered = array_intersect_key($data, array_flip($allowed));

        return $this->db->update($this->table, $filtered, 'id = ?', [$id]);
    }

    public function delete(int $id): int
    {
        return $this->db->delete($this->table, 'id = ?', [$id]);
    }
}