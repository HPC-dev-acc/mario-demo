# Development Guide

## Dev Guide
- Install dependencies with `npm install`. The project builds to static files, so no development server is required.
- Source code resides in `src/`; `main.js` and `hud.js` remain root-level entry points, while HUD logic lives in `src/ui/index.js` for modularity.
- Use `npm run build` to update version information before deployment.
- Student and OL NPC sprites are stored under `assets/sprites/Student` and `assets/sprites/OL`; add a loader in `src/sprites.js` and update spawn logic in `main.js` when introducing new NPC types. The Student walk sequence includes frames `walk_000`–`walk_010` for smooth motion, and spawn logic sets OL walk speed to `2` and Student walk speed to `1` for variety.
- Walking animations consume all provided frames; `drawNpc` uses the animation's frame count as its FPS.
- Canvas dimensions are recalculated on `fullscreenchange` to maintain centered letterboxing, and CSS targets `#game-root:fullscreen #stage` to handle fullscreen requests on the container.
- Background images are regenerated with the canvas's CSS height during DPR adjustments to avoid upscaling in fullscreen.

## Coding Standard
- Prefer ES modules and `const`/`let` declarations; avoid global variables except for the exported `__APP_VERSION__`.
- Follow a 2‑space indentation style and end files with a newline.
- Name files in `kebab-case` and keep functions pure when practical.

## CI/CD
- GitHub Actions run Jest tests on each push and pull request.
