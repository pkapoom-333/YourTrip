Set shell = CreateObject("WScript.Shell")
Set fso = CreateObject("Scripting.FileSystemObject")

Dim scriptDir
scriptDir = fso.GetParentFolderName(WScript.ScriptFullName)
Dim webDir
webDir = scriptDir & "\your-trip-web"

Dim ret
ret = shell.Run("cmd /c cd /d """ & webDir & """ && node prisma/seed-system-user.js > seed_output.txt 2>&1", 1, True)

Dim output
If fso.FileExists(webDir & "\seed_output.txt") Then
    Dim ts
    Set ts = fso.OpenTextFile(webDir & "\seed_output.txt", 1)
    output = ts.ReadAll
    ts.Close
End If

If ret = 0 Then
    MsgBox "Seed SUCCESS!" & vbCrLf & vbCrLf & Left(output, 500), 64, "Seed Done"
Else
    MsgBox "Seed FAILED (code " & ret & "):" & vbCrLf & vbCrLf & Left(output, 800), 16, "Seed Error"
End If
