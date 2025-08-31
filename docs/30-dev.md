# Development Guide

## Dev Guide
- Install dependencies with `npm install`. The project builds to static files, so no development server is required.
- Source code resides in `src/`; `main.js` and `hud.js` remain root-level entry points, while HUD logic lives in `src/ui/index.js` for modularity.
- Use `npm run build` to update version information before deployment.
- Game state tracks `hitstopMs`; the update loop pauses when this timer is positive to create a brief freeze after collisions.
- Canvas dimensions are recalculated on `fullscreenchange` to maintain centered letterboxing, and CSS targets `#game-root:fullscreen #stage` to handle fullscreen requests on the container.
- Background images are regenerated with the canvas's CSS height during DPR adjustments to avoid upscaling in fullscreen.

## Coding Standard
- Prefer ES modules and `const`/`let` declarations; avoid global variables except for the exported `__APP_VERSION__`.
- Follow a 2‑space indentation style and end files with a newline.
- Name files in `kebab-case` and keep functions pure when practical.

## CI/CD
- GitHub Actions run Jest tests on each push and pull request.
