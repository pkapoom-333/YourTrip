# System Posts — แผนการพัฒนา YourTrip Feed

> อ่านจากโค้ดจริง: schema.prisma, feed/page.tsx, posts.ts, profile.ts, AppShell.tsx
> เขียน: 2026-07-05

---

## ภาพรวม

**ปัญหา:** New user เปิดแอปแล้วเห็น feed ว่างเปล่า → ไม่มี engagement → เลิกใช้

**วิธีแก้:** "System Posts" = โพสต์คุณภาพสูงจากบัญชี YourTrip official ที่ interleave กับ user posts ทุกหน้า ทำให้ feed มีชีวิตชีวาตั้งแต่วันแรก

**หลักการออกแบบ:** ไม่สร้าง "fake" engagement — system posts ชัดเจนว่าเป็น official content ผู้ใช้ like/save/comment ได้ปกติ

---

## 1. Architecture — System User Account Strategy

### ตัวเลือกที่พิจารณา

| แนวทาง | วิธีทำ | ข้อดี | ข้อเสีย |
|--------|--------|-------|---------|
| **A: Hardcoded UUID ใน DB** | seed เข้า `users` table ตรง | ง่าย, ไม่ต้องมี auth | UUID ไม่ sync กับ `auth.users` Supabase |
| **B: Real Supabase Auth account** | สร้าง email account จริง | compatible 100% | ต้องจัดการ credentials, ยุ่งยากใน CI |
| **C: isSystemPost ไม่มี user** | userId nullable | ง่ายที่สุด | ต้องแก้ schema FK + ทุก query ที่ expect user |

### ✅ แนวทางที่แนะนำ: Option A — Seeded System User

**เหตุผล:**
- `User.id` ใน schema นี้ reference ตาราง `users` ของเรา (Prisma) **ไม่ใช่** FK ไป `auth.users` โดยตรง ไม่มี constraint ขัด
- ง่ายที่สุด, seed ครั้งเดียว, deploy ได้ทุก environment
- ตัว `profile.ts` สร้าง user จาก Supabase Auth → system user bypass ตรงนี้ได้เลย

**Implementation:**
```ts
// prisma/seed.ts — System User record
const SYSTEM_USER_ID = "00000000-0000-4000-8000-000000000001"; // well-known UUID

await prisma.user.upsert({
  where: { id: SYSTEM_USER_ID },
  update: {},
  create: {
    id: SYSTEM_USER_ID,
    email: "system@yourtrip.app",
    name: "YourTrip",
    username: "yourtrip",
    avatarUrl: "/logo-system.png",  // local asset หรือ Cloudinary URL
    bio: "สังคมแห่งการท่องเที่ยว 🌏",
    isVerified: true,
    isSystemAccount: true,   // ← new field (ดู section 2)
    isOnboarded: true,
  },
});
```

**สำคัญ:** เมื่อ user login ด้วย Supabase Auth จะไม่กระทบ system user เพราะ UUID ต่างกัน และ `getProfile()` ใน `profile.ts` จะ create user ใหม่ก็ต่อเมื่อ `!userId` → system user ไม่ถูก overwrite

---

## 2. Data Model Changes

### 2.1 เพิ่ม enum `PostType`

```prisma
enum PostType {
  USER           // โพสต์ปกติจาก user ทั่วไป
  PLACE_HIGHLIGHT // ไฮไลท์สถานที่ท่องเที่ยว
  TRIP_IDEA      // ไอเดียทริปสำเร็จรูป
  CURATED        // content คัดสรร (tips, seasonal, event)
}
```

### 2.2 แก้ `Post` model

```prisma
model Post {
  // ...existing fields...

  // ─── System Post fields (NEW) ───
  postType      PostType @default(USER)
  isSystemPost  Boolean  @default(false)
  // placeId ✅ มีอยู่แล้ว — ไม่ต้องเพิ่ม
  // userId  ✅ มีอยู่แล้ว — system user ใช้ SYSTEM_USER_ID

  // @@index เพิ่ม
  @@index([isSystemPost, postType])
}
```

### 2.3 แก้ `User` model

```prisma
model User {
  // ...existing fields...

  // ─── System Account flag (NEW) ───
  isSystemAccount Boolean @default(false)
}
```

### 2.4 Migration

```bash
npx prisma migrate dev --name add_system_posts
```

