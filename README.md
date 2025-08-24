# Mario Demo

**Version: 1.5.136**

This project is a simple platformer demo inspired by classic 2D side-scrollers. The stage clear screen now includes a simple star animation effect, sliding triggers a brief dust animation, and a one-minute countdown timer adds urgency. When time runs out before reaching the goal, a fail screen with a restart option appears. Pedestrian lights cycle through green (3s), blink (2s), and red (4s) phases, and nearby characters wait during red.

## Recent Changes
- Exiting a slide due to a red light now restores the player's height.
- Touch buttons are now semi-transparent for better visibility.
- OL NPCs are slightly shorter while remaining taller than the player.
- Red pedestrian dialog icon now matches text height.
- Restart buttons on clear and fail screens now follow the selected language.
- Stage 1-1 now spawns OL NPCs much more frequently than the original character.
- OL NPCs are approximately one-third larger with matching collision boxes.
- The page title now reads "HPC Demo Game".
- Added a white background to the debug panel for better visibility.
- Start, clear, and fail prompts are styled more clearly and restart buttons on clear/fail screens are larger.
- `createNpc` now accepts an optional `facing` parameter and OL NPCs spawn facing right to avoid redundant flipping.
- NPCs now render using each character's own sprite so OL NPCs display their animations.
- Renamed an OL walk animation frame to fix start screen resource loading errors.
- Introduced a new OL NPC that enters from the right at a steady pace and swaps to a bump animation when hit.
- Enabled pointer events on stage clear and fail overlays so restart buttons are clickable.
- Canvas now sizes itself using its bounding box and `devicePixelRatio` for sharper fullscreen rendering while keeping game coordinates consistent.
- Fixed touch controls disappearing on large touchscreens by hiding them only on hover-capable devices.
- Touch buttons are now larger and scale with the viewport for better mobile usability.
- Smoothed background rendering while keeping sprites and objects pixel-crisp.
- Collapsed HUD controls into a gear dropdown with ℹ, version, and ⚙ pills only.
- Fixed blurry sprites in desktop fullscreen by forcing pixelated canvas rendering.
- Stage caps its size at 960×540 on large screens while still scaling down on smaller viewports.
- Canvas now recalculates resolution on `fullscreenchange` and caps devicePixelRatio scaling at 4 for crisp fullscreen rendering on 4K displays.
- Updated HUD pills to use a solid white background with a subtle border for better contrast.
- Fixed unresponsive START button by enabling pointer events on the start page and showing the button by default.
- Start page now hides HUD and touch controls until gameplay begins, revealing them on START or restart and keeping overlays aligned with the stage.
- Introduced a `#stage` container that maintains a fixed aspect ratio, scaling both the canvas and HUD to prevent stretching and misalignment on desktop and mobile.
- UI elements now scale dynamically for iPhone, iPad mini, and iPad to improve touch controls and HUD readability.
- Canvas now fits the visible viewport height and stays centered in mobile landscape, tracking browser UI changes.
- HUD elements including debug panel, capsules, dialog windows, and touch controls now scale and shift with the canvas in mobile landscape.
- Added an orientation guard that overlays a rotate prompt on mobile portrait, pausing gameplay, blocking input, and muting background music until landscape.
- Orientation monitoring now begins only after leaving the start page, avoiding unnecessary checks on the home screen.
- UI pills, settings menu, and info panel now follow the selected language.

- Added a settings menu language selector for English, Japanese, Traditional Chinese, and Simplified Chinese; pedestrian dialogs follow the chosen language.
- Added Progressive Web App support with full-screen mode on iOS and Android.
- Moved the red pedestrian icon into the text dialog bubble so image and text share one box.
- Restored the red pedestrian icon in speech bubbles when characters wait at red lights.
- Updated the red pedestrian icon to a Japanese-style standing figure.
- NPC bounce counter now resets when the player lands, so spaced stomps no longer cause pass-through.
- NPC shadows have been narrowed for a subtler look.
- Side collisions with blocks are now ignored, letting the player pass through.
- Restarting now fully resets NPCs and their spawn timer.
- Red lights now display a DOM-based speech bubble with a tail that follows the player and hides when the light turns green.
- Stomping an NPC now plays the jump sound when the player bounces off.
- Pedestrian traffic lights now use dark/green/red sprites with a 3s green → 2s blink → 4s red cycle; red lights pause nearby characters with a sweat effect and no longer block movement.
 - Side collisions now knock the player back without flipping facing and also knock back the NPC before it pauses briefly.
