Set shell = CreateObject("WScript.Shell")
Set fso = CreateObject("Scripting.FileSystemObject")
Dim logPath : logPath = "C:\Users\user\Documents\your-trip\tsc_result.txt"

Dim lf : Set lf = fso.CreateTextFile(logPath, True)
lf.WriteLine "START: " & Now()
lf.Close

Dim ret
ret = shell.Run("cmd /c cd /d ""C:\Users\user\Documents\your-trip\your-trip-web"" && npx tsc --noEmit >> """ & logPath & """ 2>&1", 0, True)

Dim lf2 : Set lf2 = fso.OpenTextFile(logPath, 8, True)
lf2.WriteLine "TSC EXIT: " & ret
lf2.Close

If ret = 0 Then
    MsgBox "TypeScript: No errors!", 64, "TSC OK"
Else
    MsgBox "TypeScript errors found. Check tsc_result.txt", 48, "TSC Errors"
End If
