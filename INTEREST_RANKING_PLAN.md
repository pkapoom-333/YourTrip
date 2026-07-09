# Interest Ranking Plan
## Feature A: Trip Ranking by Interest + Feature B: Interest-Based Post Recommendations

> วันที่วางแผน: 2026-07-05
> อ่านโค้ดจาก: schema.prisma, trips/page.tsx, server/actions/trips.ts, server/actions/posts.ts, feed/page.tsx

---

## 1. สรุปสิ่งที่พบจาก Code Audit

### โครงสร้างที่มีอยู่แล้ว (ใช้ได้เลย)

| ส่วน | สิ่งที่มี | หมายเหตุ |
|------|-----------|----------|
| `User.interests` | `String[]` ใน schema ✅ | มีแล้ว แต่ยังไม่มี canonical vocabulary |
| `Post.tags` | `String[]` ใน schema ✅ | มีแล้ว user ใส่เองตอน create post |
| `TripCollaborator` | ตารางมีแล้ว ✅ | ใช้นับ collaborators สำหรับ ranking |
| `TripItem → Place.category` | relation มีแล้ว ✅ | ใช้ derive ประเภทสถานที่ในทริปได้ |
| `getForYouFeed()` | มีใน posts.ts บรรทัด 686 ✅ | Feature B ทำครึ่งแรกไปแล้ว! |
| `getPublicTrips()` | มีใน trips.ts บรรทัด 126 | แต่เรียงแค่ `updatedAt: desc` ไม่มี interest ranking |

### ช่องว่างที่ต้องแก้ไข (Gap Analysis)

| ปัญหา | สาเหตุ | วิธีแก้ |
|-------|--------|--------|
| `Trip` ไม่มี `tags` field | ไม่ได้ออกแบบไว้ตั้งแต่ต้น | เพิ่ม `tags String[]` ใน schema |
| `getPublicTrips` ไม่มี ranking | เรียงแค่ recency | เขียน `getRankedPublicTrips()` ใหม่ |
| `getForYouFeed` filter แต่ไม่ rank | `orderBy: createdAt` เท่านั้น | เพิ่ม scoring หลัง fetch |
| Interest vocabulary ไม่ unified | ไม่มี canonical list | สร้าง `INTEREST_TAGS` constant |
| Post creation ไม่ suggest tags | ไม่มี suggestion logic | เพิ่ม `getSuggestedTags(interests)` |

---

## 2. Interest Tag Vocabulary (Canonical List)

ปัญหาหลักคือ `User.interests`, `Post.tags`, และ `Trip.tags` ใช้ string อิสระ → ต้องมีชุดคำกลาง ให้ทุกอย่าง match กัน

### Master Interest Tags (ภาษาไทย เพื่อ UX ดีกว่า)

```typescript
// src/lib/interests.ts (ไฟล์ใหม่)
export const INTEREST_TAGS = [
  "ทะเล",        // beach, sea
  "ภูเขา",       // mountain, hiking
  "ธรรมชาติ",   // nature, waterfall, forest
  "วัฒนธรรม",   // culture, temple, heritage
  "อาหาร",      // food, local food
  "คาเฟ่",      // cafe, coffee
  "ช้อปปิ้ง",   // shopping, market
  "ผจญภัย",     // adventure, extreme sport
  "ดำน้ำ",      // diving, snorkeling
  "ประวัติศาสตร์", // history, museum
  "ล่องแพ",     // river, rafting
  "กลางคืน",    // nightlife
  "สปา",        // wellness, spa, relax
  "เกาะ",       // island
  "สัตว์ป่า",   // wildlife, national park
] as const;

export type InterestTag = typeof INTEREST_TAGS[number];
```

### Mapping: Interest → Place.category

```typescript
// ใช้สำหรับ derive score จาก TripItem → Place.category
export const INTEREST_TO_CATEGORY: Record<InterestTag, string[]> = {
  "ทะเล":         ["attraction", "activity"],
  "ภูเขา":        ["attraction"],
  "ธรรมชาติ":    ["attraction"],
  "วัฒนธรรม":    ["attraction"],
  "อาหาร":       ["restaurant", "cafe"],
  "คาเฟ่":       ["cafe"],
  "ช้อปปิ้ง":    ["activity"],
  "ผจญภัย":      ["activity", "attraction"],
  "ดำน้ำ":       ["activity"],
  "ประวัติศาสตร์": ["attraction"],
  "ล่องแพ":      ["activity"],
  "กลางคืน":     ["activity", "restaurant"],
  "สปา":         ["activity", "hotel"],
  "เกาะ":        ["attraction"],
  "สัตว์ป่า":    ["attraction"],
};
```

