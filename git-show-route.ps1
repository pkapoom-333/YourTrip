Set-Location 'C:\Users\user\Documents\your-trip'
git show f688cfe -- 'your-trip-web/src/app/api/upload/route.ts' | Out-File -Encoding utf8 'C:\Users\user\Documents\your-trip\route-diff.txt'
git show 96d7563:'your-trip-web/src/app/api/upload/route.ts' | Out-File -Encoding utf8 'C:\Users\user\Documents\your-trip\route-old.txt'
