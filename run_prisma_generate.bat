@echo off
cd /d "C:\Users\user\Documents\your-trip\your-trip-web"
echo Running npx prisma generate...
npx prisma generate
echo.
echo Done! Prisma client updated.
pause
