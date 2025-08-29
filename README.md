# Mario Demo


**Version: 2.0.0**

This project is a simple platformer demo inspired by classic 2D side-scrollers. The stage clear screen now includes a simple star animation effect, sliding triggers a brief dust animation, and a one-minute countdown timer adds urgency. When time runs out before reaching the goal, a fail screen with a restart option appears. Pedestrian lights cycle through green (3s), blink (2s), and red (4s) phases, and nearby characters wait during red. Background graphics scale with the device pixel ratio to stay sharp in full-screen mode.

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

Run `npm run build` to read the version from `package.json` and generate `version.js` plus versioned HTML query parameters. The build now accepts full Semantic Versioning strings, including prerelease identifiers. `version.js` defines a global `window.__APP_VERSION__` loaded before `main.js`, and this value is used in the UI to display the current version.

## Documentation

Project documentation is split between top-level overviews and in-depth specs:

- `Requirements.md` – project scope and user stories (English)
- `Design.md` – architecture overview (English)
- `docs/DESIGN_SPEC.md`
- `docs/TEST_PLAN.md`
- `docs/CHANGELOG.md`
