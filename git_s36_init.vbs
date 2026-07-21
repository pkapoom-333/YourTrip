Set sh = CreateObject("WScript.Shell")
Dim logFile
logFile = "C:\Users\user\Documents\your-trip\git_s36_init_result.txt"

' Kill git processes and delete lock
sh.Run "taskkill /f /im git.exe", 0, True
WScript.Sleep 2000
sh.Run "cmd /c del /f /q ""C:\Users\user\Documents\your-trip\.git\index.lock""", 0, True
WScript.Sleep 500

' Stage ALL modified/untracked files from repo root
Dim addCmd
addCmd = "cmd /c cd /d C:\Users\user\Documents\your-trip" & _
    " && git add -A" & _
    " > """ & logFile & """ 2>&1"
sh.Run addCmd, 0, True
WScript.Sleep 3000

' Commit
Dim commitCmd
commitCmd = "cmd /c cd /d C:\Users\user\Documents\your-trip" & _
    " && git commit -m ""Day 40: chore: S35->S36 transition — bulk commit pending files + Vercel env vars done + S36 quest board""" & _
    " >> """ & logFile & """ 2>&1"
sh.Run commitCmd, 0, True
WScript.Sleep 3000

' Push
Dim pushCmd
pushCmd = "cmd /c cd /d C:\Users\user\Documents\your-trip" & _
    " && git push github main" & _
    " >> """ & logFile & """ 2>&1"
sh.Run pushCmd, 0, True
WScript.Sleep 6000

MsgBox "S36 init done! Check git_s36_init_result.txt", 64, "YourTrip Git"
