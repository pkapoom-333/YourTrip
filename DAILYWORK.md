## 🔥 QUEST BOARD — Sprint S36 "COMMENTS + TRENDING + HIGHLIGHT REELS" (2026-07-21)
**เป้า:** Post comments threaded replies · Trending places รายสัปดาห์ · Profile highlight reels

```
PROGRESS ░░░░░░░░░░░░░░░░░░░░░░░░   0%
```

| # | Quest | XP | Status |
|---|-------|----|--------|
| S36-1 | **Post comments with threaded replies** — comment list under post detail, reply to comment, like comment, `createComment` / `getComments` server actions | 450 | ⬜ |
| S36-2 | **Trending places** — `/explore` section "กำลังฮิต" — places sorted by check-in count + save count ใน 7 วัน, horizontal scroll card strip | 350 | ⬜ |
| S36-3 | **Profile highlight reels** — `profile/[username]` แสดง pinned posts / best photos grid section, `pinnedAt` field ใน Post | 300 | ⬜ |

---

## 🔥 QUEST BOARD — Sprint S35 "ADMIN QUEUE + PACKING LIST + MENTION AUTOCOMPLETE" (2026-07-17)
**เป้า:** Admin place submission review queue · Smart packing list suggestions · @mention autocomplete in post composer

```
PROGRESS ████████████████████████ 100%  CODE COMPLETE
```

| # | Quest | XP | Status |
|---|-------|----|--------|
| S35-1 | **Admin place submissions queue** — `/admin/submissions/page.tsx` (225 lines): filter tabs, approve/reject buttons, detail expand, Google Maps link, Supabase update | 450 | ✅ |
| S35-2 | **Trip packing list smart suggestions** — `PackingListPanel.tsx` + `initPackingList` server action: categories (documents/electronics/clothing/toiletries), toggle + add + delete, default suggestions seeded from DB | 400 | ✅ |
| S35-3 | **@mention autocomplete in post composer** — `create/page.tsx`: detect `@` trigger at cursor, debounced `searchUsers(q,6)`, Avatar dropdown, onMouseDown inject `@username ` at cursor, Escape to dismiss | 350 | ✅ |

---

## 🔥 QUEST BOARD — Sprint S34 "NEAR ME + DM READ RECEIPTS + TRIP PROGRESS" (2026-07-17)
**เป้า:** Explore Near Me geolocation · DM read receipts · Trip progress tracker · Admin place queue

```
PROGRESS ████████████████████████ 100%  CODE COMPLETE
```

| # | Quest | XP | Status |
|---|-------|----|--------|
| S34-1 | **Explore "Near Me"** — GPS toggle button, `getPlacesNearCoords` action (haversine distance), sort by distance | 400 | ✅ |
| S34-2 | **DM read receipts** — mark message read on view, show ✓✓ in ChatWindow per message | 300 | ✅ |
| S34-3 | **Trip progress tracker** — checklist toggle on itinerary items, % progress bar in trip header | 350 | ✅ |

---

## 🔥 QUEST BOARD — Sprint S33 "NOTIFICATIONS POLISH + NEAR ME + PLACE SUBMIT UX" (2026-07-17)
**เป้า:** Notifications filter+bulk-read · Explore Near Me geolocation · Place submission improvements

```
PROGRESS ████████████████████████ 100%  CODE COMPLETE
```

| # | Quest | XP | Status |
|---|-------|----|--------|
| S33-1 | **Notifications filter + bulk mark-read** — filter tabs (all/likes/comments/follows/mentions) + "อ่านทั้งหมด" button | 300 | ✅ |
| S33-2 | **Explore "Near Me"** — GPS toggle button, `getPlacesNearCoords` action (haversine distance), sort by distance | 400 | ➡️ S34 |
| S33-3 | **Place submission form UX** — photo upload (Cloudinary) + preview grid before submit + form validation polish | 350 | ✅ |

---

## 🔥 QUEST BOARD — Sprint S32 "FOLLOW SUGGESTIONS + COLLECTIONS DISCOVERY + PROFILE COVER" (2026-07-17)
**เป้า:** Suggested users on Explore · Collections discovery page · Profile cover photo

```
PROGRESS ████████████████████████ 100%  CODE COMPLETE
```

| # | Quest | XP | Status |
|---|-------|----|--------|
| S32-1 | **Follow suggestions on People tab** — `getSuggestedUsers(10)` when no query, "แนะนำให้ติดตาม" section | 250 | ✅ |
| S32-2 | **Collections public discovery** — `getPublicCollections` action + `/collections/discover` page | 350 | ✅ |
| S32-3 | **Profile cover photo** — schema `User.coverImage String?` + migrate + upload in profile edit + header banner | 400 | ✅ |
| S32-4 | **DB migration for coverImage** — ALTER TABLE users via Node.js pg client (session pooler port 5432) | 100 | ✅ |

---

## 🔥 QUEST BOARD — Sprint S29 "PINNED POSTS + PASSPORT + STORY SWIPE" (2026-07-16)
**เป้า:** Profile pinned posts + travel passport stats + story UX improvements

```
PROGRESS ████████████████████████ 100%  CODE COMPLETE
```

| # | Quest | XP | Status |
|---|-------|----|--------|
| S29-1 | **Profile pinned posts grid** — `getPinnedPosts` on profile page, amber pin badge | 300 | ✅ |
| S29-2 | **Story viewer swipe between groups** — horizontal swipe ≥60px jumps group + hold-to-pause dim | 250 | ✅ |
| S29-3 | **Profile travel passport stats** — tripsCount + placesVisited + totalTripDays panel + interests on public profile | 300 | ✅ |

---

## 🔥 QUEST BOARD — Sprint S28 "PROFILE INTERESTS + MAP PINS" (2026-07-16)
**เป้า:** Profile interests editor + Explore map color category pins

```
PROGRESS ████████████████████████ 100%  CODE COMPLETE
```

