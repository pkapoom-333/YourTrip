Set sh = CreateObject("WScript.Shell")

' Test simple cmd redirect
sh.Run "cmd /c echo HELLO_TEST > C:\Users\user\Documents\your-trip\cmd_test_result.txt 2>&1", 0, True

' Also test git
sh.Run "cmd /c cd /d C:\Users\user\Documents\your-trip\your-trip-web && git status > C:\Users\user\Documents\your-trip\git_status_result.txt 2>&1", 0, True
