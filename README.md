# Mario Demo

**Version: 1.5.31**

This project is a simple platformer demo inspired by classic 2D side-scrollers. The stage clear screen now includes a simple star animation effect, sliding triggers a brief dust animation, and a one-minute countdown timer adds urgency. When time runs out before reaching the goal, a fail screen with a restart option appears. Traffic lights cycle through red (2s), yellow (1s), and green (2s) phases, and attempting to jump near a red light is prevented.

## Recent Changes

- Removed the goal's white line indicator.
- Added a "Let's Go!" start animation when beginning or restarting the game.
- Keyboard controls now honor `code` values `KeyZ` and `KeyX` even if `key` differs.
- Raised ground three rows higher, updated spawn height and traffic light placement.
- Added a semi-transparent shadow beneath the player.
- Removed cloud rendering from the background for a cleaner scene.
- Sliding now halves the player's height and preserves foot position.
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
- Applied a downward camera offset so the scene renders 80 pixels lower.
- Run animation now activates when pressing against walls and plays at half speed while blocked.
- Player shadow is now a horizontally flattened ellipse for a more natural appearance.
- Enlarged base player width to 84px and height to 120px; updated tests accordingly.

## Audio

Sound effects in `assets/sounds` are sourced from [Kenney](https://kenney.nl/assets) and are used as follows:

- `jump.wav` – played when the player jumps.
- `impact.wav` – played when the player hits a brick from below.
- `slide.wav` – played when initiating a slide.
- `clear.wav` – played upon clearing the stage.
- `coin.wav` – played when collecting a coin.
- `fail.wav` – played when the timer expires and the stage is failed.

Background music (`assets/music/background.wav`) plays in a loop when the game starts. Use the **BGM** control in the top-right corner of the screen to mute or unmute it.

## Testing

Install dependencies and run the test suite:

```sh
npm install
npm test
```

The tests verify collision handling, coin collection logic, and traffic light state transitions. Continuous integration runs the same command on each push and pull request.

## Versioning

Run `npm run build` to read the version from `package.json` and generate `version.js` plus versioned HTML query parameters. `version.js` defines a global `window.__APP_VERSION__` loaded before `main.js`, and this value is used in the UI to display the current version.
