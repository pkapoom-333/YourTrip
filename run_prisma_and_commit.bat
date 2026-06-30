@echo off
cd /d "C:\Users\user\Documents\your-trip\your-trip-web"
echo Running prisma generate...
call npx prisma generate
echo.
echo Checking for index.lock...
if exist "C:\Users\user\Documents\your-trip\your-trip-web\.git\index.lock" (
  del "C:\Users\user\Documents\your-trip\your-trip-web\.git\index.lock"
)
if exist "C:\Users\user\Documents\your-trip\.git\index.lock" (
  del "C:\Users\user\Documents\your-trip\.git\index.lock"
)
cd /d "C:\Users\user\Documents\your-trip"
echo.
echo Committing...
git add -A
git commit -m "Day 24: feat: admin dashboard + place management CRUD + messages overview"
echo.
echo Pushing to GitHub...
git push github main
echo.
echo Done!
pause