### Mapping: Interest → Template Tags (ที่มีใน TRIP_TEMPLATES)

Template tags ที่มีอยู่แล้วใน trips.ts: `["วัด", "ธรรมชาติ", "อาหาร", "วัฒนธรรม", "ช้อปปิ้ง", "กลางคืน", "ทะเล", "เกาะ", "ดำน้ำ", "พักผ่อน", "สปา", "ประวัติศาสตร์", "แม่น้ำ", "ล่องแพ", "ผจญภัย", "คาเฟ่", "หมอก"]`

ส่วนใหญ่ตรงกับ INTEREST_TAGS แล้ว — ถ้าใช้ชุดเดียวกัน matching จะ work อัตโนมัติ

---

## 3. Feature A: Trip Ranking by Interest

### A1. การตัดสินใจ: Trip Tags Strategy

**ไม่ควร:** ใช้ `Trip.destination` string เพราะ match ยาก
**ไม่ควร:** derive จาก Place.category อย่างเดียว เพราะ trip บางอันไม่มี placeId ใน items

**ควรทำ: Hybrid Approach**
1. เพิ่ม `tags String[]` ใน `Trip` model (user กำหนดตอนสร้างทริป)
2. ตอน ranking ให้ combine Trip.tags + Place.category จาก TripItems
3. Trip template ที่มีอยู่แล้วก็มี tags — ใช้ tags เหล่านั้น seed ข้อมูลได้เลย

### A2. Schema Change ที่ต้องทำ

```prisma
// prisma/schema.prisma — เพิ่มใน model Trip
model Trip {
  // ... existing fields ...
  tags     String[]  @default([])  // ← เพิ่มบรรทัดนี้
}
```

**Migration:** `npx prisma migrate dev --name add_trip_tags`

### A3. Ranking Algorithm

```
score(trip, userInterests) =
  (interest_overlap × 3)
  + (recency_score × 1)
  + (collaborator_bonus × 0.5)
  + (place_category_match × 2)
```

**คำอธิบายแต่ละ component:**

**interest_overlap** — จำนวน tags ที่ตรงกับ user.interests
```typescript
const overlap = trip.tags.filter(t => userInterests.includes(t)).length;
// ตัวอย่าง: userInterests = ["ทะเล","อาหาร"], trip.tags = ["ทะเล","เกาะ"]
// overlap = 1 → score +3
```

**recency_score** — decay แบบ exponential (ไม่ใช่ linear)
```typescript
const daysSince = (Date.now() - trip.updatedAt.getTime()) / 86_400_000;
const recencyScore = Math.exp(-daysSince / 30); // half-life ~30 วัน
// trip อัปเดตเมื่อวาน → score ≈ 0.97
// trip อัปเดต 30 วันที่แล้ว → score ≈ 0.37
// trip อัปเดต 90 วันที่แล้ว → score ≈ 0.05
```

**collaborator_bonus** — มีคนร่วมทริปหลายคน = น่าสนใจกว่า
```typescript
const collabBonus = Math.min(trip._count.collaborators, 5);
// cap ที่ 5 คน ไม่ให้ trips ที่มีคนเยอะ dominate มาก
```

**place_category_match** — สถานที่ในทริปตรงกับ interest ไหม
```typescript
const placeCats = trip.days.flatMap(d =>
  d.items.flatMap(i => i.place?.category ? [i.place.category] : [])
);
const matchedCats = userInterests.flatMap(interest =>
  INTEREST_TO_CATEGORY[interest] ?? []
);
const catMatchCount = placeCats.filter(c => matchedCats.includes(c)).length;
const placeMatch = Math.min(catMatchCount, 10) / 10; // normalize 0-1
```

**ทำไม algorithm นี้เหมาะ:**
- Weight สูงสุดที่ interest ตรง (×3) — ตรงกับ intent ของ feature
- Recency decay ป้องกัน old trips ติด top ตลอด
- Collaborator bonus เล็กน้อย — trip ที่มีคนทำร่วมกันมักมีคุณภาพดีกว่า
- Place category match เป็น "soft signal" เสริมเมื่อ tags ไม่ตรงแต่เนื้อหาตรง

### A4. Implementation Plan (ลำดับการทำ)

