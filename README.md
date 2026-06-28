# Auth Hono — Cloudflare D1 + Drizzle ORM

## Tech Stack

- **Hono** — Web framework (lightweight, fast)
- **Cloudflare D1** — Serverless SQLite database
- **Drizzle ORM** — Type-safe SQL query builder
- **JWT** — Authentication (via `hono/jwt`)
- **PBKDF2** — Password hashing (Web Crypto API)

---

## Step-by-Step Setup

### 1. Install Dependencies

```bash
pnpm install
```

### 2. Login to Cloudflare

```bash
npx wrangler login
```

### 3. Create D1 Database

```bash
npx wrangler d1 create auth-hono-db
```

Wrangler will return a `database_id` (UUID). It automatically updates `wrangler.jsonc` for you.

> **Important:** If Wrangler asks for a binding name, enter **`DB`** (the code uses `env.DB`).

### 4. Set JWT Secret

```bash
npx wrangler secret put JWT_SECRET
```

Enter a strong random string (e.g. `openssl rand -hex 32`).

### 5. Apply Database Migration

Run this to create the `users` table:

```bash
pnpm db:migrate:remote
```

### 6. Deploy

```bash
pnpm deploy
```

### 7. Test It

```bash
# Register a user
curl -X POST https://auth-hono.sovannaro066.workers.dev/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Alice","email":"alice@example.com","password":"secret123"}'

# Login
curl -X POST https://auth-hono.sovannaro066.workers.dev/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"alice@example.com","password":"secret123"}'

# Save the returned token, then list users
TOKEN="paste-token-here"
curl https://auth-hono.sovannaro066.workers.dev/users \
  -H "Authorization: Bearer $TOKEN"

# Without token → 401
curl https://auth-hono.sovannaro066.workers.dev/users
```

---

## Local Development

```bash
# Start dev server
pnpm dev

# Apply migration to local D1
pnpm db:migrate:local

# Test locally (replace URL with http://localhost:8787)
curl http://localhost:8787/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","email":"test@test.com","password":"pass123"}'
```

---

## If You Change the Schema

```bash
# 1. Edit src/db/schema.ts
# 2. Generate new migration SQL
pnpm db:generate
# 3. Copy the new file to migrations/
cp drizzle/0001_*.sql migrations/0002_*.sql
# 4. Apply to remote
pnpm db:migrate:remote
```

---

## Debugging

```bash
# Live tail logs from the deployed Worker
npx wrangler tail

# Re-generate TypeScript types after config changes
pnpm cf-typegen
```

---

## API Reference

| Method | Endpoint | Auth | Body |
|--------|----------|------|------|
| POST | `/auth/register` | No | `{ name, email, password }` |
| POST | `/auth/login` | No | `{ email, password }` |
| GET | `/users` | Bearer token | — |

## Project Structure

```
src/
├── index.ts               # Main app, routes, CORS
├── db/
│   ├── schema.ts          # Drizzle table definitions
│   └── index.ts           # D1 connection helper
├── middleware/
│   └── auth.ts            # JWT verification middleware
├── routes/
│   ├── auth.ts            # Login / Register handlers
│   └── users.ts           # List users handler (protected)
└── utils/
    └── password.ts        # PBKDF2 hash + verify
```
