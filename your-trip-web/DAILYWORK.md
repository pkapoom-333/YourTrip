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

