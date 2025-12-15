<?php

namespace App\Models;

use App\Core\Database;

class Certification
{
    private Database $db;
    private string $table = 'certifications';

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

    public function getByCoach(int $coachId): array
    {
        return $this->db->fetchAll(
            "SELECT * FROM {$this->table} 
             WHERE coach_id = ? 
             ORDER BY year_obtained DESC",
            [$coachId]
        );
    }

    public function create(array $data): int
    {
        return $this->db->insert($this->table, [
            'coach_id' => $data['coach_id'],
            'name' => $data['name'],
            'organization' => $data['organization'] ?? null,
            'year_obtained' => $data['year_obtained'] ?? null,
            'document_url' => $data['document_url'] ?? null,
        ]);
    }

    public function update(int $id, array $data): int
    {
        $allowed = ['name', 'organization', 'year_obtained', 'document_url', 'is_verified'];
        $filtered = array_intersect_key($data, array_flip($allowed));

        return $this->db->update($this->table, $filtered, 'id = ?', [$id]);
    }

    public function delete(int $id): int
    {
        return $this->db->delete($this->table, 'id = ?', [$id]);
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