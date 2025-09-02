# Development Guide

## Dev Guide
- Refer to the expanded SDS in `docs/20-design.md` for asset preload flow, input queue handling, game loop steps, and physics algorithms when implementing features (v2.9.2).
- Install dependencies with `npm install`. The project builds to static files, so no development server is required.
- Source code resides in `src/`; `main.js` and `hud.js` remain root-level entry points, while HUD logic lives in `src/ui/index.js` for modularity.
- Use `npm run build` to update version information before deployment.
- Developer mode is hidden by default. Toggle it in the settings gear to access the debug panel, log tools, and level editor controls (developers/testers only).
- Design mode outlines collision boxes for all tiles, the player, and NPCs in green to assist with layout edits (DS-34).
- Style tests ensure circular touch controls remain pinned to the bottom screen corners (DS-35, T-35).
- The start screen exposes `startScreen.setProgress` to update a loading progress bar while assets load (DS-33, T-33).
- Student, Officeman, and OL NPC sprites are stored under `assets/sprites/Student`, `assets/sprites/officeman`, and `assets/sprites/OL`; add a loader in `src/sprites.js` and update spawn logic in `main.js` when introducing new NPC types. The Student and Officeman walk sequences include frames `walk_000`–`walk_010` for smooth motion, and spawn logic sets walk speeds to `1` for Student, `1.5` for Officeman, and `2` for OL for variety.
- Officeman sprites render at **1.25×** scale from their center while the collision box dimensions stay fixed.
- NPC spawn size derives from the player's `baseH`, ensuring sliding does not change NPC dimensions (DS-32, T-32).
- NPC collision boxes use a fixed one-tile width for consistent player interaction (DS-36, T-36).
- Player idle animation narrows the sprite via `renderW` while keeping the collision width at `BASE_W` (DS-37, T-37).
- Traffic light tiles are fully pass-through; edits to physics should preserve their non-solid behavior (DS-9, T-9).
- Walking animations consume all provided frames; `drawNpc` uses the animation's frame count as its FPS.
- Canvas dimensions are recalculated on `fullscreenchange` to maintain centered letterboxing, and CSS targets `#game-root:fullscreen #stage` to handle fullscreen requests on the container.
- Background images are regenerated with the canvas's CSS height during DPR adjustments to avoid upscaling in fullscreen.

## Coding Standard
- Prefer ES modules and `const`/`let` declarations; avoid global variables except for the exported `__APP_VERSION__`.
- Follow a 2‑space indentation style and end files with a newline.
- Name files in `kebab-case` and keep functions pure when practical.

## CI/CD
- GitHub Actions run Jest tests on each push and pull request.
