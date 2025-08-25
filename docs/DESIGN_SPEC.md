# Design Specification

## DS-1: Orientation guard
- Show overlay prompting landscape orientation on mobile portrait.
- When device rotates to landscape, canvas resizes to fit and overlay hides.

## DS-2: Slide cancellation at red light
- Sliding reduces player height but red light cancels slide and restores base height.

## DS-3: Landscape fit height
- In mobile landscape, canvas height matches the viewport and UI elements move into a unified layer for scaling.
- In non-mobile or portrait orientations, original canvas styles are restored.

## DS-4: HUD visibility
- `showHUD` reveals HUD elements and touch controls while leaving the debug panel hidden.

## DS-5: Start page defaults
- Start button visible by default; restart button hidden.
- Start page allows pointer events and sets the page title to "HPC Demo Game".

## DS-6: UI styling and responsiveness
- Stage element enforces max width and height.
- Pills have a border and white background.
- Touch controls hide only on hover-capable devices and scale responsively.
- Stage clear and fail overlays allow pointer events.
- Debug panel uses a white background; clear/fail titles and buttons are styled for clarity.
- Pedestrian dialog icon scales with text height.
- Body and stage omit background images.
- Timer defines a low-time pulse animation.

## DS-7: OL NPC walk sprites
- Sprite assets `assets/sprites/OL/walk_000.png` through `walk_011.png` must exist.
