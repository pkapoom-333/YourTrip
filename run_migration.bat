@echo off
cd /d "C:\Users\user\Documents\your-trip\your-trip-web"
echo Running chat migration via Prisma...
npx prisma db execute --file="..\supabase_chat_migration.sql" --url="postgresql://postgres.wujunlagtipvbzappuwx:pakpoomtee24@aws-1-ap-northeast-1.pooler.supabase.com:5432/postgres"
echo.
echo Done! Check above for errors.
pause
