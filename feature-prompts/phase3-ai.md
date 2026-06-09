# Phase 3 — AI Features Prompt
> บันทึก: 2026-06-09 | ใช้เมื่อเริ่ม Phase 3 หลัง launch MVP

## บริบท
YourTrip MVP launch แล้ว Phase 3 คือการเพิ่ม AI layer เข้ามาใน 3 ส่วนหลัก:
1. AI Trip Planner — สร้างทริปอัตโนมัติจาก preference
2. AI Content Pipeline — ดึงสถานที่ใหม่/trending เข้า DB อัตโนมัติ
3. AI Personalized Feed — curate content ตาม interest ของแต่ละ user

---

## 🤖 Feature 1: AI Trip Planner

**หน้า:** `/trips/new` — เพิ่ม tab "สร้างด้วย AI" หรือ `/trips/ai-plan`

**Form inputs:**
- จำนวนคน: solo / คู่ / กลุ่มเล็ก (3-5) / กลุ่มใหญ่ (6+)
- วันที่: date range picker
- สไตล์: multi-select (cafe / outdoor / cultural / adventure / shopping / ธรรมชาติ / ทะเล / ภูเขา)
- จังหวัดปลายทาง: dropdown จาก DB
- งบ: ฿ (<500/วัน) / ฿฿ (500-1500/วัน) / ฿฿฿ (1500+/วัน)

**Server Action: `createAITrip`**
```typescript
// 1. ดึง places จาก DB ที่ match province + style + priceRange
// 2. ส่ง context ให้ Claude:
//    - รายชื่อสถานที่พร้อม category, openHours, priceRange, lat/lng
//    - user preference (คน, วัน, สไตล์, งบ)
// 3. Claude return itinerary JSON:
//    { days: [{ date, items: [{ placeId, time, duration, note }] }] }
// 4. Parse → createTrip + TripDays + TripItems ใน DB
```

**Claude prompt template:**
```
คุณเป็น travel planner ผู้เชี่ยวชาญในประเทศไทย
จัดทริป [N] วัน สำหรับ [X] คน ที่ [จังหวัด]
สไตล์: [styles] | งบ: [budget]/วัน

สถานที่ที่มีในระบบ:
[JSON list of places with details]

ตอบเป็น JSON format:
{ "tripName": "...", "days": [{ "dayNumber": 1, "theme": "...", "items": [{ "placeId": "...", "startTime": "09:00", "duration": 90, "note": "..." }] }] }

กฎ: จัดไม่เกิน 4 สถานที่/วัน, คำนึงถึงเวลาเดินทาง, เปิด-ปิดสถานที่
```

**UI Flow:**
1. กรอก form → กด "ให้ AI วางแผน"
2. loading state "กำลังวางแผนทริปให้คุณ... 🗺️"
3. แสดง preview itinerary (แบบ read-only trips/[id])
4. ปุ่ม "บันทึกทริปนี้" → save ลง DB / "วางแผนใหม่" → generate อีกครั้ง

**Env:** `ANTHROPIC_API_KEY`
**Model:** `claude-haiku-4-5-20251001` (เร็ว + ถูก)

---

## 🌐 Feature 2: AI Content Pipeline

**หน้า:** background job (Vercel Cron) + `/admin/places` review queue

**Cron Schedule:** ทุกวันจันทร์ 02:00 BKK → `/api/cron/fetch-places`

**Step 1: Google Places Crawler**
```typescript
// Google Places API (New) — Nearby Search
// สำหรับแต่ละ province ใน DB:
//   GET https://places.googleapis.com/v1/places:searchNearby
//   body: { locationRestriction, includedTypes, rankPreference: "POPULARITY" }
// กรอง: rating >= 4.0, userRatingCount >= 50
// ข้ามถ้า place_id มีใน DB แล้ว
```

**Step 2: AI Content Writer**
```typescript
// ส่ง raw Google Places data ให้ Claude:
// - ชื่อ, category, address, rating, reviews sample
// Claude เขียน:
// - description ภาษาไทย (200 คำ) — น่าสนใจ, ไม่ formal เกินไป
// - description ภาษาอังกฤษ (150 คำ)
// - tips/คำเตือน (2-3 ข้อ)
// - tags ที่เหมาะสม
```

**Step 3: Admin Review Queue**
- `/admin/places` — list draft places
- แต่ละ card: รูป + ข้อมูล + ปุ่ม Approve / Edit / Reject
- Approve → `isPublished = true`

**Step 4: Trend Detection**
```typescript
// Google Trends API (unofficial) หรือ SerpAPI
// keyword: "ที่เที่ยว[จังหวัด]", "cafe[จังหวัด]", "ร้านอาหาร[จังหวัด]"
// trending keyword → ค้นหา places ที่ match → priority crawl
```

**Env:** `GOOGLE_PLACES_API_KEY`, `ANTHROPIC_API_KEY`

---

## 🎯 Feature 3: AI Personalized Feed

**Concept:** แทน chronological feed ด้วย interest-ranked feed

**Step 1: Track User Interests**
```sql
-- table: user_interests
CREATE TABLE user_interests (
  user_id UUID,
  category TEXT,       -- 'cafe', 'outdoor', 'cultural'
  province TEXT,
  score FLOAT,         -- เพิ่มทุก interaction
  updated_at TIMESTAMP
);
-- update score เมื่อ: like (+2), save (+3), comment (+1), view (+0.5)
```

**Step 2: Feed Ranking**
```typescript
// สำหรับแต่ละ post candidate:
// score = (interest_match * 0.5) + (recency * 0.3) + (engagement_rate * 0.2)
// interest_match = dot product ของ user_interests กับ place categories
// top 80% = high interest / bottom 20% = discover (random from other categories)
```

**Step 3: AI Rerank (optional, Phase 4)**
```typescript
// ส่ง top 50 candidates + user interest profile ให้ Claude
// Claude rerank และอธิบาย reason สำหรับแต่ละ post
// แสดง "เพราะคุณสนใจ cafe ในเชียงใหม่" ใต้ post
```

**UI Changes:**
- Feed มี tab: "สำหรับคุณ" (personalized) / "ล่าสุด" (chronological)
- ใต้ post: chip เล็กๆ "✨ แนะนำสำหรับคุณ" (ถ้า AI ranked)

---

## Env vars สรุป Phase 3

```env
ANTHROPIC_API_KEY=sk-ant-...          # AI Trip Planner + Content Writer
GOOGLE_PLACES_API_KEY=AIza...         # Content Pipeline (server-side)
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=AIza... # Trip Maps + Places Autocomplete
```

## Dependencies ที่ต้องเพิ่ม
```bash
npm install @anthropic-ai/sdk        # Claude API
npm install @googlemaps/js-api-loader # Google Maps JS
npm install bullmq ioredis           # Job queue (ถ้าใช้ Redis)
```

## ลำดับการทำ Phase 3
1. AI Trip Planner (ทำได้ทันที มี ANTHROPIC_API_KEY)
2. Guide Verification flow ครบ (BV-2 Admin review)
3. Personalized Feed (interest tracking → ranking)
4. Content Pipeline (ต้องการ Google Places API)
5. Trend Detector + Auto-import

