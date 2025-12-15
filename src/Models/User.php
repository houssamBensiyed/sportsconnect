<?php

namespace App\Models;

use App\Core\Database;

class User
{
    private Database $db;
    private string $table = 'users';

    public function __construct()
    {
        $this->db = Database::getInstance();
    }

    public function findById(int $id): ?array
    {
        return $this->db->fetch(
            "SELECT id, email, role, is_active, email_verified, created_at 
             FROM {$this->table} WHERE id = ?",
            [$id]
        );
    }

    public function findByEmail(string $email): ?array
    {
        return $this->db->fetch(
            "SELECT * FROM {$this->table} WHERE email = ?",
            [$email]
        );
    }

    public function create(array $data): int
    {
        return $this->db->insert($this->table, [
            'email' => $data['email'],
            'password' => password_hash($data['password'], PASSWORD_BCRYPT),
            'role' => $data['role'],
        ]);
    }

    public function update(int $id, array $data): int
    {
        return $this->db->update($this->table, $data, 'id = ?', [$id]);
    }

    public function updatePassword(int $id, string $password): int
    {
        return $this->db->update(
            $this->table,
            ['password' => password_hash($password, PASSWORD_BCRYPT)],
            'id = ?',
            [$id]
        );
    }

    public function setResetToken(int $id, string $token): int
    {
        return $this->db->update(
            $this->table,
            [
                'reset_token' => $token,
                'reset_token_expiry' => date('Y-m-d H:i:s', strtotime('+1 hour')),
            ],
            'id = ?',
            [$id]
        );
    }

    public function findByResetToken(string $token): ?array
    {
        return $this->db->fetch(
            "SELECT * FROM {$this->table} 
             WHERE reset_token = ? AND reset_token_expiry > NOW()",
            [$token]
        );
    }

    public function clearResetToken(int $id): int
    {
        return $this->db->update(
            $this->table,
            ['reset_token' => null, 'reset_token_expiry' => null],
            'id = ?',
            [$id]
        );
    }

    public function verifyEmail(int $id): int
    {
        return $this->db->update(
            $this->table,
            ['email_verified' => true],
            'id = ?',
            [$id]
        );
    }

    public function emailExists(string $email, ?int $excludeId = null): bool
    {
        $sql = "SELECT COUNT(*) as count FROM {$this->table} WHERE email = ?";
        $params = [$email];

        if ($excludeId) {
            $sql .= " AND id != ?";
            $params[] = $excludeId;
        }

        $result = $this->db->fetch($sql, $params);
        return $result['count'] > 0;
    }

    public function verifyPassword(string $password, string $hash): bool
    {
        return password_verify($password, $hash);
    }

    public function delete(int $id): int
    {
        return $this->db->delete($this->table, 'id = ?', [$id]);
    }
}