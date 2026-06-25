@echo off
cd /d "C:\Users\user\Documents\your-trip"
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0do-deploy.ps1"
