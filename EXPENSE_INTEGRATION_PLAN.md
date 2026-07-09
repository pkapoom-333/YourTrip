# Expense Integration Plan — YourTrip
> สร้าง: 2026-07-05 | Status: Draft v1.0

---

## 1. Current State (สรุปสิ่งที่มีอยู่แล้ว)

### 1.1 Expense System (Standalone ✅ — แต่ยังไม่ connected)

ระบบ Expense ถูก build ครบแล้วในรูปแบบ standalone:

| ส่วน | สถานะ | Path |
|------|--------|------|
| `/expense` page | ✅ list ของ expense groups | `src/app/expense/page.tsx` |
| `/expense/new` | ✅ สร้าง group + members | `src/app/expense/new/` |
| `/expense/[id]` | ✅ tabs: expenses / summary / members | `src/app/expense/[id]/` |
| `/expense/join/[code]` | ✅ join via invite link | `src/app/expense/join/[code]/` |
| Server Actions | ✅ createGroup, addExpense, getBalances, recordPayment, invite | `src/server/actions/expense.ts` |
| Balance Algorithm | ✅ greedy debt simplification | expense.ts `simplifyDebts()` |

**Schema models ที่มีแล้ว:** `ExpenseGroup`, `ExpenseGroupMember`, `Expense`, `ExpenseSplit`, `PaymentRecord`

**⚠️ Gap 1:** `ExpenseGroup.tripId String?` มีในโค้ด แต่ **ไม่มี Prisma relation** ไปยัง `Trip` (ไม่มี `trip Trip? @relation(...)` และ Trip ไม่มี `expenseGroup ExpenseGroup?` back-reference)

**⚠️ Gap 2:** `inviteCode` ถูก generate/query ผ่าน `prisma as any` — ยังไม่อยู่ใน `schema.prisma`

### 1.2 Trip System (✅ แต่มี 2 ระบบ expense ซ้ำซ้อน)

Trip มีอยู่ครบ:
- `/trips/[id]` — itinerary, packing, budget tabs
- `Trip` model: `budget Int?`, `TripCollaborator[]`

**⚠️ Gap 3 (สำคัญมาก):** มี **2 ระบบ expense ที่แยกจากกัน:**
- **TripExpense** — ใน `trips.ts` ผ่าน `dbExp = prisma as any` → `tripExpense` model ที่ **ไม่มีใน schema.prisma** เลย (personal budget tracking รายคน)
- **ExpenseGroup** — ระบบ split bill แบบกลุ่ม (standalone, ยังไม่ link กับ trip)

ต้องตัดสินใจว่าจะ merge หรือ keep ทั้ง 2 (ดู Section 3.2)

### 1.3 Chat System (⚠️ DM-only ยังไม่มี Group Chat)

| ส่วน | สถานะ |
|------|--------|
| `/messages` | ✅ DM list |
| `/messages/[conversationId]` | ✅ ChatWindow แบบ 1:1 (real-time via Supabase) |
| Group Chat | ❌ ไม่มีเลย |
| Chat linked to Trip | ❌ ไม่มี |
| Expense in Chat | ❌ ไม่มี |

`Conversation` model มี `type String @default("direct")` แต่ยังไม่รองรับ `"group"`, `name`, `tripId`

---

## 2. Trip ↔ Expense Integration

### 2.1 การตัดสินใจ: User Opt-in (ไม่ Auto-create)

**ไม่** auto-create ExpenseGroup เมื่อสร้าง Trip — เพราะ:
- ไม่ใช่ทุก trip ที่ต้องหารค่าใช้จ่าย (solo trip, public template)
- ลด complexity ของ onboarding

**Flow แทน:** ใน trip detail page → tab "หารค่าใช้จ่าย" → ถ้ายังไม่มี group แสดง empty state พร้อมปุ่ม "สร้าง Expense Group สำหรับทริปนี้"

### 2.2 Schema Changes ที่ต้องทำ (Migration 1)

```prisma
// schema.prisma — เพิ่ม/แก้ส่วนนี้

model Trip {
  // ... existing fields ...
  expenseGroup  ExpenseGroup?   // back-reference (1 trip = 1 group max)
}

model ExpenseGroup {
  // ... existing fields ...
  tripId      String?   @unique   // เปลี่ยนจาก String? ธรรมดา → @unique
  inviteCode  String?   @unique   // ย้ายจาก prisma as any เข้ามาใน schema จริง
  trip        Trip?     @relation(fields: [tripId], references: [id], onDelete: SetNull)
}

// เพิ่ม model ใหม่สำหรับ TripExpense (ย้ายออกจาก prisma as any)
model TripExpense {
  id        String   @id @default(uuid())
  tripId    String
  name      String
  amount    Int      // THB
  category  String   @default("other")
  paidBy    String?  // free-text name
  date      DateTime @default(now())
  createdAt DateTime @default(now())

  trip Trip @relation(fields: [tripId], references: [id], onDelete: Cascade)

  @@index([tripId])
  @@map("trip_expenses")
}

model Trip {
  // เพิ่ม relation
  tripExpenses  TripExpense[]
}
```