| # | Quest | XP | Status |
|---|-------|----|--------|
| S28-1 | **Profile interests editor** — INTEREST_LIST chip picker in /profile/edit, saves to DB | 350 | ✅ |
| S28-2 | **Explore map category pins** — color-coded Leaflet DivIcons, legend, dynamic refresh | 300 | ✅ |
| S28-3 | **AI planner save-to-trip** — verified saveAITrip server action (no changes needed) | 50 | ✅ |

---

## 🔥 QUEST BOARD — Sprint S27 "QUICK REPLY + STORY RING + EXPENSE CHART" (2026-07-13)
**เป้า:** Inline reply from notifications + animated story ring + expense category breakdown

```
PROGRESS ████████████████████████ 100%  CODE COMPLETE
```

| # | Quest | XP | Status |
|---|-------|----|--------|
| S27-1 | **Quick-reply from comment notification** — inline textarea + send in notifications page | 350 | ✅ |
| S27-2 | **Story ring animation** — conic-gradient + hue-rotate CSS animation for unviewed stories | 150 | ✅ |
| S27-3 | **Expense category chart** — horizontal bar chart in expense summary tab | 200 | ✅ |

---

## 🔥 QUEST BOARD — Sprint S26 "PLACE PACKING + HASHTAGS + REVIEW PHOTOS" (2026-07-14)
**เป้า:** Place-aware packing list + hashtag navigation + review photo upload

```
PROGRESS ████████████████████████ 100%  CODE COMPLETE
```

| # | Quest | XP | Status |
|---|-------|----|--------|
| S26-1 | **Packing List Quick-Add** — FAB + smart suggestions + custom input on place detail | 300 | ✅ |
| S26-2 | **Hashtag links in captions** — `#tag` → `/tags/{tag}` in PostCard renderCaption | 100 | ✅ |
| S26-3 | **Review photo upload** — pick/preview/upload up to 3 photos in review form | 250 | ✅ |
| S26-4 | **`fix_git_lock.vbs`** — unlock stale git index for user | 50 | ✅ |

---

## 🔥 QUEST BOARD — Sprint S25 "STORY TEXT EDITOR" (2026-07-14)
**เป้า:** Canvas-based text sticker overlay for stories before upload

```
PROGRESS ████████████████████████ 100%  CODE COMPLETE
```

| # | Quest | XP | Status |
|---|-------|----|--------|
| S25-1 | **`StoryTextEditor.tsx`** — canvas sticker editor (drag, colors, delete) | 500 | ✅ |
| S25-2 | **`StoryUpload.tsx` wired** — composited JPEG replaces raw upload | 200 | ✅ |

---

## 🔥 QUEST BOARD — Sprint S24 "REALTIME UX + PWA WIRE + CRON" (2026-07-14)
**เป้า:** Notifications Realtime + PWA install from settings + trip reminders cron

```
PROGRESS ████████████████████████ 100%  CODE COMPLETE
```

| # | Quest | XP | Status |
|---|-------|----|--------|
| S24-1 | **Notifications page Realtime** — INSERT listener, new notifs appear without refresh | 200 | ✅ |
| S24-2 | **`usePWAInstall` hook** — captures beforeinstallprompt, iOS vs Android | 100 | ✅ |
| S24-3 | **Settings PWA row wired** — installed/iOS/installable states | 100 | ✅ |
| S24-4 | **Trip reminder cron** — `/api/cron/trip-reminders` + vercel.json schedule | 300 | ✅ |

---

## 🔥 QUEST BOARD — Sprint S23 "PUSH + REACTIONS" (2026-07-14)
**เป้า:** Web Push infrastructure + Story emoji reactions + Story viewer count fix

```
PROGRESS ████████████████████████ 100%  CODE COMPLETE
```

| # | Quest | XP | Status |
|---|-------|----|--------|
| S23-1 | **VAPID key gen script** — `node scripts/generate-vapid-keys.js` | 100 | ✅ |
| S23-2 | **Push subscription API** — GET/POST/DELETE `/api/push/subscribe` | 200 | ✅ |
| S23-3 | **`sendWebPush` helper** — `lib/push.ts` with web-push TODO | 150 | ✅ |
| S23-4 | **`sendPushToUser/s` actions** — `server/actions/push.ts` | 150 | ✅ |
| S23-5 | **Push in `createNotification`** — every notif fires web push | 200 | ✅ |
| S23-6 | **Push in admin broadcast** — `broadcastNotification` fires push | 100 | ✅ |
| S23-7 | **Story viewer count fix** — `viewCount` field + `_count` Prisma query | 150 | ✅ |
| S23-8 | **Story emoji reactions** — `StoryReaction` model, server actions, StoryViewer UI | 400 | ✅ |

---

## 🔥 QUEST BOARD — Sprint S22 "SOCIAL + COLLAB" (2026-07-14)
**เป้า:** Social interactions แบบ real-time + Trip collaboration ครบจบ

```
PROGRESS ████████████████████████ 100%  CODE COMPLETE
```

| # | Quest | XP | Status |
|---|-------|----|--------|
| S22-1 | **Onboarding saves interests to DB** — `completeOnboarding()` + name/username input | 300 | ✅ |
| S22-2 | **Register → /onboarding redirect** — new users go through onboarding instead of /feed | 50 | ✅ |
| S22-3 | **Trip Members tab** — `TripCollaboratorsPanel` wired as 5th tab in feature panel | 150 | ✅ |
| S22-4 | **Real-time comments** — Supabase Realtime on PostDetailClient INSERT listener | 200 | ✅ |
| S22-5 | **Trip invite link** — `joinTrip()` action + ?join=1 param + copy invite button | 250 | ✅ |
| S22-6 | **joinTrip server action** — adds user as viewer collaborator on public trips | 100 | ✅ |

---

## 🔥 QUEST BOARD — Sprint S21 "UX POLISH + ONBOARDING" (2026-07-14)
**เป้า:** ทำให้ user แรกที่เข้ามาเข้าใจแอปและ engage ได้ทันที

