Set objShell = CreateObject("WScript.Shell")
Set objFSO = CreateObject("Scripting.FileSystemObject")

repoPath = "C:\Users\user\Documents\your-trip"
lockFile = repoPath & "\.git\index.lock"

' Remove stale lock file if it exists
If objFSO.FileExists(lockFile) Then
    objFSO.DeleteFile lockFile, True
    WScript.Sleep 500
End If

' Stage all S17 changes
objShell.CurrentDirectory = repoPath
objShell.Run "cmd /c git add " & _
    "your-trip-web/src/components/features/TripExpenseTab.tsx " & _
    "your-trip-web/src/server/actions/messages.ts " & _
    """your-trip-web/src/app/expense/[id]/ExpenseGroupClient.tsx"" " & _
    """your-trip-web/src/app/trips/[id]/page.tsx"" " & _
    "your-trip-web/prisma/all_migrations.sql " & _
    "your-trip-web/prisma/schema.prisma", 1, True

WScript.Sleep 1000

' Commit
objShell.Run "cmd /c git commit -m ""Day 37: feat: S17 expense-trip tab + group chat schema""", 1, True

WScript.Sleep 1000

' Push to github (NOT origin)
objShell.Run "cmd /c git push github main", 1, True

WScript.Sleep 2000

MsgBox "S17 commit + push done! Check the terminal for results.", 64, "YourTrip S17"
