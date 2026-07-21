Set sh = CreateObject("WScript.Shell")

' Kill git processes and delete lock
sh.Run "taskkill /f /im git.exe", 0, True
WScript.Sleep 2000
sh.Run "cmd /c del /f /q ""C:\Users\user\Documents\your-trip\.git\index.lock""", 0, True
WScript.Sleep 500

' Stage S34 changes
Dim addCmd
addCmd = "cmd /c cd /d C:\Users\user\Documents\your-trip\your-trip-web" & _
    " && git add src\app\explore\ExploreClient.tsx" & _
    " src\app\trips\[id]\page.tsx" & _
    " ..\PROGRESS.md ..\DAILYWORK.md" & _
    " > C:\Users\user\Documents\your-trip\git_s34_result.txt 2>&1"
sh.Run addCmd, 0, True

' Commit
Dim commitCmd
commitCmd = "cmd /c cd /d C:\Users\user\Documents\your-trip\your-trip-web" & _
    " && git commit -m ""Day 39: feat: S34 Explore Near Me GPS button + trip progress tracker + restore ExploreClient"" " & _
    " >> C:\Users\user\Documents\your-trip\git_s34_result.txt 2>&1"
sh.Run commitCmd, 0, True

' Push
Dim pushCmd
pushCmd = "cmd /c cd /d C:\Users\user\Documents\your-trip\your-trip-web" & _
    " && git push github main" & _
    " >> C:\Users\user\Documents\your-trip\git_s34_result.txt 2>&1"
sh.Run pushCmd, 0, True
