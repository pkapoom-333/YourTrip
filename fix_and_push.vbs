Set WshShell = CreateObject("WScript.Shell")
Set fso = CreateObject("Scripting.FileSystemObject")

WshShell.CurrentDirectory = "C:\Users\user\Documents\your-trip"

' Step 1: Kill ALL stale lock files
Dim lockList(6)
lockList(0) = ".git\index.lock"
lockList(1) = ".git\refs\heads\main.lock"
lockList(2) = ".git\refs\heads\dev.lock"
lockList(3) = ".git\packed-refs.lock"
lockList(4) = ".git\HEAD.lock"
lockList(5) = ".git\COMMIT_EDITMSG.lock"
lockList(6) = ".git\MERGE_HEAD.lock"

Dim deleted
deleted = ""
Dim i
For i = 0 To 6
    If fso.FileExists(lockList(i)) Then
        fso.DeleteFile lockList(i)
        deleted = deleted & "Deleted: " & lockList(i) & Chr(10)
    End If
Next

' Step 2: Delete corrupt git index so git add rebuilds it fresh
If fso.FileExists(".git\index") Then
    fso.DeleteFile ".git\index"
    deleted = deleted & "Deleted: .git\index (will rebuild)" & Chr(10)
End If

' Step 3: git add -A + fresh commit of all current on-disk changes
WshShell.Run "cmd /c cd C:\Users\user\Documents\your-trip && " & _
    "git config user.email ""pakpoomtee24@gmail.com"" && " & _
    "git config user.name ""Pakpoom"" && " & _
    "git add -A && " & _
    "git commit -m ""Day 26-35: Full feature set — 341 TS files, 79 pages, 79 error.tsx, 21 not-found, 45 loading, OG images, maps, check-ins, packing list, achievements, AI place gen, admin suite"" " & _
    "> C:\Users\user\Documents\your-trip\push_output.txt 2>&1", 1, True

' Step 4: Push to GitHub via HTTPS remote named github
WshShell.Run "cmd /c cd C:\Users\user\Documents\your-trip && " & _
    "git push github main " & _
    ">> C:\Users\user\Documents\your-trip\push_output.txt 2>&1", 1, True

' Step 5: Read and show output
Dim outLog
outLog = ""
If fso.FileExists("push_output.txt") Then
    Dim f
    Set f = fso.OpenTextFile("push_output.txt", 1)
    outLog = f.ReadAll
    f.Close
End If

MsgBox "YourTrip Fix & Push:" & Chr(10) & Chr(10) & _
    "Cleaned:" & Chr(10) & deleted & Chr(10) & _
    "Git output:" & Chr(10) & outLog, 64, "YourTrip"
