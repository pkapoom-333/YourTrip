Set fso = CreateObject("Scripting.FileSystemObject")
Set f = fso.OpenTextFile("C:\Users\user\Documents\your-trip\vbs_test_result.txt", 2, True)
f.WriteLine "VBS IS WORKING: " & Now()
f.Close