**Step 1: Schema + Migration (10 นาที)**
```
1. เพิ่ม `tags String[]` ใน Trip model
2. npx prisma migrate dev --name add_trip_tags
3. npx prisma generate
```

**Step 2: สร้าง `getRankedPublicTrips()` ใน trips.ts (45 นาที)**

```typescript
// server/actions/trips.ts — เพิ่ม function ใหม่
export async function getRankedPublicTrips(
  userInterests: string[],
  limit = 12
): Promise<{ data: RankedTripItem[] }> {
  // 1. Fetch public trips พร้อม: tags, days→items→place, _count.collaborators
  const trips = await prisma.trip.findMany({
    where: { isPublic: true },
    orderBy: { updatedAt: "desc" },
    take: limit * 3, // fetch มากกว่า limit เพื่อ re-rank
    include: {
      user: { select: { name: true, avatarUrl: true } },
      _count: { select: { collaborators: true } },
      days: {
        include: {
          items: {
            include: {
              place: { select: { category: true } },
            },
          },
        },
      },
    },
  });

  // 2. Score แต่ละ trip
  const scored = trips.map(trip => ({
    ...trip,
    score: computeTripScore(trip, userInterests),
  }));

  // 3. Sort by score desc, take limit
  scored.sort((a, b) => b.score - a.score);
  return { data: scored.slice(0, limit).map(mapToRankedTripItem) };
}
```

**Step 3: แก้ `trips/page.tsx` ให้ดึง interests และส่งให้ ranking (20 นาที)**

```typescript
// trips/page.tsx
export default async function TripsPage() {
  const supabase = await createClient();
  const { data: { user: authUser } } = await supabase.auth.getUser();

  // ดึง interests ของ user
  let userInterests: string[] = [];
  if (authUser) {
    const profile = await prisma.user.findUnique({
      where: { id: authUser.id },
      select: { interests: true },
    });
    userInterests = profile?.interests ?? [];
  }

  const [{ data: rawTrips }, { data: communityTrips }, ...] = await Promise.all([
    getUserTrips(),
    userInterests.length > 0
      ? getRankedPublicTrips(userInterests, 12)
      : getPublicTrips(12),                    // fallback ถ้าไม่มี interests
    getDestinationSuggestions(5),
  ]);
  // ...
}
```

**Step 4: UI — "แนะนำสำหรับคุณ" Section (30 นาที)**

ตัดสินใจ: **ไม่ต้องแยก section** — เรียงใหม่ทั้งหมดดีกว่า เพราะ UX ง่ายกว่า และไม่ต้องแสดง label ที่ซับซ้อน

แต่ให้แสดง interest match badge บน card เมื่อ score สูง:

```tsx
// ใน TripCard component
{trip.matchedInterests?.length > 0 && (
  <div className="flex gap-1 mt-2">
    {trip.matchedInterests.slice(0,2).map(tag => (
      <span key={tag} className="text-[10px] px-2 py-0.5 bg-[#398AB9]/10 text-[#398AB9] rounded-full">
        {tag}
      </span>
    ))}
  </div>
)}
```

### A5. Fallback Strategy

| กรณี | ผลลัพธ์ |
|------|---------|
| User ไม่ได้ login | แสดง Popular trips (updatedAt desc) |
| User login แต่ interests = [] | แสดง Popular trips + banner "ตั้งค่าความสนใจ" |
| User มี interests แต่ไม่มี trip match | แสดง Popular trips ปกติ (score ยังทำงานได้ recency ยังช่วย) |

**Banner "ตั้งค่าความสนใจ":**
```tsx
{!hasInterests && (
  <div className="bg-[#398AB9]/5 border border-[#398AB9]/20 rounded-xl p-3 mb-4 flex items-center justify-between">
    <p className="text-sm text-gray-600">ตั้งค่าความสนใจเพื่อดูทริปที่เหมาะกับคุณ</p>
    <Link href="/profile/edit" className="text-xs text-[#398AB9] font-medium">ตั้งค่า →</Link>
  </div>
)}
```

### A6. Performance Consideration

- `limit * 3` trips = fetch 36 trips จาก DB → score ใน memory → return 12
- ข้อมูลแต่ละ trip มี `days → items → place` → query ใหญ่
- **ป้องกัน:** ใช้ `select` แทน `include` ให้เฉพาะ fields ที่ต้องการ
- **Cache:** ใช้ Next.js `unstable_cache` หรือ `revalidate: 60` เพื่อ cache 1 นาที
- **ไม่จำเป็น:** ไม่ต้องทำ DB-level scoring (Postgres scoring ซับซ้อนกว่า) — application scoring เพียงพอสำหรับ MVP

