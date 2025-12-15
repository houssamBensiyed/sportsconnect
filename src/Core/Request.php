<?php

namespace App\Core;

class Request
{
    private string $method;
    private string $uri;
    private array $params = [];
    private array $body = [];
    private array $query = [];
    private array $headers = [];
    private array $files = [];

    public function __construct()
    {
        $this->method = $_SERVER['REQUEST_METHOD'];
        $this->uri = $this->parseUri();
        $this->query = $_GET;
        $this->headers = $this->parseHeaders();
        $this->files = $_FILES;
        $this->body = $this->parseBody();
    }

    private function parseUri(): string
    {
        $uri = $_SERVER['REQUEST_URI'] ?? '/';
        $uri = parse_url($uri, PHP_URL_PATH);
        $uri = rawurldecode($uri);

        // Remove /api prefix if exists
        $uri = preg_replace('#^/api#', '', $uri);

        return $uri ?: '/';
    }

    private function parseHeaders(): array
    {
        $headers = [];
        foreach ($_SERVER as $key => $value) {
            if (str_starts_with($key, 'HTTP_')) {
                $header = str_replace('_', '-', substr($key, 5));
                $headers[$header] = $value;
            }
        }
        return $headers;
    }

    private function parseBody(): array
    {
        $contentType = $this->headers['CONTENT-TYPE'] ?? '';

        if (str_contains($contentType, 'application/json')) {
            $input = file_get_contents('php://input');
            return json_decode($input, true) ?? [];
        }

        if (in_array($this->method, ['POST', 'PUT', 'PATCH'])) {
            return $_POST;
        }

        return [];
    }

    public function getMethod(): string
    {
        return $this->method;
    }

    public function getUri(): string
    {
        return $this->uri;
    }

    public function setParams(array $params): void
    {
        $this->params = $params;
    }

    public function getParam(string $key, $default = null)
    {
        return $this->params[$key] ?? $default;
    }

    public function getBody(): array
    {
        return $this->body;
    }

    public function input(string $key, $default = null)
    {
        return $this->body[$key] ?? $default;
    }

    public function query(string $key, $default = null)
    {
        return $this->query[$key] ?? $default;
    }

    public function getHeader(string $key): ?string
    {
        $key = strtoupper(str_replace('-', '_', $key));
        return $this->headers[$key] ?? null;
    }

    public function getBearerToken(): ?string
    {
        $auth = $this->getHeader('Authorization');
        if ($auth && preg_match('/Bearer\s+(.*)$/i', $auth, $matches)) {
            return $matches[1];
        }
        return null;
    }

    public function getFile(string $key): ?array
    {
        return $this->files[$key] ?? null;
    }

    public function all(): array
    {
        return array_merge($this->query, $this->body);
    }
}