- Stomping an NPC now bounces the player to full jump height and after three stomps the player falls through to avoid getting stuck.
- Replaced stage object definitions in `assets/objects.custom.js`.
- Player now bounces off NPCs when stomping and is briefly stunned on side collisions.
- Added collision boxes to NPCs for more reliable interactions.
- Camera now scrolls when the player crosses 60% of the view width using logical coordinates, keeping movement consistent across fullscreen and high-DPI displays.
- Introduced `renderScale` so game objects and maps enlarge when the canvas exceeds the base resolution.
- Unified canvas sizing for fullscreen and high-DPI displays with configurable fit modes (`contain`, `cover`, `stretch`), automatic recalculation on resize, orientation changes, and fullscreen transitions.
- Ensured crisp rendering in fullscreen and on high-DPI displays by resizing the canvas with `devicePixelRatio` and disabling image smoothing.
- Fixed HUD elements disappearing in fullscreen by requesting fullscreen on the game container.
- Improved player sprite clarity in fullscreen by disabling image smoothing.
- Synced CSS background scroll with renderScale so it stays aligned with the game world in fullscreen.
- Removed upward collision resolution so entities moving upward are unaffected until gravity reverses.
- Bricks are now indestructible; hitting them from below no longer breaks them or fires a `brickHit` event.
- NPC sprites now use a 12×22 sheet with 64×64 cells and horizontal flipping for leftward movement.
- Made objects.custom.test.js more flexible to accommodate stage redesigns.
- Revised stage object layout and collisions in `assets/objects.custom.js`.
- Corrected NPC spritesheet loading with frame-based animations to prevent tiny duplicate sprites.
- Fixed NPC sprite rendering by cropping the spritesheet to a single frame.
- Added roaming NPCs that wander in from the right, occasionally stop or run, pause briefly on player contact, and exit off-screen on the left.
- Updated stage object parameters and collision patterns in `assets/objects.custom.js`.
- Expanded stage layout with new bricks, coins, and lights defined in `assets/objects.custom.js`.
- Design mode tests now mock `objects.custom.js` so level redesigns don't break CI.
- Shifted all stage object Y coordinates up by two tiles to align with new level layout.
- Design mode export now saves logical Y coordinates and a regression test ensures re-imported levels keep their positions.
- Added a fullscreen toggle button in the HUD to switch the canvas between fullscreen and windowed modes.
- Design mode now tracks a 24px block selection (`state.selection`) and pressing the `Q` key rotates that block clockwise within its parent tile by updating `patterns[key].mask` (2×2) and rebuilding collisions.
- Design mode's **新增** block now spawns centered below the HUD, stays 24px when moved, and keeps collisions and visuals aligned.
- Added an Info panel toggled by a top-right ℹ button with gameplay instructions.
- Added a 24px collision grid allowing half-tile and custom sub-tile collision patterns with matching visuals.
- Adjusted traffic light timings to green (2s), yellow (1s), and red (3s) with the cycle starting on green.
- Shifted the entire world down by two tiles (96px) so objects, player, and map align with grid without rendering offsets.
- Removed the downward camera offset so rendering uses unadjusted world coordinates.
- Design mode enable button now reflects its on/off state with an `active` style, `aria-pressed` attribute, and text toggling between “啟用” and “停用”.
- Clicking a selected object again cancels the selection.
- While in design mode, selected objects can be nudged with the `W`, `A`, `S`, `D` keys.
- Added experimental level design mode with drag-and-drop editing, transparency toggling, and JSON export.
- Transparency toggle now only affects the currently selected object; clicking without a selection does nothing.
- Design mode now exposes an `isEnabled()` helper, highlights the canvas, and blocks default pointer behavior during drags.
- Design mode now pauses the countdown timer while active.
- Design mode includes an **新增** button for placing 24px collision blocks.
- Added optional `transparent` flag to stage objects for see-through rendering without changing collisions.
- Transparent objects now render semi-transparently in design mode and are invisible during gameplay while remaining collidable.
- Added a `destroyable` flag for bricks with a design-mode toggle; bricks marked as non-destroyable resist breakage in gameplay.
- Fixed loading screen hang on subpath deployments by resolving asset URLs relative to modules and deferring audio initialization until the player presses **START**.
- Level layout, coins, and traffic lights now load from `assets/objects.custom.js` when present, falling back to `assets/objects.js`, removing hard-coded objects and random light spawning.
- Traffic lights now spawn at quarter points across the level for even distribution.
- Sliding now keeps the player's full width to avoid layout issues on iPad Safari.
- Traffic lights now render from PNG sprites and are scaled up 1.5× to roughly 3.75 tiles with aligned positions.
- Slide dust effect aligns with the player's feet during slides and scales correctly in fullscreen.
- Design mode retains selection after release and highlights the selected tile; `design.getSelected()` exposes the current object.
- Removed the goal's white line indicator.
- Added a "Let's Go!" start animation when beginning or restarting the game.
- Keyboard controls now honor `code` values `KeyZ` and `KeyX` even if `key` differs.
- Raised ground three rows higher, updated spawn height and traffic light placement.
- Added a semi-transparent shadow beneath the player.
- Removed cloud rendering from the background for a cleaner scene.
- Sliding now reduces the player's height to 75% of its base and preserves foot position.
- Safeguarded touch jump input when no `pressJump` callback is supplied.
- Generated `version.js` and HTML query parameters from `package.json` via the `npm run build` script.
- `npm run build` now compares existing files and only overwrites them when the version changes, keeping git clean during tests.
- Doubled player character dimensions for a larger appearance.
- Fixed player sprite positioning by drawing images with explicit width and height parameters.
- Ensured player sprite scales to match the player's width and height.
- The in-game version badge is now injected through a global variable defined in `version.js` and no longer imports `package.json` directly.
- Added `initAudioContext` to safely handle environments without the Web Audio API.
- Added integration tests covering `restartStage` to ensure state resets correctly.
- Replaced the in-game background with `background1.jpeg` and preloaded it on the start page.
- Background now repeats horizontally and scrolls with the camera for a parallax effect.
- Updated keyboard controls: `Z` now jumps and `X` triggers slide.
- Removed the solid green ground rendering to allow a transparent floor.
- Dropped the ground tile renderer, leaving tile `1` untouched.
- Player width shrinks to two-thirds when idle and returns to full size when moving.
- Width now updates after collision resolution, so a moving player that hits a wall stops and shrinks to two-thirds width.
- Player shadow is now anchored via `shadowY`, preventing it from rising when the player jumps.
- Shadow now snaps to the top of nearby blocks even when the player is airborne.
- Ground detection now searches downward from the player, so standing beneath a block anchors the shadow to the floor.
- Run animation now activates when pressing against walls and plays at half speed while blocked.
- Player shadow is now a horizontally flattened ellipse for a more natural appearance.
- Enlarged base player width to 84px and height to 120px; updated tests accordingly.
- Player width now depends on `running` or `blocked`; blocked runners keep full width.
- Width adjustment now considers airborne state so vertical jumps retain the base width.
- Coin collection now uses the player's dimensions for more reliable detection.
- Fixed a loading screen hang by properly clearing timed asset loads.

