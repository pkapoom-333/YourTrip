# 🗺️ DAILYWORK.md — YourTrip Quest Board
> CTO Claude อ่านทุก session | ทำแบบ speedrun — commit บ่อย, ไม่ถามซ้ำ
> Last updated: 2026-06-09

---

## 🎮 CURRENT SPRINT — S6 "Launch Prep"
**ช่วง:** 9–20 มิ.ย. 2026 | **MVP deadline:** 14 ก.ค. 2026

```
PROGRESS ██████████████████░░ 88%  (Day 13 / ~10 ก่อน launch)
```

---

## 🔥 QUEST BOARD — Sprint S6 NEW QUESTS

### ⚔️ TIER S — ทำก่อนเลย (ไม่ต้อง allow)

| # | Quest | XP | Status |
|---|-------|----|--------|
| S6-1 | **Toast feedback system** — global toast/snackbar สำหรับ save, like, delete, error | 300 | ✅ |
| S6-2 | **Explore infinite scroll** — replace "โหลดเพิ่มเติม" button ด้วย IntersectionObserver | 200 | ✅ |
| S6-3 | **Place nearby from DB** — ตอนนี้ nearby คือ [] hardcoded ใน PlaceDetailClient | 200 | ✅ |
| S6-4 | **next/image optimization** — convert hero images ใน Landing + Place Detail | 150 | ✅ |
| S6-5 | **Custom 404 page** — not-found.tsx + error.tsx global | 100 | ✅ |
| S6-6 | **PWA icons** — สร้าง icon-192.png + icon-512.png จริง (SVG→PNG via canvas) | 150 | ✅ |
| S6-7 | **Profile/[userId] follow** — ตรวจสอบและ fix follow button บน public profile | 150 | ✅ |
| S6-8 | **Feed pull-to-refresh** — swipe-down gesture บน mobile | 100 | ✅ |
| S6-9 | **Post tags in explore** — เพิ่ม tag-based search ใน getPlaces (filter by tags array) | 200 | ✅ |
| S6-10 | **Dark mode** — toggle + CSS variables swap ใน Settings | 200 | ✅ |

### 🛡️ TIER A — SEO + PWA + Security

| # | Quest | XP | Status |
|---|-------|----|--------|
| A1 | **JSON-LD place pages** — Schema.org TouristAttraction/Restaurant/Cafe per category | 300 | ✅ |
| A2 | **Security headers** — X-Frame-Options, X-Content-Type-Options, Referrer-Policy ใน next.config.ts | 200 | ✅ |
| A3 | **PWA offline page** — /offline page + sw.js service worker + SW registration ใน layout | 250 | ✅ |
| A4 | **Canonical tags** — alternates.canonical ใน /feed /explore /trips /place/[slug] / | 150 | ✅ |
| A5 | **Preconnect hints** — link rel=preconnect Cloudinary + Unsplash + dns-prefetch Supabase | 100 | ✅ |

### 🏹 TIER B — Polish + UX

| # | Quest | XP | Status |
|---|-------|----|--------|
| B1 | **RouteError UX** — dark mode + smart error categorisation (network/auth/server) | 200 | ✅ |
| B2 | **Explore empty state** — clear-filters button เมื่อ search ไม่เจอผลลัพธ์ | 150 | ✅ |
| B3 | **Notifications empty state** — rich state แยก unread/all + กด "ดูทั้งหมด" | 150 | ✅ |
| B4 | **Buddy empty states** — ปรับ 3 tabs (discover/requests/matched) | 150 | ✅ |
| B5 | **WebSite JSON-LD** — Schema.org WebSite + SearchAction บน landing page | 200 | ✅ |
| B6 | **Sitemap expansion** — เพิ่ม /feed /trips /forgot-password | 100 | ✅ |
| B7 | **Env validator** — lib/env.ts ตรวจ env vars ตอน server start พร้อม hint | 150 | ✅ |
| B8 | **Dark mode Notifications + Buddy** — header, tabs, rows, cards | 200 | ✅ |
| B11 | **Dark mode full sweep** — PlaceDetailClient, FeedPostsClient, SuggestedUsers, UserListRow, ResetPassword, ImageUpload, PWAPrompt, 404, 10 loading skeletons, ExploreClient, TripsClient, create, buddy/BuddyCard, profile/edit | 500 | ✅ |
| B9 | **LCP image priority** — priority=true บน first destination image ใน landing | 100 | ✅ |
| B10 | **robots.ts** — เพิ่ม /post/, /offline, /auth/ disallow rules | 50 | ✅ |

---

## 🔥 QUEST BOARD — Sprint S5 COMPLETED

### ⚔️ TIER S — ทำก่อนเลย (ไม่ต้อง allow)

