@echo off
cd /d "C:\Users\user\Documents\your-trip\your-trip-web"
start cmd /k "npm run dev"
timeout /t 18 /nobreak > nul
start chrome http://localhost:5555
