@echo off
cd /d C:\Users\user\Documents\your-trip
del .git\index.lock 2>nul

echo Committing clean notifications.ts fix...
git add your-trip-web/src/server/actions/notifications.ts
git commit -m "Day 20: fix: notifications.ts — remove corrupt trailing junk, clean 145 lines"

echo Pushing to GitHub...
git push github main
pause
