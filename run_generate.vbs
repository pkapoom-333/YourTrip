Set shell = CreateObject("WScript.Shell")
Set fso = CreateObject("Scripting.FileSystemObject")
Dim logPath : logPath = "C:\Users\user\Documents\your-trip\generate_result.txt"

Dim lf : Set lf = fso.CreateTextFile(logPath, True)
lf.WriteLine "START: " & Now()
lf.Close

Dim ret
ret = shell.Run("cmd /c cd /d ""C:\Users\user\Documents\your-trip\your-trip-web"" && npx prisma generate >> """ & logPath & """ 2>&1", 0, True)

Dim lf2 : Set lf2 = fso.OpenTextFile(logPath, 8, True)
lf2.WriteLine "GENERATE EXIT: " & ret
lf2.Close

If ret = 0 Then
    MsgBox "prisma generate OK!", 64, "Done"
Else
    MsgBox "prisma generate FAILED (code " & ret & "). Check generate_result.txt", 16, "Error"
End If
