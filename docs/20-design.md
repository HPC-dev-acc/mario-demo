# Design

## SAD (System Architecture Design)
- Single-page application served by `index.html` that boots `main.js` and the HUD layer.
- Runtime modules are grouped into **input**, **physics**, **renderer**, **camera**, **AI/NPC**, **UI/HUD**, **audio**, and **PWA/i18n** subsystems.
- `requestAnimationFrame` drives an update → physics → render loop that targets 60 FPS.
- Game state is held in a central object created by `createGameState()` and shared across modules.
- Data flow: user input mutates state → physics resolves collisions → camera follows the player → renderer draws the visible slice.

## SDS (Software Design Specification)
### Game Loop and State
- `main.js` seeds textures/audio, creates the game state, and invokes `tick()` on each frame.
- `tick()` updates timers, spawns NPCs, advances AI, handles collisions, and calls `draw()`.
- Countdown logic emits events when time hits 10 s and 0 s, toggling HUD flashes or fail/clear overlays.

### Player and Physics
- Movement uses a 24 px sub-grid; velocity integrates with gravity and is clamped on collision.
- Sliding sets a flag that shrinks the hitbox; canceling slide or hitting a red light restores height.
- Axis-aligned bounding boxes (AABB) detect overlaps against level objects and NPCs.

### NPC and Level Systems
- NPC spawn timers pick random intervals (4–8 s) and choose OL, Student, or Officeman templates.
- Officeman sprites render 1.25× larger than their collision boxes, scaling from the sprite center.
- Each NPC carries `state`, `dir`, and `speed`; stomp increases a counter that allows pass-through after the third hit.
- Level data loads from `assets/objects.custom.js`; each entry defines type, coordinates, and optional collision masks.
 - NPC spawn dimensions use the player's `baseH` so sliding does not change NPC size.

### Rendering and Camera
- `src/render.js` culls tiles and entities outside the viewport and draws remaining sprites to the canvas using device pixel ratio scaling.
- Backgrounds regenerate when DPR or fullscreen state changes to avoid blurring.
- The camera begins scrolling once the player crosses 60 % of the viewport width and clamps to level bounds.

### PWA and Internationalization
- `sw.js` caches `index.html`, scripts, assets, and versioned files; on activation it cleans up old caches.
- `manifest.json` provides icons and install metadata.
- Language packs under `src/i18n/` feed the HUD; switching language updates all text nodes on the next frame.

## ICD (Interface Control Document)
- **Game State API**: `createGameState()` ⇒ `{ level, coins, lights, player, camera, npcs, GOAL_X, LEVEL_W, LEVEL_H, spawnLights(), buildCollisions(), transparent, indestructible, patterns, selection }` (no `score` or `time`).
- **UI Actions**: start button calls `showHUD()` and restart buttons call `restartStage()`; no custom events are emitted.
- **Input Mapping**: keyboard arrows/space/Z map to move/jump/slide; touch buttons dispatch the same actions via custom events.
- **Service Worker**: `navigator.serviceWorker.register('sw.js')`; messages of type `update` prompt a reload.
- **Error Handling**: modules throw on missing assets; the main loop catches errors, logs to console, and pauses the game.

## ERD (Entity Relationship Overview)
- **Entity** – player and NPC share common fields: `id`, `type`, `pos`, `vel`, `state`, and `hitbox`.
- **TrafficLight** – controls pedestrian signals and exposes `phase` and `area`.
- **LevelObject** – defines world geometry with optional collision masks.
- Relationships: entities interact with level objects through AABB collisions; traffic lights influence nearby entities.

## API
- Global `createGameState()` returns the mutable game state used by the loop and tests.
- `showHUD()` reveals HUD elements while keeping the debug panel hidden.
- `scripts/update-version.mjs` reads `package.json` and emits `version.js` plus versioned query parameters.