## Audio

Sound effects in `assets/sounds` are sourced from [Kenney](https://kenney.nl/assets) and are used as follows:

- `jump.wav` – played when the player jumps or bounces off an NPC.
- `impact.wav` – previously played when hitting a brick from below.
- `slide.wav` – played when initiating a slide.
- `clear.wav` – played upon clearing the stage.
- `coin.wav` – played when collecting a coin.
- `fail.wav` – played when the timer expires and the stage is failed.

Background music (`assets/music/background.wav`) plays in a loop when the game starts. Use the **BGM** control in the top-right corner of the screen to mute or unmute it.

## Configuration

Stage objects are defined in `assets/objects.custom.js` (or `assets/objects.js` if the custom file is missing) as a JavaScript module. Each entry in the array looks like:

```js
{ type: 'brick', x: 12, y: 4, transparent: true }
```

Supported `type` values are `brick`, `coin`, and `light`. The `x` and `y` fields use tile coordinates. The optional `transparent` flag (default `false`) renders an object at 50% opacity without changing its collision behavior. A `collision` array like `[1,1,0,0]` can define sub-tile patterns (top-left, top-right, bottom-left, bottom-right) on the 24px collision grid. `createGameState` loads this file to populate the level, coins, and traffic lights.

## Level Design Mode

Open the settings menu and use the **LEVEL** controls to enable design mode. The canvas gains a dashed outline while active. While design mode is on, the countdown timer pauses. Click or tap an object to select it, drag it to a new tile, then release to drop it. Click the selected object again to clear the selection. Disabling design mode clears the current selection. The transparency toggle affects only the current selection; clicking it with nothing selected has no effect. The layout can be saved as JSON for editing.
While an object is selected, you can move it one tile at a time with the `W`, `A`, `S`, and `D` keys for up, left, down, and right nudges respectively.
Press `Q` to cycle a selected 24px block through quadrants clockwise.
When enabled, an **新增** button appears to place a 24px collision block centered below the HUD.

## Testing

Install dependencies and run the test suite:

```sh
npm install
npm test
```

The tests verify collision handling, coin collection logic, and traffic light state transitions. Continuous integration runs the same command on each push and pull request.

## Versioning

Run `npm run build` to read the version from `package.json` and generate `version.js` plus versioned HTML query parameters. `version.js` defines a global `window.__APP_VERSION__` loaded before `main.js`, and this value is used in the UI to display the current version.
