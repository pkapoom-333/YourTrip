@echo off
if exist "C:\Users\user\Documents\your-trip\.git\index.lock" del "C:\Users\user\Documents\your-trip\.git\index.lock"
cd /d "C:\Users\user\Documents\your-trip"
git add -A
git commit -m "Day 25: feat: LINE-like chat (image upload, emoji reactions, online status, read receipts)"
git push github main
echo Done!
pause