**ไม่มี breaking change** — field ใหม่ทั้งหมดมี default value และ existing posts ยังคงใช้งานได้ปกติ

### 2.5 ทำไมไม่ต้องเพิ่ม field อื่น?

| ความต้องการ | ใช้ field ที่มีอยู่ |
|------------|-------------------|
| Link สถานที่ | `placeId` ✅ มีแล้ว |
| รูปภาพ | `images[]` ✅ มีแล้ว |
| Hashtag | `tags[]` ✅ มีแล้ว |
| Location text | `location` ✅ มีแล้ว |
| Owner | `userId` = SYSTEM_USER_ID |

---

## 3. Content Types — โครงสร้างแต่ละประเภท

### 3.1 Place Highlight (`postType: PLACE_HIGHLIGHT`)

**วัตถุประสงค์:** โปรโมทสถานที่ท่องเที่ยวน่าสนใจ, ดึงดูดให้ explore ต่อ

```
content:  "🏔️ ดอยอินทนนท์ — หลังคาประเทศไทย
           ที่ความสูง 2,565 เมตร ชมทะเลหมอกยามเช้า
           กับดอกนางพญาเสือโคร่งสีชมพูสดใส
           ที่นี่หนาวถึง -5°C ในหน้าหนาว!"

placeId:  <id ของ Doi Inthanon ใน Place table>
images:   [url1, url2, url3]   ← 1-3 รูปสวย
tags:     ["เชียงใหม่", "ภาคเหนือ", "ธรรมชาติ", "ทะเลหมอก"]
location: "อำเภอจอมทอง เชียงใหม่"
```

**UI badge:** `📍 สถานที่แนะนำ` (สีน้ำเงิน `#398AB9`)
**CTA:** ปุ่ม "ดูรายละเอียด →" → `/place/{slug}`

---

### 3.2 Trip Idea (`postType: TRIP_IDEA`)

**วัตถุประสงค์:** แรงบันดาลใจ + funnel เข้า trip planning

```
content:  "✈️ เชียงใหม่ 3 วัน 2 คืน
           วันที่ 1: วัดพระธาตุดอยสุเทพ → ถนนคนเดินท่าแพ
           วันที่ 2: ดอยอินทนนท์ → น้ำตกวชิรธาร
           วันที่ 3: ตลาดวโรรส → ร้านกาแฟ Nimman

           งบประมาณ ~3,500 บาท/คน"

placeId:  null (trip ไม่ได้ link place เดียว)
images:   [collage ของสถานที่ในทริป]
tags:     ["เชียงใหม่", "ทริป3วัน", "ภาคเหนือ", "ไอเดียทริป"]
location: "เชียงใหม่, ประเทศไทย"
```

**UI badge:** `✈️ ไอเดียทริป` (สีม่วง `#7C3AED`)
**CTA:** ปุ่ม "วางแผนทริปนี้ →" → `/trips/new` (Phase 2: pre-fill)

---

### 3.3 Curated (`postType: CURATED`)

**วัตถุประสงค์:** Engagement content, seasonal/trending, tips

```
content:  "☕ 10 คาเฟ่วิวดีที่สุดในไทย

           1. สิริปันนา วิลล่า (เชียงใหม่) — วิวดอยสุเทพ
           2. The Blooming Gallery (กาญจนบุรี) — กลางทุ่งดอกไม้
           3. Café Del Mar Phuket — วิวทะเลอันดามัน
           ...

           Save ไว้ก่อน ไม่งั้นหา! 🔖"

placeId:  null
images:   [collage คาเฟ่ต่างๆ]
tags:     ["คาเฟ่", "ท่องเที่ยว", "ไทย", "วิวดี"]
```

**UI badge:** `🔥 Content คัดสรร` (สีส้ม `#F97316`)

---

### 3.4 UI Differentiation — System Post Card

System post จะมีความแตกต่างจาก user post เพียงเล็กน้อย:
- **Avatar:** โลโก้ YourTrip แทน user photo
- **Name badge:** ชื่อ "YourTrip" + ✓ verified badge สีน้ำเงิน
- **Type badge:** corner badge ระบุประเภท (Place Highlight / Trip Idea / Curated)
- **Border:** `border-l-2 border-[#398AB9]` เพิ่ม visual distinction เล็กน้อย
- Social actions (like, comment, save) ยังคงอยู่ปกติ — system posts **รับ engagement ได้**

