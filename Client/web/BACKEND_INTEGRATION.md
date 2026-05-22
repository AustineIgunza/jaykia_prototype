# Backend Integration Guide — for the backend developer

The frontend at `Client/web` is ready to connect. These issues in `Server/` must be
fixed before the two can talk.

---

## CRITICAL — Frontend cannot connect at all

### 1. CORS header typo (`Router.ts` ~line 19)

```diff
- res.setHeader("Access-Control-Allow-Origins", "*");
+ res.setHeader("Access-Control-Allow-Origin", "*");
```

Browser CORS checks use the singular form. The plural is ignored.

### 2. Allow `Authorization` header in CORS (`Router.ts`)

```diff
- res.setHeader("Access-Control-Allow-Headers", "accept,content-type,content-length");
+ res.setHeader("Access-Control-Allow-Headers", "accept,content-type,content-length,authorization");
```

The frontend sends `Authorization: Bearer <token>` on protected requests. Without
this, the browser blocks the preflight.

### 3. Register auth routes (`Routes.ts`)

Auth controller exists but isn't in the routes array:

```typescript
import { AuthController } from "./Src/Modules/Auth/auth.controller.js";

// Add to the routes array:
{ name: "auth", controller: AuthController }
```

### 4. Implement auth handlers (`auth.controller.ts`)

`register/legacy` and `login/legacy` are empty blocks. The frontend expects:

**POST /auth/register/legacy**
Request: `{ username, email, password }`
Response: `{ accessToken, refreshToken }` (status 201)

**POST /auth/login/legacy**
Request: `{ email, password }`
Response: `{ accessToken, refreshToken }` (status 200)

Flow:
- Register: hash password with bcrypt, insert into `users` table, generate tokens with
  `encode_access_token({ userId: user.id })`, return tokens.
- Login: find user by email, compare password with bcrypt, generate tokens, return.

The JWT payload MUST include `userId` — the frontend's `AuthChecker` and our auth
context both extract `userId` from the decoded token.

---

## HIGH — Endpoints exist but are broken

### 5. Fix SQL bugs in `user.repository.ts`

**Line ~21 — createUser() missing values parameter:**
```diff
- const result = await this.database.query(sqlQuery);
+ const result = await this.database.query(sqlQuery, values);
```

**Line ~43 — editUser() missing table name:**
```diff
- `UPDATE SET ${keys.join(",")} WHERE id=$1`
+ `UPDATE users SET ${keys.join(",")} WHERE id=$1`
```

**Line ~73 — getAllUsers() incomplete query:**
```diff
- "SELECT * FROM users WHERE"
+ "SELECT * FROM users"
```

### 6. Fix getUserRoles query (`user_roles.repository.ts`)

Add WHERE clause to filter by user:
```diff
- "SELECT ... FROM user_roles ur INNER JOIN roles r ON ur.role_id=r.id"
+ "SELECT ... FROM user_roles ur INNER JOIN roles r ON ur.role_id=r.id WHERE ur.user_id=$1"
```
And pass `[userId]` as the query parameter.

### 7. Add JWT expiry (`Utilities/jwt.ts`)

```diff
- jwt.sign(details, secret)
+ jwt.sign(details, secret, { expiresIn: "1h" })
```
Same for refresh tokens (use a longer expiry like `"7d"`).

---

## MEDIUM — Quality of life

### 8. Add start script (`package.json`)

```json
"scripts": {
  "dev": "tsx --watch Server.ts",
  "start": "tsx Server.ts",
  "migrations": "npx tsx ./Migrations/Migrations.ts"
}
```

### 9. Implement user CRUD stubs

`GET /users/:id`, `POST /users`, `PATCH /users/:id`, `DELETE /users/:id` are all
empty blocks in `user.controller.ts`. The repository methods exist (once SQL bugs are
fixed).

---

## LATER — Unimplemented modules

These controllers are empty. The frontend has full mock data for all of them and will
switch to real calls when `NEXT_PUBLIC_USE_MOCKS=false`:

| Module | Expected endpoints | DB table exists |
|--------|-------------------|-----------------|
| Bookings | CRUD at `/bookings` | `booking` ✓ |
| Payments | CRUD at `/payments` | `payments` ✓ |
| Ratings | CRUD at `/ratings` | `ratings` ✓ |
| Refunds | CRUD at `/refunds` | `refunds` ✓ |
| Feedback | CRUD at `/feedback` | `feedback` ✓ |
| Analytics | GET at `/analytics` | `analytics` ✓ |
| Permissions | CRUD at `/permissions` | `permissions` ✓ |

See `Client/web/lib/api/types.ts` for the exact request/response shapes the frontend
expects. Every assumption is marked with `// TODO: verify against backend`.

---

## Frontend env vars

Set these in `Client/web/.env.local`:

```
NEXT_PUBLIC_API_BASE_URL=http://localhost:3001   # or whatever port the backend runs on
NEXT_PUBLIC_USE_MOCKS=false                       # switch to real API
```

The backend's `PORT` env var and the frontend's `NEXT_PUBLIC_API_BASE_URL` must match.

---

## Testing the connection

Once CORS + auth are fixed:

```bash
# Terminal 1 — backend (from Server/)
npx tsx Server.ts

# Terminal 2 — frontend (from Client/web/)
npm run dev

# Quick test — should return roles JSON:
curl http://localhost:3001/roles
```

Then set `NEXT_PUBLIC_USE_MOCKS=false` in `.env.local` and restart the frontend dev
server.
