Set shell = CreateObject("WScript.Shell")
Set fso = CreateObject("Scripting.FileSystemObject")

Dim webDir : webDir = "C:\Users\user\Documents\your-trip\your-trip-web"
Dim logPath : logPath = "C:\Users\user\Documents\your-trip\db_push4_result.txt"

' Kill any hung node/prisma processes
shell.Run "cmd /c taskkill /F /IM node.exe /T 2>nul", 0, True
shell.Run "cmd /c timeout /t 2 /nobreak", 0, True

' Write start marker
Dim lf : Set lf = fso.CreateTextFile(logPath, True)
lf.WriteLine "START: " & Now()
lf.Close

' Use DIRECT Supabase URL (bypasses pooler/PgBouncer) via explicit env var
' This overrides whatever is in .env.local because prisma.config.ts checks
' if (!process.env[key]) before setting from file
Dim directUrl
directUrl = "postgresql://postgres:pakpoomtee24@db.wujunlagtipvbzappuwx.supabase.co:5432/postgres"

Dim cmd
cmd = "cmd /c set ""DATABASE_URL=" & directUrl & """ && set ""DIRECT_URL=" & directUrl & """ && cd /d """ & webDir & """ && npx prisma db push --accept-data-loss >> """ & logPath & """ 2>&1"

Dim ret
ret = shell.Run(cmd, 0, True)

' Append exit code
Dim lf2 : Set lf2 = fso.OpenTextFile(logPath, 8, True)
lf2.WriteLine "EXIT CODE: " & ret & " at " & Now()
lf2.Close

If ret = 0 Then
    MsgBox "DB push สำเร็จ! coverImage column synced.", 64, "Done"
Else
    MsgBox "DB push failed (code " & ret & "). See db_push4_result.txt", 16, "Error"
End If