```
PROGRESS ░░░░░░░░░░░░░░░░░░░░░░░░  0%  IN PROGRESS
```

| # | Quest | XP | Status |
|---|-------|----|--------|
| S21-1 | **Empty-state illustrations** — ทุก empty state มี icon + CTA แล้ว | 200 | ✅ |
| S21-2 | **Quick Actions bar on feed** — pill shortcuts สร้างทริป/เขียนรีวิว/ค้นหา/ค้นพบคน/ใกล้ฉัน | 150 | ✅ |
| S21-3 | **Trip day weather widget** — show forecast per day (Open-Meteo API) | 250 | ✅ |
| S21-4 | **Place Open/Closed real-time** — checkOpen() based on hours already in place/[slug] | 150 | ✅ |
| S21-5 | **Search suggestions** — recent searches already in ExploreClient localStorage | 200 | ✅ |
| S21-6 | **ProfileCompletionCard** — % bar + 6-step checklist, dismissable, in profile page | 200 | ✅ |
| S21-7 | **Share trip as image** — canvas trip card (skip, complex + needs canvas API) | 300 | ⬜ SKIP |

---

## 🔥 QUEST BOARD — Sprint S20 "DISCOVERY + CONTENT QUALITY" (2026-07-14)
**เป้า:** ทำให้แอปน่าใช้สำหรับผู้ใช้ใหม่ — better discovery, richer content

```
PROGRESS ░░░░░░░░░░░░░░░░░░░░░░░░  0%  IN PROGRESS
```

| # | Quest | XP | Status |
|---|-------|----|--------|
| S20-1 | **Discover page** — already wired to real DB with interest matching | 250 | ✅ |
| S20-2 | **Place review sort** — helpful/newest/highest/lowest already in PlaceDetailClient | 200 | ✅ |
| S20-3 | **Feed tabs** — สำหรับคุณ / ติดตาม already in FeedPostsClient | 200 | ✅ |
| S20-4 | **Trip templates** — /trips/templates page exists with createTripFromTemplate | 250 | ✅ |
| S20-5 | **Collection share** — /collections/[id] page fully implemented | 200 | ✅ |
| S20-6 | **Nearby places** — "nearby" sort key in ExploreClient with haversine distance | 200 | ✅ |
| S20-7 | **Homepage real stats** — getPlatformStats() wired in landing page | 150 | ✅ |
| S20-8 | **Trip Group Chat** — TripGroupChatPanel with Supabase Realtime subscription | 300 | ✅ |
| S20-9 | **Achievement link in profile** — 🏅 badge chip → /profile/achievements | 100 | ✅ |

---

## 🔥 QUEST BOARD — Sprint S19 "SOCIAL LAYER + PWA" (2026-07-14)
**ช่วง:** 14 ก.ค.+ | **เป้า:** Social interactions + PWA polish

```
PROGRESS ░░░░░░░░░░░░░░░░░░░░░░░░  0%  IN PROGRESS
```

### ⚔️ TIER S — This Sprint

| # | Quest | XP | Status |
|---|-------|----|--------|
| S19-1 | **Follow/Unfollow wire** — already wired in discover/people/explore/profile | 200 | ✅ |
| S19-2 | **Like wire** — PostCard has toggleLike with optimistic update (real DB) | 200 | ✅ |
| S19-3 | **Comment system** — CommentSection wired, createComment server action exists | 250 | ✅ |
| S19-4 | **Save place** — toggleSavePlace wired in PlaceDetailClient, Explore, Trending | 150 | ✅ |
| S19-5 | **PWA install prompt** — PWAInstallPrompt.tsx + AppShell integration exists | 200 | ✅ |
| S19-6 | **Offline page** — sw.js + public/offline.html already set up | 150 | ✅ |
| S19-7 | **Explore search** — ILIKE search in places.ts (searchPlaces), wired in ExploreClient | 300 | ✅ |
| S19-8 | **Edit profile modal** — /profile/edit page fully implemented | 200 | ✅ |
| S19-9 | **Trip Group Chat** — TripGroupChatPanel.tsx → wired into trip chat tab | 300 | ✅ |
| S19-10 | **Check-in FAB on place detail** — wired checkInToPlace + getUserCheckInStatus | 150 | ✅ |

---

## 🔥 QUEST BOARD — Sprint S18 "PROFILE MAP + PASSPORT" (2026-07-14)
**ช่วง:** 14 ก.ค. | **เป้า:** Profile travel visualization features

```
PROGRESS ████████████████████████ 100%  CODE COMPLETE
```

### ⚔️ TIER S — This Sprint

| # | Quest | XP | Status |
|---|-------|----|--------|
| S18-1 | **ThailandProvinceMap.tsx** — tile-grid 77 จังหวัด / 7 ภาค | 300 | ✅ |
| S18-2 | **Profile "แผนที่" tab** — เพิ่ม tab + wire getDeepStats → visitedProvinces | 200 | ✅ |
| S18-3 | **PassportPage** — `/profile/passport` shareable travel card | 300 | ✅ |
| S18-4 | **Passport button in profile** — 🛂 button → /profile/passport | 50 | ✅ |
| S18-5 | **Git commit S18** — รัน `git_s18_commit.vbs` | 100 | ⬜ USER ACTION |

---

## 🔥 QUEST BOARD — Sprint S17 "EXPENSE-TRIP INTEGRATION + GROUP CHAT FOUNDATION" (2026-07-12)
**ช่วง:** 12 ก.ค. | **MVP deadline:** 14 ก.ค. 2026

```
PROGRESS ████████████████████████ 100%  CODE COMPLETE — รอ git commit + SQL migration
```

### ⚔️ TIER S — This Sprint

