# Design

## SAD (System Architecture Design)
- Single-page application built with `index.html` hosting the Canvas and HUD.
- Rendering uses a 960×540 logical grid scaled by `devicePixelRatio` with image smoothing disabled.
- Core subsystems: game loop, input, physics, camera, AI/NPC, UI/HUD, PWA caching, and internationalization.

## SDS (Software Design Specification)
- `main.js` initializes resources, manages the state machine, countdown, collisions, and NPC spawning.
- `src/ui/index.js` implements the gear menu, language switcher, version pill, fullscreen toggle, restart binding, and design mode controls; `hud.js` only exposes a `showHUD()` helper.
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
| ID | Description | Requirements | Tests |
| --- | --- | --- | --- |
| DS-1 | Orientation guard overlay prompting landscape orientation. | FR-042 | T-1 |
| DS-2 | Slide cancellation at red lights restores player height. | — | T-2 |
| DS-3 | Mobile landscape fit-height layout. | NFR-003 | T-3 |
| DS-4 | `showHUD` helper reveals HUD without debug panel. | FR-040 | T-4 |
| DS-5 | Start page defaults with visible start button and correct title. | FR-001, NFR-006 | T-5 |
| DS-6 | Responsive UI styling, clear/fail overlays, and timer pulse. | FR-011, FR-012, FR-040, FR-041, NFR-006 | T-6 |
| DS-7 | OL NPC walk sprites for frames 0–11. | — | T-7 |
| DS-8 | One-minute countdown timer that flashes in the final 10 seconds. | FR-010 | T-8 |
| DS-9 | Pedestrian lights cycle 3s green → 2s blink → 4s red; during red, nearby characters pause and display dialog bubbles without blocking collisions. | FR-031, FR-032 | T-9 |
| DS-10 | NPCs spawn every 4–8 seconds, bounce on stomp, knock back on side collisions, and allow pass-through after the third stomp. | FR-021, FR-030 | T-10 |
| DS-11 | Audio effects for jump, slide, clear, coin, fail, plus looped BGM with mute control. | — | T-11 |
| DS-12 | Level objects load from `assets/objects.custom.js` with collision and transparency flags. | NFR-007 | T-12 |
| DS-13 | Level design mode for dragging objects, nudge/rotate controls, and JSON export. | NFR-007 | T-13 |
| DS-14 | Progressive Web App support for offline play and installation. | FR-050, NFR-008 | T-14 |
| DS-15 | Build script exposes `__APP_VERSION__` and versioned assets. | — | T-15 |
| DS-16 | Semantic versioning accepts prerelease identifiers. | — | T-16 |
| DS-17 | Canvas scales by device pixel ratio with image smoothing disabled; background images render at high resolution. | NFR-002 | T-17 |
| DS-18 | Language switcher updates HUD text and pedestrian dialogs. | FR-001, FR-002, NFR-005 | T-18 |
| DS-19 | Player movement system supports left/right motion, jumping, sliding, and triggers a dust effect on slide. | FR-020 | T-19 |
| DS-20 | Camera begins horizontal scroll once the player crosses 60 % of the viewport width. | FR-022 | T-20 |
| DS-21 | Fullscreen toggle maintains a fixed 16:9 aspect ratio using letterboxing. | FR-041, NFR-003 | T-21 |
| DS-22 | Rendering culls off-screen tiles and entities to sustain a 60 FPS target. | NFR-001 | T-22 |
| DS-23 | Compatible with latest Chrome, Safari, Firefox, and Edge; touch controls scale with viewport on common iOS/Android devices. | NFR-004 | T-23 |
