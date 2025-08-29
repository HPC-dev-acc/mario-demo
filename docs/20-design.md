# Design

## SAD (System Architecture Design)
- Single-page application built with `index.html` hosting the Canvas and HUD.
- Rendering uses a 960×540 logical grid scaled by `devicePixelRatio` with image smoothing disabled.
- Core subsystems: game loop, input, physics, camera, AI/NPC, UI/HUD, PWA caching, and internationalization.

## SDS (Software Design Specification)
- `main.js` initializes resources, manages the state machine, countdown, collisions, and NPC spawning.
- `hud.js` implements the gear menu, language switcher, version pill, fullscreen toggle, and restart binding.
- `orientation-guard.js` and `landscape-fit-height.js` handle device orientation and viewport fitting on mobile.
- `sw.js` and `manifest.json` provide offline capability and installation metadata.
- Source modules in `src/` encapsulate physics, rendering, camera control, and NPC logic.

## ERD (Entity Relationship Overview)
- **Entity** – player and NPC share common fields: `id`, `type`, `pos`, `vel`, `state`, and `hitbox`.
- **TrafficLight** – controls pedestrian signals and exposes `phase` and `area`.
- **LevelObject** – defines world geometry with optional collision masks.
- Relationships: entities interact with level objects through AABB collisions; traffic lights influence nearby entities.

## API
- Global `createGameState()` returns the mutable game state used by the loop and tests.
- `showHUD()` reveals HUD elements while keeping the debug panel hidden.
- `updateVersion.mjs` script reads `package.json` and emits `version.js` plus versioned query parameters.

## ADR (Architecture Decision Record)
- Chosen **vanilla JS** for minimal dependencies; build tools (Babel, Jest) are used only for development.
- Adopted a **24 px** collision sub-grid to support half tiles and precise masks.
- Enabled PWA support so the demo can run offline and be installed on mobile devices.

## UX
- HUD offers gear menu, info/debug panels, countdown timer, and touch controls on mobile.
- Orientation guard pauses play in portrait mode and resumes on landscape.
- Fullscreen uses letterboxing to preserve the 16:9 aspect ratio.

## Design Specs (DS)
- **DS-1**: Orientation guard overlay prompting landscape orientation.
- **DS-2**: Slide cancellation at red lights restores player height.
- **DS-3**: Mobile landscape fit-height layout.
- **DS-4**: `showHUD` helper reveals HUD without debug panel.
- **DS-5**: Start page defaults with visible start button and correct title.
- **DS-6**: Responsive UI styling, clear/fail overlays, and timer pulse.
- **DS-7**: OL NPC walk sprites for frames 0–11.
- **DS-8**: One-minute countdown timer that flashes in the final 10 seconds.
- **DS-9**: Pedestrian lights cycle 3s green → 2s blink → 4s red.
- **DS-10**: NPCs spawn every 4–8 seconds, bounce on stomp, and knock back on side collisions.
- **DS-11**: Audio effects for jump, slide, clear, coin, fail, plus looped BGM with mute control.
- **DS-12**: Level objects load from `assets/objects.custom.js` with collision and transparency flags.
- **DS-13**: Level design mode for dragging objects, nudge/rotate controls, and JSON export.
- **DS-14**: Progressive Web App support for offline play and installation.
- **DS-15**: Build script exposes `__APP_VERSION__` and versioned assets.
- **DS-16**: Semantic versioning accepts prerelease identifiers.
- **DS-17**: Background images scale by device pixel ratio for full-screen sharpness.
