@echo off
if exist "C:\Users\user\Documents\your-trip\.git\index.lock" del "C:\Users\user\Documents\your-trip\.git\index.lock"
cd /d "C:\Users\user\Documents\your-trip"
git add -A
git commit -m "Day 24: feat: expense splitter (Group Expense feature + Supabase migration)"
git push github main
echo Done!
pause
