<?php

namespace App\Controllers;

use App\Core\Controller;
use App\Core\Request;
use App\Models\User;
use App\Models\Coach;
use App\Models\Sportif;
use App\Services\AuthService;
use App\Services\EmailService;
use App\Helpers\Response;

class AuthController extends Controller
{
    private User $userModel;
    private Coach $coachModel;
    private Sportif $sportifModel;
    private AuthService $authService;

    public function __construct()
    {
        parent::__construct();
        $this->userModel = new User();
        $this->coachModel = new Coach();
        $this->sportifModel = new Sportif();
        $this->authService = new AuthService();
    }

    /**
     * Register a new user
     * POST /auth/register
     */
    public function register(Request $request): void
    {
        $data = $this->validate($request->getBody(), [
            'email' => 'required|email',
            'password' => 'required|password|min:8',
            'role' => 'required|in:sportif,coach',
            'first_name' => 'required|min:2|max:100',
            'last_name' => 'required|min:2|max:100',
            'phone' => 'phone',
        ]);

        // Check if email exists
        if ($this->userModel->emailExists($data['email'])) {
            $this->error('Cet email est déjà utilisé', 409);
            return;
        }

        try {
            // Create user
            $userId = $this->userModel->create([
                'email' => $data['email'],
                'password' => $data['password'],
                'role' => $data['role'],
            ]);

            // Create profile based on role
            if ($data['role'] === 'coach') {
                $profileId = $this->coachModel->create([
                    'user_id' => $userId,
                    'first_name' => $data['first_name'],
                    'last_name' => $data['last_name'],
                    'phone' => $data['phone'] ?? null,
                ]);
            } else {
                $profileId = $this->sportifModel->create([
                    'user_id' => $userId,
                    'first_name' => $data['first_name'],
                    'last_name' => $data['last_name'],
                    'phone' => $data['phone'] ?? null,
                ]);
            }

            // Generate token
            $token = $this->authService->generateToken($userId, $data['role']);

            // Get user data
            $user = $this->userModel->findById($userId);

            $this->success([
                'user' => [
                    'id' => $userId,
                    'email' => $user['email'],
                    'role' => $user['role'],
                    'profile_id' => $profileId,
                ],
                'token' => $token,
            ], 'Inscription réussie', 201);

        } catch (\Exception $e) {
            error_log('Registration error: ' . $e->getMessage());
            $this->error('Erreur lors de l\'inscription', 500);
        }
    }

    /**
     * Login user
     * POST /auth/login
     */
    public function login(Request $request): void
    {
        $data = $this->validate($request->getBody(), [
            'email' => 'required|email',
            'password' => 'required',
        ]);

        // Find user
        $user = $this->userModel->findByEmail($data['email']);

        if (!$user) {
            $this->error('Email ou mot de passe incorrect', 401);
            return;
        }

        // Verify password
        if (!$this->userModel->verifyPassword($data['password'], $user['password'])) {
            $this->error('Email ou mot de passe incorrect', 401);
            return;
        }

        // Check if active
        if (!$user['is_active']) {
            $this->error('Votre compte a été désactivé', 403);
            return;
        }

        // Generate token
        $token = $this->authService->generateToken($user['id'], $user['role']);

        // Get profile
        $profile = null;
        if ($user['role'] === 'coach') {
            $profile = $this->coachModel->findByUserId($user['id']);
        } else {
            $profile = $this->sportifModel->findByUserId($user['id']);
        }

        $this->success([
            'user' => [
                'id' => $user['id'],
                'email' => $user['email'],
                'role' => $user['role'],
                'profile' => $profile,
            ],
            'token' => $token,
        ], 'Connexion réussie');
    }

