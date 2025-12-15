<?php

namespace App\Services;

use Firebase\JWT\JWT;
use Firebase\JWT\Key;
use Dotenv\Dotenv;

class AuthService
{
    private string $secret;
    private int $expiry;

    public function __construct()
    {
        // Ensure env is loaded
        if (!isset($_ENV['JWT_SECRET'])) {
            $dotenv = Dotenv::createImmutable(dirname(__DIR__, 2));
            $dotenv->safeLoad();
        }

        $this->secret = $_ENV['JWT_SECRET'] ?? 'default_secret_key_please_change';
        $this->expiry = (int)($_ENV['JWT_EXPIRY'] ?? 3600);
    }

    public function generateToken(int $userId, string $role): string
    {
        $payload = [
            'iat' => time(),
            'exp' => time() + $this->expiry,
            'sub' => $userId,
            'role' => $role
        ];

        return JWT::encode($payload, $this->secret, 'HS256');
    }

    public function validateToken(string $token): ?array
    {
        try {
            $decoded = JWT::decode($token, new Key($this->secret, 'HS256'));
            return (array) $decoded;
        } catch (\Exception $e) {
            return null;
        }
    }
}
