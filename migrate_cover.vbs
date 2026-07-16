Set shell = CreateObject("WScript.Shell")
Set fso = CreateObject("Scripting.FileSystemObject")

Dim webDir : webDir = "C:\Users\user\Documents\your-trip\your-trip-web"
Dim logPath : logPath = "C:\Users\user\Documents\your-trip\migrate_result.txt"

Dim lf
Set lf = fso.CreateTextFile(logPath, True)
lf.WriteLine "START migrate: " & Now()
lf.Close

Dim ret
ret = shell.Run("cmd /c cd /d """ & webDir & """ && npx prisma migrate dev --name add-user-cover-image >> """ & logPath & """ 2>&1", 1, True)

Dim lf2
Set lf2 = fso.OpenTextFile(logPath, 8, True)
lf2.WriteLine "EXIT CODE: " & ret & " at " & Now()
lf2.Close

If ret = 0 Then
    MsgBox "Migration สำเร็จ! coverImage field ถูกเพิ่มใน DB แล้ว", 64, "Done"
Else
    MsgBox "Migration failed (code " & ret & ") - ดู migrate_result.txt", 16, "Error"
End If
