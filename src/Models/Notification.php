<?php

namespace App\Models;

use App\Core\Database;

class Notification
{
    private Database $db;
    private string $table = 'notifications';

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

    public function getByUser(int $userId, int $limit = 20): array
    {
        return $this->db->fetchAll(
            "SELECT * FROM {$this->table} 
             WHERE user_id = ? 
             ORDER BY created_at DESC 
             LIMIT ?",
            [$userId, $limit]
        );
    }

    public function getUnread(int $userId): array
    {
        return $this->db->fetchAll(
            "SELECT * FROM {$this->table} 
             WHERE user_id = ? AND is_read = 0 
             ORDER BY created_at DESC",
            [$userId]
        );
    }

    public function getUnreadCount(int $userId): int
    {
        $result = $this->db->fetch(
            "SELECT COUNT(*) as count FROM {$this->table} 
             WHERE user_id = ? AND is_read = 0",
            [$userId]
        );
        return (int) $result['count'];
    }

    public function create(array $data): int
    {
        return $this->db->insert($this->table, [
            'user_id' => $data['user_id'],
            'title' => $data['title'],
            'message' => $data['message'],
            'type' => $data['type'] ?? 'systeme',
            'reference_id' => $data['reference_id'] ?? null,
            'reference_type' => $data['reference_type'] ?? null,
        ]);
    }

    public function markAsRead(int $id): int
    {
        return $this->db->update(
            $this->table,
            ['is_read' => true],
            'id = ?',
            [$id]
        );
    }

    public function markAllAsRead(int $userId): int
    {
        return $this->db->update(
            $this->table,
            ['is_read' => true],
            'user_id = ? AND is_read = 0',
            [$userId]
        );
    }

    public function delete(int $id): int
    {
        return $this->db->delete($this->table, 'id = ?', [$id]);
    }

    public function deleteOld(int $days = 30): int
    {
        return $this->db->delete(
            $this->table,
            'created_at < DATE_SUB(NOW(), INTERVAL ? DAY) AND is_read = 1',
            [$days]
        );
    }

    public function belongsToUser(int $id, int $userId): bool
    {
        $result = $this->db->fetch(
            "SELECT COUNT(*) as count FROM {$this->table} WHERE id = ? AND user_id = ?",
            [$id, $userId]
        );
        return $result['count'] > 0;
    }

    // Helper methods for creating specific notifications
    public static function notifyNewReservation(int $coachUserId, int $reservationId, string $date): void
    {
        $model = new self();
        $model->create([
            'user_id' => $coachUserId,
            'title' => 'Nouvelle demande de réservation',
            'message' => "Vous avez reçu une nouvelle demande de séance pour le {$date}",
            'type' => 'reservation',
            'reference_id' => $reservationId,
            'reference_type' => 'reservation',
        ]);
    }

    public static function notifyReservationAccepted(int $sportifUserId, int $reservationId, string $date): void
    {
        $model = new self();
        $model->create([
            'user_id' => $sportifUserId,
            'title' => 'Réservation acceptée',
            'message' => "Votre séance du {$date} a été acceptée!",
            'type' => 'confirmation',
            'reference_id' => $reservationId,
            'reference_type' => 'reservation',
        ]);
    }

    public static function notifyReservationRefused(int $sportifUserId, int $reservationId, string $date): void
    {
        $model = new self();
        $model->create([
            'user_id' => $sportifUserId,
            'title' => 'Réservation refusée',
            'message' => "Votre demande de séance du {$date} a été refusée.",
            'type' => 'annulation',
            'reference_id' => $reservationId,
            'reference_type' => 'reservation',
        ]);
    }

    public static function notifyReservationCancelled(int $userId, int $reservationId, string $date): void
    {
        $model = new self();
        $model->create([
            'user_id' => $userId,
            'title' => 'Séance annulée',
            'message' => "La séance du {$date} a été annulée.",
            'type' => 'annulation',
            'reference_id' => $reservationId,
            'reference_type' => 'reservation',
        ]);
    }

    public static function notifyNewReview(int $coachUserId, int $reviewId, int $rating): void
    {
        $model = new self();
        $model->create([
            'user_id' => $coachUserId,
            'title' => 'Nouvel avis reçu',
            'message' => "Vous avez reçu un avis {$rating} étoiles!",
            'type' => 'avis',
            'reference_id' => $reviewId,
            'reference_type' => 'review',
        ]);
    }
}