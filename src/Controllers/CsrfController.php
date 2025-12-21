<?php

namespace App\Controllers;

use App\Core\Controller;
use App\Core\Request;
use App\Middleware\CsrfMiddleware;

class CsrfController extends Controller
{
    /**
     * Generate CSRF token
     * GET /csrf-token
     */
    public function generate(Request $request): void
    {
        $user = $GLOBALS['auth_user'] ?? null;
        $userId = $user ? $user['id'] : null;

        $token = CsrfMiddleware::generate($userId);

        $this->success([
            'csrf_token' => $token,
            'expires_in' => 3600, // 1 hour
        ]);
    }
}