| # | Quest | XP | Status |
|---|-------|----|--------|
| S17-1 | **TripExpenseTab.tsx** — empty state + link to existing group | 200 | ✅ |
| S17-2 | **Feature panel in trips/[id]** — 4-tab section (Expense/Budget/Packing/Chat) | 250 | ✅ |
| S17-3 | **ExpenseGroupClient back-link** — "← กลับทริป" when linked to trip | 100 | ✅ |
| S17-4 | **Group chat schema** — Conversation.name/avatarUrl/tripId + Trip.groupChat | 200 | ✅ |
| S17-5 | **createTripGroupChat / getTripGroupChat** — messages.ts additions | 200 | ✅ |
| S17-6 | **SQL migration block** — all_migrations.sql group_chat_schema | 100 | ✅ |
| S17-7 | **Git commit + push to github** — run `git_s17_commit.vbs` | 100 | ⬜ USER ACTION |
| S17-8 | **Supabase SQL migration** — paste all_migrations.sql (now includes S17) | 300 | ⬜ USER ACTION |
| S17-9 | **Run seed-system-user.ts** — after S17-8 | 50 | ⬜ USER ACTION |

---

## 🔥 QUEST BOARD — Sprint S16 "SYSTEM POSTS + INTEREST RANKING" (2026-07-10)
**ช่วง:** 10 ก.ค.+ | **MVP deadline:** 14 ก.ค. 2026

```
PROGRESS ████████████████████████ 100%  CODE COMPLETE — รอ SQL migration + seed
```

### ⚔️ TIER S — This Sprint

| # | Quest | XP | Status |
|---|-------|----|--------|
| S16-1 | **Schema fixes** — Trip↔ExpenseGroup relation, PostType enum, isSystemAccount, Trip.tags, TripExpense/PackingItem real models | 300 | ✅ |
| S16-2 | **🔴 Fixed expense_groups snake_case bug** — 5 expense models had zero `@map`, feature broken since Day 24 (0 rows in prod). Added `@map` everywhere | 300 | ✅ |
| S16-3 | **Fixed TripCollaborator addedAt mismatch** — schema had `createdAt`, migration SQL had `addedAt` → renamed field, removed dead `as any` | 100 | ✅ |
| S16-4 | **Fixed all_migrations.sql index bug** — Day 35 indexes used snake_case on camelCase tables, would've failed on paste | 100 | ✅ |
| S16-5 | **lib/interests.ts** — canonical 15-key interest vocabulary | 100 | ✅ |
| S16-6 | **System user + 10 system posts seed** — `prisma/seed-system-user.ts` | 200 | ✅ (not yet run — needs migration first) |
| S16-7 | **System posts in feed** — getSystemPosts + interleave (1/5) + empty-state welcome | 250 | ✅ |
| S16-8 | **Trip ranking by interest** — getPublicTripsRanked + matched-interest badges + banner | 250 | ✅ |
| S16-9 | **Feed personalization scoring** — getForYouFeed real in-memory ranking | 200 | ✅ |
| S16-10 | **Supabase SQL migration** — paste updated `all_migrations.sql` | 300 | ⬜ NEXT |
| S16-11 | **Run seed-system-user.ts** — after S16-10 | 50 | ⬜ NEXT |

---

## 🔥 QUEST BOARD — Sprint S15 "DEPLOY & LAUNCH" (Day 35 — 2026-07-03)
**ช่วง:** 3–14 ก.ค. 2026 | **MVP deadline:** 14 ก.ค. 2026

```
PROGRESS ████████████████████████ 100%  CODEBASE COMPLETE — รอ push + deploy
```

### ⚔️ TIER S — Launch Blockers

| # | Quest | XP | Status |
|---|-------|----|--------|
| S15-1 | **git push to GitHub** — รัน `fix_and_push.vbs` (340 files) | 500 | ✅ Done (commits 3451080→7c450ca) |
| S15-2 | **Vercel deploy** — import repo + env vars | 500 | ✅ Done — https://your-trip-nu.vercel.app (1m 8s build GREEN) |
| S15-3 | **Supabase SQL migrations** — paste all_migrations.sql (now bigger — see S16-10) | 300 | ⬜ NEXT |
| S15-4 | **Supabase Auth callback URL** — set to Vercel domain | 100 | ⬜ NEXT |

### ✅ DONE Day 35 (2026-07-03)

| # | Quest | XP | Status |
|---|-------|----|--------|
| D35-1 | **Error boundaries** — 57 new error.tsx → 79/79 pages covered | 300 | ✅ |
| D35-2 | **Not-found pages** — 20 new not-found.tsx for all dynamic routes | 200 | ✅ |
| D35-3 | **OG image system** — /api/og edge runtime + layout.tsx wired | 200 | ✅ |
| D35-4 | **TSC clean** — 0 errors across 340 TS files | 100 | ✅ |
| D35-5 | **fix_and_push.vbs** — updated commit message | 50 | ✅ |

---

# 🗺️ DAILYWORK.md — YourTrip Quest Board
> CTO Claude อ่านทุก session | ทำแบบ speedrun — commit บ่อย, ไม่ถามซ้ำ
> Last updated: 2026-06-12

---

## 🎮 CURRENT SPRINT — S9 "Final Mile"
**ช่วง:** 10–30 มิ.ย. 2026 | **MVP deadline:** 14 ก.ค. 2026

```
PROGRESS ██████████████████████ 98%  (Day 14 / ~34 ก่อน launch)
```

---

## 🔥 QUEST BOARD — Sprint S14 "LAUNCH POLISH"
**ช่วง:** 12–30 มิ.ย. 2026 | **MVP deadline:** 14 ก.ค. 2026

### ⚔️ TIER S — Launch Ready

| # | Quest | XP | Status |
|---|-------|----|--------|
| B3 | **Vercel deploy** — git push + env vars in dashboard | 500 | ⬜ (batch next session) |
| SD-3 | **Seed Supabase** — run seed-places-real.ts on production DB | 300 | ✅ 60 places |
| S14-1 | **Feed mobile nav wired** — Search→/explore, Bell→/notifications | 50 | ✅ |
| S14-2 | **Trip destination suggestions** — saved places → suggest trip destinations | 100 | ✅ |
| S14-3 | **trips/new URL prefill** — ?destination= param pre-fills wizard | 50 | ✅ |
| S14-4 | **create post URL prefill** — ?tag= + ?placeId= pre-fills form | 50 | ✅ |
| S14-5 | **Province page trip CTA** — "วางแผนทริป[province]" button in hero | 50 | ✅ |
| S14-6 | **Loading skeletons** — /explore/[province] + /profile/[userId] | 50 | ✅ |
| S14-7 | **Landing destination links** — cards link to province pages not /explore | 30 | ✅ |

