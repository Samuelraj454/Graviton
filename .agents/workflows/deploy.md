---
description: Automated mission sync to GitHub and Cloudflare
---

Whenever a task involving code changes is completed, or when explicitly requested, follow these steps to ensure the project is live and synchronized.

1. Ensure all changes are saved in the project directory.
2. Run the sync command using the `-C` flag to reference the `game` folder from the allowed workspace.

// turbo
3. Execute: `git -C c:\Users\HP\game add .`
// turbo
4. Execute: `git -C c:\Users\HP\game commit -m "Antigravity Sync: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')"`
// turbo
5. Execute: `git -C c:\Users\HP\game push origin main`
