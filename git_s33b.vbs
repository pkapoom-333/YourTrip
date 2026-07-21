Set sh = CreateObject("WScript.Shell")

Dim cmd
cmd = "cmd /c """ & _
    "cd /d C:\Users\user\Documents\your-trip\your-trip-web" & _
    " && if exist .git\index.lock del /f .git\index.lock" & _
    " && git add -A" & _
    " && git commit -m """"Day 39: feat: S33 notifications type filter + place submit photo upload + TS fixes""""" & _
    " && git push github main" & _
    " > C:\Users\user\Documents\your-trip\git_s33_result.txt 2>&1" & _
    """"

' Run hidden, wait for completion
sh.Run cmd, 0, True