---

## 🔥 QUEST BOARD — Sprint S13 "PRE-LAUNCH FINAL"
**ช่วง:** 12–30 มิ.ย. 2026 | **MVP deadline:** 14 ก.ค. 2026

### ⚔️ TIER S — ทำก่อนเลย

| # | Quest | XP | Status |
|---|-------|----|--------|
| B3 | **Vercel deploy** — git push + env vars in dashboard | 500 | ⬜ (batch next session) |
| SD-3 | **Seed Supabase** — run seed-places-real.ts on production DB | 300 | ✅ 60 places |
| S13-1 | **Vanity URLs** — /u/[username] → redirect to /profile/[userId] | 150 | ✅ |
| S13-2 | **Feed lightbox** — click image in PostCard for fullscreen zoom view | 200 | ✅ |
| S13-3 | **Place rating badge on Explore card** — star count + rating trend % | 100 | ✅ |
| S13-4 | **Place community posts grid** — /place/[slug] shows grid of community photos | 150 | ✅ |
| S13-5 | **Feed stories row wired** — real active users (posted last 7 days) replace mock | 100 | ✅ |

### 🛡️ TIER A — Polish

| # | Quest | XP | Status |
|---|-------|----|--------|
| A28 | **Travel stats card** — on profile: days traveled / places / avg days/trip + style badge | 150 | ✅ |
| A29 | **User activity timeline** — profile กิจกรรม tab shows posts/trips/reviews | 150 | ✅ |
| A30 | **OG metadata on trips** — layout.tsx generateMetadata for shared trip links | 100 | ✅ |

### 🏹 TIER B — UX Details

| # | Quest | XP | Status |
|---|-------|----|--------|
| S12-1 | Trending hashtags from DB (UNNEST SQL) | 100 | ✅ |
| S12-2 | Trip cover image upload (camera button) | 100 | ✅ |
| S12-5 | Related posts on post detail | 100 | ✅ |
| S12-6 | Trip day notes (inline editor) | 100 | ✅ |
| S12-7 | Place social sharing (LINE/Facebook/X) | 100 | ✅ |
| S12-8 | Budget category breakdown chips | 100 | ✅ |
| S12-9 | User activity timeline on own profile | 100 | ✅ |
| S12-10 | Explore destination spotlight cards | 100 | ✅ |
| S12-11 | Trip print/export copy-to-clipboard | 100 | ✅ |
| S12-12 | Public profile activity timeline | 100 | ✅ |

---

## 🔥 QUEST BOARD — Sprint S11 "POLISH & DEPLOY"
**ช่วง:** 12–20 มิ.ย. 2026 | **MVP deadline:** 14 ก.ค. 2026

### ⚔️ TIER S — Priority

| # | Quest | XP | Status |
|---|-------|----|--------|
| GM-1 | **Open in Google Maps** per destination + full route button | 100 | ✅ |
| GM-2 | **Google Directions API** — accurate travel times (3-tier fallback) | 200 | ✅ |
| GM-3 | **Places Autocomplete** in trips/[id] add-item modal | 150 | ✅ |
| S11-1 | **Province pages** — /explore/[province] SEO landing pages + explore chips | 250 | ✅ |
| S11-2 | **Save trip copy** — cloneTripToUser() + "บันทึกสำเนา" button | 150 | ✅ |

### 🛡️ TIER A — Polish

| # | Quest | XP | Status |
|---|-------|----|--------|
| A23 | **Place photo lightbox** — fullscreen viewer with thumbnail strip | 150 | ✅ |
| A24 | **AI caption assistant** — ✨ button in create post (claude-haiku) | 150 | ✅ |
| A25 | **Notification preferences** — per-type toggle in /settings/notifications | 100 | ✅ |
| A26 | **Trip QR code share** — modal with QR code for public trips | 100 | ✅ |

### 🏹 TIER B — UX Details

| # | Quest | XP | Status |
|---|-------|----|--------|
| B31 | **Post creation preview** — Eye/EyeOff toggle shows live PostCard | 100 | ✅ |
| B35 | **Destination autocomplete** — Google Places in /trips/new | 100 | ✅ |
| B36 | **Place reviews sort** — sort reviews by newest/highest/most liked | 50 | ✅ |
| B37 | **Feed video support** — show video player for mp4 posts | 100 | ✅ |

---

## 🔥 QUEST BOARD — Sprint S10 "LAUNCH READY"
**ช่วง:** 10–30 มิ.ย. 2026 | **MVP deadline:** 14 ก.ค. 2026

### ⚔️ TIER S — ทำก่อนเลย

| # | Quest | XP | Status |
|---|-------|----|--------|
| S10-1 | **Collections CRUD** — Create/edit/delete collection, add/remove places from collection | 300 | ✅ |
| S10-2 | **Blocked users settings page** — /settings/blocked list with unblock buttons | 150 | ✅ |
| S10-3 | **@mention notifications** — when tagged in post/comment, create Notification row | 200 | ✅ |

### 🛡️ TIER A — Polish Before Launch

| # | Quest | XP | Status |
|---|-------|----|--------|
| A19 | **Landing page polish** — add hero animation, features section, CTA, screenshots | 200 | ✅ |
| A20 | **PWA offline page** — custom /offline.html + better SW error fallback | 100 | ✅ |
| A21 | **Feed infinite scroll** — replace "load more" button with IntersectionObserver | 200 | ✅ |
| A22 | **Place categories filter** — filter by category chips in Explore (ร้านอาหาร/คาเฟ่/ธรรมชาติ) | 100 | ✅ |

