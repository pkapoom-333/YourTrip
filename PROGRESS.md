# PROGRESS.md
# Travel Community App — Dev Log

## Status: Phase 1 | Day 1 | 2026-05-09

## Current sprint task
→ **NEXT TASK: Setup Supabase project + .env.local → run `npx prisma migrate dev`**

---

## Phase completion
- [ ] Phase 1: Foundation (target: 23 May 2026)
  - [x] Project setup (Next.js 16 + Tailwind + TypeScript)
  - [x] Migrate to Supabase stack (Postgres + Supabase Auth)
  - [x] Fix foundation bugs (layout, schema, duplicates)
  - [x] Shadcn/ui setup (Button component)
  - [ ] Supabase project created + .env.local configured
  - [ ] DB migration run (`prisma migrate dev`)
  - [ ] Auth pages: /login, /register
  - [ ] Middleware protecting /feed /profile /trips
  - [ ] User profile page (view)
- [ ] Phase 2: Core Features (target: 13 Jun 2026)
  - [ ] Posts & Feed (create, list, like)
  - [ ] My Trip (CRUD + itinerary)
  - [ ] Image upload (Cloudinary)
- [ ] Phase 3: Social Layer (target: 30 Jun 2026)
  - [ ] Follow/unfollow
  - [ ] Travel Buddy matching
  - [ ] Notifications
- [ ] Phase 4: Polish & Launch (target: 14 Jul 2026)
  - [ ] Search (Postgres full-text)
  - [ ] Performance tuning
  - [ ] Deploy to Vercel

---

## Features status

### Done ✅
- Next.js 16 + TypeScript + Tailwind setup
- Supabase stack migration (replaced SQLite + NextAuth)
- Shadcn/ui Button component
- Middleware auth guard (protect /feed /profile /trips /buddy)
- Google OAuth via Supabase Auth

### In progress 🔧
- Supabase project setup (user needs to create project + .env.local)

### Not started ⬜
- Auth pages (/login /register)
- Posts / Feed
- My Trip
- Travel Buddy
- Search

---

## Stack
- Frontend: Next.js 16 App Router + Tailwind + Shadcn/ui
- Auth: Supabase Auth (Google OAuth)
- Database: Supabase Postgres + Prisma ORM
- Storage: Cloudinary (Phase 2+)
- Deploy: Vercel

## Architecture decisions
- Supabase Auth (not custom JWT) — simpler for solo dev
- Shadcn/ui Slate theme with CSS variables
- Prisma as ORM on top of Supabase Postgres
- `lib/supabase/client.ts` → browser | `lib/supabase/server.ts` → server components

## Known issues / tech debt
- TODO: add rate limiting to API routes
- TODO: replace mock data in /explore (Phase 2)
- TODO: Cloudinary integration for image upload

---

## Session log

| Date | Completed | Token% | Next |
|------|-----------|--------|------|
| 2026-05-09 | Foundation: Supabase migration + bug fixes + Shadcn/ui | ~40% | Create Supabase project + auth pages |
