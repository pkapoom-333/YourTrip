Set shell = CreateObject("WScript.Shell")
Set fso = CreateObject("Scripting.FileSystemObject")

Dim scriptDir
scriptDir = fso.GetParentFolderName(WScript.ScriptFullName)

' Remove stale lock if present
Dim lockFile
lockFile = scriptDir & "\.git\index.lock"
If fso.FileExists(lockFile) Then fso.DeleteFile lockFile

Dim ret
ret = shell.Run("cmd /c cd /d """ & scriptDir & """ && git add -A", 1, True)
If ret <> 0 Then MsgBox "git add failed", 16, "Error" : WScript.Quit ret

ret = shell.Run("cmd /c cd /d """ & scriptDir & """ && git commit -m ""Day 37: feat: S28-1 profile interests editor + S28-2 explore map category pins""", 1, True)
If ret <> 0 Then MsgBox "git commit failed (maybe nothing to commit?)", 48, "Warning" : WScript.Quit ret

ret = shell.Run("cmd /c cd /d """ & scriptDir & """ && git push github main", 1, True)
If ret = 0 Then
    MsgBox "Pushed to github/main!", 64, "Done"
Else
    MsgBox "Push failed (code " & ret & ")", 16, "Push Error"
End If
