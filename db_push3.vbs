Set shell = CreateObject("WScript.Shell")
Set fso = CreateObject("Scripting.FileSystemObject")

Dim webDir : webDir = "C:\Users\user\Documents\your-trip\your-trip-web"
Dim logPath : logPath = "C:\Users\user\Documents\your-trip\db_push3_result.txt"

' Kill any hung node/prisma/wscript processes
shell.Run "cmd /c taskkill /F /IM node.exe /T 2>nul", 0, True

' Wait 3 seconds
shell.Run "cmd /c timeout /t 3 /nobreak", 0, True

' Write start marker
Dim lf : Set lf = fso.CreateTextFile(logPath, True)
lf.WriteLine "START: " & Now()
lf.Close

' Run prisma db push — directUrl in prisma.config.ts now bypasses pooler
Dim ret
ret = shell.Run("cmd /c cd /d """ & webDir & """ && npx prisma db push --accept-data-loss >> """ & logPath & """ 2>&1", 0, True)

' Append exit code
Dim lf2 : Set lf2 = fso.OpenTextFile(logPath, 8, True)
lf2.WriteLine "EXIT CODE: " & ret & " at " & Now()
lf2.Close

If ret = 0 Then
    MsgBox "DB push สำเร็จ! coverImage synced to Supabase.", 64, "Done"
Else
    MsgBox "DB push failed (code " & ret & ") - check db_push3_result.txt", 16, "Error"
End If
