Set shell = CreateObject("WScript.Shell")
Set fso = CreateObject("Scripting.FileSystemObject")
Dim logPath : logPath = "C:\Users\user\Documents\your-trip\list_result.txt"
shell.Run "cmd /c taskkill /F /IM node.exe /T 2>nul", 0, True
shell.Run "cmd /c timeout /t 1 /nobreak", 0, True
Dim lf : Set lf = fso.CreateTextFile(logPath, True)
lf.WriteLine "START: " & Now()
lf.Close
Dim ret
ret = shell.Run("cmd /c cd /d ""C:\Users\user\Documents\your-trip"" && node list_tables.js >> """ & logPath & """ 2>&1", 0, True)
Dim lf2 : Set lf2 = fso.OpenTextFile(logPath, 8, True)
lf2.WriteLine "EXIT CODE: " & ret
lf2.Close
MsgBox "Done! See list_result.txt (exit: " & ret & ")", 64, "List Tables"
