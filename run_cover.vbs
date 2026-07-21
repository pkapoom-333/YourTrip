Set shell = CreateObject("WScript.Shell")
Set fso = CreateObject("Scripting.FileSystemObject")
Dim logPath : logPath = "C:\Users\user\Documents\your-trip\cover_result.txt"
shell.Run "cmd /c taskkill /F /IM node.exe /T 2>nul", 0, True
shell.Run "cmd /c timeout /t 1 /nobreak", 0, True
Dim lf : Set lf = fso.CreateTextFile(logPath, True)
lf.WriteLine "START: " & Now()
lf.Close
Dim ret
ret = shell.Run("cmd /c cd /d ""C:\Users\user\Documents\your-trip"" && node add_cover.js >> """ & logPath & """ 2>&1", 0, True)
Dim lf2 : Set lf2 = fso.OpenTextFile(logPath, 8, True)
lf2.WriteLine "EXIT CODE: " & ret
lf2.Close
If ret = 0 Then
    MsgBox "coverImage column added! Check cover_result.txt", 64, "Done"
Else
    MsgBox "Failed (code " & ret & "). See cover_result.txt", 16, "Error"
End If
