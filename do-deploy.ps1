Set-Location "C:\Users\user\Documents\your-trip"
$log = Join-Path $PWD "git-push-output.txt"

function Log($msg) {
    $line = "$(Get-Date -Format 'HH:mm:ss') $msg"
    Write-Host $line
    Add-Content -Path $log -Value $line
}

"=== DEPLOY $(Get-Date -Format o) ===" | Set-Content -Path $log

Remove-Item -Force ".git\index.lock" -ErrorAction SilentlyContinue
Log "index.lock cleared (if existed)"

Log "--- git status ---"
git status 2>&1 | ForEach-Object { Log $_ }

Log "--- git add -A ---"
git add -A 2>&1 | ForEach-Object { Log $_ }

Log "--- staged files ---"
git status --short 2>&1 | ForEach-Object { Log $_ }

Log "--- git commit ---"
git commit -m "Day 19: fix: blob upload 400 — remove onUploadCompleted, pass token explicitly" 2>&1 | ForEach-Object { Log $_ }

Log "--- git log -1 ---"
git log -1 --oneline 2>&1 | ForEach-Object { Log $_ }

Log "--- git push github main ---"
git push github main 2>&1 | ForEach-Object { Log $_ }

$local = (Get-Content ".git\refs\heads\main" -Raw).Trim()
$remote = (Get-Content ".git\refs\remotes\github\main" -Raw).Trim()
Log "LOCAL_HEAD:  $local"
Log "GITHUB_HEAD: $remote"
if ($local -eq $remote) { Log "SYNC OK" } else { Log "SYNC MISMATCH" }

Log "=== DONE ==="
Write-Host ""
Write-Host "Log saved to: $log"
Read-Host "Press Enter to close"
