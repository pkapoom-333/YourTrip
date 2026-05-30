# PROGRESS.md
# Travel Community App — Dev Log

## Status: Phase 1 | Day 5 | 2026-05-25

## Current sprint task
→ **DONE**: Prisma 7 runtime connection fixed (@prisma/adapter-pg)
→ **DONE**: DB seeded (11 places)
→ **DONE**: Build passes clean (0 TS errors, all pages dynamic)
→ **NEXT**: Add Cloudinary env vars → test image upload → deploy to Vercel

---

## Phase completion
- [ ] Phase 1: Foundation (target: 23 May 2026)
  - [x] Project setup (Next.js 16 + Tailwind + TypeScript)
  - [x] Migrate to Supabase stack (Postgres + Supabase Auth)
  - [x] Fix foundation bugs (layout, schema, duplicates)
  - [x] Shadcn/ui setup (Button component)
  - [x] Supabase project created + .env.local configured
  - [x] DB schema created (via SQL editor) + seeded (11 places)
  - [x] Auth pages: /login, /register (UI complete, needs real Supabase wiring)
  - [x] Middleware protecting /feed /profile /trips
  - [x] User profile page (/profile — UI complete)
  - [x] PWA manifest + mobile meta tags
  - [x] Responsive AppShell (sidebar desktop + bottom nav mobile)
  - [x] Feed page redesign (stories + posts + right panel)
  - [x] Place Detail page (/place/[slug]) — server page + PlaceDetailClient, wired to getPlaceBySlug
  - [x] Explore/Search page (/explore) — filter by category + region + keyword
  - [x] Trips page (/trips) — trip planning list
  - [x] Supabase project created + .env.local configured
  - [x] DB migration run (via SQL editor — Prisma 7 direct migration blocked on free tier)
  - [x] /notifications page (unread count, mark-all-read, buddy request card)
  - [x] /settings page (toggles: notification, privacy, dark mode)
  - [x] /buddy page (Travel Buddy discovery, like/pass/match — wired to server actions)
  - [x] /trips/[id] page (itinerary builder, day tabs, budget bar, add/delete items — wired to server actions)
  - [x] /trips/new page (3-step wizard: destination → dates+budget → privacy)
  - [x] /profile/edit page (edit form, avatar upload stub)
  - [x] /forgot-password + /auth/reset-password pages
  - [x] /api/auth/callback route (Supabase OAuth exchange)
  - [x] useUser hook (Supabase auth state, onAuthStateChange)
  - [x] AppShell: user card + sign out button using useUser
  - [x] PostCard: interactive like/save with optimistic update
  - [x] CommentSection: expandable comments with like/reply/optimistic submit
  - [x] useLocalStorage: SSR-safe hook for persisting state
  - [x] Prisma schema: full Phase 1-2 models (Place, Post, Like, Comment, Save, Trip, TripDay, TripItem, Follow, Notification, BuddyRequest, Review)
  - [x] server/actions/profile.ts — real Prisma (posts, profile, places, trips all wired)
  - [x] server/actions/trips.ts — createTrip (auto TripDays), getUserTrips, getTripById, addItineraryItem, deleteTripItem, reorderItinerary, deleteTrip
  - [x] /profile/[userId] — public user profile (follow/unfollow optimistic, posts grid)
  - [x] /post/[id] — post detail page (image carousel, like/save/share, full comments)
  - [x] PostCard: user avatar/name links to /profile/[userId], image links to /post/[id]
  - [x] Avatar upload wired in /profile/edit (Cloudinary + instant preview + uploading state)
  - [x] Connect auth to real Supabase OAuth (Google login working ✅)
