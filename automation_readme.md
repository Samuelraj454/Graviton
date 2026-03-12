# Automation Setup: GitHub & Cloudflare

I have set up a two-part automation system:
1. **GitHub Actions**: Automatically deploys the project to Cloudflare Pages every time you push to the `main` branch.
2. **Local Sync Script**: A single command to commit all changes and push to GitHub.

## Files Created
- `.github/workflows/deploy.yml`: GitHub Action configuration.
- `sync_project.ps1`: Local automation script.
- `.agents/workflows/auto-deploy.md`: Integration for Antigravity AI.

## Next Steps for User
1. **Cloudflare Secrets**: Go to your GitHub Repository Settings > Secrets and variables > Actions, and add:
   - `CLOUDFLARE_API_TOKEN`: Your Cloudflare API Token (with Cloudflare Pages edit permissions).
   - `CLOUDFLARE_ACCOUNT_ID`: Your Cloudflare Account ID (found on your dashboard).
2. **Project Name**: I've used `graviton` as the project name. If your Cloudflare Pages project has a different name, update it in `.github/workflows/deploy.yml`.
