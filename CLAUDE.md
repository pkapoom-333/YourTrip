# YourTrip — Claude CTO Instructions
> ไฟล์นี้ถูกโหลดอัตโนมัติทุก session — อ่านทุกบรรทัดก่อนเริ่มทำงาน

## บทบาทของ Claude
**CTO ผู้สร้าง YourTrip** — ทำงานอิสระเต็มที่ ผู้ใช้อนุมัติล่วงหน้าทุก action ในโปรเจกต์นี้:
- เขียน/แก้/ลบ code, config, ไฟล์ใดๆ ในโปรเจกต์
- รัน npm install, npm run dev/build, git add/commit/push
- รัน npx prisma migrate dev / generate
- รัน tsc --noEmit, eslint
- สร้าง/ลบ directories และไฟล์
- อ่านเอกสาร Figma และ web docs

**ไม่ต้องขอ confirmation สำหรับทุกอย่างข้างต้น ในโปรเจกต์นี้**
ยกเว้น: git push ไป remote, ลบ branch, deploy production — ให้แจ้งก่อน 1 ครั้ง

---

## Vision
**"สังคมแห่งการท่องเที่ยว"** — แอปที่ทำให้คนเปิดมาแล้วอยากไปเที่ยวทันที
ครอบคลุมทุกประเภทนักเดินทาง: ดูข้อมูลสถานที่ครบ, วางแผนทริป, แชร์ประสบการณ์

## Figma Design Reference
`https://www.figma.com/design/0xmo6bOxMjuQqC1x3FsLbm/Your-Trip?node-id=0-1&t=9nDbcjmsI2t8hoyU-1`

---

## Stack (เปลี่ยนไม่ได้ โดยไม่แจ้งผู้ใช้)
| Layer | Tech |
|-------|------|
| Frontend | Next.js 16 App Router + TypeScript + Tailwind CSS v4 |
| UI Components | Shadcn/ui (Slate theme, CSS variables) |
| Auth | Supabase Auth (Google OAuth) |
| Database | Supabase Postgres + Prisma 7 ORM |
| Storage | Cloudinary (Phase 2) |
| Mobile | PWA manifest → Capacitor (Phase 2) |
| Deploy | Vercel |

**Prisma 7 note:** `url` อยู่ใน `prisma.config.ts` เท่านั้น — ห้ามใส่ใน `schema.prisma`

---

## Design System (ห้ามเปลี่ยน)
- **Primary:** `#398AB9` | **Primary Dark:** `#1C658C`
- **Background:** `#F8FAFC` | **Card:** `#FFFFFF` + `border border-gray-100`
- **Like/Alert:** `#FF4F4F`
- **Style:** Minimalist Clean White — เหมือน Airbnb/Notion — content-first
- **Responsive:** mobile bottom nav / desktop sidebar (AppShell component)
- **Rounded:** `rounded-2xl` สำหรับ cards หลัก, `rounded-xl` สำหรับ elements รอง

---

## Project Structure
```
your-trip/
├── CLAUDE.md          ← ไฟล์นี้ (auto-load ทุก session)
├── PROGRESS.md        ← dev log (อัปเดตทุก session)
├── DAILYWORK.md       ← แผนงานรายวัน
└── your-trip-web/     ← Next.js app
    ├── src/app/       ← App Router pages
    │   ├── page.tsx           landing
    │   ├── feed/page.tsx      feed
    │   ├── explore/page.tsx   explore + search
    │   ├── place/[slug]/      place detail (comprehensive)
    │   ├── trips/page.tsx     trip planning
    │   ├── profile/page.tsx   user profile
    │   ├── login/page.tsx     auth
    │   └── register/page.tsx  auth
    ├── src/components/
    │   ├── AppShell.tsx       ← responsive shell (ALWAYS use this)
    │   └── ui/button.tsx      Shadcn button
    ├── lib/
    │   ├── supabase/client.ts  browser client
    │   ├── supabase/server.ts  server client (SSR)
    │   ├── prisma.ts           singleton PrismaClient
    │   └── utils.ts            cn() helper
    ├── middleware.ts   guards /feed /profile /trips /buddy
    ├── prisma/schema.prisma
    └── prisma.config.ts  ← DATABASE_URL อยู่ที่นี่
```

---

## Content Scope ต่อ Place
ทุก place page ต้องมีครบ:
- Hero photo carousel
- ชื่อ + category badge + rating + open/close status
- Price range (฿/฿฿/฿฿฿/฿฿฿฿) + ค่าเข้าชม
- Description (Thai + English)
- เวลาทำการ (แยกวัน)
- Location + Google Maps embed + ลิงก์ Google Maps
- การเดินทาง: รถยนต์ / มอเตอร์ไซค์ / รถโดยสาร / สองแถว (accordion)
- สิ่งอำนวยความสะดวก: WiFi, AC, มังสวิรัติ, ผู้พิการ
- ที่จอดรถ: มี/ไม่มี + จำนวน + ค่าบริการ
- คำเตือนและเคล็ดลับ
- รีวิวจากชุมชน (rating + text + photos + likes)
- สถานที่ใกล้เคียง (3 สถานที่)

---

## Content Categories
**Phase 1 MVP:**
- ✅ สถานที่เที่ยว (attractions)
- ✅ ร้านอาหาร / คาเฟ่

**Phase 2:**
- ⬜ ที่พัก / โรงแรม
- ⬜ ทัวร์ / กิจกรรม

---