---

## 4. Feature B: Interest-Based Post Add

### B1. สิ่งที่มีอยู่แล้วใน `getForYouFeed()`

ดูโค้ด `posts.ts` บรรทัด 686-763 — **function นี้มีอยู่แล้ว** และทำงานดังนี้:
1. ดึง user interests จาก DB
2. ดึง users ที่ฉัน follow
3. Filter posts: `WHERE tags HAVE SOME interests OR userId IN followingIds`
4. `orderBy: { createdAt: "desc" }` ← ปัญหา! ยัง sort แค่ recency

**สิ่งที่ `getForYouFeed` ทำได้ดีแล้ว:** filter ถูกต้อง
**สิ่งที่ `getForYouFeed` ยังขาด:** ไม่มี true ranking — post ที่ match interest 3 tags vs 1 tag ได้ score เท่ากัน

### B2. Post Feed Scoring (upgrade getForYouFeed)

```
postScore(post, user) =
  (interest_tag_overlap × 3)
  + (following_bonus × 2)
  + (recency_score × 1)
  + (engagement_score × 0.5)
```

**interest_tag_overlap:** จำนวน tags ตรงกับ user.interests
**following_bonus:** 1 ถ้า post มาจาก user ที่ฉัน follow (binary, ไม่ต้องซับซ้อน)
**recency_score:** `Math.exp(-daysSince / 7)` — half-life 7 วัน (สั้นกว่า trip เพราะ feed เปลี่ยนเร็ว)
**engagement_score:** `(likes + comments * 2) / 100` — normalize, cap ที่ 1

**Implementation: แก้ `getForYouFeed` เพิ่ม in-memory scoring หลัง fetch**

```typescript
// หลัง fetch posts (บรรทัดประมาณ 739)
// เพิ่ม scoring:
const followingSet = new Set(followingIds);

const scored = posts.map(p => {
  const tagOverlap = (p.tags as string[]).filter(t => interests.includes(t)).length;
  const daysSince = (Date.now() - p.createdAt.getTime()) / 86_400_000;
  const recency = Math.exp(-daysSince / 7);
  const following = followingSet.has(p.userId) ? 1 : 0;
  const engagement = Math.min((p._count.likes + p._count.comments * 2) / 100, 1);

  return {
    ...p,
    _score: tagOverlap * 3 + following * 2 + recency + engagement * 0.5,
  };
});

// Re-sort by score
scored.sort((a, b) => b._score - a._score);
```

**หมายเหตุ:** `_score` ไม่ต้องส่งออกไปยัง client — เป็นแค่ sort key ภายใน

### B3. Post Creation: Tag Suggestions from Interests

**เป้าหมาย:** เมื่อ user เปิด create post dialog ให้ auto-suggest tags ที่ match interests

**สิ่งที่ต้องสร้าง: `getSuggestedTagsForUser()`**

```typescript
// server/actions/posts.ts — เพิ่ม function ใหม่
export async function getSuggestedTagsForUser(): Promise<{ data: string[] }> {
  try {
    const supabase = await createServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { data: [] };

    const profile = await prisma.user.findUnique({
      where: { id: user.id },
      select: { interests: true },
    });

    const interests = profile?.interests ?? [];

    // เพิ่ม sub-tags ที่ relate กับ interests
    const related = interests.flatMap(interest => {
      const map: Record<string, string[]> = {
        "ทะเล":      ["ทะเล", "ชายหาด", "หาด", "พักผ่อน"],
        "อาหาร":     ["อาหาร", "รีวิวอาหาร", "ร้านอร่อย"],
        "คาเฟ่":     ["คาเฟ่", "กาแฟ", "ของหวาน"],
        "วัฒนธรรม": ["วัด", "วัฒนธรรม", "ประวัติศาสตร์"],
        "ธรรมชาติ": ["ธรรมชาติ", "น้ำตก", "ป่า", "ภูเขา"],
        // ...ครบทุก interest
      };
      return map[interest] ?? [interest];
    });

    // dedupe + return top 10
    return { data: [...new Set(related)].slice(0, 10) };
  } catch {
    return { data: [] };
  }
}
```

**UI ใน Create Post Form:**

