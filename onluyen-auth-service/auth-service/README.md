# OnLuyen Auth Service

Production-ready authentication backend for the OnLuyen quiz platform.
Node.js + Express + TypeScript + PostgreSQL.

## Features
- Register / login with bcrypt password hashing (cost 12)
- Short-lived JWT access tokens (15 min) + opaque, rotating refresh tokens
  stored **hashed** in PostgreSQL (httpOnly, SameSite=strict cookie) —
  individually revocable, unlike stateless JWT refresh tokens
- Refresh-token rotation: each `/refresh` call revokes the old token and
  issues a new pair, limiting the blast radius of a stolen token
- Forgot / reset password flow (time-limited, single-use, hashed tokens;
  revokes all sessions on password change)
- Role-based access control (`user` / `admin`) via `requireRole` middleware
- Zod request validation, centralized error handling, rate limiting on
  auth endpoints, Helmet security headers, CORS with credentials

## Project layout
```
src/
  config/env.ts          typed, validated environment config
  db/pool.ts              pg connection pool
  db/migrate.ts            SQL migration runner
  db/migrations/*.sql      versioned schema migrations
  middleware/              auth guard, role guard, error handler, rate limit, validation
  modules/auth/             register/login/refresh/logout/forgot/reset
  modules/users/            profile read/update
  utils/                    jwt, password hashing, ApiError, asyncHandler
  app.ts                    Express app assembly
  server.ts                 entrypoint
```

## Setup
```bash
cp .env.example .env        # fill in real secrets
npm install
npm run migrate             # applies src/db/migrations/*.sql
npm run dev                 # http://localhost:4000
```

Or with Docker (spins up Postgres + the service):
```bash
docker compose up --build
docker compose exec auth-service npm run migrate
```

## API
| Method | Path                        | Auth        | Notes                                   |
|--------|-----------------------------|-------------|------------------------------------------|
| POST   | /api/auth/register          | —           | body: email, password, name              |
| POST   | /api/auth/login              | —           | body: email, password                    |
| POST   | /api/auth/refresh            | cookie      | rotates refresh token, returns new access token |
| POST   | /api/auth/logout             | cookie      | revokes current refresh token             |
| POST   | /api/auth/forgot-password     | —           | body: email                               |
| POST   | /api/auth/reset-password      | —           | body: token, newPassword                  |
| GET    | /api/users/me                 | Bearer      | current user profile                      |
| PATCH  | /api/users/me                 | Bearer      | body: name                                |

`register` and `login` return `{ user, accessToken }` and set the refresh
token as an httpOnly cookie. Send `accessToken` as `Authorization: Bearer <token>`
on subsequent requests; call `/api/auth/refresh` (with credentials) when it expires.

## Connecting the quiz app (frontend)
The quiz app currently keys its `window.storage` data per anonymous session.
To attach it to a real account: after login, call the same storage keys
(`progress`, `wrong-ids`, `bookmark-ids`, `question-bank`) scoped by
`user.id` instead — or, for full server-side sync, add a `progress` table
keyed on `user_id` and expose `GET/PUT /api/progress` in a new module
following the same `modules/<name>/` pattern used here.

## Security notes
- Passwords never logged or returned in responses.
- Refresh tokens are opaque (not JWT) and stored as SHA-256 hashes —
  a database leak alone cannot be used to impersonate a session.
- `forgotPassword` always responds identically whether or not the email
  exists, to prevent account enumeration.
- Set `COOKIE_SECURE=true` and a real `COOKIE_DOMAIN` in production (HTTPS required).
- Wire a real transactional email provider into `authService.forgotPassword`
  before going to production — it currently only logs the reset token in
  non-production environments.
