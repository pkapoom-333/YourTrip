Set sh = CreateObject("WScript.Shell")

' Kill all git processes
sh.Run "taskkill /f /im git.exe", 0, True

' Wait a moment
WScript.Sleep 2000

' Delete index.lock directly via cmd
sh.Run "cmd /c del /f /q ""C:\Users\user\Documents\your-trip\.git\index.lock""", 0, True

' Write result
Set fso = CreateObject("Scripting.FileSystemObject")
Set f = fso.OpenTextFile("C:\Users\user\Documents\your-trip\kill_git_result.txt", 2, True)
If fso.FileExists("C:\Users\user\Documents\your-trip\.git\index.lock") Then
    f.WriteLine "LOCK STILL EXISTS"
Else
    f.WriteLine "LOCK DELETED OK"
End If
f.Close
