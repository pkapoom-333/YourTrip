# PROGRESS.md
# Travel Community App — Dev Log

## Status: Phase 2 | Day 18 | 2026-06-16

## Current sprint task
→ **DONE Day 18 QA Loop (2026-06-16)**: Full codebase QA sweep (continuous loop). Fixed:
  - **React 19 streaming bug (CRITICAL)**: Removed AppShell from ALL 18 loading.tsx files — React 19 $RC mechanism failed when loading fallback contained hydrated client components. Replaced with minimal spinner.
  - **`<a>` → `<Link>` sweep**: Fixed hard navigation in PlaceDetailClient (2×), settings/page.tsx RowLink, FeedPostsClient, TagFeedClient — all internal routes now use Next.js Link for SPA navigation
  - **place/[slug] perf fix**: getNearbyPlaces() replaces getPlaces({ take: 50 }) — targeted 3-place query
  - **feed/page.tsx**: Added `images[]` array to SSR PostCardData mapping (was missing — multi-image carousel broken on first load)
  - **TagFeedClient**: Added `images[]` + Link import
  - All commits: 6dae4ac, 1f75d5b, 3366d63, 98bd51e, 6fac177

→ **PENDING USER**: `git push github main` from local machine — deploys 5 commits to Vercel
→ **PENDING DB**: buddy_requests / collections / collection_places SQL migration (see below)
→ **PENDING VERCEL**: Set `BLOB_READ_WRITE_TOKEN` env var for image upload