**หมายเหตุ:** TripExpense (personal budget) และ ExpenseGroup (split bill) **อยู่ร่วมกันได้** — ใช้คนละ tab ใน Trip detail

### 2.3 UI Location ใน Trip Detail Page

Trip detail page (`/trips/[id]`) ปัจจุบันมี tabs: Itinerary | Budget | Packing

เพิ่ม tab ใหม่: **หารค่าใช้จ่าย** (แสดงเฉพาะเมื่อ trip มี collaborators หรือ user เปิดใช้)

```
[Itinerary] [Budget] [Packing] [💰 หารค่าใช้จ่าย]  ← ใหม่
```

**Tab "หารค่าใช้จ่าย" content:**

**Case A — ยังไม่มี ExpenseGroup:**
```
[Empty state illustration]
ยังไม่มีกลุ่มหารค่าใช้จ่ายสำหรับทริปนี้
[ปุ่ม: สร้าง Expense Group] → เรียก createExpenseGroupForTrip(tripId)
```

**Case B — มี ExpenseGroup แล้ว:**
- แสดง mini version ของ ExpenseGroupClient (เหมือน `/expense/[id]` แต่ embed ใน trip)
- ลิงก์ "ดูเต็มหน้าจอ" → `/expense/[groupId]`
- แสดง: ยอดรวม | balance summary | ปุ่ม Add Expense

### 2.4 Server Actions ที่ต้องเพิ่ม

ใน `src/server/actions/expense.ts`:

```typescript
// สร้าง ExpenseGroup ที่ผูกกับ Trip
// auto-sync members จาก TripCollaborators (optional)
createExpenseGroupForTrip(tripId: string, options?: {
  syncCollaborators: boolean  // เพิ่ม collaborators เป็น members อัตโนมัติ
})

// ดึง ExpenseGroup ของ Trip
getExpenseGroupByTripId(tripId: string)

// Sync สมาชิก: เมื่อเพิ่ม TripCollaborator → เพิ่มเป็น ExpenseMember ด้วย (optional)
syncTripCollaboratorsToExpenseGroup(tripId: string)
```

### 2.5 Member Sync Policy

| สถานการณ์ | Action |
|-----------|--------|
| สร้าง ExpenseGroup จาก Trip | Trip owner = Group creator. TripCollaborators → แสดง dialog ถามว่าจะ sync ไหม |
| เพิ่ม TripCollaborator | ไม่ auto-sync — แจ้ง user ว่า "คุณอยากเพิ่มเขาเข้า expense group ด้วยไหม?" |
| ลบ TripCollaborator | ไม่ลบออกจาก expense group (เพราะอาจมี expense ที่ยังค้างอยู่) |

---

## 3. Chat ↔ Expense Integration

### 3.1 สถานะ Chat ปัจจุบัน

Chat ปัจจุบันเป็น DM 1:1 เท่านั้น ยังไม่มี Group Chat เลย นั่นหมายความว่า:

> **ต้องสร้าง Group Chat ก่อน จึงจะ embed Expense ใน Chat ได้**

### 3.2 Architecture Decision: Trip Chat

แทนที่จะสร้าง Group Chat ทั่วไป ให้สร้าง **Trip Group Chat** — แต่ละ trip ที่มี collaborators จะมี group conversation ของตัวเอง

```
Trip ─── มี ──→ Conversation (type="group", tripId=trip.id)
         └──→ ExpenseGroup (tripId=trip.id)
```

### 3.3 Schema Changes (Migration 2)

```prisma
model Conversation {
  id           String   @id @default(uuid())
  type         String   @default("direct")  // "direct" | "group"
  name         String?                       // ชื่อกลุ่ม (สำหรับ group type)
  avatarUrl    String?                       // รูปกลุ่ม
  tripId       String?  @unique             // 1 trip = 1 group conversation
  createdAt    DateTime @default(now())
  participants ConversationParticipant[]
  messages     Message[]
  trip         Trip?    @relation(fields: [tripId], references: [id], onDelete: SetNull)
}

model Trip {
  // เพิ่ม back-reference
  groupChat    Conversation?
}
```

