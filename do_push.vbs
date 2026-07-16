Set shell = CreateObject("WScript.Shell")
Set fso = CreateObject("Scripting.FileSystemObject")

Dim repoDir : repoDir = "C:\Users\user\Documents\your-trip"
Dim logPath : logPath = repoDir & "\push_log.txt"

Dim lf
Set lf = fso.CreateTextFile(logPath, True)
lf.WriteLine "START: " & Now()
lf.Close

' Amend commit message first
Dim ret
ret = shell.Run("cmd /c cd /d """ & repoDir & """ && git commit --amend -m ""Day 39: feat: S30 trip share+server search+recently viewed + S31 post edit/delete for owners"" >> """ & logPath & """ 2>&1", 0, True)

Dim lf2
Set lf2 = fso.OpenTextFile(logPath, 8, True)
lf2.WriteLine "AMEND CODE: " & ret
lf2.Close

' Push
ret = shell.Run("cmd /c cd /d """ & repoDir & """ && git push github main >> """ & logPath & """ 2>&1", 0, True)

Dim lf3
Set lf3 = fso.OpenTextFile(logPath, 8, True)
lf3.WriteLine "PUSH CODE: " & ret & " DONE: " & Now()
lf3.Close