```tsx
// components/features/CreatePostModal.tsx (หรือ wherever form อยู่)
// เพิ่ม section "แท็กแนะนำ" ด้านบน tag input:

{suggestedTags.length > 0 && (
  <div className="mb-3">
    <p className="text-xs text-gray-400 mb-2">แท็กแนะนำสำหรับคุณ</p>
    <div className="flex flex-wrap gap-1.5">
      {suggestedTags.map(tag => (
        <button
          key={tag}
          onClick={() => addTag(tag)}
          className="text-xs px-3 py-1 rounded-full bg-[#398AB9]/10 text-[#398AB9]
                     hover:bg-[#398AB9]/20 transition disabled:opacity-40"
          disabled={selectedTags.includes(tag)}
        >
          + {tag}
        </button>
      ))}
    </div>
  </div>
)}
```

### B4. Auto-tagging เมื่อเลือก Place

เมื่อ user เลือก place ใน create post form → auto-add tag ที่สอดคล้อง:

```typescript
// ใน handlePlaceSelect(place: Place)
function deriveTagsFromPlace(place: { category: string; name: string }): string[] {
  const categoryTagMap: Record<string, string> = {
    restaurant: "อาหาร",
    cafe:       "คาเฟ่",
    attraction: "ท่องเที่ยว",
    hotel:      "ที่พัก",
    activity:   "กิจกรรม",
  };
  const derived: string[] = [];
  if (categoryTagMap[place.category]) {
    derived.push(categoryTagMap[place.category]);
  }
  return derived;
}

// เมื่อ user เลือก place:
const autoTags = deriveTagsFromPlace(selectedPlace);
setTags(prev => [...new Set([...prev, ...autoTags])]);
```

**UX Note:** auto-tags ควรเพิ่มแบบ "soft" ไม่ใช่ force — user ลบได้เสมอ

### B5. Feed Personalization Tab

ปัจจุบัน `FeedPostsClient` ใน feed/page.tsx รับ `initialPosts` จาก `getFeed()` ซึ่งเป็น chronological

**Plan:** เพิ่ม tab "สำหรับคุณ" ข้าง "ล่าสุด"

```
[ล่าสุด]  [สำหรับคุณ ✨]
```

- **ล่าสุด tab:** ใช้ `getFeed()` เหมือนเดิม
- **สำหรับคุณ tab:** ใช้ `getForYouFeed()` (ที่ upgrade แล้ว)
- Switch ระหว่าง tab = client-side state, re-fetch เมื่อ switch

```tsx
// FeedPostsClient.tsx — เพิ่ม tab
const [mode, setMode] = useState<"latest" | "forYou">("latest");

// เมื่อ switch ไป "forYou" ถ้า posts ยังไม่มีให้ fetch:
useEffect(() => {
  if (mode === "forYou" && forYouPosts.length === 0) {
    fetchForYouPosts();
  }
}, [mode]);
```

---

## 5. Schema Changes Required

```prisma
// prisma/schema.prisma

model Trip {
  // เพิ่มบรรทัดนี้:
  tags     String[]  @default([])   // interest tags เช่น ["ทะเล","อาหาร"]
}

// ไม่ต้องแก้ Post — Post.tags มีอยู่แล้ว ✅
// ไม่ต้องแก้ User — User.interests มีอยู่แล้ว ✅
```

**Migration command:**
```bash
npx prisma migrate dev --name add_trip_tags
npx prisma generate
```

---

## 6. New Files ที่ต้องสร้าง

```
your-trip-web/src/
├── lib/
│   └── interests.ts              ← INTEREST_TAGS, INTEREST_TO_CATEGORY, deriveTagsFromPlace
├── server/actions/
│   └── posts.ts                  ← เพิ่ม getSuggestedTagsForUser(), upgrade getForYouFeed()
│   └── trips.ts                  ← เพิ่ม getRankedPublicTrips()
└── components/features/
    └── InterestTagPicker.tsx     ← shared component สำหรับ picking interest tags
                                     (ใช้ได้ทั้ง profile edit + create trip form)
```

---

## 7. Existing Files ที่ต้องแก้ไข

| ไฟล์ | การแก้ไข | ความยาก |
|------|----------|---------|
| `prisma/schema.prisma` | เพิ่ม `tags String[]` ใน Trip | 🟢 ง่าย |
| `server/actions/trips.ts` | เพิ่ม `getRankedPublicTrips()` | 🟡 ปานกลาง |
| `server/actions/posts.ts` | upgrade `getForYouFeed()`, เพิ่ม `getSuggestedTagsForUser()` | 🟡 ปานกลาง |
| `app/trips/page.tsx` | ดึง userInterests, ส่งให้ ranking, แสดง fallback banner | 🟢 ง่าย |
| `app/feed/page.tsx` | ส่ง tab mode ให้ FeedPostsClient | 🟢 ง่าย |
| `components/features/FeedPostsClient.tsx` | เพิ่ม "สำหรับคุณ" tab | 🟡 ปานกลาง |
| `components/features/CreatePostModal.tsx` | เพิ่ม tag suggestions, auto-tag from place | 🟡 ปานกลาง |

