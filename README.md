# Mario Demo

**Version: 1.5.7**

This project is a simple platformer demo inspired by classic 2D side-scrollers. The stage clear screen now includes a simple star animation effect, sliding triggers a brief dust animation, and a one-minute countdown timer adds urgency. When time runs out before reaching the goal, a fail screen with a restart option appears. Traffic lights cycle through red (2s), yellow (1s), and green (2s) phases, and attempting to jump near a red light is prevented.

## Recent Changes

- Generated `version.js` and HTML query parameters from `package.json` via the `npm run build` script.
- Doubled player character dimensions for a larger appearance.
- Fixed player sprite positioning by drawing images with explicit width and height parameters.
- Ensured player sprite scales to match the player's width and height.
- The in-game version badge is now injected through a global variable defined in `version.js` and no longer imports `package.json` directly.

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
