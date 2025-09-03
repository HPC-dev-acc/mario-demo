# Mario Demo


**Version: 2.13.0**

This project is a simple platformer demo inspired by classic 2D side-scrollers. A brief **HPC Games** splash fades in on a black screen before revealing the home page, whose title now uses a large, stylized font for stronger visual impact. The splash overlay disables pointer events and is removed on initialization even if its animation already finished, preventing it from blocking the start page on slow connections. The home screen shows a resource loading progress bar before gameplay begins, preloading sprites and audio so sounds are ready once the game starts. The stage clear screen includes a simple star animation effect, sliding triggers a brief dust animation, and stomping an NPC now spawns a small star at the point of impact for visual feedback. A one-minute countdown timer adds urgency. When time runs out before reaching the goal, a fail screen with a restart option appears. Pedestrian lights cycle through green (3s), blink (2s), and red (4s) phases, and nearby characters wait during red. When stopped by a red light, OL NPCs play a dedicated idle animation from their new sprite set. Traffic lights are non-solid and cannot be stood on. Background graphics rebuild using the canvas's full height to preserve source resolution in fullscreen. Fullscreen uses centered letterboxing with black bars and automatic canvas resize, and entering fullscreen via the root container resizes the stage correctly with centered letterboxing. Stage 1-1 now spawns OL, Student, and Officeman NPCs with equal frequency. OL NPCs walk fastest, Officemen move at a medium pace, and Students walk more slowly; all walk animations cycle through every sprite frame for smoother motion. Student and Officeman NPCs use an 11-frame walk sequence for added fluidity, and Officeman sprites render 1.25× larger from their center without changing collision boxes. NPCs now spawn at their normal size even if the player is sliding. Touch buttons are circular and pinned to the bottom screen corners for easier reach. NPC and player collision boxes now span exactly one tile width for consistent interactions, while the player sprite narrows when idle without shrinking its collision box. The **SDS** in `docs/20-design.md` details asset preloading, input queuing, game-loop ordering, friction and collision formulas, NPC state machines, rendering culls, service worker messaging, and i18n dictionary updates for easier maintenance.
During gameplay, the HUD displays the player's live score, current stage label, and a countdown timer to track progress. A developer toggle in the settings gear reveals a debug panel, log controls, and level editor tools for developers and testers.

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

Install dependencies and run the test suite. The project does not include a development server; static files can be served directly.

```sh
npm install
npm test
```

The tests verify collision handling, coin collection logic, and traffic light state transitions. Continuous integration runs the same command on each push and pull request.

## Versioning

Run `npm run build` (which executes `scripts/update-version.mjs`) to read the version from `package.json` and generate `version.js` plus versioned HTML query parameters. The build now accepts full Semantic Versioning strings, including prerelease identifiers. `version.js` defines a global `window.__APP_VERSION__` loaded before `main.js`, and this value is used in the UI to display the current version.

## Documentation

Project documentation is stored in the `docs/` directory:

- `docs/10-requirement.md` – URS, SRS (FR/NFR), and RTM
- `docs/20-design.md` – SAD, SDS, ICD, ERD, API, ADR, and UX
- `docs/30-dev.md` – development guide, coding standards, and CI/CD
- `docs/40-test.md` – test plan/specs/reports and UAT
- `docs/CHANGELOG.md`
