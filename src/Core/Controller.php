<?php

namespace App\Core;

use App\Helpers\Response;
use App\Helpers\Validator;

abstract class Controller
{
    protected Database $db;
    protected ?array $user = null;

    public function __construct()
    {
        $this->db = Database::getInstance();
    }

    protected function setUser(array $user): void
    {
        $this->user = $user;
    }

    protected function getUser(): ?array
    {
        return $this->user;
    }

    protected function validate(array $data, array $rules): array
    {
        $validator = new Validator($data, $rules);

        if (!$validator->validate()) {
            Response::error('Validation failed', 422, $validator->getErrors());
            exit;
        }

        return $validator->getSanitized();
    }

    protected function json(array $data, int $status = 200): void
    {
        Response::json($data, $status);
    }

    protected function success($data = null, string $message = 'Success', int $status = 200): void
    {
        Response::success($data, $message, $status);
    }

    protected function error(string $message, int $status = 400, $errors = null): void
    {
        Response::error($message, $status, $errors);
    }
}