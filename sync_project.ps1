# Antigravity Auto-Sync Script
# Staging all changes
git add .

# Creating a timestamp for the commit message
$timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
$message = "Automated mission update via Antigravity [$timestamp]"

# Committing changes
git commit -m $message

# Pushing to GitHub (assumes main branch)
git push origin main

Write-Host "Mission progress synchronized to GitHub and Cloudflare Uplink." -ForegroundColor Cyan
