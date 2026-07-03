@echo off
echo Running Day 26 migrations...
cd /d "C:\Users\user\Documents\your-trip\your-trip-web"
echo.
echo 1/2 Running: add_site_config migration
psql %DATABASE_URL% -f prisma\migrations\20260630000001_add_site_config\migration.sql
echo.
echo 2/2 Running: expense_invite_code migration
psql %DATABASE_URL% -f prisma\migrations\20260630000002_expense_invite_code\migration.sql
echo.
echo Done! Press any key to close.
pause
