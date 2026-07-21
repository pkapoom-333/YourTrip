@echo off
cd /d C:\Users\user\Documents\your-trip\your-trip-web

if exist ".git\index.lock" del /f ".git\index.lock"

git add -A > C:\Users\user\Documents\your-trip\git_s33_result.txt 2>&1
echo ADD_EXIT: %ERRORLEVEL% >> C:\Users\user\Documents\your-trip\git_s33_result.txt

git commit -m "Day 39: feat: S33 notifications type filter + place submit photo upload + TS fixes" >> C:\Users\user\Documents\your-trip\git_s33_result.txt 2>&1
echo COMMIT_EXIT: %ERRORLEVEL% >> C:\Users\user\Documents\your-trip\git_s33_result.txt

git push github main >> C:\Users\user\Documents\your-trip\git_s33_result.txt 2>&1
echo PUSH_EXIT: %ERRORLEVEL% >> C:\Users\user\Documents\your-trip\git_s33_result.txt