### 3.4 Expense Panel ใน Group Chat — UI Design

Group Chat Window มี **floating button** ที่มุมขวาบน:

```
[← กลับ]  [ชื่อทริป]          [💰] [⋮]
─────────────────────────────────────
| chat messages...                   |
|                                    |
└──────────────────[send input]──────┘
```

เมื่อกด 💰 → **slide-up panel** (half-screen) แสดง:
- Tab: ค่าใช้จ่าย | Balance | โอน
- ปุ่ม "เพิ่มรายการ" → mini form (ไม่ต้อง navigate ออกไป)
- ปุ่ม "ดูทั้งหมด" → navigate ไป `/expense/[groupId]`

**ทำไมไม่เป็น tab เต็มหน้าจอใน chat:** เพราะ chat UX ควร fluid — ไม่ต้องการ navigation ที่หนัก

### 3.5 Data Flow: Add Expense จาก Chat

```
User กด 💰 ใน Group Chat
    → slide-up ExpensePanel component
    → กรอก: ชื่อรายการ | จำนวน | ผู้จ่าย | แบ่ง
    → เรียก addExpense(groupId, ...)
    → ส่ง "system message" ลงใน conversation:
       💰 [name] เพิ่มรายการ "อาหารกลางวัน" ฿500 (แบ่ง 3 คน)
    → ExpenseGroup อัปเดต balance
    → แจ้งเตือน Notification ไปยังสมาชิกทุกคน (type: EXPENSE_ADDED)
    → Trip summary tab อัปเดต (revalidatePath)
```

### 3.6 Message Types สำหรับ Expense Events

เพิ่ม `type` ใน `Message`:

| type | content | แสดงผล |
|------|---------|---------|
| `"text"` | ข้อความปกติ | bubble ปกติ |
| `"expense_added"` | JSON: `{expenseId, name, amount, paidBy, splitCount}` | card สีเขียว: "💰 [name] เพิ่ม 'อาหาร' ฿500" |
| `"expense_settled"` | JSON: `{fromName, toName, amount}` | card สีน้ำเงิน: "✅ [A] โอนให้ [B] ฿250 แล้ว" |
| `"trip_update"` | JSON: `{field, value}` | card สีเทา: "📍 เพิ่มสถานที่ใหม่ใน Day 2" |

---

## 4. Data Flow สมบูรณ์

```
                    ┌─────────────────┐
                    │   Trip Detail   │
                    │ /trips/[id]     │
                    └────────┬────────┘
                             │ tab "หารค่าใช้จ่าย"
                    ┌────────▼────────┐
    ┌───────────────┤  ExpenseGroup   ├───────────────┐
    │               │  (linked by     │               │
    │               │   tripId)       │               │
    │               └────────┬────────┘               │
    │                        │                        │
    ▼                        ▼                        ▼
[Expense          [Balance Summary         [Invite Link
  List]             & Debts]                /expense/join/[code]]
    │                        │
    │                        │ system message
    ▼                        ▼
[Trip Group Chat (/messages/[convId])]
    ├─── text messages
    ├─── 💰 expense_added cards
    └─── ✅ expense_settled cards
                        │
                        ▼
            [Notifications → สมาชิก]
                        │
                        ▼
            [Trip Summary: totalExpense]
```

---

## 5. Implementation Steps (เรียงลำดับ + Dependencies)

### Phase 1: Schema Fix (Prerequisites — ต้องทำก่อนทุกอย่าง)

**Step 1.1 — Fix schema.prisma** *(no dependencies)*
- เพิ่ม `inviteCode String? @unique` ใน `ExpenseGroup` (ย้ายออกจาก `any`)
- เพิ่ม `trip Trip? @relation(...)` ใน `ExpenseGroup` + `@unique` บน `tripId`
- เพิ่ม `expenseGroup ExpenseGroup?` back-ref ใน `Trip`
- เพิ่ม model `TripExpense` (ย้ายจาก `prisma as any` ใน trips.ts)
- เพิ่ม `tripExpenses TripExpense[]` ใน `Trip`
- รัน `npx prisma migrate dev --name expense-trip-schema`

**Step 1.2 — Fix trips.ts** *(depends on 1.1)*
- เปลี่ยน `dbExp = prisma as any` → `prisma.tripExpense` จริง
- ลบ `const dbExp = prisma as any` แล้วใช้ `prisma.tripExpense` โดยตรง
- ลบ `const dbPack = prisma as any` → ต้องเพิ่ม `PackingItem` ใน schema ด้วยถ้ายังไม่มี

