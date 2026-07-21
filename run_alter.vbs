Set shell = CreateObject("WScript.Shell")
Set fso = CreateObject("Scripting.FileSystemObject")

Dim repoDir : repoDir = "C:\Users\user\Documents\your-trip"
Dim logPath : logPath = repoDir & "\alter_table_result.txt"

' Kill existing node processes
shell.Run "cmd /c taskkill /F /IM node.exe /T 2>nul", 0, True
shell.Run "cmd /c timeout /t 2 /nobreak", 0, True

Dim lf : Set lf = fso.CreateTextFile(logPath, True)
lf.WriteLine "START: " & Now()
lf.Close

' Run the Node.js script directly
Dim ret
ret = shell.Run("cmd /c cd /d """ & repoDir & """ && node alter_table.js >> """ & logPath & """ 2>&1", 0, True)

Dim lf2 : Set lf2 = fso.OpenTextFile(logPath, 8, True)
lf2.WriteLine "EXIT CODE: " & ret & " at " & Now()
lf2.Close

If ret = 0 Then
    MsgBox "ALTER TABLE สำเร็จ! ดู alter_table_result.txt สำหรับ details", 64, "Done"
Else
    MsgBox "ALTER TABLE failed (code " & ret & "). See alter_table_result.txt", 16, "Error"
End If
