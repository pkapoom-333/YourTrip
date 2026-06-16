# Feature Prompt: Backend Scale — Stage 2

> ทำหลัง launch Phase 1, เมื่อมี real users

```
## Backend Migration: Stage 1 → Stage 2

### Goal
Separate API from Next.js monolith. Add caching + job queue.

### New services to add
1. Hono API server (Railway) — replace Next.js API routes
2. Upstash Redis — cache feed, sessions, rate limiting
3. BullMQ — async jobs (email, notifications, image processing)
4. Read replica — Supabase Pro adds this automatically

### Migration order
Step 1: Create Hono app on Railway. Copy auth routes first.
Step 2: Update Next.js to call Railway API instead of /api/*
Step 3: Add Redis cache to feed endpoint (TTL: 30s)
Step 4: Move notification sending to BullMQ queue
Step 5: Add rate limiting middleware to API gateway

### Caching strategy
- Feed (GET /feed) → Redis, TTL 30s, invalidate on new post
- User profile → Redis, TTL 5min, invalidate on profile edit
- Search results → Redis, TTL 1min
- Auth session → Supabase manages (no Redis needed)

### Database scale rules
- All reads → replica (env: DATABASE_REPLICA_URL)
- All writes → primary (env: DATABASE_URL)
- Use Prisma $transaction for multi-step writes
- Add indexes on: userId, createdAt, destination, status
- Paginate EVERYTHING — never SELECT * without LIMIT

### Do NOT add yet
- Kafka / message streaming (Stage 3+)
- Multi-region (Stage 4+)
- Elasticsearch (Stage 3+) — use Postgres full-text for now

### Deploy targets
- Frontend: Vercel (already)
- Hono API: Railway
- Redis: Upstash (serverless)
- Queue: BullMQ on Railway (same instance as Hono)

Start with: Hono server setup + auth route migration
```
