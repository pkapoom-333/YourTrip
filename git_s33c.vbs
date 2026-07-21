Set fso = CreateObject("Scripting.FileSystemObject")
Set sh = CreateObject("WScript.Shell")

' Delete index.lock from correct git root (your-trip, not your-trip-web)
lockFile = "C:\Users\user\Documents\your-trip\.git\index.lock"
If fso.FileExists(lockFile) Then
    fso.DeleteFile lockFile, True
End If

' Run hidden, wait for completion
' Use your-trip root as working directory (git root)
sh.CurrentDirectory = "C:\Users\user\Documents\your-trip\your-trip-web"

Dim cmd
cmd = "cmd /c cd /d C:\Users\user\Documents\your-trip\your-trip-web" & _
    " && git restore --staged ." & _
    " && git add -A" & _
    " && git commit -m ""Day 39: feat: S33 notifications type filter + place submit photo upload + TS fixes""" & _
    " && git push github main" & _
    " > C:\Users\user\Documents\your-trip\git_s33_result.txt 2>&1"

sh.Run cmd, 0, True