→ **DONE Day 13 sess 1**: B16 dark mode (ThemeProvider + anti-FOUC + AppShell + Settings + Feed + PostCard + Explore + Toast + Trips), B18 PWA SVG icon
→ **DONE Day 13 sess 2**: Sprint S6 ALL TIER S cleared + Tier A + Tier B + Extras (see session log)
→ **DONE Day 13 sess 3**: Full dark mode sweep — PlaceDetailClient, FeedPostsClient, SuggestedUsers, UserListRow, ResetPassword, ImageUpload, PWAInstallPrompt, not-found, all 10 loading skeletons, ExploreClient, TripsClient, create page, notifications, buddy/BuddyCard, profile/edit. Prisma client regenerated for lat/lng/googlePlaceId on TripItem.
→ **DONE Day 14 sess 4**: Google Maps integration trips/[id] (getMapsUrl, getFullRouteUrl, GooglePlacesPicker v2, TravelConnector OSRM); dark mode trips/new wizard; Guide Verification (BV-1+BV-4 badge 🏅, BV-2 /guide/apply wizard); Trip public read-only view (isOwner guard, read-only banner); Community Trips section on /trips page (getPublicTrips, 2-col grid with owner avatar)
→ **DONE Day 14 sess 5**: robots.ts /guide/ disallow; Featured Guides section on landing page (getVerifiedGuides action + FeaturedGuide type + 3-col cards + mock fallback); Trips tab on own profile page (/profile) with public/private badge; "Add to Trip" FAB on place detail (modal: trip+day selector, addItineraryItem); Trips list search bar (shows when >3 trips); Explore map view (Leaflet, 3rd view toggle, markers with popup). 0 TS errors.
→ **DONE Day 14 sess 6**: Dark mode followers/following pages (profile/[userId]/followers + following — header, tab strip, empty state, divider rows). 0 TS errors.
→ **DONE Day 14 sess 7**: AI Trip Planner AI-1→AI-4 (@anthropic-ai/sdk, /trips/ai-plan 4-step UI form→generating→preview→save, generateAITrip+saveAITrip actions, TripsClient AI button+FAB). Real Thai places seed (SD-1+SD-2 — 41 places 10 provinces w/ lat/lng, seed-places-real.ts).
→ **DONE Day 15**: Sprint S9 100% complete + Sprint S10 LAUNCH READY — B28 calendar view, A15 block user, A16 report post modal, S9-1 Supabase Realtime notification badge+toast, S10-1 collections edit, S10-2 /settings/blocked page, S10-3 @mention notifications in posts+comments, A19 landing page AI section+live badge, B30 trip drag-reorder, A20 /offline.html PWA page. Schema: Report+Block models added. 0 TS errors.
→ **DONE Day 16 sess 1**: Google Maps API key wired (GM-3 autocomplete active); GM-2 Google Directions API proxy + 3-tier fallback (Google→OSRM→haversine) with source badge; B31 post creation preview panel (Eye/EyeOff toggle, live PostCard mock); Sprint S11: S11-1 /explore/[province] SEO province pages + ExploreClient province chips, S11-2 cloneTripToUser + "บันทึกสำเนา" button on shared trips, A23 place photo lightbox (Maximize2 + fullscreen overlay + thumbnail strip), A24 AI caption assistant in create post (✨ generateCaption via claude-haiku), B35 Google Places autocomplete in /trips/new destination field. 0 TS errors.
→ **DONE Day 16 sess 2**: Sprint S12 A25-S12-12 (8 features) + Sprint S13 S13-1-5 (lightbox, explore rating badges, place community posts grid, feed stories wired to real users). 0 TS errors.
→ **DONE Day 16 sess 3**: Sprint S14 — S14-1 feed mobile nav linked (search→/explore, bell→/notifications), S14-2 trip destination suggestions from saved places (getDestinationSuggestions), S14-3 trips/new URL prefill ?destination=, S14-4 create post pre-fills ?tag= + ?placeId=, S14-5 province page "Plan trip" CTA, S14-6 landing page destination cards link to province pages, loading.tsx for /explore/[province] + /profile/[userId]. 0 TS errors.
→ **DONE Day 16 sess 4**: fix openAddToTrip auth check (use useUser hook); DB migration add_travel_fields PENDING (see below)
→ **DONE Day 16 sess 5**: Mock data audit complete — removed all MOCK_* constants from place, explore, feed, trips, landing, profile, notifications, buddy; seed-places-real.ts fixed (descriptionEen typo); 60 places in production DB; tsc 0 errors. 5 commits total.
→ **DONE Day 16 sess 6**: Final verification pass — found+fixed MOCK_TRIP (trips/[id]), MOCK_COMMENTS (CommentSection), 3 server action catch blocks returning fake mock IDs/data (createTrip→mock-trip-id, addItineraryItem→mock-item-id, getProfile→mock-id). Also removed dead `startsWith("mock")` guards. 2 more commits. tsc 0 errors.
→ **DONE Day 16 sess 7**: E2E Functional Test 5/5 PASSED. Fixed critical bugs: (1) `saved_places` column mismatch — added `@map("user_id")` + `@map("place_id")` + `@map("created_at")` to SavedPlace model; (2) noted `isGuide`/`isVerifiedGuide` missing from DB — needs SQL in Supabase SQL Editor (see below). tsc 0 errors.
→ **DONE Day 16 sess 8**: Loading skeletons added to 6 previously-missing pages (tags/[tag], collections/[id], trending/places, followers, following, admin/guides). Fixed critical "use server" bug: `REPORT_REASONS` was exported as a const from posts.ts — invalid in "use server" files, caused 500 on all pages using PostCard (e.g. /tags/[tag], /feed). Moved to PostCard.tsx. Verified: /feed ✓, /tags ✓, /trending/places ✓. tsc 0 errors.
→ **NEXT**: git push + Vercel deploy (batch next session — user requested wait); set Vercel env vars; run isGuide SQL migration (see DAILYWORK.md blocked section)

---

## Verification Report (Day 16 final)

> tsc: 0 errors | สำรวจทุกหน้าหลัก | commit: 393e715

