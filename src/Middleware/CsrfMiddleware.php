<?php

namespace App\Middleware;

use App\Core\Request;
use App\Core\Database;
use App\Helpers\Response;

class CsrfMiddleware
{
    public function handle(Request $request): bool
    {
        // Skip for GET requests
        if ($request->getMethod() === 'GET') {
            return true;
        }

        $token = $request->getHeader('X-CSRF-Token') ?? $request->input('_csrf_token');

        if (!$token) {
            Response::error('Token CSRF manquant', 403);
            return false;
        }

        $db = Database::getInstance();
        $valid = $db->fetch(
            "SELECT id FROM csrf_tokens WHERE token = ? AND expires_at > NOW()",
            [$token]
        );

        if (!$valid) {
            Response::error('Token CSRF invalide', 403);
            return false;
        }

        // Delete used token
        $db->delete('csrf_tokens', 'id = ?', [$valid['id']]);

        return true;
    }

    public static function generate(?int $userId = null): string
    {
        $token = bin2hex(random_bytes(32));
        $expiresAt = date('Y-m-d H:i:s', strtotime('+1 hour'));

        $db = Database::getInstance();
        $db->insert('csrf_tokens', [
            'user_id' => $userId,
            'token' => $token,
            'expires_at' => $expiresAt,
        ]);

        return $token;
    }
}