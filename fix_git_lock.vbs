Set fso = CreateObject("Scripting.FileSystemObject")
Dim lockFile
lockFile = fso.GetAbsolutePathName(".git\index.lock")
If fso.FileExists(lockFile) Then
    fso.DeleteFile lockFile
    MsgBox "Git lock removed. You can now run git commands.", 64, "Fixed"
Else
    MsgBox "No lock file found.", 64, "OK"
End If
