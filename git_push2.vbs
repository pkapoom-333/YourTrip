
Dim oShell
Set oShell = CreateObject("WScript.Shell")
oShell.Run "cmd /c cd /d C:\Users\user\Documents\your-trip && git add -A && git commit -m ""Day 25: feat: admin improvements (ban user, recent activity feed, analytics)"" && git push github main > C:\Users\user\Documents\your-trip\git_push_output2.txt 2>&1", 0, True
MsgBox "Done!", 64, "Git Push"