| # | Quest | XP | Status |
|---|-------|----|--------|
| 1 | **Full-text search** `/explore` — เพิ่ม multi-field ILIKE search (name, nameEn, province, description) | 300 | ✅ |
| 2 | **Seed demo posts** — เพิ่ม seed script สร้าง demo posts + users (ไม่ใช้ OAuth UUID จริง) | 250 | ✅ |
| 3 | **Place reviews** — wire `createReview` action ให้ submit จาก `/place/[slug]` star picker form | 250 | ✅ |
| 4 | **Feed: likedByMe optimistic** — ตอนนี้ `liked` state เริ่มที่ `false` เสมอ แม้ DB บอก likedByMe=true | 200 | ✅ |
| 5 | **Post share button** — เพิ่ม share icon ใน PostCard → Web Share API + clipboard fallback | 150 | ✅ |
| 6 | **Explore: sort by "ใกล้ฉัน"** — Geolocation API → sort by distance จาก lat/lng | 200 | ✅ |
| 7 | **Place detail: save to wishlist** — ปุ่ม Bookmark บน `/place/[slug]` hero section | 150 | ✅ |
| 8 | **Loading skeletons** ใน /explore, /notifications, /buddy | 100 | ✅ |
| 9 | **Image lazy loading** — ใช้ `loading="lazy"` บนทุก `<img>` tag ที่ยังไม่มี | 100 | ✅ |
| 10 | **Trips: duplicate trip** — ปุ่ม Copy บน trip card → clone trip + all days + items | 200 | ✅ |

### 🛡️ TIER A — ทำหลัง S หมดแล้ว

| # | Quest | XP | Status |
|---|-------|----|--------|
| 11 | **Notifications: create real notif** on like/comment/follow events | 300 | ✅ |
| 12 | **Profile stats: trips count** จาก DB จริง (ตอนนี้ไม่มี tripsCount ใน profile) | 150 | ✅ |
| 13 | **Search history** — บันทึก recent searches ใน localStorage | 100 | ✅ |
| 14 | **Post: edit/delete** — เจ้าของโพสต์ edit caption + delete (hard delete) | 200 | ✅ |
| 15 | **Trip: share link** — copy link `/trips/[id]` Web Share API | 100 | ✅ |

### 🏹 TIER B — Nice to have

| # | Quest | XP | Status |
|---|-------|----|--------|
| 16 | **Dark mode** — toggle + CSS variables swap | 200 | ✅ |
| 17 | **Capacitor wrap** → iOS/Android build | 300 | ⬜ |
| 18 | **PWA icons** — SVG icon (icon.svg) + manifest update | 150 | ✅ |
| 19 | **Custom domain** ผูกกับ your-trip-nu.vercel.app | 100 | ⬜ |

---

## ⚠️ BLOCKED — รอ User (ข้ามไปก่อน)

| # | Task | Blocked by |
|---|------|-----------|
| B1 | E2E test login → create post → feed badge | ต้อง login จริง |
| B2 | SQL migration `travel_time_to` column | Supabase SQL Editor |
| B3 | git push → Vercel deploy | user confirm |
| B4 | Cloudinary env ใน Vercel dashboard | user action |

---

## 🏆 COMPLETED QUESTS

<details>
<summary>Day 1–12 (คลิกดู)</summary>

**Foundation & Infrastructure**
- [x] Next.js 16 + Supabase + Prisma 7 setup
- [x] Google OAuth working on production
- [x] DB schema + seed (21 สถานที่)
- [x] Middleware auth guard
- [x] Deploy: your-trip-nu.vercel.app ✅
- [x] PWA manifest

**All UI Pages**
- [x] Landing, Feed, Explore, Place Detail, Trips, Trips/[id], Trips/new
- [x] Profile, Profile/edit, Profile/[userId], Profile followers/following
- [x] Notifications, Settings, Buddy, Create post, Post/[id]
- [x] Login, Register, Forgot password, Auth callback

**Real Data Wiring**
- [x] Feed: posts จาก DB + infinite scroll + liked/saved state
- [x] Explore: places จาก DB + search + filter + load-more pagination
- [x] Place Detail: wired getPlaceBySlug + nearby places + reviews
- [x] Posts: create + like + save + comment (optimistic UI)
- [x] Trips: CRUD + itinerary builder + budget tracker + map + OSRM distance
- [x] Profile: real stats + posts grid + saved places/posts tabs
- [x] Buddy: discover + send request (wired)
- [x] Notifications: real DB + unread badge poll 60s
- [x] Follow/Unfollow: wired + optimistic

**Polish & SEO**
- [x] PostCard place badge (Post→Place relation)
- [x] Feed tag filter chips + clickable post tags
- [x] Post detail place badge
- [x] Feed suggested places from DB
- [x] Landing page real featured places from DB
- [x] Place detail: generateMetadata + og:image
- [x] SEO metadata: /feed /explore /trips
- [x] Sitemap: dynamic DB place slugs
- [x] Error boundaries (13 pages)
- [x] Avatar shared component + referrerPolicy everywhere
- [x] Image upload: Cloudinary + ImageUpload component

</details>

---

## 🤖 AUTONOMOUS AGENT RULES
```
✅ ทำได้เลย (ไม่ต้อง allow):
  - เขียน/แก้ code ทุกไฟล์
  - npm install, npx tsc, npx prisma generate
  - git add, git commit
  - อ่าน Figma / web docs

⛔ ต้องแจ้งก่อน (ข้ามไปทำอย่างอื่นแทน):
  - git push to remote
  - ลบ branch
  - Deploy production
  - Action ที่ต้องการ user session / OAuth
```

