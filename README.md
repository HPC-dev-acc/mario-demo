# Mario Demo


**Version: 2.20.4**

- HPC Games splash and title scale to any viewport.
- Assets preload with a progress bar; gameplay uses star and dust effects.
- Adds a countdown timer, pedestrian lights, and idle animations for nearby NPCs.
- Introduces Trunk NPC and refines NPC speeds, collisions, and culling.
- HUD shows score, stage, and timer; a developer toggle exposes debug tools and a level editor.

## Installation

Install dependencies:

```sh
npm install
```

## Run

Open `index.html` directly in a browser, or rebuild version info and serve the directory with a static server:

```sh
npm run build && npx serve .
```

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

## Level Editor (developer/tester only)

Open the settings menu and use the **LEVEL** controls to enable design mode. This editor is intended for developers and testers; the canvas gains a dashed outline while active and the countdown timer pauses. Click or tap an object to select it, drag it to a new tile, then release to drop it. Click the selected object again to clear the selection. Disabling design mode clears the current selection. The transparency toggle affects only the current selection; clicking it with nothing selected has no effect. The layout can be saved as JSON for editing.
While an object is selected, you can move it one tile at a time with the `W`, `A`, `S`, and `D` keys for up, left, down, and right nudges respectively.
Press `Q` to cycle a selected 24px block through quadrants clockwise.
When enabled, an **新增** button appears to place a 24px collision block centered below the HUD. Design mode also outlines collision boxes for all objects, the player, and NPCs in green to aid placement.

## Testing

Run the test suite after installing dependencies:

```sh
npm test
```
Tests live alongside modules in `src/` and under `tests/` for DOM and sprite checks. 
The test suite uses a jsdom environment with a stubbed Canvas context from [`jest.setup.js`](./jest.setup.js) and currently reports **42 passed suites (232 tests)** with coverage **84 % statements, 76 % branches, 84 % functions, 88 % lines**. Continuous integration runs the same command on each push. Detailed reports and UAT results are documented in `docs/04-test.md`.

## Versioning

Run `npm run build` to regenerate `version.js` and `version.global.js`. The script reads `RELEASE_VERSION` (or `package.json`), records `BUILD_NUMBER` and `GIT_SHA`, and exposes `window.__APP_VERSION__` plus optional build metadata for cache busting. `index.html` loads `version.global.js` as a module.

## Documentation

Project documentation is stored in the `docs/` directory. Each file is curated for its specific role so requirements, design, development, and tests remain in sync:

- `docs/01-requirement.md` – URS, SRS (FR/NFR), and RTM
- `docs/02-design.md` – SAD (with architecture diagram), SDS, ICD (module sequence & data tables), ERD, API, ADR, and UX
- `docs/03-dev.md` – development guide, coding standards, and CI/CD
- `docs/04-test.md` – test plan/specs/reports and UAT
- `docs/CHANGELOG.md` – version history
