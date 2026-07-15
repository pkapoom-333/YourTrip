Set shell = CreateObject("WScript.Shell")
Set fso = CreateObject("Scripting.FileSystemObject")

Dim scriptDir
scriptDir = fso.GetParentFolderName(WScript.ScriptFullName)
Dim webDir
webDir = scriptDir & "\your-trip-web"

MsgBox "Step 1/3: Installing web-push packages...", 64, "Setup Push"

' Install web-push
Dim ret
ret = shell.Run("cmd /c cd /d """ & webDir & """ && npm install web-push @types/web-push --save 2>&1", 1, True)
If ret <> 0 Then
    MsgBox "npm install failed (code " & ret & ")", 16, "Error"
    WScript.Quit ret
End If

MsgBox "Step 2/3: Generating VAPID keys...", 64, "Setup Push"

' Generate VAPID keys and save to file
ret = shell.Run("cmd /c cd /d """ & webDir & """ && node scripts/generate-vapid-keys.js > """ & webDir & "\vapid_output.txt"" 2>&1", 1, True)
If ret <> 0 Then
    MsgBox "VAPID key generation failed (code " & ret & ")", 16, "Error"
    WScript.Quit ret
End If

MsgBox "Step 3/3: Running seed script...", 64, "Setup Push"

' Run seed script
ret = shell.Run("cmd /c cd /d """ & webDir & """ && npx ts-node --compiler-options ""{""module"":""CommonJS""}"" prisma/seed-system-user.ts > """ & webDir & "\seed_output.txt"" 2>&1", 1, True)

' Show VAPID keys output
Dim vapidOutput
If fso.FileExists(webDir & "\vapid_output.txt") Then
    Dim ts
    Set ts = fso.OpenTextFile(webDir & "\vapid_output.txt", 1)
    vapidOutput = ts.ReadAll
    ts.Close
End If

Dim seedOutput
If fso.FileExists(webDir & "\seed_output.txt") Then
    Set ts = fso.OpenTextFile(webDir & "\seed_output.txt", 1)
    seedOutput = ts.ReadAll
    ts.Close
End If

MsgBox "All done!" & vbCrLf & vbCrLf & "VAPID output:" & vbCrLf & vapidOutput & vbCrLf & "Seed output:" & vbCrLf & Left(seedOutput, 300), 64, "Setup Complete"