---

## 4. Feed Algorithm — Interleaving Strategy

### ปัจจุบัน (getFeed)
```
getFeed() → 10 public posts, orderBy createdAt DESC, cursor pagination
```

### แนวทางที่แนะนำ: Client-Side Interleaving (ง่ายกว่า, ไม่แตะ cursor logic)

**เหตุผลที่ไม่ทำ server-side:**
- `getFeed()` ใช้ cursor pagination ด้วย post ID — ถ้า inject system posts เข้าไปใน query จะทำให้ cursor offset เพี้ยน
- System posts มีจำนวนน้อย (seeded ~10-20 posts) → fetch แยกแล้ว interleave ดีกว่า

### กลไก

```
ฝั่ง Server (feed/page.tsx):
  getFeed()          → initialPosts (10 user posts)
  getSystemPosts(3)  → systemPosts (3 system posts แบบ random/rotating)

ส่งทั้ง 2 ชุดไปให้ FeedPostsClient
```

```
ฝั่ง Client (FeedPostsClient):
  displayPosts = interleave(userPosts, systemPosts, ratio=5)
  → ทุก 5 user posts แทรก 1 system post
  → rotating index ใน systemPosts array
```

**Interleave function (pseudo-code):**
```ts
function interleave(userPosts, systemPosts, every = 5) {
  const result = [];
  let sysIdx = 0;
  userPosts.forEach((post, i) => {
    result.push(post);
    if ((i + 1) % every === 0 && sysIdx < systemPosts.length) {
      result.push(systemPosts[sysIdx++]);
    }
  });
  return result;
}
```

**Infinite Scroll:**
- เมื่อ load more user posts → fetch system posts เพิ่ม (ถ้า sysIdx หมด → loop กลับต้น)
- System posts ไม่มี cursor pagination — fetch ทั้งหมดตั้งแต่ต้นครั้งเดียว (มีแค่ ~10-20 posts)

### Special Case — Empty Feed (New User)
```
if (userPosts.length === 0):
  แสดง system posts ล้วนๆ ก่อน พร้อม UI:
  "👋 ยินดีต้อนรับ! นี่คือสถานที่น่าสนใจใน YourTrip
   เริ่มติดตามคนอื่นหรือโพสต์รูปแรกเพื่อ personalized feed"
```

### getSystemPosts action (ใหม่)
```ts
export async function getSystemPosts(take = 5): Promise<SystemPost[]> {
  return prisma.post.findMany({
    where: { isSystemPost: true, isPublic: true },
    orderBy: { createdAt: "desc" },
    take,
    include: {
      user: { select: { name: true, avatarUrl: true, isVerified: true } },
      place: { select: { slug: true, name: true } },
      _count: { select: { likes: true, comments: true } },
    },
  });
}
```

---

## 5. Admin Interface

### 5.1 ตำแหน่งที่แนะนำ

**สร้างหน้าใหม่: `/admin/system-posts`**

เหตุผล:
- ไม่มี `/admin` route อยู่ใน codebase ปัจจุบัน
- ควรแยก concern ออกจาก feed/profile ชัดเจน
- ง่ายต่อการขยาย (เพิ่ม admin features ในอนาคต)

### 5.2 Auth Guard

```ts
// app/admin/layout.tsx
const supabase = await createClient();
const { data: { user } } = await supabase.auth.getUser();

const dbUser = await prisma.user.findUnique({
  where: { id: user.id },
  select: { isVerified: true },
});

if (!dbUser?.isVerified) redirect("/feed");
// ✅ ใช้ isVerified เป็น admin flag (มีอยู่แล้ว ไม่ต้องเพิ่ม field ใหม่)
```

### 5.3 UI Pages

**`/admin`** — Admin Dashboard (simple)
- จำนวน system posts per type
- link ไป manage pages

**`/admin/system-posts`** — List + Manage
```
┌─────────────────────────────────────────┐
│ System Posts   [+ สร้างใหม่]            │
├─────────────────────────────────────────┤
│ [PLACE_HIGHLIGHT] ดอยอินทนนท์          │
│  📍 เชียงใหม่ · 2,456 ❤ · 342 💬      │
│  [แก้ไข] [ลบ]                           │
├─────────────────────────────────────────┤
│ [TRIP_IDEA] เชียงใหม่ 3 วัน 2 คืน     │
│  ✈️ ไม่ link place · 1,234 ❤          │
│  [แก้ไข] [ลบ]                           │
└─────────────────────────────────────────┘
```

