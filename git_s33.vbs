Set fso = CreateObject("Scripting.FileSystemObject")
Set sh = CreateObject("WScript.Shell")
sh.CurrentDirectory = "C:\Users\user\Documents\your-trip\your-trip-web"

' Delete index.lock if present
lockFile = "C:\Users\user\Documents\your-trip\your-trip-web\.git\index.lock"
If fso.FileExists(lockFile) Then
    fso.DeleteFile lockFile
End If

' git add all
Set exec1 = sh.Exec("git add -A")
Do While exec1.Status = 0 : WScript.Sleep 200 : Loop

' git commit
Set exec2 = sh.Exec("git commit -m ""Day 39: feat: S33 notifications type filter + place submit photo upload + TS fixes""")
Do While exec2.Status = 0 : WScript.Sleep 200 : Loop
commitOut = exec2.StdOut.ReadAll()
commitErr = exec2.StdErr.ReadAll()

' git push
Set exec3 = sh.Exec("git push github main")
Do While exec3.Status = 0 : WScript.Sleep 500 : Loop
pushOut = exec3.StdOut.ReadAll()
pushErr = exec3.StdErr.ReadAll()

' Write result
Set f = fso.OpenTextFile("C:\Users\user\Documents\your-trip\git_s33_result.txt", 2, True)
f.WriteLine "COMMIT OUT: " & commitOut
f.WriteLine "COMMIT ERR: " & commitErr
f.WriteLine "COMMIT EXIT: " & exec2.ExitCode
f.WriteLine "PUSH OUT: " & pushOut
f.WriteLine "PUSH ERR: " & pushErr
f.WriteLine "PUSH EXIT: " & exec3.ExitCode
f.Close
