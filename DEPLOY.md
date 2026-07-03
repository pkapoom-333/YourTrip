# YourTrip — Deploy Checklist
> สร้างโดย CTO Claude | อัปเดต 2026-07-03

## ขั้นตอนการ Deploy (ทำตามลำดับ)

---

## STEP 1 — Push to GitHub

1. เปิด File Explorer ไปที่ `C:\Users\user\Documents\your-trip`
2. ดับเบิ้ลคลิก **`fix_and_push.vbs`**
3. รอ dialog ขึ้นมาแสดงผล
4. ตรวจสอบใน MsgBox ว่ามี `main -> main` หรือไม่
5. ถ้าไม่มี — เปิด `push_output.txt` ดู error

```
ผลที่ต้องการ:
  Branch 'main' set up to track remote branch 'main' from 'github'.
  main -> main
```

---

## STEP 2 — Vercel Deploy

1. ไปที่ https://vercel.com
2. คลิก **Add New Project**
3. Import from GitHub — เลือก repo `YourTrip`
4. **Root Directory:** `your-trip-web` (สำคัญมาก!)
5. Framework preset: **Next.js** (auto-detect)
6. ใส่ Environment Variables ทั้ง 4 ตัวนี้:

| Variable | ค่า |
|----------|-----|
| `NEXT_PUBLIC_SUPABASE_URL` | จาก Supabase → Settings → API |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | จาก Supabase → Settings → API |
| `DATABASE_URL` | จาก Supabase → Settings → Database → URI |
| `NEXT_PUBLIC_SITE_URL` | `https://your-trip-nu.vercel.app` |

7. คลิก **Deploy**
8. รอ ~3 นาที

---

## STEP 3 — Supabase Auth Callback URL

1. ไปที่ https://supabase.com → project → **Auth** → **URL Configuration**
2. **Site URL:** `https://your-trip-nu.vercel.app`
3. **Redirect URLs:** เพิ่ม `https://your-trip-nu.vercel.app/auth/callback`
4. Save

---

## STEP 4 — Run SQL Migrations

1. ไปที่ Supabase → **SQL Editor**
2. เปิดไฟล์ `your-trip-web/prisma/all_migrations.sql` (197 บรรทัด)
3. Copy ทั้งหมด → Paste ใน SQL Editor
4. คลิก **Run**
5. ต้องเห็น "Success" ทุก statement

---

## STEP 5 — ทดสอบ

1. เปิด https://your-trip-nu.vercel.app
2. ทดสอบ Login ด้วย Google
3. เปิด /explore ดูสถานที่
4. ทดสอบ Create post

---

## Optional — เพิ่ม Env Vars สำหรับ Features เพิ่มเติม

| Variable | ใช้ทำอะไร | ที่ได้มา |
|----------|-----------|---------|
| `BLOB_READ_WRITE_TOKEN` | Image upload (Vercel Blob) | Vercel → Storage → Blob |
| `ANTHROPIC_API_KEY` | AI trip planner | console.anthropic.com |
| `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` | Maps + Directions | Google Cloud Console |
| `CLOUDINARY_CLOUD_NAME` | Image CDN (fallback) | cloudinary.com |

---

## Troubleshooting

**Build fails: "Cannot find module '@prisma/client'"**
→ postinstall script ควรรัน prisma generate อัตโนมัติ
→ ถ้ายังไม่ work: เพิ่ม Build Command ใน Vercel: `npx prisma generate && next build`

**"DATABASE_URL must not be empty"**
→ ตรวจสอบ Environment Variables ใน Vercel dashboard

**Google OAuth callback fails**
→ ตรวจสอบ Redirect URL ใน Supabase Auth settings

**Blank page หลัง deploy**
→ เปิด Vercel → Deployments → ดู Function Logs
