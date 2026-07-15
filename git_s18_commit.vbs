Set objShell = CreateObject("WScript.Shell")
Set objFSO = CreateObject("Scripting.FileSystemObject")

repoPath = "C:\Users\user\Documents\your-trip"
lockFile = repoPath & "\.git\index.lock"

If objFSO.FileExists(lockFile) Then
    objFSO.DeleteFile lockFile, True
    WScript.Sleep 500
End If

objShell.CurrentDirectory = repoPath

' Stage S17 files (uncommitted from previous session)
objShell.Run "cmd /c git add " & _
    "your-trip-web/src/components/features/TripExpenseTab.tsx " & _
    "your-trip-web/src/server/actions/messages.ts " & _
    """your-trip-web/src/app/expense/[id]/ExpenseGroupClient.tsx"" " & _
    """your-trip-web/src/app/trips/[id]/page.tsx"" " & _
    "your-trip-web/prisma/all_migrations.sql " & _
    "your-trip-web/prisma/schema.prisma", 1, True

WScript.Sleep 500

' Commit S17
objShell.Run "cmd /c git commit -m ""Day 37: feat: S17 expense-trip tab + group chat schema""", 1, True

WScript.Sleep 500

' Stage S18 files
objShell.Run "cmd /c git add " & _
    "your-trip-web/src/components/features/ThailandProvinceMap.tsx " & _
    "your-trip-web/src/app/profile/page.tsx", 1, True

WScript.Sleep 500

' Commit S18
objShell.Run "cmd /c git commit -m ""Day 37: feat: S18 Thailand province map on profile""", 1, True

WScript.Sleep 1000

' Push to github
objShell.Run "cmd /c git push github main", 1, True

WScript.Sleep 2000

MsgBox "S17+S18 committed and pushed to GitHub!", 64, "YourTrip"