**`/admin/system-posts/new`** — Create Form
```
ประเภทโพสต์:  ○ Place Highlight  ○ Trip Idea  ○ Curated
สถานที่:      [autocomplete search จาก Place table]  (ถ้า Place Highlight)
เนื้อหา:      [textarea]
รูปภาพ:       [URL input × 3]  (Phase 2: Cloudinary upload)
แท็ก:         [tag input]
ตำแหน่ง:      [text input]

[Preview] [บันทึก]
```

### 5.4 Server Action

```ts
// server/actions/admin.ts
export async function createSystemPost(input: SystemPostInput) {
  // 1. Verify caller is admin (isVerified user)
  // 2. prisma.post.create with userId = SYSTEM_USER_ID, isSystemPost = true
  // 3. revalidatePath("/feed")
}
```

---

## 6. Seed Data — 10 System Posts สำหรับ Thailand Travel

> ใช้รูปภาพจาก Unsplash (public domain) ระหว่าง dev, เปลี่ยนเป็น Cloudinary Phase 2

### Post 1 — Place Highlight: วัดพระแก้ว
```
type: PLACE_HIGHLIGHT
content: "👑 วัดพระแก้ว — หัวใจของกรุงเทพฯ
          วัดที่สำคัญที่สุดในประเทศไทย ประดิษฐาน
          พระแก้วมรกตที่สร้างจากหยกเนื้อเดียวทั้งองค์
          เปิด 08:30–15:30 น. ค่าเข้า 500 บาท"
tags: ["กรุงเทพ", "วัด", "วัฒนธรรม", "ท่องเที่ยว"]
location: "พระบรมมหาราชวัง กรุงเทพฯ"
```

### Post 2 — Place Highlight: ดอยอินทนนท์
```
type: PLACE_HIGHLIGHT
content: "🌄 ดอยอินทนนท์ — หลังคาประเทศไทย
          ทะเลหมอกยามเช้า + ดอกนางพญาเสือโคร่งสีชมพู
          ฤดูหนาว (ธ.ค.-ก.พ.) ชมดอกไม้สวยที่สุด
          ระดับความสูง 2,565 เมตร อากาศ 0°C"
tags: ["เชียงใหม่", "ภาคเหนือ", "ธรรมชาติ", "ทะเลหมอก", "ดอกไม้"]
location: "อ.จอมทอง เชียงใหม่"
```

### Post 3 — Place Highlight: อ่าวมาหยา (เกาะพีพี)
```
type: PLACE_HIGHLIGHT
content: "🏖️ อ่าวมาหยา — ชายหาดสวยที่สุดในไทย
          น้ำทะเลสีเขียวมรกต หาดทรายขาวละเอียด
          สถานที่ถ่ายทำ The Beach (ลีโอนาร์โด ดิคาปริโอ)
          เดินทางโดยเรือสปีดโบ้ตจากกระบี่ ~45 นาที"
tags: ["กระบี่", "ทะเล", "ชายหาด", "ภาคใต้", "พีพี"]
location: "เกาะพีพีเล กระบี่"
```

### Post 4 — Place Highlight: ตลาดน้ำอัมพวา
```
type: PLACE_HIGHLIGHT
content: "🛶 ตลาดน้ำอัมพวา — วิถีชีวิตริมคลอง
          ช้อปของกิน นั่งเรือชมหิ่งห้อยยามค่ำ
          ล่องเรือชมวัดริมน้ำแบบโบราณ
          เปิดวันศุกร์-อาทิตย์ 12:00–21:00 น."
tags: ["สมุทรสงคราม", "ตลาดน้ำ", "ใกล้กรุงเทพ", "วัฒนธรรม"]
location: "อัมพวา สมุทรสงคราม"
```

