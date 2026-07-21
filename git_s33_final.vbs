Set sh = CreateObject("WScript.Shell")

Dim addCmd, commitCmd, pushCmd

' Stage only S33 relevant files (from your-trip-web directory)
addCmd = "cmd /c cd /d C:\Users\user\Documents\your-trip\your-trip-web" & _
    " && git add next.config.ts" & _
    " src\app\api\place-submission\route.ts" & _
    " src\app\collections\discover\page.tsx" & _
    " src\app\notifications\page.tsx" & _
    " src\app\place\submit\page.tsx" & _
    " src\app\post\[id]\PostDetailClient.tsx" & _
    " src\components\features\TripGroupChatPanel.tsx" & _
    " src\server\actions\collections.ts" & _
    " src\server\actions\profile.ts" & _
    " ..\DAILYWORK.md ..\PROGRESS.md ..\migrate_result.txt" & _
    " > C:\Users\user\Documents\your-trip\git_s33_result.txt 2>&1"

sh.Run addCmd, 0, True

' Commit
commitCmd = "cmd /c cd /d C:\Users\user\Documents\your-trip\your-trip-web" & _
    " && git commit -m ""Day 39: feat: S33 notifications type filter + place submit photo upload + TS fixes""" & _
    " >> C:\Users\user\Documents\your-trip\git_s33_result.txt 2>&1"

sh.Run commitCmd, 0, True

' Push
pushCmd = "cmd /c cd /d C:\Users\user\Documents\your-trip\your-trip-web" & _
    " && git push github main" & _
    " >> C:\Users\user\Documents\your-trip\git_s33_result.txt 2>&1"

sh.Run pushCmd, 0, True