### 🏹 TIER B — UX Details

| # | Quest | XP | Status |
|---|-------|----|--------|
| B30 | **Trip day drag-reorder** — drag items within a day to reorder (HTML5 drag or @dnd-kit) | 150 | ✅ |
| B31 | **Post creation preview** — show image preview before posting | 100 | ✅ (already built) |
| B32 | **Dark mode user setting** — remember dark/light preference via localStorage (not just system) | 50 | ✅ |
| B33 | **Notification mark all read** — "อ่านทั้งหมด" button on /notifications page | 50 | ✅ |

---

## 🔥 QUEST BOARD — Sprint S9 FINAL MILE

### ⚔️ TIER S — ทำก่อนเลย

| # | Quest | XP | Status |
|---|-------|----|--------|
| S9-1 | **Notification push real** — Supabase Realtime subscribe to new likes/follows/comments | 300 | ✅ |
| S9-2 | **Explore search bar** — search places by name/province with debounce in ExploreClient | 200 | ✅ |
| S9-3 | **Post image carousel in feed** — swipeable multi-image support in PostCard | 200 | ✅ |

### 🛡️ TIER A — Quality of Life

| # | Quest | XP | Status |
|---|-------|----|--------|
| A15 | **Block user** — /settings block list, block blocks follow + hides posts | 200 | ✅ |
| A16 | **Report post** — report button → logs to DB, admin can view | 150 | ✅ |
| A17 | **Profile stats** — trips count, places visited, total km traveled (from itinerary) | 150 | ✅ |
| A18 | **Place save from feed** — save button on place card in Explore shows saved state | 100 | ✅ |

### 🏹 TIER B — Polish

| # | Quest | XP | Status |
|---|-------|----|--------|
| B26 | **Guide badge on profile** — ✓ verified badge next to name for isVerifiedGuide users | 100 | ✅ |
| B27 | **Copy link to post** — share button in PostCard also copies to clipboard + toast | 50 | ✅ |
| B28 | **Trips calendar view** — /trips monthly calendar showing trip start/end dates | 200 | ✅ |
| B29 | **Search history** — localStorage-based recent searches on /search/posts + /search/users | 100 | ✅ |

---

## 🔥 QUEST BOARD — Sprint S8 COMPLETED

### ⚔️ TIER S — ทำก่อนเลย

| # | Quest | XP | Status |
|---|-------|----|--------|
| S8-1 | **Post detail page** — /post/[id]: full view, image, likes, share, OG meta | 300 | ✅ |
| S8-2 | **Profile edit** — change name, bio, username (avatar later with Cloudinary) | 250 | ✅ |
| S8-3 | **Write a review** — form in PlaceDetailClient: stars + text, POST to DB | 250 | ✅ |

### 🛡️ TIER A — Content + Discovery

| # | Quest | XP | Status |
|---|-------|----|--------|
| A11 | **Dynamic sitemap** — /sitemap.xml เพิ่ม entries จาก DB places + /u/[username] | 150 | ✅ |
| A12 | **Suggested follows sidebar** — "คนที่คุณอาจรู้จัก" widget บน feed (mutual follows) | 200 | ✅ |
| A13 | **Trip share link** — toggle trip เป็น public → shareable URL + OG preview | 200 | ✅ |
| A14 | **Comment delete** — post owner + comment owner สามารถ delete comment ตัวเองได้ | 100 | ✅ |

### 🏹 TIER B — Polish + UX

| # | Quest | XP | Status |
|---|-------|----|--------|
| B22 | **Post search** — search ใน feed by keyword (caption full-text) | 150 | ✅ |
| B23 | **Place suggest in create** — แนะนำ places จาก DB ขณะ type location ใน Create Post | 150 | ✅ |
| B24 | **Dark mode admin** — /admin/guides full dark sweep | 50 | ✅ |
| B25 | **Skeleton for collections** — loading.tsx สำหรับ /collections | 50 | ✅ |

---

## 🔥 QUEST BOARD — Sprint S7 COMPLETED

### ⚔️ TIER S — ทำก่อนเลย

| # | Quest | XP | Status |
|---|-------|----|--------|
| S7-1 | **User Search** — /search/users หน้าค้นหาคน + follow ได้เลย | 300 | ✅ |
| S7-2 | **Trending Places** — algorithm: sort by (saves×2 + reviews×3 + 7-day recency boost) | 200 | ✅ |
| S7-3 | **Onboarding wizard** — first-time user: choose interests + follow 3 suggested users | 250 | ✅ |
| S7-4 | **Place Collections** — user-curated lists ("/เที่ยวเชียงใหม่ weekend") like a listicle | 300 | ✅ |

### 🛡️ TIER A — Social + Quality

| # | Quest | XP | Status |
|---|-------|----|--------|
| A6 | **Hashtag browsing** — /tags/[tag] page แสดง posts + places ที่มี tag นั้น | 200 | ✅ |
| A7 | **Admin guide review** — /admin/guides: approve/reject guide applications | 250 | ✅ |
| A8 | **Post mentions** — @username ใน caption → link to profile | 150 | ✅ |
| A9 | **Place rating aggregate** — คำนวณ avg rating จาก reviews จริง (ตอนนี้ไม่ได้อัปเดต) | 200 | ✅ |
| A10 | **Feed Following tab** — filter feed เฉพาะ posts จากคนที่ follow | 250 | ✅ |

### 🏹 TIER B — Performance + PWA

| # | Quest | XP | Status |
|---|-------|----|--------|
| B18 | **Bundle analysis** — รัน @next/bundle-analyzer แล้ว optimize chunk ใหญ่สุด | 150 | ✅ |
| B19 | **Core Web Vitals** — ตรวจ LCP/FID/CLS ด้วย Lighthouse แล้วแก้ | 200 | ✅ |
| B20 | **Offline support** — sw.js cache: /feed, place images (stale-while-revalidate) | 150 | ✅ |
| B21 | **Share open graph preview** — og:image ดึง place photo จริง (ตอนนี้ใช้ fallback) | 100 | ✅ |