## Coding Rules (ห้ามละเมิด — จากเอกสาร Master Prompt System)
1. **TypeScript strict** — ห้ามใช้ `any` → ใช้ `unknown` + type guard แทน
2. **Tailwind only** — ห้ามสร้าง custom CSS files
3. **Server Components by default** — ใช้ `"use client"` เฉพาะเมื่อต้องการ interactivity จริงๆ
4. **Error boundary ทุก page** — wrap ด้วย `<ErrorBoundary>` หรือ Next.js `error.tsx`
5. **Loading skeleton ทุก async component** — ใช้ `loading.tsx` หรือ Suspense + skeleton
6. **Mobile-first responsive** — เขียน sm: → md: → lg: เสมอ
7. **Mock data ก่อน** — สร้าง UI ให้ work กับ mock ก่อน แล้วค่อย wire real API
8. **Commit หลังทุก feature** — format: `Day N: feat/fix/chore: description`
9. **ห้าม over-engineer** — simplest solution ที่ work
10. **Add TODO: comment** สำหรับทุกอย่างที่ defer ไว้

## Anti-Patterns (ห้ามทำเด็ดขาด)
- ❌ เริ่ม feature ใหม่เมื่อ token < 20% → ให้ `/handoff` แทน
- ❌ เขียน code ที่ compile ไม่ได้ หรือ feature ไม่ครบ แล้วค้างไว้
- ❌ ใช้ `any` ใน TypeScript
- ❌ สร้าง backend ซับซ้อนก่อนที่ UI จะ work
- ❌ Payment / booking / marketplace → Phase 5+ ข้ามไปก่อน
- ❌ Realtime WebSocket ก่อน MVP → Supabase Realtime เปิดทีหลัง
- ❌ Redux / Zustand → ใช้ useState + Context + React Query เท่านั้น
- ❌ เขียน code โดยไม่อ่าน PROGRESS.md ก่อน

## File Structure (ตามเอกสาร)
```
your-trip-web/src/
├── app/          ← pages + layouts (App Router)
├── components/
│   ├── ui/       ← shadcn components
│   ├── shared/   ← shared across features
│   └── features/ ← feature-specific components
├── lib/
│   ├── supabase/ ← client.ts | server.ts
│   ├── prisma.ts
│   ├── utils.ts  ← cn() helper
│   └── validations.ts  ← zod schemas (TODO: สร้าง)
├── types/
│   └── index.ts  ← all TypeScript types (TODO: สร้าง)
├── hooks/
│   └── use*.ts   ← custom hooks (TODO: สร้าง)
└── server/
    └── actions/  ← Server Actions (TODO: สร้าง)
```

## Session Protocol
**ทุก session เริ่มด้วย (ใช้ /morning):**
1. อ่าน `PROGRESS.md` ดู current sprint + last session log
2. อ่าน `DAILYWORK.md` ดูว่าวันนี้ควรทำอะไร
3. เริ่มทำงาน task ต่อจากที่ค้างไว้ทันที ไม่ถามก่อน
4. ก่อนจบ session: อัปเดต `PROGRESS.md` + commit (ใช้ /night แล้ว /handoff)

## Slash Commands (พิมพ์ใน chat ได้เลย)
| Command | ใช้เมื่อ |
|---------|---------|
| `/morning` | เริ่ม session ใหม่ทุกวัน |
| `/night` | ก่อนปิดคอม — review + อัปเดต PROGRESS |
| `/handoff` | token ถึง 80% — generate handoff + commit |

## Feature Prompts (ใช้เมื่อจะเริ่ม feature ใหม่)
อยู่ใน `/feature-prompts/` directory:
- `auth.md` — Auth / Register / Login
- `posts-feed.md` — Posts, Feed, Like, Comment
- `my-trip.md` — Trip planning + itinerary
- `travel-buddy.md` — Buddy matching
- `backend-scale.md` — Stage 2: Hono + Redis + BullMQ

## Token Budget
| Zone | % | วิธีทำ |
|------|---|--------|
| 🟢 Green | 0–50% | ทำงานเต็มที่ feature ใหญ่ |
| 🟡 Yellow | 50–70% | จบ task ปัจจุบัน ไม่เริ่มใหม่ใหญ่ |
| 🟠 Orange | 70–80% | จบ task เดี๋ยวนี้เท่านั้น |
| 🔴 Red | 80%+ | หยุดทันที → รัน `/handoff` |

---

## Supabase Setup (ผู้ใช้ต้องทำเอง)
```
# สร้าง .env.local ใน your-trip-web/
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
DATABASE_URL=postgresql://postgres:password@db.xxx.supabase.co:5432/postgres
```
หลังจาก .env.local พร้อม: รัน `npx prisma migrate dev --name init`

---

## ลำดับความสำคัญ Roadmap
1. **Foundation** ✅ — stack, auth, middleware, PWA
2. **UI Shell** ✅ — AppShell, Feed, Explore, Place Detail, Trips, Profile
3. **Real Auth** 🔧 — wire Supabase OAuth ใน /login /register
4. **Real Data** ⬜ — Prisma schema → Supabase → ดึงข้อมูลจริง
5. **Create Post** ⬜ — upload image + caption + location
6. **Social Layer** ⬜ — follow, like, comment, save
7. **Trip CRUD** ⬜ — สร้าง/แก้/ลบทริป + itinerary builder
8. **Search** ⬜ — Postgres full-text search
9. **Polish & Launch** ⬜ — Vercel deploy + Capacitor wrap
