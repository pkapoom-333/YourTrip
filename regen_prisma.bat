@echo off
cd /d "C:\Users\user\Documents\your-trip\your-trip-web"
echo Regenerating Prisma client with new expense models...
call npx prisma generate
echo.
echo Checking index.d.ts line count:
find node_modules\.prisma\client\index.d.ts | xargs wc -l 2>nul || echo done
echo.
echo Done! Press any key to close.
pause
