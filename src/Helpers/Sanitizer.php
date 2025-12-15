<?php

namespace App\Helpers;

class Sanitizer
{
    public static function clean($value)
    {
        if (is_array($value)) {
            return array_map([self::class, 'clean'], $value);
        }

        if (is_string($value)) {
            $value = trim($value);
            $value = stripslashes($value);
            $value = htmlspecialchars($value, ENT_QUOTES, 'UTF-8');
        }

        return $value;
    }

    public static function email(string $email): string
    {
        return filter_var(trim($email), FILTER_SANITIZE_EMAIL);
    }

    public static function int($value): int
    {
        return (int) filter_var($value, FILTER_SANITIZE_NUMBER_INT);
    }

    public static function float($value): float
    {
        return (float) filter_var($value, FILTER_SANITIZE_NUMBER_FLOAT, FILTER_FLAG_ALLOW_FRACTION);
    }

    public static function url(string $url): string
    {
        return filter_var(trim($url), FILTER_SANITIZE_URL);
    }

    public static function filename(string $filename): string
    {
        $filename = preg_replace('/[^a-zA-Z0-9_\-.]/', '', $filename);
        return substr($filename, 0, 255);
    }
}