**Step 1.3 — Fix expense.ts** *(depends on 1.1)*
- เปลี่ยน `(prisma as any).expenseGroup` → `prisma.expenseGroup` ที่มี `inviteCode`
- ลบ type casting `any` ทั้งหมดที่เกี่ยวกับ inviteCode

---

### Phase 2: Trip ↔ Expense Link

**Step 2.1 — Server Action: linkExpenseToTrip** *(depends on 1.1, 1.3)*

สร้างใน `expense.ts`:
```typescript
// สร้าง ExpenseGroup ใหม่ผูกกับ trip
createExpenseGroupForTrip(tripId: string, opts: { syncCollaborators?: boolean })

// ดึง ExpenseGroup ของ trip
getExpenseGroupByTripId(tripId: string)

// ผูก ExpenseGroup ที่มีอยู่แล้วกับ trip
linkExistingGroupToTrip(groupId: string, tripId: string)
```

**Step 2.2 — Trip Detail Page: เพิ่ม Expense Tab** *(depends on 2.1)*

แก้ `src/app/trips/[id]/TripDetailClient.tsx` (หรือ TripsClient ที่เกี่ยวข้อง):
- เพิ่ม tab "💰 หารค่าใช้จ่าย" ใน tab bar
- โหลด `getExpenseGroupByTripId(tripId)` ใน page.tsx
- ส่ง prop `expenseGroup` ไปยัง Client component

**Step 2.3 — TripExpenseTab Component** *(depends on 2.2)*

สร้าง `src/components/features/TripExpenseTab.tsx`:
- Empty state + ปุ่ม "สร้าง Expense Group"
- Embedded expense list (compact version)
- Balance mini-summary
- ลิงก์ไป `/expense/[id]` สำหรับ full view

---

### Phase 3: Group Chat

**Step 3.1 — Schema: Group Conversation** *(depends on 1.1)*

แก้ schema.prisma:
- เพิ่ม `name String?`, `avatarUrl String?`, `tripId String? @unique` ใน `Conversation`
- เพิ่ม `groupChat Conversation?` back-ref ใน `Trip`
- รัน `npx prisma migrate dev --name group-chat-schema`

**Step 3.2 — Server Actions: Group Chat** *(depends on 3.1)*

สร้าง functions ใน `messages.ts`:
```typescript
createTripGroupChat(tripId: string)  // สร้าง Conversation type="group" + add participants
getTripGroupChat(tripId: string)
addParticipantToGroupChat(conversationId: string, userId: string)
```

**Step 3.3 — GroupChatWindow Component** *(depends on 3.2)*

สร้าง `src/components/features/GroupChatWindow.tsx` (fork จาก ChatWindow.tsx):
- รองรับหลาย participants (แสดง avatar + ชื่อผู้ส่งทุก bubble)
- Header: ชื่อกลุ่ม (= ชื่อ trip) + ปุ่ม 💰
- Expense button → เปิด `ExpensePanel` (slide-up)
- รองรับ message types: text, expense_added, expense_settled

**Step 3.4 — Trip Group Chat Page** *(depends on 3.3)*

Route: `/trips/[id]/chat` หรือ embed ใน trip detail tabs:
```
[Itinerary] [Budget] [Packing] [💰 หาร] [💬 แชท]
```

**Step 3.5 — ExpensePanel Component** *(depends on 3.3, 2.3)*

สร้าง `src/components/features/ExpensePanel.tsx`:
- Slide-up half-screen panel
- Tab: รายการ | Balance
- Quick add expense form (inline, ไม่ navigate ออก)
- เมื่อ submit → addExpense() + sendMessage() พร้อมกัน (system message)

---

### Phase 4: Notifications + Polish

**Step 4.1 — Expense Notification** *(depends on 2.1, 3.5)*

เพิ่ม `NotificationType` ใน schema: `EXPENSE_ADDED`, `EXPENSE_SETTLED`

เมื่อ addExpense → สร้าง Notification ไปยังสมาชิกทุกคน (ยกเว้น payer)

**Step 4.2 — Trip Summary: แสดง Expense Total** *(depends on 2.3)*

ใน Trip card (trips list page) และ Trip detail header:
- แสดง "ค่าใช้จ่ายรวม: ฿X,XXX" ถ้ามี ExpenseGroup
- แสดง balance ของ current user: "คุณติดหนี้ ฿XXX" หรือ "คนอื่นติดหนี้คุณ ฿XXX"

