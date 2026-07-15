Set WshShell = CreateObject("WScript.Shell")
Set fso = CreateObject("Scripting.FileSystemObject")

WshShell.CurrentDirectory = "C:\Users\user\Documents\your-trip"

' Step 1: Remove any lock files
Dim locks(5)
locks(0) = ".git\index.lock"
locks(1) = ".git\refs\heads\main.lock"
locks(2) = ".git\packed-refs.lock"
locks(3) = ".git\HEAD.lock"
locks(4) = ".git\COMMIT_EDITMSG.lock"
locks(5) = ".git\MERGE_HEAD.lock"
Dim i
For i = 0 To 5
    If fso.FileExists(locks(i)) Then fso.DeleteFile locks(i)
Next

' Step 2: Rebuild the git index from HEAD (in case it's corrupt)
WshShell.Run "cmd /c cd C:\Users\user\Documents\your-trip && git read-tree HEAD > C:\Users\user\Documents\your-trip\fix_push_output.txt 2>&1", 1, True

' Step 3: Add + commit + push
WshShell.Run "cmd /c cd C:\Users\user\Documents\your-trip && " & _
    "git config user.email ""pakpoomtee24@gmail.com"" && " & _
    "git config user.name ""Pakpoom"" && " & _
    "git add your-trip-web/package.json your-trip-web/package-lock.json >> C:\Users\user\Documents\your-trip\fix_push_output.txt 2>&1 && " & _
    "git commit -m ""fix: upgrade @prisma/client to 7.8.0 to match prisma CLI"" >> C:\Users\user\Documents\your-trip\fix_push_output.txt 2>&1 && " & _
    "git push github main >> C:\Users\user\Documents\your-trip\fix_push_output.txt 2>&1", 1, True

' Step 4: Show result
Dim outLog
outLog = ""
If fso.FileExists("fix_push_output.txt") Then
    Dim f
    Set f = fso.OpenTextFile("fix_push_output.txt", 1)
    outLog = f.ReadAll
    f.Close
End If
MsgBox "Push Result:" & Chr(10) & outLog, 64, "YourTrip Push"
