# DAILYWORK.md — YourTrip Daily Sprint Plan
> อัปเดตทุก session | อ่านควบคู่กับ PROGRESS.md
> Last updated: 2026-05-26

---

## ลำดับงานตาม Phase

### 🔴 PRIORITY NOW — Real Data Flow

- [ ] ทดสอบ end-to-end: Login Google → DB มี user record → Feed โหลดได้
- [ ] สร้างโพสต์แรก (`/create`) → ขึ้น feed จริง
- [ ] อัป avatar ใน `/profile/edit` → Cloudinary → แสดงในทุกหน้า
- [ ] Feed: ดึง posts จริงจาก DB (ตอนนี้ fallback mock อยู่)

### 🟡 NEXT — Trip Flow
- [ ] สร้างทริปใหม่ (`/trips/new`) → บันทึกลง DB
- [ ] เพิ่มสถานที่ใน itinerary → บันทึกลง DB
- [ ] `travelTimeTo` field ใน TripItem schema → migrate DB

### 🟡 NEXT — Social Layer
- [ ] Follow/Unfollow จริง (UI มีแล้ว ต้อง test กับ real users)
- [ ] Notifications: badge count จาก DB จริง
- [ ] Travel Buddy: discover + send request

### 🟢 SOON — Polish
- [ ] `/explore` search: Postgres full-text search
- [ ] Post detail (`/post/[id]`) — like/comment/share จริง
- [ ] Public profile (`/profile/[userId]`) — posts grid จริง
- [ ] Error boundaries ครบทุกหน้า

### 🔵 LATER — Launch
- [ ] Custom domain ผูกกับ your-trip-nu.vercel.app
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
- [x] Cloudinary env vars set (ready for image upload)
- [x] ทุก UI page ครบ (feed, explore, trips, buddy, notifications, settings)
- [x] Server actions ทุก module (posts, profile, trips, buddy, notifications)
- [x] AppShell + bottom nav + responsive layout
- [x] PWA manifest

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
| S3 | 24-30 พ.ค. 2026 | Real data flow: post/feed/profile จริง + image upload |
| S4 | 1-7 มิ.ย. 2026 | Trip CRUD จริง + Travel Buddy |
| S5 | 8-13 มิ.ย. 2026 | Social layer (follow, notify) + Search |
| S6 | 14-20 มิ.ย. 2026 | Polish + custom domain |
| S7 | 21-30 มิ.ย. 2026 | Capacitor build + App Store submit |

**MVP deadline: 14 กรกฎาคม 2026**
