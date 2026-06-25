@echo off
cd /d C:\Users\user\Documents\your-trip
del .git\index.lock 2>nul

echo [1/2] Committing blob upload fix...
git add your-trip-web/src/app/api/upload/route.ts
git commit -m "Day 19: fix: blob upload 400 — remove onUploadCompleted, pass token explicitly"

echo [2/2] Committing UX improvements...
git add your-trip-web/src/components/features/PostCard.tsx
git add your-trip-web/src/app/create/page.tsx
git add your-trip-web/src/app/notifications/page.tsx
git add your-trip-web/src/server/actions/notifications.ts
git commit -m "Day 20: feat: UX — double-tap like + swipe images + heart burst, SVG char ring, notification actor avatars"

echo Pushing to GitHub...
git push github main
pause