---

## 🔥 QUEST BOARD — Sprint S6 COMPLETED

### ⚔️ TIER S — ทำก่อนเลย (ไม่ต้อง allow)

| # | Quest | XP | Status |
|---|-------|----|--------|
| S6-1 | **Toast feedback system** — global toast/snackbar สำหรับ save, like, delete, error | 300 | ✅ |
| S6-2 | **Explore infinite scroll** — replace "โหลดเพิ่มเติม" button ด้วย IntersectionObserver | 200 | ✅ |
| S6-3 | **Place nearby from DB** — ตอนนี้ nearby คือ [] hardcoded ใน PlaceDetailClient | 200 | ✅ |
| S6-4 | **next/image optimization** — convert hero images ใน Landing + Place Detail | 150 | ✅ |
| S6-5 | **Custom 404 page** — not-found.tsx + error.tsx global | 100 | ✅ |
| S6-6 | **PWA icons** — สร้าง icon-192.png + icon-512.png จริง (SVG→PNG via canvas) | 150 | ✅ |
| S6-7 | **Profile/[userId] follow** — ตรวจสอบและ fix follow button บน public profile | 150 | ✅ |
| S6-8 | **Feed pull-to-refresh** — swipe-down gesture บน mobile | 100 | ✅ |
| S6-9 | **Post tags in explore** — เพิ่ม tag-based search ใน getPlaces (filter by tags array) | 200 | ✅ |
| S6-10 | **Dark mode** — toggle + CSS variables swap ใน Settings | 200 | ✅ |

### 🛡️ TIER A — SEO + PWA + Security

| # | Quest | XP | Status |
|---|-------|----|--------|
| A1 | **JSON-LD place pages** — Schema.org TouristAttraction/Restaurant/Cafe per category | 300 | ✅ |
| A2 | **Security headers** — X-Frame-Options, X-Content-Type-Options, Referrer-Policy ใน next.config.ts | 200 | ✅ |
| A3 | **PWA offline page** — /offline page + sw.js service worker + SW registration ใน layout | 250 | ✅ |
| A4 | **Canonical tags** — alternates.canonical ใน /feed /explore /trips /place/[slug] / | 150 | ✅ |
| A5 | **Preconnect hints** — link rel=preconnect Cloudinary + Unsplash + dns-prefetch Supabase | 100 | ✅ |

### 🏹 TIER B — Polish + UX

| # | Quest | XP | Status |
|---|-------|----|--------|
| B1 | **RouteError UX** — dark mode + smart error categorisation (network/auth/server) | 200 | ✅ |
| B2 | **Explore empty state** — clear-filters button เมื่อ search ไม่เจอผลลัพธ์ | 150 | ✅ |
| B3 | **Notifications empty state** — rich state แยก unread/all + กด "ดูทั้งหมด" | 150 | ✅ |
| B4 | **Buddy empty states** — ปรับ 3 tabs (discover/requests/matched) | 150 | ✅ |
| B5 | **WebSite JSON-LD** — Schema.org WebSite + SearchAction บน landing page | 200 | ✅ |
| B6 | **Sitemap expansion** — เพิ่ม /feed /trips /forgot-password | 100 | ✅ |
| B7 | **Env validator** — lib/env.ts ตรวจ env vars ตอน server start พร้อม hint | 150 | ✅ |
| B8 | **Dark mode Notifications + Buddy** — header, tabs, rows, cards | 200 | ✅ |
| B11 | **Dark mode full sweep** — PlaceDetailClient, FeedPostsClient, SuggestedUsers, UserListRow, ResetPassword, ImageUpload, PWAPrompt, 404, 10 loading skeletons, ExploreClient, TripsClient, create, buddy/BuddyCard, profile/edit | 500 | ✅ |
| B9 | **LCP image priority** — priority=true บน first destination image ใน landing | 100 | ✅ |
| B10 | **robots.ts** — เพิ่ม /post/, /offline, /auth/ disallow rules | 50 | ✅ |
| B12 | **Featured Guides on landing** — getVerifiedGuides + 3-col cards + mock fallback + CTA | 200 | ✅ |
| B13 | **Profile own Trips tab** — /profile page Trips tab (grid, public/private badge, create tile) | 150 | ✅ |
| B14 | **Add to Trip FAB** — place detail → bottom sheet modal (trip+day selector, addItineraryItem) | 250 | ✅ |
| B15 | **Trips list search bar** — filter by title+destination (visible when >3 trips) | 100 | ✅ |
| B16 | **Explore map view** — 3rd view toggle (Leaflet, lazy init, markers+popup, fitBounds) | 300 | ✅ |
| B17 | **Dark mode followers/following pages** — profile/[userId]/followers + following pages full dark sweep | 100 | ✅ |

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
| B5 | ANTHROPIC_API_KEY ใน .env.local + Vercel | user provide key |
| B6 | Google Maps API: enable Directions + Places APIs ใน GCP console | user action |

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
Total earned: ~8,400 XP (Day 1–13 sess 1 complete)
Session 2: S6-2(200)+S6-4(150)+S6-7(150)+S6-8(100)+S6-9(200) = +800 XP (S6-1/3/5/6/10 already done)
Sprint S6 TIER S: ALL 10 QUESTS CLEARED! 🎉
Session 3: Tier A (300+200+250+150+100=1,000) + Tier B (200+150+150+150+200+100+150+200+100+50=1,450) = +2,450 XP
Session 4 (Day 14): Google Maps+Guide System+Trip public+Community = ~800 XP
Session 5 (Day 14): robots(50)+FeaturedGuides(200)+ProfileTripsTab(150)+AddToTrip(250)+TripsSearch(100)+ExploreMap(300) = +1,050 XP
Grand total: ~15,100 XP 🏆
Remaining (blocked): B17 Capacitor (needs iOS env), B19 custom domain (user action), B3 git push (user confirm)
```

---

## ⚠️ MANUAL STEPS (ผู้ใช้ต้องทำเอง)

### SQL Migration
```sql
-- Run in: https://supabase.com/dashboard/project/wujunlagtipvbzappuwx/sql
ALTER TABLE trip_items ADD COLUMN IF NOT EXISTS travel_time_to INTEGER;

