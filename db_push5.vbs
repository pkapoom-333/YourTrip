Set shell = CreateObject("WScript.Shell")
Set fso = CreateObject("Scripting.FileSystemObject")

Dim webDir : webDir = "C:\Users\user\Documents\your-trip\your-trip-web"
Dim logPath : logPath = "C:\Users\user\Documents\your-trip\db_push5_result.txt"

' Kill existing node processes
shell.Run "cmd /c taskkill /F /IM node.exe /T 2>nul", 0, True
shell.Run "cmd /c timeout /t 2 /nobreak", 0, True

Dim lf : Set lf = fso.CreateTextFile(logPath, True)
lf.WriteLine "START: " & Now()
lf.Close

' Pipe "y" to handle any Prisma 7 interactive prompts
' Using cmd /c "echo y | command" syntax
Dim ret
ret = shell.Run("cmd /c cd /d """ & webDir & """ && echo y | npx prisma db push 2>&1 >> """ & logPath & """", 0, True)

Dim lf2 : Set lf2 = fso.OpenTextFile(logPath, 8, True)
lf2.WriteLine "EXIT CODE: " & ret & " at " & Now()
lf2.Close

If ret = 0 Then
    MsgBox "DB push สำเร็จ!", 64, "Done"
Else
    MsgBox "Failed (code " & ret & ") - see db_push5_result.txt", 16, "Error"
End If