### Post 5 — Place Highlight: อุทยานแห่งชาติอ่าวพังงา
```
type: PLACE_HIGHLIGHT
content: "⛵ อ่าวพังงา — ฟยอร์ดแห่งเอเชีย
          หินปูนทรงแหลมโผล่พ้นน้ำสีเขียวมรกต
          เกาะเจมส์บอนด์ (เกาะตะปู) ต้องมา!
          ล่องเรือ kayak ผ่านถ้ำหินปูนลึกลับ"
tags: ["พังงา", "ทะเล", "ธรรมชาติ", "ภาคใต้", "kayak"]
location: "อุทยานแห่งชาติอ่าวพังงา"
```

---

### Post 6 — Trip Idea: เชียงใหม่ 3 วัน 2 คืน
```
type: TRIP_IDEA
content: "✈️ เชียงใหม่ 3 วัน 2 คืน งบ 4,000 บาท/คน

          📅 วันที่ 1 (วัดและวัฒนธรรม)
          ► วัดพระธาตุดอยสุเทพ → วัดเจดีย์หลวง
          ► ถนนนิมมานเหมินทร์ (คาเฟ่ + ช้อปปิ้ง)
          ► ถนนคนเดินท่าแพ (ทุกอาทิตย์)

          📅 วันที่ 2 (ธรรมชาติ)
          ► ดอยอินทนนท์ ชมทะเลหมอก (ออกเดิน 04:30!)
          ► น้ำตกวชิรธาร + กิ่วแม่ปาน

          📅 วันที่ 3 (ตลาด + กิน)
          ► ตลาดวโรรส (กิมยง) อาหารเช้าราคาถูก
          ► พิพิธภัณฑ์ชนเผ่า + Craft Beer Bar

          💰 งบประมาณ: ที่พัก 1,200 + อาหาร 800 + เดินทาง 2,000"
tags: ["เชียงใหม่", "ทริป3วัน", "ภาคเหนือ", "ไอเดียทริป", "งบน้อย"]
location: "เชียงใหม่"
```

### Post 7 — Trip Idea: ภูเก็ต-กระบี่ 5 วัน
```
type: TRIP_IDEA
content: "🌊 Southern Island Hopping 5 วัน 4 คืน

          วันที่ 1-2: ภูเก็ต
          ► Old Town สีพาสเทล + ไนต์มาร์เก็ต
          ► หาดป่าตอง / หาดกะรน (สงบกว่า)

          วันที่ 3-4: กระบี่ + เกาะพีพี
          ► เรือ speedboat เช้า → เกาะพีพีดอน
          ► Snorkel อ่าวมาหยา (ต้องจองล่วงหน้า!)

          วันที่ 5: อ่าวนาง + ถ้ำพระนาง
          ► Kayak อ่าวพังงา ก่อนบินกลับ

          ✅ เหมาะสำหรับ: คู่รัก, ครอบครัว, กลุ่มเพื่อน"
tags: ["ภูเก็ต", "กระบี่", "ทะเล", "เกาะ", "ไอเดียทริป"]
location: "ภูเก็ต - กระบี่"
```

### Post 8 — Trip Idea: Weekend Gateway กรุงเทพ → อยุธยา
```
type: TRIP_IDEA
content: "🏛️ Weekend ใกล้บ้าน: กรุงเทพ → อยุธยา 2 วัน

          วันเสาร์:
          ► รถไฟ หัวลำโพง → อยุธยา (1:20 ชม. 15 บาท!)
          ► เช่าจักรยาน 50 บาท/วัน
          ► วัดมหาธาตุ → วัดพระศรีสรรเพชญ์
          ► ล่องเรือชมพระอาทิตย์ตก

          วันอาทิตย์:
          ► ตลาดเจ้าพรม (ข้าวหน้าห่อ 30 บาท!)
          ► วัดใหญ่ชัยมงคล + วัดพนัญเชิง
          ► รถไฟกลับ พักผ่อนบนขบวน

          💰 งบ 1,500 บาท/คนทุกอย่าง รวมที่พัก"
tags: ["อยุธยา", "ประวัติศาสตร์", "วันหยุด", "ใกล้กรุงเทพ", "งบน้อย"]
location: "พระนครศรีอยุธยา"
```