**Step 4.3 — Deep Link: Expense → Trip** *(depends on 2.1)*

ใน `/expense/[id]` header:
- ถ้า group มี tripId → แสดง "📍 ทริป: [ชื่อทริป]" + ลิงก์กลับไป `/trips/[tripId]`

---

## 6. File Changes Summary

| ไฟล์ | การเปลี่ยนแปลง | Phase |
|------|----------------|-------|
| `prisma/schema.prisma` | เพิ่ม relation Trip↔ExpenseGroup, TripExpense model, Group Conversation fields | 1.1, 3.1 |
| `src/server/actions/expense.ts` | ลบ `any`, เพิ่ม createExpenseGroupForTrip, getExpenseGroupByTripId | 1.3, 2.1 |
| `src/server/actions/trips.ts` | ลบ `dbExp as any`, ใช้ `prisma.tripExpense` จริง | 1.2 |
| `src/server/actions/messages.ts` | เพิ่ม createTripGroupChat, getTripGroupChat, group message support | 3.2 |
| `src/app/trips/[id]/page.tsx` | โหลด expenseGroup + groupChat data | 2.2, 3.4 |
| `src/app/trips/[id]/TripDetailClient.tsx` | เพิ่ม tab หารค่าใช้จ่าย + แชท | 2.2, 3.4 |
| `src/components/features/TripExpenseTab.tsx` | **ใหม่** — embedded expense view ใน trip | 2.3 |
| `src/components/features/GroupChatWindow.tsx` | **ใหม่** — group chat (fork from ChatWindow) | 3.3 |
| `src/components/features/ExpensePanel.tsx` | **ใหม่** — slide-up panel ใน chat | 3.5 |
| `src/app/expense/[id]/ExpenseGroupClient.tsx` | เพิ่ม "กลับไปทริป" link ถ้ามี tripId | 4.3 |

---

## 7. Risks & Decisions

### Risk 1: PackingItem ยังอยู่ใน `prisma as any`
- `src/server/actions/trips.ts` ใช้ `dbPack = prisma as any` สำหรับ PackingItem ด้วย
- ต้องเพิ่ม `PackingItem` model ใน schema ตอน Migration 1 ด้วย ไม่งั้นจะ break

### Risk 2: TripCollaborator.addedAt ไม่มีในโมเดล
- `getTripCollaborators()` ใน trips.ts ใช้ `orderBy: { addedAt: "asc" }` แต่ schema มีแค่ `createdAt`
- ต้อง fix ให้ใช้ `createdAt` แทน หรือ rename field

### Risk 3: Group Chat Real-time
- ChatWindow ปัจจุบัน subscribe Supabase Realtime ผ่าน `conversationId`
- Group Chat ใช้ channel เดียวกันได้ — ไม่ต้องเปลี่ยน architecture
- แต่ต้องอัปเดต UI ให้ render avatar + ชื่อผู้ส่งทุก bubble (ปัจจุบัน assume 2 คนเท่านั้น)

### Decision: ไม่ merge TripExpense กับ ExpenseGroup
- TripExpense = personal budget tracking (เช่น "ฉันจ่ายค่าตั๋ว ฿2000") — track เงินของตัวเอง
- ExpenseGroup = split bill (เช่น "แบ่งกัน 4 คน จ่ายใคร เท่าไร") — social feature
- ทั้งสองใช้ใน tab คนละ tab ใน Trip detail — ไม่ขัดแย้งกัน

### Decision: Expense ใน Chat → ไม่บังคับ
- User ที่ไม่มี Group Chat (solo trip, ไม่มี collaborators) ยังใช้ Expense ได้ตามปกติผ่าน `/expense`
- Group Chat + Expense Panel เป็น optional feature สำหรับ collaborative trips

---

## 8. Quick Win (ทำได้เร็ว ≤ 1 session)

ถ้าอยากเห็นผลเร็วโดยไม่ต้องรอ Group Chat:

1. **Fix schema** (Step 1.1) + **migrate**
2. เพิ่ม `createExpenseGroupForTrip` action
3. เพิ่ม tab "💰 หารค่าใช้จ่าย" ใน trip detail → แสดง link ไป `/expense/[id]`
4. ใน `/expense/[id]` header เพิ่ม "← กลับทริป [ชื่อ]" link

**ผลลัพธ์:** Trip และ Expense linked กัน ผู้ใช้เดินทางไปมาระหว่างสองหน้าได้ — ใช้เวลาประมาณ 1 session
Group Chat + ExpensePanel เป็น Phase 3 ที่ทำได้ใน 2-3 sessions ถัดไป
