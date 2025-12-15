<?php

namespace App\Controllers;

use App\Core\Controller;
use App\Core\Request;
use App\Models\Notification;
use App\Helpers\Response;

class NotificationController extends Controller
{
    private Notification $notificationModel;

    public function __construct()
    {
        parent::__construct();
        $this->notificationModel = new Notification();
    }

    /**
     * Get user notifications
     * GET /notifications
     */
    public function index(Request $request): void
    {
        $user = $GLOBALS['auth_user'];
        $limit = (int) ($request->query('limit') ?: 20);

        $notifications = $this->notificationModel->getByUser($user['id'], $limit);
        $unreadCount = $this->notificationModel->getUnreadCount($user['id']);

        $this->success([
            'notifications' => $notifications,
            'unread_count' => $unreadCount,
        ]);
    }

    /**
     * Get unread notifications
     * GET /notifications/unread
     */
    public function unread(Request $request): void
    {
        $user = $GLOBALS['auth_user'];

        $notifications = $this->notificationModel->getUnread($user['id']);

        $this->success($notifications);
    }

    /**
     * Get unread count
     * GET /notifications/count
     */
    public function count(Request $request): void
    {
        $user = $GLOBALS['auth_user'];

        $count = $this->notificationModel->getUnreadCount($user['id']);

        $this->success(['count' => $count]);
    }

    /**
     * Mark notification as read
     * PUT /notifications/{id}/read
     */
    public function markAsRead(Request $request): void
    {
        $user = $GLOBALS['auth_user'];
        $id = (int) $request->getParam('id');

        if (!$this->notificationModel->belongsToUser($id, $user['id'])) {
            $this->error('Notification non trouvée', 404);
            return;
        }

        $this->notificationModel->markAsRead($id);

        $this->success(null, 'Notification marquée comme lue');
    }

    /**
     * Mark all notifications as read
     * PUT /notifications/read-all
     */
    public function markAllAsRead(Request $request): void
    {
        $user = $GLOBALS['auth_user'];

        $this->notificationModel->markAllAsRead($user['id']);

        $this->success(null, 'Toutes les notifications marquées comme lues');
    }

    /**
     * Delete notification
     * DELETE /notifications/{id}
     */
    public function destroy(Request $request): void
    {
        $user = $GLOBALS['auth_user'];
        $id = (int) $request->getParam('id');

        if (!$this->notificationModel->belongsToUser($id, $user['id'])) {
            $this->error('Notification non trouvée', 404);
            return;
        }

        $this->notificationModel->delete($id);

        $this->success(null, 'Notification supprimée');
    }
}
