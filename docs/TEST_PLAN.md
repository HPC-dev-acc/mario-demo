# Test Plan

**Version: 2.0.0**

Each design specification point is validated by at least one automated test.

See `../Requirements.md` and `../Design.md` for overall project context.

## T-1: Orientation guard overlay
- **Design Spec**: [DS-1]
- **Test File**: `orientation-guard.test.js`
- **Description**: verifies overlay activation and canvas resize on orientation change.

## T-2: Slide cancellation at red light
- **Design Spec**: [DS-2]
- **Test File**: `redLightSlide.test.js`
- **Description**: ensures exiting a slide restores player height when a red light cancels the slide.

## T-3: Landscape fit height
- **Design Spec**: [DS-3]
- **Test File**: `landscape-fit-height.test.js`
- **Description**: fits canvas to viewport in mobile landscape, restores styles otherwise, and moves UI elements into a scaling layer.

## T-4: HUD visibility
- **Design Spec**: [DS-4]
- **Test File**: `hud.test.js`
- **Description**: confirms `showHUD` displays HUD elements and touch controls while keeping the debug panel hidden.

## T-5: Start page defaults
- **Design Spec**: [DS-5]
- **Test File**: `start-page.test.js`
- **Description**: checks start button visibility, pointer events, and correct page title.

## T-6: UI styling and responsiveness
- **Design Spec**: [DS-6]
- **Test File**: `style.test.js`
- **Description**: validates CSS rules for stage limits, pills, touch control responsiveness, pointer events, debug panel styling, clear/fail visuals, pedestrian dialog icon scaling, background omissions, and timer animation.

## T-7: OL NPC walk sprites
- **Design Spec**: [DS-7]
- **Test File**: `ol-walk-sprites.test.js`
- **Description**: ensures sprite files for walk animation frames 0–11 exist.

## T-8: Countdown timer
- **Design Spec**: [DS-8]
- **Test File**: Manual
- **Description**: Start gameplay, observe timer flash during final 10 seconds, and verify fail screen appears when time expires.

## T-9: Pedestrian traffic lights
- **Design Spec**: [DS-9]
- **Test File**: Manual
- **Description**: Confirm lights cycle 3s green → 2s blink → 4s red and that characters wait during red with slide cancellation.

## T-10: NPC behavior
- **Design Spec**: [DS-10]
- **Test File**: Manual
- **Description**: Verify NPCs spawn every 4–8 seconds, avoid duplicate types, face right on spawn, bounce player on stomp, and knock back on side collisions.

## T-11: Audio
- **Design Spec**: [DS-11]
- **Test File**: Manual
- **Description**: Check that jump, slide, clear, coin, and fail sounds play and background music can be muted or unmuted.

## T-12: Stage configuration
- **Design Spec**: [DS-12]
- **Test File**: Manual
- **Description**: Edit `assets/objects.custom.js` and ensure defined objects load with correct transparency and collision patterns.

## T-13: Level design mode
- **Design Spec**: [DS-13]
- **Test File**: Manual
- **Description**: Enable design mode, drag objects, nudge with WASD, rotate with Q, add blocks, toggle transparency, export layout, and confirm timer pause.

## T-14: Progressive Web App support
- **Design Spec**: [DS-14]
- **Test File**: Manual
- **Description**: Install the app on a mobile device and verify it launches full screen.

## T-15: Versioning build
- **Design Spec**: [DS-15]
- **Test File**: Manual (`npm run build`)
- **Description**: Running `npm run build` generates `version.js` and updates HTML query parameters so `window.__APP_VERSION__` matches `package.json`.

## T-16: Semantic version handling
- **Design Spec**: [DS-16]
- **Test File**: `updateVersion.test.js`
- **Description**: Setting a prerelease version in `package.json` updates HTML query parameters, `version.js`, and `manifest.json`.
