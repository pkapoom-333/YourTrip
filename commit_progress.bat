@echo off
if exist "C:\Users\user\Documents\your-trip\.git\index.lock" del "C:\Users\user\Documents\your-trip\.git\index.lock"
cd /d "C:\Users\user\Documents\your-trip"
git add PROGRESS.md
git commit -m "Day 24: docs: update PROGRESS.md"
git push github main
echo Done!
pause
