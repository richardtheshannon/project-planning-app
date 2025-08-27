# Claude Code Instructions

## Git Workflow

**IMPORTANT**: Always work on and push to the `master` branch directly. Do NOT create or work on feature branches.

- When making changes, work directly on `master`
- Always push to `master` branch: `git push origin master`
- Railway deployment is triggered by pushes to `master` branch only
- Avoid creating feature branches to prevent merge confusion

## Development Commands

- Build: `npm run build`
- Dev server: `npm run dev`
- Lint: `npm run lint`
- Type check: `npm run type-check`

## Deployment

- Deployment platform: Railway
- Deployment trigger: Push to `master` branch
- Repository: https://github.com/richardtheshannon/project-planning-app.git