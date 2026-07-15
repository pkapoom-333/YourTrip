@echo off
cd /d C:\Users\user\Documents\your-trip
git config user.email "pakpoomtee24@gmail.com"
git config user.name "Pakpoom"
git add your-trip-web/package.json your-trip-web/package-lock.json
git commit -m "fix: upgrade @prisma/client to 7.8.0 to match prisma CLI (root cause of 1-sec generate failure)"
git push github main
pause
