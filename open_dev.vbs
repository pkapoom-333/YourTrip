Set WshShell = CreateObject("WScript.Shell")
' Open Chrome directly to localhost:5555 skipping profile picker
WshShell.Run "chrome.exe http://localhost:5555", 1, False
