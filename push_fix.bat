@echo off
cd /d C:\Users\user\Documents\your-trip
echo === Removing stale lock file ===
del .git\index.lock 2>nul

echo === Staging all changes ===
git add your-trip-web/src/hooks/useLocalStorage.ts
git add "your-trip-web/src/app/trips/[id]/page.tsx"
git add "your-trip-web/src/app/place/[slug]/PlaceDetailClient.tsx"
git add your-trip-web/src/app/search/posts/PostSearchClient.tsx
git add your-trip-web/src/app/search/posts/page.tsx
git add your-trip-web/src/app/search/users/page.tsx
git add your-trip-web/src/components/features/UserSearchClient.tsx

echo === Git status ===
git status

echo === Committing ===
git commit -m "Day 19: fix: hydration mismatch + place reviews empty state + search URL params"

echo === Pushing to GitHub ===
git push github main

echo === Done! Check https://vercel.com for deployment ===
pause
