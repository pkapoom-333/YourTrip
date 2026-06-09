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
| S6-1 | **Toast feedback system** — global toast/snackbar สำหรับ save, like, delete, error | 300 | ⬜ |
| S6-2 | **Explore infinite scroll** — replace "โหลดเพิ่มเติม" button ด้วย IntersectionObserver | 200 | ⬜ |
| S6-3 | **Place nearby from DB** — ตอนนี้ nearby คือ [] hardcoded ใน PlaceDetailClient | 200 | ⬜ |
| S6-4 | **next/image optimization** — convert hero images ใน Landing + Place Detail | 150 | ⬜ |
| S6-5 | **Custom 404 page** — not-found.tsx + error.tsx global | 100 | ⬜ |
| S6-6 | **PWA icons** — สร้าง icon-192.png + icon-512.png จริง (SVG→PNG via canvas) | 150 | ⬜ |
| S6-7 | **Profile/[userId] follow** — ตรวจสอบและ fix follow button บน public profile | 150 | ⬜ |
| S6-8 | **Feed pull-to-refresh** — swipe-down gesture บน mobile | 100 | ⬜ |
| S6-9 | **Post tags in explore** — เพิ่ม tag-based search ใน getPlaces (filter by tags array) | 200 | ⬜ |
| S6-10 | **Dark mode** — toggle + CSS variables swap ใน Settings | 200 | ⬜ |

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
Total earned: ~8,400 XP (Day 1–13 complete)
This session: B16✅+B18✅ = +350 XP (+ dark mode extended to Feed/PostCard/Explore/Trips)
All Tier S and A quests CLEARED! 🎉
Tier B remaining: B17 (Capacitor, needs iOS env), B19 (custom domain, user action)
```

---

## ⚠️ MANUAL STEPS (ผู้ใช้ต้องทำเอง)

### SQL Migration
```sql
-- Run in: https://supabase.com/dashboard/project/wujunlagtipvbzappuwx/sql
ALTER TABLE trip_items ADD COLUMN IF NOT EXISTS travel_time_to INTEGER;
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
