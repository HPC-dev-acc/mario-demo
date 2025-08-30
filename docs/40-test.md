# Test Plan

## Test Plan
Each design specification point in `docs/20-design.md` is verified by an automated or manual test. Jest is used for unit tests and GitHub Actions runs them on every push.

## Test Specifications
### T-1: Orientation guard overlay
- **Design Spec**: DS-1
- **Test File**: `orientation-guard.test.js`
- **Description**: verifies overlay activation and canvas resize on orientation change.

### T-2: Slide cancellation at red light
- **Design Spec**: DS-2
- **Test File**: `redLightSlide.test.js`
- **Description**: ensures exiting a slide restores player height when a red light cancels the slide.

### T-3: Landscape fit height
- **Design Spec**: DS-3
- **Test File**: `landscape-fit-height.test.js`
- **Description**: fits canvas to viewport in mobile landscape and restores styles otherwise.

### T-4: HUD visibility
- **Design Spec**: DS-4
- **Test File**: `hud.test.js`
- **Description**: confirms `showHUD` displays HUD elements while keeping the debug panel hidden.

### T-5: Start page defaults
- **Design Spec**: DS-5
- **Test File**: `start-page.test.js`
- **Description**: checks start button visibility, pointer events, and correct page title.

### T-6: UI styling and responsiveness
- **Design Spec**: DS-6
- **Test File**: `style.test.js`
- **Description**: validates CSS rules for stage limits, touch controls, clear/fail overlays, and timer animation.

### T-7: OL NPC walk sprites
- **Design Spec**: DS-7
- **Test File**: `ol-walk-sprites.test.js`
- **Description**: ensures sprite files for walk animation frames 0–11 exist.

### T-8: Countdown timer
- **Design Spec**: DS-8
- **Test**: Manual
- **Description**: observe timer flash during final 10 seconds and verify fail screen on expiration.

### T-9: Pedestrian traffic lights
- **Design Spec**: DS-9
- **Test**: Manual
- **Description**: confirm lights cycle 3s green → 2s blink → 4s red, nearby characters pause with dialog bubbles, and collisions remain unaffected.

### T-10: NPC behavior
- **Design Spec**: DS-10
- **Test**: Manual
- **Description**: verify spawn intervals, stomping bounce, side collision knockback, and pass-through after the third stomp.

### T-11: Audio
- **Design Spec**: DS-11
- **Test**: Manual
- **Description**: check jump, slide, clear, coin, and fail sounds and HUD mute toggle.

### T-12: Stage configuration
- **Design Spec**: DS-12
- **Test**: Manual
- **Description**: edit `assets/objects.custom.js` and ensure defined objects load with correct patterns.

### T-13: Level design mode
- **Design Spec**: DS-13
- **Test**: Manual
- **Description**: enable design mode, move objects, rotate with Q, add blocks, toggle transparency, and export layout.

### T-14: Progressive Web App support
- **Design Spec**: DS-14
- **Test**: Manual
- **Description**: install the app on a mobile device and verify full-screen launch.

### T-15: Versioning build
- **Design Spec**: DS-15
- **Test**: Manual (`npm run build`)
- **Description**: running the build generates `version.js` and updates HTML query parameters.

### T-16: Semantic version handling
- **Design Spec**: DS-16
- **Test File**: `update-version.test.js`
- **Description**: prerelease versions update HTML parameters, `version.js`, and `manifest.json`.

### T-17: High-resolution background
- **Design Spec**: DS-17
- **Test File**: `background.test.js`
- **Description**: verifies background tiles render at the correct logical size when scaled by device pixel ratio.

### T-18: Language switching
- **Design Spec**: DS-18
- **Test**: Manual
- **Description**: change language in settings and confirm HUD text and dialog bubbles update.

### T-19: Player movement and slide dust
- **Design Spec**: DS-19
- **Test**: Manual
- **Description**: move left/right, jump, and slide; verify dust effect triggers on slide.

### T-20: Camera scroll threshold
- **Design Spec**: DS-20
- **Test**: Manual
- **Description**: run right until the camera begins scrolling once crossing 60 % of the viewport.

### T-21: Fullscreen letterboxing
- **Design Spec**: DS-21
- **Test File**: `src/ui/index.test.js`
- **Description**: toggles fullscreen, verifies 16:9 letterboxing, and ensures `fullscreenchange` triggers canvas resize.

### T-22: Performance culling
- **Design Spec**: DS-22
- **Test**: Manual
- **Description**: monitor frame rate with dev tools and ensure off-screen objects are not rendered.

### T-23: Cross-browser compatibility
- **Design Spec**: DS-23
- **Test**: Manual
- **Description**: verify functionality on latest Chrome, Safari, Firefox, and Edge with responsive touch controls.

### T-24: Continuous integration tests
- **Design Spec**: DS-24
- **Test File**: `.github/workflows/test.yml`
- **Description**: ensures GitHub Actions runs `npm test` on pushes and pull requests.

## Test Reports
- Automated test results are available in GitHub Actions logs for each commit.
- Manual tests are recorded in issue comments or release notes as needed.

## UAT
- After switching language, START/Restart buttons and dialogs update.
- 60 s countdown flashes in the last 10 s; on timeout, a fail screen appears with a clickable Restart.
- During a red light, the player and NPCs stop nearby and display dialog bubbles; they resume on green.
- Stomping an NPC causes a bounce; the third stomp allows pass-through; side collisions knock both back.
- Fullscreen works on desktop and mobile; portrait mode shows a rotate overlay and landscape resumes play.
- Game loads and starts offline once installed as a PWA.
