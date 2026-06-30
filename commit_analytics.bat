@echo off
taskkill /F /IM cmd.exe /T >nul 2>&1
timeout /t 2 /nobreak >nul
if exist "C:\Users\user\Documents\your-trip\.git\index.lock" del /F "C:\Users\user\Documents\your-trip\.git\index.lock"
cd /d "C:\Users\user\Documents\your-trip"
git add -A
git commit -m "Day 25: feat: admin analytics page (line charts, donut, bar, top places/tags)"
git push github main
echo Done!
pause
