# Development Guide

## Dev Guide
- Install dependencies with `npm install` and run the development server using `npm start`.
- Source code resides in `src/` while entry points (`main.js`, `hud.js`, etc.) live at project root for compatibility with the demo.
- Use `npm run build` to generate `version.js` and bundle assets before deployment.

## Coding Standard
- Prefer ES modules and `const`/`let` declarations; avoid global variables except for the exported `__APP_VERSION__`.
- Follow a 2‑space indentation style and end files with a newline.
- Name files in `kebab-case` and keep functions pure when practical.

## CI/CD
- GitHub Actions run linting and Jest tests on each push.
- Successful merges deploy the static site to GitHub Pages.
- `update-version.mjs` ensures the version in `package.json`, `manifest.json`, and `version.js` stays synchronized.
