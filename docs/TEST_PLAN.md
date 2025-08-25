# Test Plan

Each design specification point is validated by at least one automated test.

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
