Set WshShell = CreateObject("WScript.Shell")
WshShell.CurrentDirectory = "C:\Users\user\Documents\your-trip\your-trip-web"
WshShell.Run "cmd /k npm run dev", 1, False
WScript.Sleep 1000
MsgBox "Dev server starting at http://localhost:5555" & Chr(10) & "รอ 10-15 วินาทีก่อนเปิด Chrome", 64, "YourTrip Dev"
