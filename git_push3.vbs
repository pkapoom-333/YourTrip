
Dim oShell
Set oShell = CreateObject("WScript.Shell")
oShell.Run "cmd /c cd /d C:\Users\user\Documents\your-trip && git add -A && git commit -m ""Day 25: feat: admin content moderation page (hide/delete posts, filter by reported)"" && git push github main > C:\Users\user\Documents\your-trip\git_push_output3.txt 2>&1", 0, True
MsgBox "Done!", 64, "Git Push"