| หน้า | Data source | Loading | Empty state | Error | Status | หมายเหตุ |
|------|------------|---------|-------------|-------|--------|---------|
| `/` (landing) | `getPlaces` + `getVerifiedGuides` | — | Sections hidden when empty | — | ✅ | testimonials = static marketing copy (ตั้งใจ) |
| `/feed` | `getFeed` + `getActiveUsers` + `getTrendingHashtags` + `getPlaces` + `getPublicTrips` | `loading.tsx` ✅ | `FeedEmptyState` ✅ | — | ✅ | Stories fallback to initials-only when no real users |
| `/explore` | `getPlaces` + `getSavedPlaceIds` | `loading.tsx` ✅ | "ไม่พบสถานที่" ✅ | — | ✅ | ExploreClient รับ real initialPlaces |
| `/explore/[province]` | `getPlaces` ×3 (attraction/restaurant/cafe) | `loading.tsx` ✅ | Section hidden when empty ✅ | — | ✅ | SEO metadata จาก province param |
| `/place/[slug]` | `getPlaceBySlug` + `getSavedPlaceIds` | `loading.tsx` ✅ | `notFound()` ✅ | `notFound()` ✅ | ✅ | reviews/nearby จาก DB จริง |
| `/trips` | `getUserTrips` + `getPublicTrips` + `getDestinationSuggestions` | `loading.tsx` ✅ | "ยังไม่มีทริป" ✅ | — | ✅ | |
| `/trips/[id]` | `getTripById` (useEffect) | `loading.tsx` ✅ | empty days array | — | ✅ | Fixed: ลบ MOCK_TRIP ใช้ EMPTY_TRIP แทน |
| `/trips/new` | client-side form | — | — | toast | ✅ | Fixed: createTrip catch ส่ง error แทน mock-trip-id |
| `/profile` | `getProfile` + `getUserPosts` + `getSavedPlaces` + `getUserTrips` | `loading.tsx` ✅ | empty grids | — | ✅ | Fixed: getProfile catch ส่ง null แทน mock data |
| `/profile/[userId]` | `getProfile` + `getUserPosts` + `getUserPublicTrips` | `loading.tsx` ✅ | empty grids | — | ✅ | |
| `/notifications` | `getNotifications` (useEffect) | `loading.tsx` ✅ | "ยังไม่มีการแจ้งเตือน" ✅ | — | ✅ | Fixed: ลบ MOCK + ลบ guard |
| `/buddy` | `getDiscoverBuddies` + `getIncomingRequests` + `getMatchedBuddies` | `loading.tsx` ✅ | แยก 3 tabs ✅ | — | ✅ | Fixed: ลบ MOCK_BUDDIES |
| `/post/[id]` | `getPostById` + `getRelatedPosts` | `loading.tsx` ✅ | `notFound()` ✅ | `notFound()` ✅ | ✅ | |
| `/tags/[tag]` | `getPostsByTag` | — | "ยังไม่มีโพสต์" ✅ | — | ⚠️ | ไม่มี loading.tsx |
| `/search/posts` | `searchPosts` (client) | — | empty state | — | ✅ | |
| `/search/users` | `searchUsers` (client) | — | empty state | — | ✅ | |
| `/trending/places` | `getTrendingPlaces` | — | — | — | ✅ | |
| `/collections` | `getUserCollections` (useEffect) | `loading.tsx` ✅ | "ยังไม่มี collection" ✅ | — | ✅ | |
| `/collections/[id]` | `getCollectionById` (useEffect) | — | — | — | ⚠️ | ไม่มี loading.tsx, ไม่มี notFound |
| **CommentSection** | `getComments` (lazy on expand) | — | empty list | — | ✅ | Fixed: ลบ MOCK_COMMENTS + guards |

### Issues Fixed ในรอบนี้
| ไฟล์ | ปัญหา | การแก้ไข |
|------|------|---------|
| `trips/[id]/page.tsx` | `useState(MOCK_TRIP)` — แสดง "เชียงใหม่ 4 วัน 3 คืน" ปลอมระหว่าง load | เปลี่ยนเป็น `EMPTY_TRIP` (blank state) |
| `trips/[id]/page.tsx` | `id.startsWith("mock")` guard — block real data load | ลบออก |
| `CommentSection.tsx` | `MOCK_COMMENTS` initial state — แสดง "wanderer", "travelmate" ปลอม | `useState([])` |
| `CommentSection.tsx` | `startsWith("mock")` guards ×3 — block createComment/deleteComment | ลบออก |
| `server/actions/trips.ts` | `createTrip` catch → `{ id: "mock-trip-id" }` — navigate ไป broken URL | เปลี่ยนเป็น `{ error }` |
| `server/actions/trips.ts` | `addItineraryItem` catch → `{ id: "mock-item-id" }` — orphan item ID ใน state | เปลี่ยนเป็น `{ error }` |
| `server/actions/profile.ts` | `getProfile` catch → fake 48 posts / 1200 followers | เปลี่ยนเป็น `{ data: null }` |

