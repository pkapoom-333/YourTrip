Set WshShell = CreateObject("WScript.Shell")
Set fso = CreateObject("Scripting.FileSystemObject")

WshShell.CurrentDirectory = "C:\Users\user\Documents\your-trip"

' Delete only lock files (NOT the index)
Dim lockList(5)
lockList(0) = ".git\index.lock"
lockList(1) = ".git\refs\heads\main.lock"
lockList(2) = ".git\packed-refs.lock"
lockList(3) = ".git\HEAD.lock"
lockList(4) = ".git\COMMIT_EDITMSG.lock"
lockList(5) = ".git\MERGE_HEAD.lock"
Dim i
For i = 0 To 5
    If fso.FileExists(lockList(i)) Then fso.DeleteFile lockList(i)
Next

' Stage schema.prisma only, commit, push
WshShell.Run "cmd /c cd C:\Users\user\Documents\your-trip && " & _
    "git config user.email ""pakpoomtee24@gmail.com"" && " & _
    "git config user.name ""Pakpoom"" && " & _
    "git add your-trip-web/prisma/schema.prisma && " & _
    "git commit -m ""fix: add missing CheckIn + TripCollaborator models — fixes npx prisma generate failure"" && " & _
    "git push github main " & _
    "> C:\Users\user\Documents\your-trip\push_schema_output.txt 2>&1", 1, True

' Show result
Dim outLog
outLog = ""
If fso.FileExists("push_schema_output.txt") Then
    Dim f
    Set f = fso.OpenTextFile("push_schema_output.txt", 1)
    outLog = f.ReadAll
    f.Close
End If
MsgBox "Schema Fix Push:" & Chr(10) & outLog, 64, "YourTrip"
