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
    "git add PROGRESS.md DAILYWORK.md > C:\Users\user\Documents\your-trip\push_docs_out.txt 2>&1 && " & _
    "git commit -m ""docs: update PROGRESS + DAILYWORK — build green, S15-1/S15-2/S15-4 done"" >> C:\Users\user\Documents\your-trip\push_docs_out.txt 2>&1 && " & _
    "git push github main >> C:\Users\user\Documents\your-trip\push_docs_out.txt 2>&1", 1, True

Dim outLog
outLog = ""
If fso.FileExists("push_docs_out.txt") Then
    Dim f
    Set f = fso.OpenTextFile("push_docs_out.txt", 1)
    outLog = f.ReadAll
    f.Close
End If
MsgBox "Docs Commit:" & Chr(10) & outLog, 64, "YourTrip"
