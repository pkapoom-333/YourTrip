Set fso = CreateObject("Scripting.FileSystemObject")
Dim logPath : logPath = "C:\Users\user\Documents\your-trip\db_push_result.txt"
Dim outPath : outPath = "C:\Users\user\Documents\your-trip\db_push_copy.txt"

If fso.FileExists(logPath) Then
    Dim ts : Set ts = fso.OpenTextFile(logPath, 1)
    Dim content : content = ts.ReadAll
    ts.Close
    ' Write to copy file
    Dim out : Set out = fso.CreateTextFile(outPath, True)
    out.Write content
    out.Close
    MsgBox "Done! Lines: " & Len(content) & " chars", 64, "OK"
Else
    MsgBox "File not found!", 16, "Error"
End If
