Set shell = CreateObject("WScript.Shell")
Set fso = CreateObject("Scripting.FileSystemObject")
Dim logPath : logPath = "C:\Users\user\Documents\your-trip\fix_git_result.txt"

Dim lf : Set lf = fso.CreateTextFile(logPath, True)
lf.WriteLine "START: " & Now()

' Delete the stale index.lock
Dim lockFile : lockFile = "C:\Users\user\Documents\your-trip\.git\index.lock"
If fso.FileExists(lockFile) Then
    fso.DeleteFile(lockFile)
    lf.WriteLine "Deleted index.lock"
Else
    lf.WriteLine "No index.lock found"
End If
lf.Close

' Now run git reset HEAD to unstage everything
Dim ret
ret = shell.Run("cmd /c cd /d ""C:\Users\user\Documents\your-trip"" && git restore --staged . >> """ & logPath & """ 2>&1", 0, True)
Dim lf2 : Set lf2 = fso.OpenTextFile(logPath, 8, True)
lf2.WriteLine "git restore --staged exit: " & ret
lf2.Close

' Check status
shell.Run "cmd /c cd /d ""C:\Users\user\Documents\your-trip"" && git status --short >> """ & logPath & """ 2>&1", 0, True

MsgBox "Done. Exit code: " & ret & ". See fix_git_result.txt", 64, "Git Fix"
