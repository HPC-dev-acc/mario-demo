# Design Overview

## 1. System Architecture
- **Single-page frontend**: `index.html` hosts the Canvas and HUD. A `<div id="stage">` maintains a **16:9** ratio, scaling the Canvas and HUD together.
- **Rendering**: Canvas 2D with logical coordinates capped at **960×540**. Actual resolution = CSS size × `devicePixelRatio`; image smoothing is disabled for crisp pixels.
- **Game engine subsystems**
  - **Loop**: `update(dt)` → `render()` driven by `requestAnimationFrame`.
  - **Input**: keyboard (Left/Right/Jump/Slide) and touch (virtual buttons).
  - **Physics**: gravity, acceleration, velocity integration; AABB collisions.
  - **Collision grid**: **24 px sub-cells** with 2×2 masks for half tiles or custom patterns.
  - **Camera**: scrolls horizontally once the player crosses **60 %** of the viewport width.
  - **AI/NPC**: spawn from the right, walk/idle/run, then exit left; respond to stomps and side bumps; pause at red lights.
  - **UI/HUD**: gear menu (ℹ, version, ⚙), info/debug panels, countdown timer, fullscreen toggle, language selection.
  - **PWA**: `manifest.json` and `sw.js` handle caching, versioning, and asset updates.
  - **i18n**: language selector affects UI and dialog strings (recommend `i18n.<lang>.json` or constant tables).

## 2. File and Module Mapping
- `index.html`: canvas/HUD template, start page, clear/fail overlays, language selector, script order (`version.js` → `hud.js` → `main.js`).
- `style.css`: `#stage` aspect box, HUD pills, dialog bubbles with red-light icon, touch button sizing and opacity, overlay styling.
- `main.js`: resource initialization, game loop, state machine (Start/Playing/Clear/Fail/Paused), camera and collisions, NPC spawning, countdown, and event dispatch.
- `hud.js`: gear menu, info/debug toggles, language switch, version display, fullscreen control, and restart binding.
- `orientation-guard.js`: detects mobile portrait orientation and shows an overlay until landscape is restored.
- `landscape-fit-height.js`: mobile landscape **fit-height** algorithm that tracks browser UI changes to keep the view centered.
- `sw.js`: PWA cache names and asset whitelist; version upgrade strategy (recommend `skipWaiting` with a custom update prompt).
- `manifest.json`: app name, icons, display mode (fullscreen/standalone), and installation settings for iOS/Android.
- `version.js`: exports the current version (e.g., `2.0.0`).
- `assets/objects.custom.js`: level object list and collision patterns; art assets (sprites/tiles/music).
- `tests/*.test.js`: Jest tests for HUD, style, start page, pedestrian lights and sliding, landscape adaptation, OL walk animation, etc.
- `docs/`, `scripts/`, `src/`: documentation, utility scripts, and modular source files as applicable.
- `.github/workflows/`: CI for linting, testing, and GitHub Pages deployment.
- `package.json`: development scripts (`test`, `build`, `serve`, etc.) and Jest/Babel configuration.

## 3. Game States and Flow
```mermaid
flowchart LR
S[Start Page] -->|START| P[Playing]
P -->|Reach Goal| C[Stage Clear]
P -->|Time Up| F[Fail]
C -->|Restart| P
F -->|Restart| P
P -->|Mobile Portrait| O[Orientation Guard \\n(Paused)]
O -->|Rotate Landscape| P
```

## 4. Key Data Structures (suggested)
```ts
type Vec2 = { x: number; y: number };
type HitBox = { w: number; h: number; ox?: number; oy?: number };

interface Entity {
  id: string; type: 'player' | 'npc' | 'light' | 'coin' | 'block';
  pos: Vec2; vel: Vec2; dir: 1 | -1; onGround: boolean;
  state: string; // 'idle'|'run'|'jump'|'slide'|'stun'...
  hitbox: HitBox; anim?: { sheet: string; frame: number; t: number };
}

interface TrafficLight {
  phase: 'green' | 'blink' | 'red';
  t: number;
  area: { x: number; y: number; w: number; h: number };
}

interface LevelObject {
  id: string;
  kind: string;
  cell: { x: number; y: number };
  mask: [0 | 1, 0 | 1, 0 | 1, 0 | 1];
  solid?: boolean;
  trigger?: boolean;
}
```

## 5. Coordinates and Rendering
- **Logical coordinates**: 16:9 grid capped at **960×540**. When CSS size exceeds this, `renderScale` enlarges sprites and map.
- **Canvas DPR**: `canvas.width = cssWidth * devicePixelRatio` (and height); `ctx.imageSmoothingEnabled = false`.
- **View culling**: render only tiles and objects within the camera viewport to reduce fill rate.

## 6. Physics and Collisions
- **Integration**: `vel += gravity * dt`; `pos += vel * dt`; landing zeroes `vy` and triggers a bounce.
- **AABB**: 24 px sub-cells with 2×2 masks for precise bounds; upward movement ignores collisions to avoid false hits above the player.
- **Pedestrian light exception**: vertical collisions ignored and side pass-through doesn't change vertical speed; during **red**, nearby characters set `onHold = true` (pause/show dialog).

## 7. AI / NPC
- **Spawning**: every **4–8 s**, avoiding duplicate types via `createNpc({ type, facing })`.
- **Interaction**: stomps bounce (third stomp passes through) and side collisions cause mutual **knockback** with brief stun.
- **OL character**: slightly larger with matching hitboxes and dedicated walk/bump animations.

## 8. UI / HUD / i18n
- **HUD**: top-right gear menu; info panel (instructions), debug panel (position/velocity/collision grid); version pill from `version.js`.
- **Timer**: one-minute countdown, **flashing during final 10 s**.
- **Languages**: English, Japanese, Traditional Chinese, Simplified Chinese; centralize strings where possible. Restart button labels follow the selected language.
- **Touch controls**: mobile devices show directional and jump/slide buttons with transparency.

## 9. Fullscreen and Device Orientation
- **Fullscreen**: request on `#stage` container with no stretching; black bars maintain 16:9.
- **Orientation guard**: portrait mode shows overlay and **pauses** (muting BGM); rotating to landscape resumes and hides overlay.
- **Fit-Height**: listens to `resize`/`fullscreenchange`, adjusting CSS and `data-css-scale-x` to keep background and scroll in sync.

## 10. PWA Design
- **Caching**: versioned JS/CSS/images. `install` pre-caches, `fetch` uses cache- or network-first strategies by asset type, and `activate` cleans old caches.
- **Updates**: `skipWaiting + clients.claim` (recommended) and HUD shows a “new version available” prompt.

## 11. Testing Strategy (Jest)
- **Unit**: `hud.test.js`, `style.test.js`, `orientation-guard.test.js`, `landscape-fit-height.test.js`, `ol-walk-sprites.test.js`, `start-page.test.js`, `redLightSlide.test.js`.
- **Integration** (suggested): camera scrolling, collision edges, PWA install flow, language switching.
- **Coverage thresholds** (suggested): ≥80 % lines / ≥70 % branches.

## 12. Directory and Build (suggested)
```
/assets           # sprites / audio / level data (objects.custom.js)
/src              # engine/physics/AI/rendering modules
/docs             # documentation (this file, requirements, design specs)
/tests            # Jest tests
.github/workflows # CI: Lint / Test / Pages deployment
index.html style.css main.js hud.js sw.js manifest.json version.js
```

## 13. Extensions and TODO
- UI for level editor (extend current 24 px grid and Q-key rotation).
- Multiple levels with asset splitting per world/stage.
- Audio/volume settings, gamepad support, and accessibility features.

