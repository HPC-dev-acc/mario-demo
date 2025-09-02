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
- **Description**: confirm lights cycle 3s green → 2s blink → 4s red, nearby characters pause with dialog bubbles, and traffic lights provide no surface to stand on.

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
- **Description**: verifies background tiles render at the correct logical size when scaled by device pixel ratio and CSS scaling factors.

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
- **Description**: toggles fullscreen, verifies 16:9 letterboxing, ensures `fullscreenchange` triggers canvas resize, and confirms `#game-root:fullscreen #stage` styles apply.

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

### T-25: Student NPC walk sprites
- **Design Spec**: DS-25
- **Test File**: `student-walk-sprites.test.js`
- **Description**: ensures sprite files for walk animation frames 0–10 exist.

### T-26: NPC walk animation frame usage
- **Design Spec**: DS-26
- **Test File**: `src/render.test.js`
- **Description**: verifies OL and Student walk animations iterate through all sprite frames within one second for smooth motion.

### T-27: NPC speed differentiation
- **Design Spec**: DS-27
- **Test File**: `src/main.integration.test.js`
- **Description**: confirms OL NPC walks fastest, Officeman NPC walks at a medium pace, and the Student NPC walks more slowly.

### T-28: Developer switch
- **Design Spec**: DS-28
- **Test File**: `src/ui/index.test.js`
- **Description**: toggling developer mode shows or hides the debug panel, log controls, and level editor controls for developers and testers.

### T-29: Game state fields
- **Design Spec**: DS-29
- **Test File**: `src/game/state.test.js`
- **Description**: `createGameState` exposes level, coins, lights, player, camera, and npcs without score or time properties.

### T-30: Officeman NPC walk sprites
- **Design Spec**: DS-30
- **Test File**: `officeman-walk-sprites.test.js`
- **Description**: ensures sprite files for walk animation frames 0–10 exist.

### T-31: Officeman sprite scaling
- **Design Spec**: DS-31
- **Test File**: `src/render.test.js`
- **Description**: verifies Officeman NPC sprites draw 1.25× larger from their center while hitboxes remain unchanged.

### T-32: NPC spawn size during player slide
- **Design Spec**: DS-32
- **Test File**: `src/main.integration.test.js`
- **Description**: ensures NPCs spawn at normal size even when the player is sliding.

### T-33: Loading progress bar
- **Design Spec**: DS-33
- **Test File**: `src/ui/index.test.js`
- **Description**: verifies the start screen progress bar updates and hides after loading completes.

## Test Reports
- Automated test results are available in GitHub Actions logs for each commit.
- Manual tests are recorded in issue comments or release notes as needed.

## UAT
- **URS-001**: On load, the start screen is visible and changing the language updates all text before play.
- **URS-002**: During play, the character responds to left/right/jump/slide inputs and can stomp NPCs.
- **URS-003**: Meeting NPCs and traffic lights requires timing; red lights pause nearby characters and resume on green.
- **URS-004**: A countdown is always visible, flashes during the last 10 s, and clear/fail screens offer a restart.
- **URS-005**: The game runs on desktop and mobile, supports fullscreen, and launches offline after installation.
- **URS-006**: The HUD shows timer and controls, and portrait orientation displays a rotate prompt.
- **URS-011**: Enabling developer mode reveals the debug panel, log controls, and level editor; disabling hides them again (developer/tester only).
- **URS-012**: Officeman NPCs appear larger on screen without altering collision behavior.
- **URS-013**: NPCs spawn at normal size even when the player slides.
- **URS-014**: A progress bar shows loading status before the start button appears.
