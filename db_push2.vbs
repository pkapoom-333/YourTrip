Set shell = CreateObject("WScript.Shell")
Set fso = CreateObject("Scripting.FileSystemObject")

Dim webDir : webDir = "C:\Users\user\Documents\your-trip\your-trip-web"
Dim logPath : logPath = "C:\Users\user\Documents\your-trip\db_push2_result.txt"

' Kill any hung node/prisma processes first
shell.Run "cmd /c taskkill /F /IM node.exe /T", 0, True

' Small delay
shell.Run "cmd /c timeout /t 2 /nobreak", 0, True

' Write start marker
Dim lf : Set lf = fso.CreateTextFile(logPath, True)
lf.WriteLine "START: " & Now()
lf.Close

' Run prisma db push using PowerShell for better output capture
Dim psCmd
psCmd = "powershell -ExecutionPolicy Bypass -Command """ & _
    "Set-Location '" & webDir & "'; " & _
    "$out = npx prisma db push --accept-data-loss 2>&1; " & _
    "$out | Out-File -FilePath '" & logPath & "' -Append -Encoding utf8; " & _
    "exit $LASTEXITCODE" & """"

Dim ret
ret = shell.Run(psCmd, 0, True)

' Append exit code
Dim lf2 : Set lf2 = fso.OpenTextFile(logPath, 8, True)
lf2.WriteLine "EXIT CODE: " & ret & " at " & Now()
lf2.Close

If ret = 0 Then
    MsgBox "DB push สำเร็จ! coverImage column synced to Supabase.", 64, "Done"
Else
    MsgBox "DB push failed (code " & ret & ") - check db_push2_result.txt", 16, "Error"
End If