### Post 9 — Curated: ช่วงเวลาดีที่สุดในการเที่ยว
```
type: CURATED
content: "📅 ไปเที่ยวไทยเดือนไหนดี? ฉบับสมบูรณ์

          ❄️ พ.ย.–ก.พ. (High Season)
          ✓ ภาคเหนือ: อากาศเย็น ดอกไม้บาน
          ✓ ภาคใต้ฝั่งตะวันตก: ทะเลใสสุด (ภูเก็ต/กระบี่)
          ✗ แออัดมาก + ราคาสูง

          🌞 มี.ค.–พ.ค. (Shoulder)
          ✓ ราคาที่พักถูกลง 30-50%
          ✓ ภาคใต้ฝั่งตะวันออก (เกาะสมุย/เกาะเต่า)
          ✗ ร้อนมากในกรุงเทพฯ

          🌧️ มิ.ย.–ต.ค. (Green Season)
          ✓ ภาคเหนือ: ทุ่งดอกบัวตอง (ต.ค.)
          ✓ ธรรมชาติเขียวสวย นักท่องเที่ยวน้อย
          ✗ ฝนชุก ทะเลอันดามันคลื่นแรง

          Save ไว้วางแผนทริปได้เลย! 🔖"
tags: ["เที่ยวไทย", "วางแผนทริป", "เคล็ดลับ", "ฤดูกาล"]
```

### Post 10 — Curated: 10 ของกินต้องลองในไทย
```
type: CURATED
content: "🍜 10 อาหารไทยที่ต้องกินก่อนตาย

          1. ผัดไทกุ้งสด (ตลาดนัดจตุจักร)
          2. ข้าวมันไก่ประตูน้ำ (กรุงเทพ)
          3. ข้าวซอย (เชียงใหม่ — ลองตำหนัก)
          4. หอยทอด (สมุทรสงคราม)
          5. มัสมั่นเนื้อ (ร้านเก่าในย่านเก่า)
          6. แกงเขียวหวาน (ต้นตำรับกรุงเทพ)
          7. ส้มตำปูปลาร้า (ภาคอีสาน)
          8. ข้าวเหนียวมะม่วง (เดือนมีนา–พฤษภา)
          9. ผัดกะเพราไข่ดาว (ทุกที่ทุกเวลา)
          10. ชาไทย + โรตีกล้วย (ตลาดใต้)

          แบบไหนชอบที่สุด? 👇"
tags: ["อาหารไทย", "กินเที่ยว", "Street Food", "ท่องเที่ยว"]
```

---

## 7. Implementation Steps

> เรียงตามลำดับการทำงาน — แต่ละ step สั้นพอที่จะทำใน 1 session

---

### Step 1: Schema Migration (⏱️ ~30 นาที)

**ไฟล์ที่แก้:**
- `prisma/schema.prisma` — เพิ่ม `PostType` enum, `Post.postType`, `Post.isSystemPost`, `User.isSystemAccount`
- รัน `npx prisma migrate dev --name add_system_posts`
- รัน `npx prisma generate`

**Commit:** `Day N: feat: add PostType enum + isSystemPost + isSystemAccount to schema`

---

### Step 2: Seed System User + System Posts (⏱️ ~45 นาที)

**ไฟล์ที่สร้าง/แก้:**
- `prisma/seed.ts` — upsert system user (SYSTEM_USER_ID), สร้าง 10 system posts จาก section 6
- `package.json` — เพิ่ม `"prisma": { "seed": "ts-node prisma/seed.ts" }` (ถ้ายังไม่มี)

**ทดสอบ:** `npx prisma db seed` → ตรวจ DB ว่ามี user + posts

**Commit:** `Day N: feat: seed system user and 10 system posts for Thailand travel`

---

### Step 3: Server Actions (⏱️ ~30 นาที)

**ไฟล์ที่สร้าง:**
- `src/server/actions/system-posts.ts`
  - `getSystemPosts(take?: number)` — fetch posts where `isSystemPost = true`
  - `createSystemPost(input)` — admin-only create (check isVerified)
  - `updateSystemPost(id, input)` — admin-only edit
  - `deleteSystemPost(id)` — admin-only delete

**แก้ไฟล์:**
- `src/lib/validations.ts` — เพิ่ม `systemPostSchema` (zod)
- `src/types/index.ts` — เพิ่ม `SystemPost` type, `PostType` type

**Commit:** `Day N: feat: add system post server actions`

---

### Step 4: Feed Integration (⏱️ ~1 ชั่วโมง)