### Dead code remaining (harmless, ไม่ใช้ไม่แก้)
- `PlaceDetailClient.tsx` — `startsWith("mock")` guards ×4 (place.id มาจาก DB จริงเสมอแล้ว ไม่มีทางเป็น "mock-xxx")

---

## E2E Functional Test (Day 16)

> Run: `npx tsx prisma/test-e2e.ts` | Date: 2026-06-12 | Result: **5/5 PASSED** ✅

| Flow | Status | Details |
|------|--------|---------|
| Post → Profile | ✅ | createPost → getUserPosts → postsCount via post.count |
| Trip CRUD | ✅ | create w/ TripDays → addItineraryItem → update cost/note → delete |
| Like / Comment / Save | ✅ | like→count→unlike; comment→DB; save post; save place ('ดอยอินทนนท์') |
| Follow / Unfollow | ✅ | follow→count+1→unfollow→count restored |
| Review → Avg Rating | ✅ | createReview(rating=4) → aggregate _avg=4.00 → visible in page query |

**Bugs found and fixed:**
1. `saved_places` table uses snake_case columns (`user_id`, `place_id`, `created_at`) but Prisma schema had no `@map` — fixed with `@map` annotations in `SavedPlace` model + `prisma generate`.
2. `isGuide` / `isVerifiedGuide` in Prisma schema but missing from `users` table in DB — all `prisma.user.findUnique(...)` without explicit `select` will fail at runtime (breaks `getProfile`). Needs SQL migration (see below).

---

## ⚠️ PENDING: DB Migrations (run in Supabase SQL Editor)

### 1. `add_travel_fields` — TripItem location columns
`npx prisma migrate dev --name add_travel_fields` failed on Windows (node_modules file lock).

```sql
ALTER TABLE "trip_items"
  ADD COLUMN IF NOT EXISTS "googlePlaceId" TEXT,
  ADD COLUMN IF NOT EXISTS "travelTimeTo"  INTEGER,
  ADD COLUMN IF NOT EXISTS "lat"           DOUBLE PRECISION,
  ADD COLUMN IF NOT EXISTS "lng"           DOUBLE PRECISION;
```

### 2. `add_guide_fields` — User guide columns (CRITICAL — breaks getProfile until applied)
`isGuide` and `isVerifiedGuide` are in Prisma schema but NOT in DB. Any page that renders a user profile will fail at runtime.

```sql
ALTER TABLE "users"
  ADD COLUMN IF NOT EXISTS "isGuide"         BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS "isVerifiedGuide"  BOOLEAN NOT NULL DEFAULT false;
```

After running both SQL blocks:
```bash
npx prisma migrate resolve --applied add_travel_fields
```

---

## MVP Status — Day 16 (2026-06-12)

> สถานะ: **Launch-Ready pending 2 user actions** | tsc: 0 errors | E2E: 5/5 ✅

### ✅ สิ่งที่พร้อมแล้ว
| Category | Status |
|----------|--------|
| UI Pages (20+) | ✅ ครบทุกหน้า + dark mode + loading skeletons |
| Real DB wiring | ✅ ทุกหน้าดึงข้อมูลจาก Supabase — ไม่มี mock data เหลือ |
| Auth (Google OAuth) | ✅ Supabase Auth + middleware guard |
| Place data | ✅ 60 สถานที่จริง 10 จังหวัด ใน production DB |
| Social features | ✅ Like / Comment / Save / Follow / Review / Buddy |
| Trip planning | ✅ CRUD + AI planner + itinerary builder + Google Maps |
| SEO | ✅ JSON-LD, sitemap, OG tags, canonical, robots.txt |
| PWA | ✅ manifest + service worker + offline page |
| Performance | ✅ Bundle analysis, lazy images, next/image |
| E2E functional test | ✅ 5/5 flows pass against real DB |