    /**
     * Get current user
     * GET /auth/me
     */
    public function me(Request $request): void
    {
        $user = $GLOBALS['auth_user'] ?? null;

        if (!$user) {
            $this->error('Non authentifié', 401);
            return;
        }

        // Get full profile
        $profile = null;
        if ($user['role'] === 'coach') {
            $profile = $this->coachModel->findByUserId($user['id']);
        } else {
            $profile = $this->sportifModel->findByUserId($user['id']);
        }

        $this->success([
            'id' => $user['id'],
            'email' => $user['email'],
            'role' => $user['role'],
            'profile' => $profile,
        ]);
    }

    /**
     * Logout user
     * POST /auth/logout
     */
    public function logout(Request $request): void
    {
        // In JWT, logout is handled client-side by removing the token
        // Optionally, you can blacklist the token here
        $this->success(null, 'Déconnexion réussie');
    }

    /**
     * Request password reset
     * POST /auth/forgot-password
     */
    public function forgotPassword(Request $request): void
    {
        $data = $this->validate($request->getBody(), [
            'email' => 'required|email',
        ]);

        $user = $this->userModel->findByEmail($data['email']);

        // Always return success to prevent email enumeration
        if (!$user) {
            $this->success(null, 'Si cet email existe, vous recevrez un lien de réinitialisation');
            return;
        }

        // Generate reset token
        $token = bin2hex(random_bytes(32));
        $this->userModel->setResetToken($user['id'], $token);

        // Send email
        try {
            $emailService = new EmailService();
            $resetLink = $_ENV['APP_URL'] . '/reset-password?token=' . $token;
            
            $emailService->send(
                $user['email'],
                'Réinitialisation de votre mot de passe',
                "Cliquez sur ce lien pour réinitialiser votre mot de passe: {$resetLink}\n\nCe lien expire dans 1 heure."
            );
        } catch (\Exception $e) {
            error_log('Email error: ' . $e->getMessage());
        }

        $this->success(null, 'Si cet email existe, vous recevrez un lien de réinitialisation');
    }

    /**
     * Reset password
     * POST /auth/reset-password
     */
    public function resetPassword(Request $request): void
    {
        $data = $this->validate($request->getBody(), [
            'token' => 'required',
            'password' => 'required|password|min:8',
        ]);

        $user = $this->userModel->findByResetToken($data['token']);

        if (!$user) {
            $this->error('Token invalide ou expiré', 400);
            return;
        }

        // Update password
        $this->userModel->updatePassword($user['id'], $data['password']);
        $this->userModel->clearResetToken($user['id']);

        $this->success(null, 'Mot de passe réinitialisé avec succès');
    }

    /**
     * Change password
     * PUT /auth/change-password
     */
    public function changePassword(Request $request): void
    {
        $user = $GLOBALS['auth_user'];

        $data = $this->validate($request->getBody(), [
            'current_password' => 'required',
            'new_password' => 'required|password|min:8',
        ]);

        // Get full user with password
        $fullUser = $this->userModel->findByEmail($user['email']);

        if (!$this->userModel->verifyPassword($data['current_password'], $fullUser['password'])) {
            $this->error('Mot de passe actuel incorrect', 400);
            return;
        }

        $this->userModel->updatePassword($user['id'], $data['new_password']);

        $this->success(null, 'Mot de passe modifié avec succès');
    }

    /**
     * Update email
     * PUT /auth/update-email
     */
    public function updateEmail(Request $request): void
    {
        $user = $GLOBALS['auth_user'];

        $data = $this->validate($request->getBody(), [
            'email' => 'required|email',
            'password' => 'required',
        ]);

        // Verify password
        $fullUser = $this->userModel->findByEmail($user['email']);

        if (!$this->userModel->verifyPassword($data['password'], $fullUser['password'])) {
            $this->error('Mot de passe incorrect', 400);
            return;
        }

        // Check if new email exists
        if ($this->userModel->emailExists($data['email'], $user['id'])) {
            $this->error('Cet email est déjà utilisé', 409);
            return;
        }

        $this->userModel->update($user['id'], [
            'email' => $data['email'],
            'email_verified' => false,
        ]);

        $this->success(null, 'Email modifié avec succès');
    }
}