## 📊 XP TRACKER
```
Total earned: ~8,400 XP (Day 1–13 sess 1 complete)
Session 2: S6-2(200)+S6-4(150)+S6-7(150)+S6-8(100)+S6-9(200) = +800 XP (S6-1/3/5/6/10 already done)
Sprint S6 TIER S: ALL 10 QUESTS CLEARED! 🎉
Session 3: Tier A (300+200+250+150+100=1,000) + Tier B (200+150+150+150+200+100+150+200+100+50=1,450) = +2,450 XP
Grand total: ~12,050 XP 🏆
Remaining (blocked): B17 Capacitor (needs iOS env), B19 custom domain (user action), B3 git push (user confirm)
```

---

## ⚠️ MANUAL STEPS (ผู้ใช้ต้องทำเอง)

### SQL Migration
```sql
-- Run in: https://supabase.com/dashboard/project/wujunlagtipvbzappuwx/sql
ALTER TABLE trip_items ADD COLUMN IF NOT EXISTS travel_time_to INTEGER;

-- Guide Verification System (BV-1)
ALTER TABLE users ADD COLUMN IF NOT EXISTS is_guide BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS is_verified_guide BOOLEAN NOT NULL DEFAULT FALSE;
```

### Vercel Environment Variables
```
CLOUDINARY_CLOUD_NAME = dczrvpbnn
CLOUDINARY_API_KEY = 248983694737923
CLOUDINARY_API_SECRET = 1o_jxBhXXjvObTIAO_bqbBeOmdk
```
URL: https://vercel.com → YourTrip → Settings → Environment Variables

---

## 🗓️ Sprint Calendar
| Sprint | ช่วงเวลา | เป้าหมาย | Status |
|--------|----------|----------|--------|
| S3 | 24–30 พ.ค. | Real data flow + image upload | ✅ Done |
| S4 | 1–7 มิ.ย. | Trip CRUD + Social base | ✅ Done |
| S5 | 8–13 มิ.ย. | Polish + SEO + Search | 🔧 Active |
| S6 | 14–20 มิ.ย. | Launch prep + custom domain | ⬜ |
| S7 | 21–30 มิ.ย. | Capacitor + App Store | ⬜ |

**🏁 MVP Launch: 14 กรกฎาคม 2026**

---

## 💡 USER REQUESTS — บันทึกความต้องการจาก Pakpoom

### 🗺️ Google Maps Integration ใน /trips/[id]
> บันทึก: 2026-06-09 | ลำดับความสำคัญ: สูง

| # | Feature | รายละเอียด | Status |
|---|---------|------------|--------|
| GM-1 | **Open in Google Maps** | ปุ่มเปิด Google Maps ทุก destination + ปุ่ม "เปิด route ทั้งทริป" | ⏳ รอ API Key |
| GM-2 | **เวลาเดินทาง A→B** | แสดง "🚗 25 นาที · 12 กม." ระหว่างแต่ละจุดใน itinerary โดยใช้ Google Directions API | ⏳ รอ API Key |
| GM-3 | **Places Autocomplete** | ค้นหาสถานที่ผ่าน Google Places API เมื่อเพิ่ม destination ในทริป | ⏳ รอ API Key |

**Env ที่ต้องเพิ่ม:**
- `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` ใน `.env.local` และ Vercel dashboard
- Enable APIs: Maps JavaScript API, Directions API, Places API, Distance Matrix API


### 👥 Buddy — Guide Verification System
> บันทึก: 2026-06-09 | ลำดับความสำคัญ: กลาง (Phase 2+)

**ความต้องการ:**
- ผู้ใช้ที่เป็น Guide ต้องผ่านกระบวนการ verify ก่อนจึงจะรับงานพาเที่ยวได้
- มีเครื่องหมาย verified badge แสดงบน profile และ avatar อย่างชัดเจน

| # | Feature | รายละเอียด | Status |
|---|---------|------------|--------|
| BV-1 | **Guide role + badge** | เพิ่ม field `isGuide` + `isVerifiedGuide` ใน User model, แสดง badge 🏅 บน avatar + BuddyCard + profile | ✅ |
| BV-2 | **Verification flow** | หน้า apply เป็น guide → upload หลักฐาน (ID card / ใบอนุญาต) → pending review | ⬜ Phase 2 |
| BV-3 | **Admin review** | admin dashboard อนุมัติ/ปฏิเสธ คำขอ guide verification | ⬜ Phase 2 |
| BV-4 | **Accept job guard** | badge ⏳ รอการยืนยัน แสดงบน BuddyCard + requests tab (visual guard) | ✅ partial |

**Badge design:**
- Avatar: เครื่องหมาย ✓ สีทอง (verified guide) หรือ สีน้ำเงิน (regular verified) ที่มุมล่างขวา
- Profile: badge "มัคคุเทศก์ที่ได้รับการรับรอง" ใต้ชื่อ

**Depends on:** Supabase Storage (upload หลักฐาน) + admin role

