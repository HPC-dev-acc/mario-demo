# Design Specification

**Version: 2.0.0**

## DS-1: Orientation guard
- Show overlay prompting landscape orientation on mobile portrait.
- When device rotates to landscape, canvas resizes to fit and overlay hides.

## DS-2: Slide cancellation at red light
- Sliding reduces player height but red light cancels slide and restores base height.

## DS-3: Landscape fit height
- In mobile landscape, canvas height matches the viewport and UI elements move into a unified layer for scaling.
- In non-mobile or portrait orientations, original canvas styles are restored.

## DS-4: HUD visibility
- `showHUD` reveals HUD elements and touch controls while leaving the debug panel hidden.

## DS-5: Start page defaults
- Start button visible by default; restart button hidden.
- Start page allows pointer events and sets the page title to "HPC Demo Game".

## DS-6: UI styling and responsiveness
- Stage element enforces max width and height.
- Pills have a border and white background.
- Touch controls hide only on hover-capable devices and scale responsively.
- Stage clear and fail overlays allow pointer events.
- Debug panel uses a white background; clear/fail titles and buttons are styled for clarity.
- Pedestrian dialog icon scales with text height.
- Body and stage omit background images.
- Timer defines a low-time pulse animation.

## DS-7: OL NPC walk sprites
- Sprite assets `assets/sprites/OL/walk_000.png` through `walk_011.png` must exist.

## DS-8: Countdown timer
- Stage uses a 60-second timer that decrements once gameplay begins.
- The timer flashes during the final 10 seconds.
- Expiration triggers a fail screen with a restart option.

## DS-9: Pedestrian traffic lights
- Lights cycle through green (3s), blink (2s), and red (4s) phases.
- Nearby characters wait during red and slide attempts are cancelled.
- Collisions with lights allow pass-through movement while preserving ground support.

## DS-10: NPC behavior
- NPCs spawn every 4–8 seconds with type tags preventing duplicate spawns.
- OL NPCs face right on spawn and render using their own sprites.
- Stomping bounces the player to full jump height; side collisions cause mutual knockback.

## DS-11: Audio
- Sound effects play for jump, slide, clear, coin, and fail events.
- Background music loops during gameplay and can be muted or unmuted via the HUD control.

## DS-12: Stage configuration
- Level objects load from `assets/objects.custom.js`, falling back to `assets/objects.js`.
- Each object defines `type`, `x`, and `y` tile coordinates with optional `transparent` and `collision` flags.

## DS-13: Level design mode
- Enabled via settings menu **LEVEL** controls with a dashed canvas outline.
- Selecting, dragging, or nudging (WASD) moves objects; `Q` rotates 24px blocks.
- An **新增** button places collision blocks and a transparency toggle affects only the selection.
- Countdown timer pauses and layout can export as JSON.

## DS-14: Progressive Web App support
- Supports installation with full-screen mode on iOS and Android.

## DS-15: Versioning build
- `npm run build` reads `package.json` to generate `version.js` and versioned HTML query parameters.
- Exposes the current version as `window.__APP_VERSION__` for display in the UI.

## DS-16: Semantic version handling
- Build script accepts full Semantic Versioning strings, including prerelease identifiers.
- HTML query parameters and manifest version fields allow alphanumeric, dot, and hyphen segments.
