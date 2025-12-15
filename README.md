# SportsConnect API

## Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   composer install
   ```

3. Copy `.env.example` to `.env` and configure:
   ```bash
   cp .env.example .env
   ```

4. Import the database:
   ```bash
   mysql -u root -p < database/sportsconnect.sql
   ```

5. Create upload directories:
   ```bash
   mkdir -p uploads/profiles uploads/certifications logs
   chmod -R 755 uploads logs
   ```

6. Start the server:
   ```bash
   composer start
   # or
   php -S localhost:8000 -t public
   ```

## API Base URL

```
http://localhost:8000/api
```

## Authentication

The API uses JWT (JSON Web Tokens) for authentication.

Include the token in the Authorization header:
```
Authorization: Bearer YOUR_TOKEN
```

## Response Format

All responses follow this format:

### Success
```json
{
  "success": true,
  "message": "Success message",
  "data": { ... }
}
```

### Error
```json
{
  "success": false,
  "message": "Error message",
  "errors": { ... }
}
```

### Paginated
```json
{
  "success": true,
  "data": [ ... ],
  "meta": {
    "total": 100,
    "page": 1,
    "per_page": 10,
    "total_pages": 10
  }
}
```

## License

MIT