## ADR (Architecture Decision Record)
- Chosen **vanilla JS** for minimal dependencies; build tools (Babel, Jest) are used only for development.
- Adopted a **24 px** collision sub-grid to support half tiles and precise masks.
- Enabled PWA support so the demo can run offline and be installed on mobile devices.

## UX
- HUD offers a gear menu, info panel, countdown timer, and touch controls on mobile. A debug panel appears only when developer mode is enabled for developers or testers.
- Orientation guard pauses play in portrait mode and resumes on landscape.
- Fullscreen uses centered letterboxing with black bars and resizes on `fullscreenchange` to preserve the 16:9 aspect ratio; styles target both `#stage:fullscreen` and `#game-root:fullscreen #stage`.

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
| DS-9 | Pedestrian lights cycle 3s green → 2s blink → 4s red; during red, nearby characters pause and display dialog bubbles. Traffic light tiles are fully non-solid so characters cannot stand on them. | FR-031, FR-032 | T-9 |
| DS-10 | NPCs spawn every 4–8 seconds, bounce on stomp, knock back on side collisions, and allow pass-through after the third stomp. | FR-021, FR-030 | T-10 |
| DS-11 | Audio effects for jump, slide, clear, coin, fail, plus looped BGM with mute control. | — | T-11 |
| DS-12 | Level objects load from `assets/objects.custom.js` with collision and transparency flags. | NFR-007 | T-12 |
| DS-13 | Level design mode for dragging objects, nudge/rotate controls, and JSON export. | NFR-007 | T-13 |
| DS-14 | Progressive Web App support for offline play and installation. | FR-050, NFR-008 | T-14 |
| DS-15 | Build script exposes `__APP_VERSION__` and versioned assets. | — | T-15 |
| DS-16 | Semantic versioning accepts prerelease identifiers. | — | T-16 |
| DS-17 | Canvas scales by device pixel ratio with image smoothing disabled; background images regenerate using the current canvas height to render at native resolution. | NFR-002 | T-17 |
| DS-18 | Language switcher updates HUD text and pedestrian dialogs. | FR-001, FR-002, NFR-005 | T-18 |
| DS-19 | Player movement system supports left/right motion, jumping, sliding, and triggers a dust effect on slide. | FR-020 | T-19 |
| DS-20 | Camera begins horizontal scroll once the player crosses 60 % of the viewport width. | FR-022 | T-20 |
| DS-21 | Fullscreen toggle maintains a fixed 16:9 aspect ratio using centered letterboxing and recalculates canvas size on `fullscreenchange`; CSS handles `#stage:fullscreen` and `#game-root:fullscreen #stage`. | FR-041, NFR-003 | T-21 |
| DS-22 | Rendering culls off-screen tiles and entities to sustain a 60 FPS target. | NFR-001 | T-22 |
| DS-23 | Compatible with latest Chrome, Safari, Firefox, and Edge; touch controls scale with viewport on common iOS/Android devices. | NFR-004 | T-23 |
| DS-24 | Continuous integration runs Jest tests on pushes and pull requests. | — | T-24 |
| DS-25 | Student NPC walk sprites for frames 0–10. | FR-030 | T-25 |
| DS-26 | OL and Student NPC walk animations cycle through all frames for smooth motion. | FR-030 | T-26 |
| DS-27 | OL NPCs walk fastest, Officemen move at a medium pace, and Students walk more slowly. | FR-030 | T-27 |
| DS-30 | Officeman NPC walk sprites for frames 0–10. | FR-030 | T-30 |
| DS-31 | Officeman sprites render 1.25× larger from their center without altering collision boxes. | FR-033 | T-31 |
| DS-32 | NPC spawn size derives from player's base height to stay consistent while sliding. | FR-034 | T-32 |
| DS-28 | Developer switch reveals debug panel, log controls, and a level editor for developers/testers. | FR-043 | T-28 |
| DS-29 | Game state factory exposes core fields (level, coins, lights, player, camera, npcs) and excludes score/time. | — | T-29 |
