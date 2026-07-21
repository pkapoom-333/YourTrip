Set shell = CreateObject("WScript.Shell")
Set fso = CreateObject("Scripting.FileSystemObject")
Dim logPath : logPath = "C:\Users\user\Documents\your-trip\restore_result.txt"

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

Dim ret
' Restore truncated files from HEAD
ret = shell.Run("cmd /c cd /d ""C:\Users\user\Documents\your-trip"" && git checkout HEAD -- your-trip-web/src/app/explore/ExploreClient.tsx your-trip-web/src/app/place/[slug]/PlaceDetailClient.tsx your-trip-web/src/app/post/[id]/PostDetailClient.tsx your-trip-web/src/app/collections/page.tsx >> """ & logPath & """ 2>&1", 0, True)
Dim lf2 : Set lf2 = fso.OpenTextFile(logPath, 8, True)
lf2.WriteLine "git checkout HEAD exit: " & ret

' Delete lock again if any
If fso.FileExists(lockFile) Then
    fso.DeleteFile(lockFile)
    lf2.WriteLine "Deleted index.lock (2nd time)"
End If

lf2.Close

MsgBox "Done. Exit: " & ret & ". See restore_result.txt", 64, "Restore"
