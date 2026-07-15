Set WshShell = CreateObject("WScript.Shell")
' Open Chrome with Profile 2 (Tee/everapp.io) and go to Vercel
WshShell.Run """C:\Program Files\Google\Chrome\Application\chrome.exe"" --profile-directory=""Profile 2"" https://vercel.com/pkapoom-333/your-trip/deployments", 1, False
