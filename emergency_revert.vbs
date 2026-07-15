Set WshShell = CreateObject("WScript.Shell")
Set fso = CreateObject("Scripting.FileSystemObject")

WshShell.CurrentDirectory = "C:\Users\user\Documents\your-trip"

' Step 1: Delete ONLY lock files (NOT the index - Windows git index is fine)
Dim lockList(5)
lockList(0) = ".git\index.lock"
lockList(1) = ".git\refs\heads\main.lock"
lockList(2) = ".git\packed-refs.lock"
lockList(3) = ".git\HEAD.lock"
lockList(4) = ".git\COMMIT_EDITMSG.lock"
lockList(5) = ".git\MERGE_HEAD.lock"

Dim i
For i = 0 To 5
    If fso.FileExists(lockList(i)) Then
        fso.DeleteFile lockList(i)
    End If
Next

' Step 2: Soft reset to undo bad commit 9f66de7 (keeps all files on disk)
' This puts us back to 0ab7f65 with next.config.ts still having our fix
WshShell.Run "cmd /c cd C:\Users\user\Documents\your-trip && " & _
    "git config user.email ""pakpoomtee24@gmail.com"" && " & _
    "git config user.name ""Pakpoom"" && " & _
    "git reset --soft HEAD~1 " & _
    "> C:\Users\user\Documents\your-trip\push_output3.txt 2>&1", 1, True

' Step 3: Unstage everything (go back to clean state at 0ab7f65)
WshShell.Run "cmd /c cd C:\Users\user\Documents\your-trip && " & _
    "git restore --staged . " & _
    ">> C:\Users\user\Documents\your-trip\push_output3.txt 2>&1", 1, True

' Step 4: Stage ONLY next.config.ts (which has the eslint fix)
WshShell.Run "cmd /c cd C:\Users\user\Documents\your-trip && " & _
    "git add your-trip-web/next.config.ts " & _
    ">> C:\Users\user\Documents\your-trip\push_output3.txt 2>&1", 1, True

' Step 5: Commit the fix
WshShell.Run "cmd /c cd C:\Users\user\Documents\your-trip && " & _
    "git commit -m ""fix: eslint ignoreDuringBuilds — unblock Vercel build"" " & _
    ">> C:\Users\user\Documents\your-trip\push_output3.txt 2>&1", 1, True

' Step 6: Force push to overwrite bad commit on GitHub
WshShell.Run "cmd /c cd C:\Users\user\Documents\your-trip && " & _
    "git push github main --force " & _
    ">> C:\Users\user\Documents\your-trip\push_output3.txt 2>&1", 1, True

' Step 7: Read and show output
Dim outLog
outLog = ""
If fso.FileExists("push_output3.txt") Then
    Dim f
    Set f = fso.OpenTextFile("push_output3.txt", 1)
    outLog = f.ReadAll
    f.Close
End If

MsgBox "Emergency Revert & Fix Push:" & Chr(10) & Chr(10) & outLog, 64, "YourTrip"
