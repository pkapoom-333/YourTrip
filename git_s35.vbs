Set sh = CreateObject("WScript.Shell")

' Kill git processes and delete lock
sh.Run "taskkill /f /im git.exe", 0, True
WScript.Sleep 2000
sh.Run "cmd /c del /f /q ""C:\Users\user\Documents\your-trip\.git\index.lock""", 0, True
WScript.Sleep 500

' Stage S35 changes
Dim addCmd
addCmd = "cmd /c cd /d C:\Users\user\Documents\your-trip\your-trip-web" & _
    " && git add src\app\create\page.tsx" & _
    " ..\PROGRESS.md ..\DAILYWORK.md" & _
    " > C:\Users\user\Documents\your-trip\git_s35_result.txt 2>&1"
sh.Run addCmd, 0, True
WScript.Sleep 2000

' Commit
Dim commitCmd
commitCmd = "cmd /c cd /d C:\Users\user\Documents\your-trip\your-trip-web" & _
    " && git commit -m ""Day 39: feat: S35 @mention autocomplete in post composer + verify admin queue + packing list"" " & _
    " >> C:\Users\user\Documents\your-trip\git_s35_result.txt 2>&1"
sh.Run commitCmd, 0, True
WScript.Sleep 3000

' Push
Dim pushCmd
pushCmd = "cmd /c cd /d C:\Users\user\Documents\your-trip\your-trip-web" & _
    " && git push github main" & _
    " >> C:\Users\user\Documents\your-trip\git_s35_result.txt 2>&1"
sh.Run pushCmd, 0, True
WScript.Sleep 5000

MsgBox "S35 done! Check git_s35_result.txt", 64, "YourTrip Git"
