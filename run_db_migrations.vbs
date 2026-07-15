Set shell = CreateObject("WScript.Shell")
Set fso = CreateObject("Scripting.FileSystemObject")

Dim scriptDir
scriptDir = fso.GetParentFolderName(WScript.ScriptFullName)
Dim webDir
webDir = scriptDir & "\your-trip-web"

' Run node migrations script
Dim ret
ret = shell.Run("cmd /c cd /d """ & webDir & """ && node run_migrations.js > run_migrations_output.txt 2>&1", 1, True)

' Show result
Dim outputFile
outputFile = webDir & "\run_migrations_output.txt"
If fso.FileExists(outputFile) Then
    Dim ts
    Set ts = fso.OpenTextFile(outputFile, 1)
    Dim content
    content = ts.ReadAll
    ts.Close
    If ret = 0 Then
        MsgBox "SUCCESS!" & vbCrLf & vbCrLf & content, 64, "DB Migrations Done"
    Else
        MsgBox "ERROR (code " & ret & "):" & vbCrLf & vbCrLf & content, 16, "DB Migrations Failed"
    End If
Else
    If ret = 0 Then
        MsgBox "Migrations complete! (no output file)", 64, "Done"
    Else
        MsgBox "Failed with code " & ret, 16, "Error"
    End If
End If