**แก้ไฟล์:**
- `src/app/feed/page.tsx` — เรียก `getSystemPosts(6)` เพิ่ม, ส่ง `systemPosts` prop ไปให้ `FeedPostsClient`
- `src/app/feed/FeedPostsClient.tsx` — รับ `systemPosts` prop, implement `interleave()` function, handle empty state แสดง system posts

**แก้ `PostCardData` type:**
```ts
interface PostCardData {
  // ...existing fields
  isSystemPost?: boolean;
  postType?: PostType;
}
```

**Commit:** `Day N: feat: interleave system posts in feed (1 per 5 user posts)`

---

### Step 5: System Post Card UI (⏱️ ~45 นาที)

**แก้ไฟล์:**
- `src/components/features/PostCard.tsx` — เพิ่ม conditional rendering สำหรับ system post
  - Avatar: โลโก้แทน user photo
  - Type badge: corner badge ตาม `postType`
  - Border accent: `border-l-2 border-[#398AB9]`
  - CTA button (ถ้าเป็น PLACE_HIGHLIGHT → "ดูสถานที่" button)

**สร้างไฟล์:**
- `src/components/features/SystemPostBadge.tsx` — reusable badge component

**Commit:** `Day N: feat: system post card UI with type badges and CTA`

---

### Step 6: Admin Interface (⏱️ ~1.5 ชั่วโมง)

**สร้างไฟล์:**
- `src/app/admin/layout.tsx` — auth guard (isVerified check)
- `src/app/admin/page.tsx` — admin dashboard (stats)
- `src/app/admin/system-posts/page.tsx` — list + delete
- `src/app/admin/system-posts/new/page.tsx` — create form (Server Component + Server Action)
- `src/app/admin/system-posts/[id]/edit/page.tsx` — edit form

**Commit:** `Day N: feat: admin interface for system post management`

---

### Step 7: Empty State (⏱️ ~30 นาที)

**แก้ไฟล์:**
- `src/app/feed/FeedPostsClient.tsx` — empty state component ที่แสดง system posts พร้อม onboarding message

**ทดสอบ:**
- ล็อกอิน account ใหม่ที่ไม่มีโพสต์ → ต้องเห็น system posts ทันที
- Account ที่มีโพสต์ → เห็น interleaved feed

**Commit:** `Day N: feat: empty feed state shows system posts with onboarding CTA`

---

### Step 8: Verification (⏱️ ~30 นาที)

**ทดสอบ:**
- [ ] `tsc --noEmit` ไม่มี error
- [ ] Feed แสดง system post ทุก 5 posts
- [ ] New user feed ไม่ว่างเปล่า
- [ ] Like/save ใน system post ทำงานปกติ
- [ ] Admin `/admin/system-posts` เข้าได้เฉพาะ isVerified user
- [ ] สร้าง system post ใหม่จาก admin form → ปรากฏในฟีดทันที

**Commit:** `Day N: chore: verify system posts feature + final polish`

---

## สรุป Effort

| Step | งาน | เวลา |
|------|-----|------|
| 1 | Schema Migration | 30 นาที |
| 2 | Seed Data | 45 นาที |
| 3 | Server Actions | 30 นาที |
| 4 | Feed Integration | 60 นาที |
| 5 | PostCard UI | 45 นาที |
| 6 | Admin Interface | 90 นาที |
| 7 | Empty State | 30 นาที |
| 8 | Verification | 30 นาที |
| **รวม** | | **~6 ชั่วโมง** |

---

## คำถามที่ต้องตัดสินใจก่อน implement

1. **รูปภาพ system posts** — ใช้ Unsplash URL ชั่วคราวได้ไหม? หรือต้องการ Cloudinary ก่อน?
2. **Admin access** — `isVerified` เป็น admin gate โอเคไหม? หรือต้องการ `role: 'admin'` field แยก?
3. **Ratio interleave** — 1:5 (1 system per 5 user) โอเคไหม? หรือต้องการปรับ?
4. **System posts แสดงใน getForYouFeed ด้วยไหม?** — ปัจจุบัน `getForYouFeed` แยก tab ใน feed
5. **Comment/Like บน system posts** — ต้องการหรือ disable? (recommendation: เปิดไว้เพื่อ engagement)

---

*เอกสารนี้พร้อม implement ทันที — ทำตามลำดับ Step 1→8 ใน session เดียวหรือหลาย session ก็ได้*
