<?php

namespace App\Controllers;

use App\Core\Controller;
use App\Core\Request;
use App\Core\Database;

class HealthController extends Controller
{
    /**
     * Health check endpoint
     * GET /health
     */
    public function check(Request $request): void
    {
        $status = [
            'status' => 'ok',
            'timestamp' => date('Y-m-d H:i:s'),
            'version' => '1.0.0',
        ];

        // Check database connection
        try {
            $db = Database::getInstance();
            $db->fetch("SELECT 1");
            $status['database'] = 'connected';
        } catch (\Exception $e) {
            $status['database'] = 'disconnected';
            $status['status'] = 'degraded';
        }

        // Check upload directory
        $uploadPath = dirname(__DIR__, 2) . '/uploads';
        $status['uploads'] = is_writable($uploadPath) ? 'writable' : 'not_writable';

        $this->success($status);
    }
}
