<?php

namespace App\Helpers;

class Validator
{
    private array $data;
    private array $rules;
    private array $errors = [];
    private array $sanitized = [];

    public function __construct(array $data, array $rules)
    {
        $this->data = $data;
        $this->rules = $rules;
    }

    public function validate(): bool
    {
        foreach ($this->rules as $field => $ruleString) {
            $rules = explode('|', $ruleString);
            $value = $this->data[$field] ?? null;

            foreach ($rules as $rule) {
                $params = [];
                if (str_contains($rule, ':')) {
                    [$rule, $paramString] = explode(':', $rule, 2);
                    $params = explode(',', $paramString);
                }

                $method = 'validate' . ucfirst($rule);
                if (method_exists($this, $method)) {
                    if (!$this->$method($field, $value, $params)) {
                        break;
                    }
                }
            }

            if (!isset($this->errors[$field]) && $value !== null) {
                $this->sanitized[$field] = $this->sanitize($value);
            }
        }

        return empty($this->errors);
    }

    public function getErrors(): array
    {
        return $this->errors;
    }

    public function getSanitized(): array
    {
        return $this->sanitized;
    }

    private function sanitize($value)
    {
        if (is_string($value)) {
            return htmlspecialchars(trim($value), ENT_QUOTES, 'UTF-8');
        }
        return $value;
    }

    private function addError(string $field, string $message): void
    {
        if (!isset($this->errors[$field])) {
            $this->errors[$field] = [];
        }
        $this->errors[$field][] = $message;
    }

    private function validateRequired(string $field, $value): bool
    {
        if ($value === null || $value === '') {
            $this->addError($field, "Le champ {$field} est obligatoire");
            return false;
        }
        return true;
    }

    private function validateEmail(string $field, $value): bool
    {
        if ($value && !filter_var($value, FILTER_VALIDATE_EMAIL)) {
            $this->addError($field, "Le champ {$field} doit être un email valide");
            return false;
        }
        return true;
    }

    private function validateMin(string $field, $value, array $params): bool
    {
        $min = (int) $params[0];
        if (is_string($value) && strlen($value) < $min) {
            $this->addError($field, "Le champ {$field} doit contenir au moins {$min} caractères");
            return false;
        }
        if (is_numeric($value) && $value < $min) {
            $this->addError($field, "Le champ {$field} doit être au moins {$min}");
            return false;
        }
        return true;
    }

    private function validateMax(string $field, $value, array $params): bool
    {
        $max = (int) $params[0];
        if (is_string($value) && strlen($value) > $max) {
            $this->addError($field, "Le champ {$field} ne doit pas dépasser {$max} caractères");
            return false;
        }
        if (is_numeric($value) && $value > $max) {
            $this->addError($field, "Le champ {$field} ne doit pas dépasser {$max}");
            return false;
        }
        return true;
    }

    private function validateNumeric(string $field, $value): bool
    {
        if ($value && !is_numeric($value)) {
            $this->addError($field, "Le champ {$field} doit être un nombre");
            return false;
        }
        return true;
    }

    private function validateDate(string $field, $value): bool
    {
        if ($value && !strtotime($value)) {
            $this->addError($field, "Le champ {$field} doit être une date valide");
            return false;
        }
        return true;
    }

    private function validateIn(string $field, $value, array $params): bool
    {
        if ($value && !in_array($value, $params)) {
            $allowed = implode(', ', $params);
            $this->addError($field, "Le champ {$field} doit être parmi: {$allowed}");
            return false;
        }
        return true;
    }

    private function validatePhone(string $field, $value): bool
    {
        if ($value && !preg_match('/^[0-9+\s\-().]{8,20}$/', $value)) {
            $this->addError($field, "Le champ {$field} doit être un numéro de téléphone valide");
            return false;
        }
        return true;
    }

    private function validatePassword(string $field, $value): bool
    {
        if ($value && !preg_match('/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/', $value)) {
            $this->addError($field, "Le mot de passe doit contenir au moins 8 caractères, une majuscule, une minuscule et un chiffre");
            return false;
        }
        return true;
    }
}