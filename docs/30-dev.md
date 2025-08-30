# Development Guide

## Dev Guide
- Install dependencies with `npm install`. The project builds to static files, so no development server is required.
- Source code resides in `src/`; `main.js` and `hud.js` remain root-level entry points, while HUD logic lives in `src/ui/index.js` for modularity.
- Use `npm run build` to generate `version.js` and bundle assets before deployment.

## Coding Standard
- Prefer ES modules and `const`/`let` declarations; avoid global variables except for the exported `__APP_VERSION__`.
- Follow a 2‑space indentation style and end files with a newline.
- Name files in `kebab-case` and keep functions pure when practical.

## CI/CD
- GitHub Actions run linting and Jest tests on each push.
- Successful merges deploy the static site to GitHub Pages.
- `scripts/update-version.mjs` ensures the version in `package.json`, `manifest.json`, and `version.js` stays synchronized.
