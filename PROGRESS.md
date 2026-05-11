# PROGRESS.md
# Travel Community App — Dev Log

## Status: Phase 1 | Day 3 | 2026-05-11

## Current sprint task
→ **NEXT TASK: Setup Supabase project + .env.local → run `npx prisma migrate dev --name init`**
→ Then: ทดสอบ Google OAuth flow (/login → callback → /feed)
→ Then: ดึง real user data จาก Supabase ใน Profile + AppShell

---

## Phase completion
- [ ] Phase 1: Foundation (target: 23 May 2026)
  - [x] Project setup (Next.js 16 + Tailwind + TypeScript)
  - [x] Migrate to Supabase stack (Postgres + Supabase Auth)
  - [x] Fix foundation bugs (layout, schema, duplicates)
  - [x] Shadcn/ui setup (Button component)
  - [ ] Supabase project created + .env.local configured
  - [ ] DB migration run (`prisma migrate dev`)
  - [x] Auth pages: /login, /register (UI complete, needs real Supabase wiring)
  - [x] Middleware protecting /feed /profile /trips
  - [x] User profile page (/profile — UI complete)
  - [x] PWA manifest + mobile meta tags
  - [x] Responsive AppShell (sidebar desktop + bottom nav mobile)
  - [x] Feed page redesign (stories + posts + right panel)
  - [x] Place Detail page (/place/[slug]) — full info: carousel, hours, map, transport, caution, parking, reviews, nearby
  - [x] Explore/Search page (/explore) — filter by category + region + keyword
  - [x] Trips page (/trips) — trip planning list
  - [ ] Supabase project created + .env.local configured
  - [ ] DB migration run (`prisma migrate dev`)
  - [x] /notifications page (unread count, mark-all-read, buddy request card)
  - [x] /settings page (toggles: notification, privacy, dark mode)
  - [x] /buddy page (Travel Buddy discovery, like/pass/match)
  - [x] /trips/[id] page (itinerary builder, day tabs, budget bar, add/delete items)
  - [x] /trips/new page (3-step wizard: destination → dates+budget → privacy)
  - [x] /profile/edit page (edit form, avatar upload stub)
  - [x] /forgot-password + /auth/reset-password pages
  - [x] /api/auth/callback route (Supabase OAuth exchange)
  - [x] useUser hook (Supabase auth state, onAuthStateChange)
  - [x] AppShell: user card + sign out button using useUser
  - [x] PostCard: interactive like/save with optimistic update
  - [x] Prisma schema: full Phase 1-2 models (Place, Post, Like, Comment, Save, Trip, TripDay, TripItem, Follow, Notification, BuddyRequest, Review)
  - [x] server/actions/profile.ts stubs
  - [ ] Connect auth to real Supabase OAuth
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
- PWA manifest + viewport meta (installable on iOS/Android)
- Responsive AppShell (desktop sidebar + mobile bottom nav)
- Landing page (/) with hero + destinations grid
- Feed page (/feed) — stories, posts, trending sidebar
- Place Detail page (/place/[slug]) — comprehensive travel info
- Explore page (/explore) — search + category + region filters
- Trips page (/trips) — trip planning
- Profile page (/profile) — user stats + posts grid

### In progress 🔧
- Supabase project setup (user needs to create project + .env.local)
- Auth wiring (UI exists, needs real Supabase OAuth integration)

### Not started ⬜
- Posts create/like (real data)
- My Trip CRUD
- Travel Buddy
- Image upload (Cloudinary)

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
| 2026-05-09 | UI Sprint: AppShell + Feed + Place Detail + Explore + Trips + Profile (all pages with mock data) | ~70% | Supabase project setup + wire real auth |
| 2026-05-09 | Foundation code: types/index.ts, validations (Zod v4), loading skeletons x5, error.tsx, create post page, server action stubs | ~95% | Setup .env.local → prisma migrate dev → wire auth |
| 2026-05-11 | Day 3: notifications, settings, buddy, trips/[id], trips/new, profile/edit, forgot-password, auth callback, useUser hook, AppShell user card, PostCard interactive, Prisma schema expanded, profile server actions | ~60% | Setup Supabase .env.local → migrate → test OAuth |
