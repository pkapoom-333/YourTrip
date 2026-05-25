# DAILYWORK.md — YourTrip Daily Sprint Plan
> อัปเดตทุก session | อ่านควบคู่กับ PROGRESS.md

---

## ลำดับงานตาม Phase

### 🔴 PRIORITY NOW — Real Auth (ต้องทำก่อน)
> ขึ้นอยู่กับ: ผู้ใช้สร้าง Supabase project + .env.local

- [ ] ตรวจสอบว่ามี `.env.local` หรือยัง → ถ้าไม่มี แจ้งผู้ใช้ก่อนทำขั้นนี้
- [ ] `npx prisma migrate dev --name init` → สร้างตารางใน Supabase
- [ ] Wire `/login` → `supabase.auth.signInWithOAuth({ provider: 'google' })`
- [ ] Wire `/register` → `supabase.auth.signUp()` + redirect
- [ ] Test auth flow (login → callback → /feed)
- [ ] Add user display name to AppShell sidebar

### 🟡 NEXT — Place Data Layer
- [ ] Prisma schema: เพิ่ม model `Place`, `Review`, `PlaceImage`
- [ ] Seed script: เพิ่มข้อมูล 10 สถานที่จริงจากภาคเหนือ + ต่างประเทศ
- [ ] `/place/[slug]` — ดึงข้อมูลจาก Supabase แทน mock
- [ ] `/explore` — ดึงข้อมูลจาก Supabase + full-text search

### 🟡 NEXT — Post & Feed Layer
- [ ] Prisma schema: `Post`, `Like`, `Comment`, `Save`
- [ ] `POST /api/posts` — สร้างโพสต์ (with image URL)
- [ ] Feed page: ดึง posts จริง จาก Supabase
- [ ] Like / Save toggle (optimistic update)
- [ ] Comment input → save ใน DB

### 🟢 SOON — Image Upload
- [ ] ติดตั้ง Cloudinary SDK
- [ ] `POST /api/upload` — signed upload
- [ ] สร้าง ImageUpload component
- [ ] ใช้ใน /create post page

### 🟢 SOON — Trip CRUD
- [ ] Prisma schema: `Trip`, `TripDay`, `TripPlace`
- [ ] `/trips/new` — สร้างทริป
- [ ] `/trips/[id]` — itinerary view + edit
- [ ] Drag-and-drop places ใน itinerary

### 🔵 LATER — Social Layer
- [ ] Follow / Unfollow
- [ ] Notification system
- [ ] Travel Buddy matching (ค้นหาเพื่อนร่วมทริป)

### 🔵 LATER — Polish & Launch
- [ ] Vercel deploy (connect git repo)
- [ ] Capacitor wrap → iOS/Android builds
- [ ] Performance: image optimization, lazy load
- [ ] PWA install prompt component

---

## วิธีเลือกงานวันนี้

```
1. มี .env.local หรือยัง?
   ไม่มี → แจ้งผู้ใช้ว่าต้องสร้าง Supabase project ก่อน
           แต่ยังทำ UI / mock data ต่อได้ระหว่างรอ
   มี    → เริ่มจาก 🔴 PRIORITY NOW ทันที

2. เช็ค PROGRESS.md ว่า last session ค้างอะไรไว้
   → ทำต่อจากจุดนั้นก่อน

3. ทำ task ที่ใหญ่ที่สุดที่ยังสามารถ complete ได้ใน session นี้
```

---

## Sprint Calendar (เป้าหมาย)
| Sprint | ช่วงเวลา | เป้าหมาย |
|--------|----------|----------|
| S1 | 9-16 พ.ค. 2026 | Auth + DB migration + Place data จริง |
| S2 | 17-23 พ.ค. 2026 | Post + Feed + Like/Save จริง |
| S3 | 24-30 พ.ค. 2026 | Image upload + Create post UI |
| S4 | 1-7 มิ.ย. 2026 | Trip CRUD + itinerary |
| S5 | 8-13 มิ.ย. 2026 | Social layer (follow, notify) |
| S6 | 14-20 มิ.ย. 2026 | Travel Buddy + Search |
| S7 | 21-30 มิ.ย. 2026 | Polish + Vercel deploy |
| S8 | 1-14 ก.ค. 2026 | Capacitor build + App Store submit |

**MVP deadline: 14 กรกฎาคม 2026**
