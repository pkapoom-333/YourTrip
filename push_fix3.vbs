Set WshShell = CreateObject("WScript.Shell")
Set fso = CreateObject("Scripting.FileSystemObject")
WshShell.CurrentDirectory = "C:\Users\user\Documents\your-trip"

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

WshShell.Run "cmd /c cd C:\Users\user\Documents\your-trip && " & _
    "git config user.email ""pakpoomtee24@gmail.com"" && " & _
    "git config user.name ""Pakpoom"" && " & _
    "git add your-trip-web/src/app/popular/page.tsx your-trip-web/src/app/trending/page.tsx ""your-trip-web/src/app/post/[id]/page.tsx"" > C:\Users\user\Documents\your-trip\push_fix3_out.txt 2>&1 && " & _
    "git commit -m ""fix: remove incorrect 'use server' from page files (causes object export error)"" >> C:\Users\user\Documents\your-trip\push_fix3_out.txt 2>&1 && " & _
    "git push github main >> C:\Users\user\Documents\your-trip\push_fix3_out.txt 2>&1", 1, True

Dim outLog
outLog = ""
If fso.FileExists("push_fix3_out.txt") Then
    Dim f
    Set f = fso.OpenTextFile("push_fix3_out.txt", 1)
    outLog = f.ReadAll
    f.Close
End If
MsgBox "Fix3 Push:" & Chr(10) & outLog, 64, "YourTrip"
