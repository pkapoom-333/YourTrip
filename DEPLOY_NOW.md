# Deploy Instructions

Run these commands in Windows Command Prompt:

```
del "C:\Users\user\Documents\your-trip\.git\index.lock"
cd "C:\Users\user\Documents\your-trip"
git add -A && git commit -m "fix: blob FormData upload for story/avatar" && git push github main
```

## What was fixed

**Bug**: StoryUpload.tsx sends FormData but `/api/upload` in Blob mode only handled JSON handshake → every story upload got "ยังไม่ได้ตั้งค่า storage" error even though BLOB_READ_WRITE_TOKEN was set correctly in Vercel.

**Fix**: Added FormData handler in `/api/upload/route.ts` that uses `put()` server-side for Blob mode.

After pushing, Vercel will auto-deploy and story uploads will work.
