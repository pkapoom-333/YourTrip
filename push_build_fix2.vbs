Set WshShell = CreateObject("WScript.Shell")
Set fso = CreateObject("Scripting.FileSystemObject")
WshShell.CurrentDirectory = "C:\Users\user\Documents\your-trip"

' Clear any lock files
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
    "git add your-trip-web/src/app/admin/ai-places/page.tsx your-trip-web/src/server/actions/trips.ts your-trip-web/src/server/actions/profile.ts your-trip-web/src/app/trips/templates/page.tsx > C:\Users\user\Documents\your-trip\push_build_fix2_out.txt 2>&1 && " & _
    "git commit -m ""fix: Turbopack 4 build errors (metadata in client, non-async actions, profile.ts parse error)"" >> C:\Users\user\Documents\your-trip\push_build_fix2_out.txt 2>&1 && " & _
    "git push github main >> C:\Users\user\Documents\your-trip\push_build_fix2_out.txt 2>&1", 1, True

Dim outLog
outLog = ""
If fso.FileExists("push_build_fix2_out.txt") Then
    Dim f
    Set f = fso.OpenTextFile("push_build_fix2_out.txt", 1)
    outLog = f.ReadAll
    f.Close
End If
MsgBox "Build Fix Push:" & Chr(10) & outLog, 64, "YourTrip"
