Set shell = CreateObject("WScript.Shell")
Set fso = CreateObject("Scripting.FileSystemObject")
Dim logPath : logPath = "C:\Users\user\Documents\your-trip\restore_result2.txt"

Dim lf : Set lf = fso.CreateTextFile(logPath, True)
lf.WriteLine "START: " & Now()

' Delete stale index.lock if present
Dim lockFile : lockFile = "C:\Users\user\Documents\your-trip\.git\index.lock"
If fso.FileExists(lockFile) Then
    fso.DeleteFile(lockFile)
    lf.WriteLine "Deleted index.lock"
Else
    lf.WriteLine "No index.lock"
End If
lf.Close

Dim repoDir : repoDir = "C:\Users\user\Documents\your-trip"
Dim webDir : webDir = repoDir & "\your-trip-web\src\app"
Dim ret

' Restore ExploreClient.tsx from HEAD
ret = shell.Run("cmd /c cd /d """ & repoDir & """ && git show HEAD:your-trip-web/src/app/explore/ExploreClient.tsx > """ & webDir & "\explore\ExploreClient.tsx"" 2>> """ & logPath & """", 0, True)
Dim lf2 : Set lf2 = fso.OpenTextFile(logPath, 8, True)
lf2.WriteLine "ExploreClient exit: " & ret
lf2.Close

' Restore PostDetailClient.tsx from HEAD
ret = shell.Run("cmd /c cd /d """ & repoDir & """ && git show HEAD:your-trip-web/src/app/post/[id]/PostDetailClient.tsx > """ & webDir & "\post\[id]\PostDetailClient.tsx"" 2>> """ & logPath & """", 0, True)
Dim lf3 : Set lf3 = fso.OpenTextFile(logPath, 8, True)
lf3.WriteLine "PostDetailClient exit: " & ret
lf3.Close

' Restore collections/page.tsx from HEAD
ret = shell.Run("cmd /c cd /d """ & repoDir & """ && git show HEAD:your-trip-web/src/app/collections/page.tsx > """ & webDir & "\collections\page.tsx"" 2>> """ & logPath & """", 0, True)
Dim lf4 : Set lf4 = fso.OpenTextFile(logPath, 8, True)
lf4.WriteLine "collections/page exit: " & ret
lf4.Close

' Delete lock again
If fso.FileExists(lockFile) Then
    fso.DeleteFile(lockFile)
End If

MsgBox "Done! See restore_result2.txt", 64, "Restore Files"
