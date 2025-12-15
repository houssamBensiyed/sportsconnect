<?php

namespace App\Middleware;

use App\Core\Request;
use App\Core\Database;
use App\Helpers\Response;
use Firebase\JWT\JWT;
use Firebase\JWT\Key;

class AuthMiddleware
{
    private ?string $requiredRole = null;

    public function __construct(?string $role = null)
    {
        $this->requiredRole = $role;
    }

    public function handle(Request $request): bool
    {
        $token = $request->getBearerToken();

        if (!$token) {
            Response::error('Token manquant', 401);
            return false;
        }

        try {
            $secret = $_ENV['JWT_SECRET'] ?? 'default_secret_key_please_change';
            $decoded = JWT::decode($token, new Key($secret, 'HS256'));

            // Get user from database
            $db = Database::getInstance();
            $user = $db->fetch(
                "SELECT id, email, role, is_active FROM users WHERE id = ?",
                [$decoded->sub]
            );

            if (!$user || !$user['is_active']) {
                Response::error('Utilisateur non autorisé', 401);
                return false;
            }

            // Check role if required
            if ($this->requiredRole && $user['role'] !== $this->requiredRole) {
                Response::error('Accès non autorisé', 403);
                return false;
            }

            // Store user in request
            $GLOBALS['auth_user'] = $user;

            return true;
        } catch (\Exception $e) {
            Response::error('Token invalide', 401);
            return false;
        }
    }
}