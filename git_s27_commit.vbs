Set shell = CreateObject("WScript.Shell")
Set fso = CreateObject("Scripting.FileSystemObject")

' Get the directory where this script lives
Dim scriptDir
scriptDir = fso.GetParentFolderName(WScript.ScriptFullName)

' Step 1: Remove stale lock if present
Dim lockFile
lockFile = scriptDir & "\.git\index.lock"
If fso.FileExists(lockFile) Then
    fso.DeleteFile lockFile
End If

' Step 2: git add all changes
Dim ret
ret = shell.Run("cmd /c cd /d """ & scriptDir & """ && git add -A", 1, True)
If ret <> 0 Then
    MsgBox "git add failed (code " & ret & "). Check your git config.", 16, "Error"
    WScript.Quit ret
End If

' Step 3: commit
ret = shell.Run("cmd /c cd /d """ & scriptDir & """ && git commit -m ""Day 37: feat: Sprint S17-S27 — quick reply notifications, story ring animation, expense category chart""", 1, True)
If ret <> 0 Then
    MsgBox "git commit failed (code " & ret & "). Maybe nothing to commit.", 48, "Warning"
    WScript.Quit ret
End If

' Step 4: push to github remote
Dim answer
answer = MsgBox("Commit done!" & vbCrLf & vbCrLf & "Push to github remote now?", 36, "Push?")
If answer = 6 Then ' Yes
    ret = shell.Run("cmd /c cd /d """ & scriptDir & """ && git push github main", 1, True)
    If ret <> 0 Then
        MsgBox "git push failed (code " & ret & "). Check your internet connection.", 16, "Push Error"
    Else
        MsgBox "Pushed to github/main successfully!", 64, "Done"
    End If
Else
    MsgBox "Commit done. Push skipped — run git push github main when ready.", 64, "Done"
End If