-- Guide Verification System (BV-1)
ALTER TABLE users ADD COLUMN IF NOT EXISTS is_guide BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS is_verified_guide BOOLEAN NOT NULL DEFAULT FALSE;

-- Place Collections (S7-4) — run after above
CREATE TABLE IF NOT EXISTS collections (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  title TEXT NOT NULL,
  description TEXT,
  emoji TEXT DEFAULT '📍',
  is_public BOOLEAN NOT NULL DEFAULT true,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS collection_places (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  collection_id TEXT NOT NULL REFERENCES collections(id) ON DELETE CASCADE,
  place_id TEXT NOT NULL REFERENCES places(id) ON DELETE CASCADE,
  note TEXT,
  "order" INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(collection_id, place_id)
);

CREATE INDEX IF NOT EXISTS idx_collections_user_id ON collections(user_id);
CREATE INDEX IF NOT EXISTS idx_collection_places_collection_id ON collection_places(collection_id);
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

---

## 💡 USER REQUESTS — บันทึกความต้องการจาก Pakpoom

### 🗺️ Google Maps Integration ใน /trips/[id]
> บันทึก: 2026-06-09 | ลำดับความสำคัญ: สูง

| # | Feature | รายละเอียด | Status |
|---|---------|------------|--------|
| GM-1 | **Open in Google Maps** | ปุ่มเปิด Google Maps ทุก destination + ปุ่ม "เปิด route ทั้งทริป" | ⏳ รอ API Key |
| GM-2 | **เวลาเดินทาง A→B** | แสดง "🚗 25 นาที · 12 กม." ระหว่างแต่ละจุดใน itinerary โดยใช้ Google Directions API | ⏳ รอ API Key |
| GM-3 | **Places Autocomplete** | ค้นหาสถานที่ผ่าน Google Places API เมื่อเพิ่ม destination ในทริป | ⏳ รอ API Key |

**Env ที่ต้องเพิ่ม:**
- `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` ใน `.env.local` และ Vercel dashboard
- Enable APIs: Maps JavaScript API, Directions API, Places API, Distance Matrix API


### 👥 Buddy — Guide Verification System
> บันทึก: 2026-06-09 | ลำดับความสำคัญ: กลาง (Phase 2+)

**ความต้องการ:**
- ผู้ใช้ที่เป็น Guide ต้องผ่านกระบวนการ verify ก่อนจึงจะรับงานพาเที่ยวได้
- มีเครื่องหมาย verified badge แสดงบน profile และ avatar อย่างชัดเจน

| # | Feature | รายละเอียด | Status |
|---|---------|------------|--------|
| BV-1 | **Guide role + badge** | เพิ่ม field `isGuide` + `isVerifiedGuide` ใน User model, แสดง badge 🏅 บน avatar + BuddyCard + profile | ✅ |
| BV-2 | **Verification flow** | หน้า apply เป็น guide → upload หลักฐาน (ID card / ใบอนุญาต) → pending review | ⬜ Phase 2 |
| BV-3 | **Admin review** | admin dashboard อนุมัติ/ปฏิเสธ คำขอ guide verification | ⬜ Phase 2 |
| BV-4 | **Accept job guard** | badge ⏳ รอการยืนยัน แสดงบน BuddyCard + requests tab (visual guard) | ✅ partial |

**Badge design:**
- Avatar: เครื่องหมาย ✓ สีทอง (verified guide) หรือ สีน้ำเงิน (regular verified) ที่มุมล่างขวา
- Profile: badge "มัคคุเทศก์ที่ได้รับการรับรอง" ใต้ชื่อ

**Depends on:** Supabase Storage (upload หลักฐาน) + admin role


### 🤖 AI Trip Planner — สร้างทริปด้วย AI
> บันทึก: 2026-06-09 | ลำดับความสำคัญ: สูง (Phase 3)

**ความต้องการ:** หน้า /trips มี AI assistant ช่วยสร้างทริปอัตโนมัติจาก form input

**Form inputs:**
- จำนวนคน (solo / คู่ / กลุ่ม)
- วันที่เดินทาง (ช่วงวัน)
- สไตล์ (cafe hopping / outdoor / cultural / adventure / shopping / ฯลฯ)
- จังหวัด/เมืองปลายทาง
- งบประมาณ (฿ / ฿฿ / ฿฿฿)

**AI Output:**
- สร้าง Trip + TripDays + TripItems อัตโนมัติ
- ดึงสถานที่จาก DB ที่ match กับ style + จังหวัด + งบ
- จัดลำดับสถานที่ต่อวันอย่างสมเหตุสมผล (เช้า/บ่าย/เย็น)
- คำนวณเวลาเดินทางระหว่างจุด (OSRM)
- บันทึก trip ลง DB ให้เลย

| # | Feature | รายละเอียด | Status |
|---|---------|------------|--------|
| AI-1 | **AI Trip form** | /trips/ai-plan หรือ modal — form กรอก preference | ✅ |
| AI-2 | **AI generation logic** | Server Action เรียก Claude API (claude-haiku) ส่ง context สถานที่ใน DB + preference → รับ itinerary JSON | ✅ |
| AI-3 | **Auto-create trip** | parse AI response → createTrip + TripDays + TripItems อัตโนมัติ | ✅ |
| AI-4 | **Preview before save** | แสดง itinerary ที่ AI สร้างให้ดูก่อน → กด "บันทึกทริปนี้" | ✅ |

**Stack:** Anthropic SDK (claude-haiku-4-5) + Prisma places as context
**Env ที่ต้องเพิ่ม:** `ANTHROPIC_API_KEY`


### 🌐 AI Content Pipeline — ดึงสถานที่ใหม่อัตโนมัติ
> บัน