---

## 8. Integration กัน (Feature A ↔ B)

สิ่งที่ทำให้ทั้งสอง Feature ทำงานร่วมกันได้:

1. **`lib/interests.ts`** คือ source of truth — ทั้ง Trip ranking และ Post feed ใช้ INTEREST_TAGS เดียวกัน
2. **`User.interests`** ขับเคลื่อนทั้งสอง Feature — user set ครั้งเดียวใช้ได้ทุกที่
3. **เมื่อ user สร้าง Post แล้ว auto-tag จาก interest → tag เหล่านั้นถูก index → post ขึ้น feed ของ user อื่นที่มี interest ตรงกัน** ← virtuous cycle

```
User interests → Trip Ranking (A)
     ↓
User interests → Post Creation tag suggestions (B)
     ↓
Post ถูก tag ด้วย interest tags
     ↓
Post ปรากฏใน "สำหรับคุณ" ของ users อื่นที่มี interests เดียวกัน (B)
```

---

## 9. Implementation Order (แนะนำ)

ทำตามลำดับนี้เพื่อ minimize risk:

```
Day 1 (Foundation)
  1. สร้าง lib/interests.ts
  2. Schema: เพิ่ม Trip.tags + migrate
  3. Upgrade getForYouFeed() ให้ score in-memory

Day 2 (Feature A — Trip Ranking)
  4. เขียน getRankedPublicTrips()
  5. แก้ trips/page.tsx ดึง interests + call ranking
  6. เพิ่ม matched interest badges ใน TripCard
  7. เพิ่ม fallback banner "ตั้งค่าความสนใจ"

Day 3 (Feature B — Post Creation)
  8. เขียน getSuggestedTagsForUser()
  9. แก้ CreatePostModal เพิ่ม tag suggestions
  10. เพิ่ม auto-tag เมื่อเลือก place
  11. เพิ่ม "สำหรับคุณ" tab ใน FeedPostsClient
```

---

## 10. Risk Assessment

| ความเสี่ยง | โอกาส | ผลกระทบ | วิธีรับมือ |
|-----------|--------|---------|----------|
| Migration `add_trip_tags` อาจ fail ถ้า DB ไม่ได้เชื่อมต่อ | 🟡 ปานกลาง | 🔴 สูง | ทดสอบ dev DB ก่อน |
| `getForYouFeed` มีการใช้ `prisma as any` อยู่แล้ว | 🟢 ต่ำ | 🟡 ปานกลาง | อย่าเพิ่ม any ใหม่ ใช้ proper type |
| ไม่มี user ที่ set interests → ทุกคนได้ popular feed | 🔴 สูง (MVP) | 🟡 ปานกลาง | ใช้ fallback ที่ออกแบบไว้ + แสดง banner |
| Scoring ทำใน memory — ถ้า DB มี trips เยอะ อาจช้า | 🟢 ต่ำ (MVP) | 🟡 ปานกลาง | limit fetch ที่ `limit * 3`, เพิ่ม cache |
| Post tags และ Interest tags ไม่ตรงกัน (user พิมพ์เอง) | 🔴 สูง | 🔴 สูง | บังคับใช้ INTEREST_TAGS เป็น preset + free text |

---

## 11. TODO ที่ defer ไว้ (Phase 2+)

- **DB-level scoring:** ย้าย scoring ไปเป็น Postgres function ถ้า trips เกิน 10,000 รายการ
- **Collaborative filtering:** "users ที่ interests คล้ายกันชอบทริปนี้" — ต้องมี interaction data ก่อน
- **Interest decay:** ลด weight ของ interest ที่ user ไม่ได้ interact มาสักพัก
- **A/B testing:** ทดสอบ weight ต่าง ๆ ใน scoring formula
- **Push notification:** แจ้งเตือนเมื่อมีทริปใหม่ที่ match interests

---

*แผนนี้ใช้งานได้ทันที — ไม่มี feature ที่ต้อง infrastructure ใหม่ (ไม่ต้องการ Redis, BullMQ, หรือ AI model)*
