@echo off
echo === YourTrip Day 19 Git Push ===
cd /d "C:\Users\user\Documents\your-trip"

echo.
echo [1/5] Removing index.lock if exists...
if exist ".git\index.lock" (
    del /f ".git\index.lock"
    echo   index.lock removed.
) else (
    echo   No index.lock found.
)

echo.
echo [2/5] Staging all fixed files...
git add "your-trip-web/src/hooks/useLocalStorage.ts"
git add "your-trip-web/src/app/trips/[id]/page.tsx"
git add "your-trip-web/src/app/search/posts/page.tsx"
git add "your-trip-web/src/app/search/posts/PostSearchClient.tsx"
git add "your-trip-web/src/app/search/users/page.tsx"
git add "your-trip-web/src/components/features/UserSearchClient.tsx"
git add "your-trip-web/src/components/features/UserListRow.tsx"
git add "your-trip-web/src/app/place/[slug]/PlaceDetailClient.tsx"
git add "your-trip-web/src/server/actions/profile.ts"

echo.
echo [3/5] Git status:
git status --short

echo.
echo [4/5] Committing...
git commit -m "Day 19: fix: restore 6 truncated files + hydration fix + follow auth guard"

echo.
echo [5/5] Pushing to github main...
git push github main

echo.
echo === Done! Check Vercel: https://vercel.com/pakpoomtee24s-projects/your-trip ===
pause
