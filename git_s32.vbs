Set shell = CreateObject("WScript.Shell")
Set fso = CreateObject("Scripting.FileSystemObject")

Dim repoDir : repoDir = "C:\Users\user\Documents\your-trip"
Dim logPath : logPath = repoDir & "\git_s32_log.txt"

Dim lf
Set lf = fso.CreateTextFile(logPath, True)
lf.WriteLine "START: " & Now()
lf.Close

Dim ret
ret = shell.Run("cmd /c cd /d """ & repoDir & """ && git add -A >> """ & logPath & """ 2>&1", 0, True)
Dim lf2
Set lf2 = fso.OpenTextFile(logPath, 8, True)
lf2.WriteLine "ADD CODE: " & ret
lf2.Close

ret = shell.Run("cmd /c cd /d """ & repoDir & """ && git commit -m ""Day 39: feat: S32 follow suggestions + collections discover + profile cover photo"" >> """ & logPath & """ 2>&1", 0, True)
Dim lf3
Set lf3 = fso.OpenTextFile(logPath, 8, True)
lf3.WriteLine "COMMIT CODE: " & ret
lf3.Close

ret = shell.Run("cmd /c cd /d """ & repoDir & """ && git push github main >> """ & logPath & """ 2>&1", 0, True)
Dim lf4
Set lf4 = fso.OpenTextFile(logPath, 8, True)
lf4.WriteLine "PUSH CODE: " & ret & " DONE: " & Now()
lf4.Close

If ret = 0 Then
    MsgBox "S32 pushed!", 64, "Done"
Else
    MsgBox "Push failed (code " & ret & ")", 16, "Error"
End If
