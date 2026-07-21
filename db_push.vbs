Set shell = CreateObject("WScript.Shell")
Set fso = CreateObject("Scripting.FileSystemObject")

Dim webDir : webDir = "C:\Users\user\Documents\your-trip\your-trip-web"
Dim logPath : logPath = "C:\Users\user\Documents\your-trip\db_push_result.txt"

Dim lf
Set lf = fso.CreateTextFile(logPath, True)
lf.WriteLine "START db push: " & Now()
lf.Close

' Use prisma db push (non-interactive, no migration files needed)
Dim ret
ret = shell.Run("cmd /c cd /d """ & webDir & """ && npx prisma db push --accept-data-loss >> """ & logPath & """ 2>&1", 0, True)

Dim lf2
Set lf2 = fso.OpenTextFile(logPath, 8, True)
lf2.WriteLine "EXIT CODE: " & ret & " at " & Now()
lf2.Close

If ret = 0 Then
    MsgBox "DB push สำเร็จ! Schema synced.", 64, "Done"
Else
    MsgBox "DB push failed (code " & ret & ") - ดู db_push_result.txt", 16, "Error"
End If