- [ ] Phase 2: Core Features (target: 13 Jun 2026)
  - [x] Posts & Feed (create, list, like) — wired to Prisma (needs DB)
  - [x] My Trip (CRUD + itinerary) — fully wired
  - [x] Image upload (Cloudinary) — /api/upload + ImageUpload component (needs CLOUDINARY_* env vars)
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
| 2026-05-11 | Day 3 cont.: CommentSection component (expandable, like/reply/optimistic), PostCard integrated, useLocalStorage hook, TypeScript clean, pushed to dev | ~80% | Setup Supabase .env.local → migrate → test OAuth |
| 2026-05-15 | Day 4: Wire server actions (posts/profile/places) w/ Prisma + mock fallback, seed script (11 places), refactor /explore → server page + ExploreClient, fix proxy.ts, fix preview config | ~40% | ใส่ .env.local → migrate → seed → test auth |
| 2026-05-15 | Day 4 cont.: Wire trips.ts (createTrip+auto TripDays, getUserTrips, getTripById, addItineraryItem, deleteTripItem, reorderItinerary, deleteTrip), confirm auth/callback route exists, add .claude/settings.json permission allowlist | ~55% | สร้าง Supabase project → .env.local → migrate → seed |
| 2026-05-15 | Day 4 cont.2: Wire /create post, /trips/new, /feed, /trips to server actions; refactor PostCard (avatarUrl+optional fields); TripsClient server+client split; MOCK fallback on all pages | ~75% | สร้าง Supabase project → .env.local → migrate → seed → test OAuth |
| 2026-05-16 | Day 4 cont.3: /place/[slug] server refactor + PlaceDetailClient; /trips/[id] wired (loadTrip+addItem+deleteItem); /profile wired (avatar+real stats); /profile/edit wired; permissions expanded | ~60% | สร้าง Supabase project → .env.local → migrate → seed → test OAuth |
| 2026-05-16 | Day 4 cont.4: notifications.ts server actions (get/mark-read/delete); /notifications wired (useEffect+mock fallback); buddy.ts (discover/requests/matched/send/accept/decline); /buddy wired (real data + optimistic UI) | ~75% | สร้าง Supabase project → .env.local → migrate → seed → test OAuth |
| 2026-05-16 | Day 4 cont.5: AppShell unread badge (live poll 60s); settings → useLocalStorage + real user + sign-out; CommentSection → getComments+createComment; createReview action + star picker form on /place/[slug] | ~85% | สร้าง Supabase project → .env.local → migrate → seed → test OAuth |
| 2026-05-16 | Day 4 cont.6 (/loop): Cloudinary upload (/api/upload + ImageUpload component + /create page); vercel.json + .env.example; profile real posts grid + saved tab; PWAInstallPrompt; feed infinite scroll (IntersectionObserver + cursor) | ~70% | สร้าง Supabase + .env.local → migrate → seed → add Cloudinary keys |
| 2026-05-17 | Day 5 (/loop): /profile/[userId] public profile (follow/unfollow optimistic + posts grid); avatar upload wired in /profile/edit (Cloudinary + preview + loading state); avatarUrl added to updateProfileSchema; PostCard user name/avatar → /profile/[userId]; /post/[id] detail page (image carousel, like/save/share, CommentSection, getPostById action) | ~40% | สร้าง Supabase project → .env.local → migrate → seed → test OAuth |
| 2026-05-25 | Day 5 cont: Prisma 7 fix (@prisma/adapter-pg driver); DB seeded (11 places); Google OAuth working; build passes clean (0 TS errors, all pages dynamic) | ~30% | Add Cloudinary env vars → test image upload → deploy Vercel |
| 2026-05-27 | Day 6: referrerPolicy+onError image fix (Explore/Place/Profile); /create real user info; travelTimeTo schema+action+UI; nearby places from DB; fix addItem saves all fields; DAILYWORK sync | ~60% | Run SQL migration (travel_time_to column) → add Cloudinary env to Vercel → test E2E |
| 2026-05-29 | Day 7 (/loop): Error boundaries ครบทุกหน้า — RouteError shared component + error.tsx สำหรับทุก route (feed/explore/place/post/trips/trips[id]/trips/new/profile/profile[userId]/profile/edit/buddy/notifications/create/settings) | ~15% | ทำ task ถัดไปใน DAILYWORK |
| 2026-05-30 | Day 8: Feed compose box + empty state; Trips delete confirm inline; fix onError in Server Component; verified Explore 20 places from DB | ~40% | ต่อ Day 8 tasks หรือ social layer |
