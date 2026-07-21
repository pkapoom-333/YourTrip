Set fso = CreateObject("Scripting.FileSystemObject")
Dim logPath : logPath = "C:\Users\user\Documents\your-trip\db_push_result.txt"

If fso.FileExists(logPath) Then
    Dim ts : Set ts = fso.OpenTextFile(logPath, 1)
    Dim content : content = ts.ReadAll
    ts.Close
    MsgBox "db_push_result.txt content:" & Chr(13) & Chr(10) & content, 64, "File Content"
Else
    MsgBox "File not found: " & logPath, 16, "Error"
End If
