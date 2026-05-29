# DAILYWORK.md — YourTrip Daily Sprint Plan
> อัปเดตทุก session | อ่านควบคู่กับ PROGRESS.md
> Last updated: 2026-05-27

---

## ลำดับงานตาม Phase

### 🔴 PRIORITY NOW — Real Data Flow

- [x] Feed: ดึง posts จริงจาก DB (server action wired, fallback mock ถ้า DB ว่าง)
- [x] `/create` page — แสดง avatar/ชื่อจริงจาก useUser + error banner
- [x] สร้างโพสต์แรก (`/create`) → ขึ้น feed จริง ✅ (action wired, ทำงานเมื่อมี user)
- [ ] ⚠️ **ต้อง run SQL**: `ALTER TABLE trip_items ADD COLUMN IF NOT EXISTS travel_time_to INTEGER;`
- [ ] ทดสอบ end-to-end: Login Google → สร้างโพสต์ → Feed โหลด
- [ ] อัป avatar ใน `/profile/edit` → Cloudinary → แสดงในทุกหน้า (Cloudinary env ยังไม่ set ใน Vercel)

### 🟡 NEXT — Trip Flow
- [x] สร้างทริปใหม่ (`/trips/new`) → บันทึกลง DB ✅
- [x] เพิ่มสถานที่ใน itinerary → บันทึกลง DB ✅ (addItineraryItem wired)
- [x] `travelTimeTo` field ใน TripItem schema ✅ (schema + action + UI all updated)
- [ ] ⚠️ Migrate DB: run SQL above first

### 🟡 NEXT — Social Layer
- [x] Follow/Unfollow จริง ✅ (wired ใน /profile/[userId])
- [x] Notifications: badge count จาก DB จริง ✅ (poll 60s ใน AppShell)
- [x] Travel Buddy: discover + send request ✅ (getDiscoverBuddies action wired)
- [ ] Test Travel Buddy flow จริงกับ real users

### 🟢 SOON — Polish
- [x] `/explore` search: server-side search ด้วย Prisma contains (insensitive) ✅
- [x] `/place/[slug]` nearby places จาก DB จริง ✅ (same region/category)
- [x] Post detail (`/post/[id]`) — like/comment/share wired ✅
- [x] Public profile (`/profile/[userId]`) — posts grid จริง ✅
- [x] Error boundaries ครบทุกหน้า ✅ (RouteError shared component + 13 error.tsx files)
- [x] Image onError handlers ครบ ✅ (Avatar shared component + referrerPolicy ทุกหน้า)
- [x] likedByMe/savedByMe state ใน /post/[id] + feed โหลดจาก DB จริง ✅

### 🔵 LATER — Launch
- [ ] Custom domain ผูกกับ your-trip-nu.vercel.app
- [ ] Vercel env vars: CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET ⚠️
- [ ] Capacitor wrap → iOS/Android builds
- [ ] Performance: image optimization, lazy load
- [ ] App Store submit

---

## ✅ เสร็จแล้ว (ไม่ต้องทำซ้ำ)
- [x] Next.js 16 + Supabase + Prisma 7 setup
- [x] Google OAuth (login ทำงานบน production)
- [x] DB schema + seed (11 สถานที่)
- [x] Middleware auth guard (protect /feed /trips /profile ฯลฯ)
- [x] User upsert on OAuth callback
- [x] Deploy: your-trip-nu.vercel.app ✅
- [x] Cloudinary env vars set ใน .env.local (upload ทำงาน dev mode)
- [x] ทุก UI page ครบ (feed, explore, trips, buddy, notifications, settings)
- [x] Server actions ทุก module (posts, profile, trips, buddy, notifications, places)
- [x] AppShell + bottom nav + responsive layout
- [x] PWA manifest
- [x] referrerPolicy no-referrer + onError: PostCard, Explore, Place, Profile
- [x] travelTimeTo field: schema + validation + server action + trip detail UI
- [x] Nearby places ใน /place/[slug] ดึงจาก DB (same region/category)
- [x] /create: real user avatar+name + error banner
- [x] /trips/[id]: addItem ส่ง duration/travelTimeTo/cost ไป DB จริง
- [x] updateTripItem: edit duration/travelTimeTo/cost persist ลง DB ✅
- [x] Feed liked/saved state จาก DB batch query ✅
- [x] loading.tsx skeletons: /post/[id], /profile/edit, /trips/[id] ✅
- [x] Avatar shared component (referrerPolicy + onError fallback initials) ✅
- [x] /trips/new cover image upload wired (ImageUpload + Cloudinary) ✅
- [x] Seed data 21 places (เพิ่มจาก 11 → 21) ✅
- [x] /profile/edit redirect → /profile หลัง save สำเร็จ ✅

---

## ⚠️ Manual Steps Required (ต้องทำเอง)

### 1. SQL Migration (Supabase SQL Editor)
```sql
ALTER TABLE trip_items ADD COLUMN IF NOT EXISTS travel_time_to INTEGER;
```
URL: https://supabase.com/dashboard/project/wujunlagtipvbzappuwx/sql

### 2. Vercel Environment Variables
เพิ่มใน https://vercel.com → YourTrip → Settings → Environment Variables:
```
CLOUDINARY_CLOUD_NAME = dczrvpbnn
CLOUDINARY_API_KEY = 248983694737923
CLOUDINARY_API_SECRET = 1o_jxBhXXjvObTIAO_bqbBeOmdk
```

---

## วิธีเลือกงานวันนี้

```
1. เช็ค PROGRESS.md → last session ค้างอะไรไว้
2. เริ่มจาก 🔴 PRIORITY NOW เสมอ
3. ทำ task ที่ใหญ่ที่สุดที่ complete ได้ใน session เดียว
4. Commit ทุก sub-task → push github main → Vercel auto-deploy
```

---

## Sprint Calendar (ปรับใหม่)
| Sprint | ช่วงเวลา | เป้าหมาย |
|--------|----------|----------|
| S3 | 24-30 พ.ค. 2026 | Real data flow: post/feed/profile จริง + image upload ✅ mostly done |
| S4 | 1-7 มิ.ย. 2026 | Trip CRUD จริง + Travel Buddy + SQL migration |
| S5 | 8-13 มิ.ย. 2026 | Social layer test + Search + Error boundaries |
| S6 | 14-20 มิ.ย. 2026 | Polish + custom domain |
| S7 | 21-30 มิ.ย. 2026 | Capacitor build + App Store submit |

**MVP deadline: 14 กรกฎาคม 2026**
