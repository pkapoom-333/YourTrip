Dim oShell, oFSO
Set oShell = CreateObject("WScript.Shell")
Set oFSO = CreateObject("Scripting.FileSystemObject")

' Kill stuck cmd processes
oShell.Run "cmd /c taskkill /F /IM cmd.exe /T", 0, True

' Wait 1 second
WScript.Sleep 1000

' Delete lock file if exists
Dim lockFile
lockFile = "C:\Users\user\Documents\your-trip\.git\index.lock"
If oFSO.FileExists(lockFile) Then
    oFSO.DeleteFile lockFile, True
End If

' Run git commands
oShell.Run "cmd /c cd /d C:\Users\user\Documents\your-trip && git add -A && git commit -m ""Day 25: feat: admin analytics page (line charts, donut, bar, top places/tags)"" && git push github main > C:\Users\user\Documents\your-trip\git_push_output.txt 2>&1", 0, True

MsgBox "Git push complete! Check git_push_output.txt for details.", 64, "Done"