### ⏳ รอ User Action (2 รายการก่อน deploy)
| # | Action | ผลกระทบ |
|---|--------|---------|
| 1 | รัน SQL `isGuide`/`isVerifiedGuide` ใน Supabase SQL Editor | ถ้าไม่รัน: หน้า /profile crash เมื่อมี user จริง |
| 2 | git push → Vercel deploy + set env vars | Production launch |

### SQL ที่ต้องรันก่อน deploy (CRITICAL)
```sql
-- Supabase SQL Editor → https://supabase.com/dashboard/project/wujunlagtipvbzappuwx/sql
ALTER TABLE "users"
  ADD COLUMN IF NOT EXISTS "isGuide"         BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS "isVerifiedGuide"  BOOLEAN NOT NULL DEFAULT false;
```

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
| 2026-06-02 | Day 8 cont: Explore wishlist save (localStorage); Place share button (Web Share API + clipboard fallback); Trips status cycle (planning→upcoming→completed); Trip day map (Leaflet + OpenStreetMap) + OSRM driving distance/time between itinerary places | ~70% | seed lat/lng ให้ places → map จะแสดงผลจริง |
| 2026-06-02 | Day 8 cont.2: Trip place picker autocomplete (searchPlacesForTrip + debounce 300ms); lat/lng propagate optimistically to map; fix not-found.tsx use client (source of persistent onClick error) | ~85% | ทดสอบ trip map ด้วย real data หลัง login |
| 2026-06-04 | Day 9: SavedPlace model+SQL migration; Explore wishlist→DB (optimistic); Profile saved tab (สถานที่/โพสต์ sub-tab); Create post place picker (placeId link) | ~90% | E2E wishlist test + PostCard place badge |
| 2026-06-07 | Day 10: PostCard place badge (Post→Place Prisma relation wired; getFeed includes place; blue clickable badge); Feed tag filter chips UI; PROGRESS.md updated | ~25% | Deploy Vercel → E2E test → seed post data |
| 2026-06-09 | Day 11: Post detail place badge; clickable post tags→filter feed; Feed right panel suggested places from DB; Place detail SEO generateMetadata (og:image); Landing page real featured places from DB; Explore load-more pagination (12/page); SEO metadata /feed /explore /trips; sitemap+robots.ts URL fix | ~70% | Deploy → E2E test |
| 2026-06-09 | Day 13: Dark mode B16 (ThemeProvider + anti-FOUC script + CSS vars + AppShell + Settings + Feed + PostCard + Explore + Toast + Trips + FeedPostsClient); PWA SVG icon B18 (icon.svg + manifest sizes=any) | ~60% | Deploy → Capacitor (B17) |
| 2026-06-09 | Day 13 cont: Sprint S6 ALL TIER S cleared — Explore infinite scroll (IntersectionObserver), next/image hero (Landing+PlaceDetail+Cloudinary patterns), profile follow fix (own-profile guard+rollback+toast), feed pull-to-refresh (touch swipe gesture), tag-based search in Explore (facility chips multi-select filter) | ~40% | git push → Vercel deploy |
| 2026-06-09 | Day 13 sess 2: Sprint S6 Tier A — JSON-LD (place TouristAttraction/Restaurant/Cafe, landing WebSite+SearchAction), security headers (next.config.ts), PWA offline page (/offline + sw.js), canonical tags (/feed /explore /trips /place/[slug] /), preconnect hints. Tier B — RouteError dark mode + smart error categorisation, Explore clear-filters empty state, Notifications rich empty state, Buddy improved empty states (x3), sitemap expansion (+/feed/trips/forgot-password). Extras — env validator (lib/env.ts), dark mode Notifications+Buddy pages, LCP image priority on landing, robots.ts updates. 0 TS errors throughout. | ~70% | git push → Vercel deploy |
| 2026-06-09 | Day 14 sess 4: Google Maps integration trips/[id] (getMapsUrl/getFullRouteUrl/GooglePlacesPicker v2 setOptions+importLibrary/TravelConnector OSRM); dark mode trips/new wizard full sweep; isGuide+isVerifiedGuide Prisma schema+regenerate; buddy.ts+buddy/page.tsx+BuddyCard guide 🏅 badge+⏳ pending; profile.ts+profile/page.tsx guide badge; getTripById public trip read-only (isOwner flag, amber banner, hide edit controls); getPublicTrips+TripsClient community grid; /guide/apply 3-step wizard+applyAsGuide action; settings "สมัครเป็นมัคคุเทศก์" link. 0 TS errors. | ~50% | git push → Vercel → Capacitor |
| 2026-06-09 | Day 14 sess 5: robots.ts /guide/ disallow; Featured Guides on landing page (getVerifiedGuides+FeaturedGuide+3-col cards+mock fallback+Shield CTA); Trips tab on /profile own page (grid+public/private badge+create tile); "Add to Trip" FAB on place detail (bottom sheet modal: trip+day selector→addItineraryItem+toast); Trips list search bar (visible when >3 trips, filters by title+destination); Explore map view (3rd toggle, Leaflet lazy init, markers+popup, auto fitBounds). 0 TS errors. | ~60% | git push → Vercel |
| 2026-06-09 | Day 14 sess 6: Dark mode followers/following pages (profile/[userId]/followers + following — header, tab strip, empty state, divider rows). 0 TS errors. | ~40% | git push → Vercel |
| 2026-06-10 | Day 14 sess 7: AI Trip Planner (AI-1→AI-4): @anthropic-ai/sdk, /trips/ai-plan 4-step UI (form→generating→preview→save), generateAITrip+saveAITrip server actions, TripsClient AI button+FAB. Real Thai places seed (SD-1+SD-2): 41 places 10 provinces all w/ lat/lng. 0 TS errors. | – | Sprint S7 User Search + Collections + Onboarding |
| 2026-06-11 | Day 15: Sprint S9+S10 complete — B28 trip calendar view (monthly grid w/ dots), A15 block user (profile menu+blockUser action+middleware guard), A16 report post modal (reportPost+ReportModel in DB), S9-1 Supabase Realtime notification badge+toast in AppShell, S10-1 collections edit (rename/delete/create), S10-2 /settings/blocked users page, S10-3 @mention notifications (createPost+createComment), A19 landing page AI planner highlight+live badge section, B30 trip item drag-to-reorder (HTML5 drag API), A20 /offline.html PWA offline page + SW v3. 0 TS errors. | – | Sprint S11 + video support + AI caption |
| 2026-06-11 | Day 16 sess 1: Google Maps API key wired (GM-3); GM-2 Google Directions proxy (3-tier: Google→OSRM→haversine+source badge); B31 post creation preview panel (Eye/EyeOff toggle, live PostCard mock); Sprint S11 — /explore/[province] SEO pages+province chips, cloneTripToUser+"บันทึกสำเนา" on shared trips, A23 place photo lightbox (Maximize2+fullscreen+thumbnail strip), A24 AI caption assistant in /create (✨ claude-haiku), B35 Google Places autocomplete in trips/new destination field. 0 TS errors. | – | S12 sprint: travel stats card, video support, notification prefs |
| 2026-06-12 | Day 16 sess 2: A28 travel stats card on profile (TravelStatsCard+getTravelStyle badge: Explorer/Slow Traveler/Frequent Flyer/Adventure Seeker/New Traveler); B37 trip status tracker (PLANNING→CONFIRMED→ONGOING→COMPLETED stepper); B38 video support (PostCard video render+badge, ImageUpload video preview, /api/upload resource_type=auto, 50MB limit); A25 notification preferences (per-type toggle in AppShell — like/comment/follow/buddy, localStorage); S12-1 trending hashtags from DB (UNNEST SQL+getTrendingHashtags); S12-2 trip cover image upload (camera button+updateTripCover); S12-3 trip detail OG metadata (layout.tsx server component+generateMetadata); S12-4 sitemap expansion (provinces+publicTrips); S12-5 related posts on post detail (getRelatedPosts+2-col grid); S12-6 trip day notes (inline editor+updateTripDayNote); S12-7 place social sharing (LINE/Facebook/X links); fix: notification click navigates to actionUrl; S12-8 budget category breakdown chips. 0 TS errors. | – | S12 cont: activity timeline, explore regions, trip export |
