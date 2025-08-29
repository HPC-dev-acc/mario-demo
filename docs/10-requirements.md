
# Requirements

## URS
### Project Goals and Scope
- Build a 2D side-scrolling platformer demo using HTML5 Canvas and vanilla JS with movement, jumping, stomping, NPC interaction, and clear/fail flow.
- Support mobile and desktop devices, fullscreen, and offline play (PWA) with HUD, language switching, and a simple debug panel.

### Key Stakeholders
- **Players**: experience the platformer and mobile controls.
- **Product/Planning**: define game rules, levels, and art direction.
- **Development/QA**: implement the code and verify performance and compatibility.
- **Operations/Publishing**: handle deployment, versioning, and asset management.

## SRS
### Functional Requirements (FR)
**Navigation / Launch**
- FR-001: The home page shows a **START** button and language settings; pressing START begins the game.
- FR-002: Language can be switched in the settings menu (English, Japanese, Traditional Chinese, Simplified Chinese); the HUD and pedestrian dialogs follow the selection.

**Game Flow**
- FR-010: Each session has a **60-second countdown** that flashes during the final 10 seconds.
- FR-011: Reaching the goal displays a **clear screen** with a simple star animation and a **restart** option.
- FR-012: Timing out or failing shows a **fail screen** with a **restart** option.

**Characters & Physics**
- FR-020: The player can move left/right, jump, and slide (sliding triggers a brief dust effect).
- FR-021: The player can stomp NPCs to bounce; after three stomps the player passes through to avoid getting stuck; side collisions knock both back.
- FR-022: The camera begins horizontal scrolling once the player crosses **60 %** of the viewport width.

**NPCs and Traffic**
- FR-030: Levels spawn various **NPCs** (including OL characters) at random intervals of about **4–8 seconds** from the right; they may stop, run, or exit.
- FR-031: **Pedestrian signals** cycle **green 3s → blink 2s → red 4s**; during red, nearby characters stop and display a dialog bubble with a Japanese-style figure.
- FR-032: Red lights do not block collision pass-through but must pause nearby characters; brushing the side or passing underneath should not change vertical movement.

**UI / HUD**
- FR-040: The HUD includes a gear menu (ℹ, version, ⚙) to toggle the info and debug panels; mobile shows virtual buttons.
- FR-041: Supports **fullscreen** toggle; start/clear/fail screens have clickable **restart** buttons.
- FR-042: Provides an **orientation guard overlay**: mobile portrait shows a mask and pauses the game, prompting rotation to landscape.

**Platform / Release**
- FR-050: As a **PWA**, the game can be added to the home screen and launched offline with resource caching and versioning.

### Content and Levels
- Default level **Stage 1-1** offers basic terrain (bricks/platforms/coins/pedestrian lights) with NPC combinations and spawn rates (OL NPCs appear more often).
- Level data uses object lists and **24 px sub-grid** collision masks (2×2) to support half tiles and custom patterns.

## NFR
- NFR-001 (Performance): Target **60 FPS** (allow degradation on low-end devices); render only tiles/objects within the camera view.
- NFR-002 (Visual Quality): Canvas resolution = CSS size × `devicePixelRatio`; **disable image smoothing** for crisp pixels.
- NFR-003 (Layout): Fixed **16:9** aspect; fullscreen uses letterboxing; mobile landscape uses **fit-height** to avoid browser UI overlap.
- NFR-004 (Compatibility): Latest Chrome/Safari/Firefox/Edge; common iOS/Android sizes must be operable (virtual buttons scale with viewport).
- NFR-005 (i18n): UI, dialog bubbles, buttons, and prompts fully follow the selected language.
- NFR-006 (Usability): START/Restart buttons must be **clickable** and visible; touch targets ≥ 40 px (recommended).
- NFR-007 (Maintainability): Assets and levels managed via structured files (e.g., `assets/objects.custom.js`); introducing design mode/export must not break compatibility.
- NFR-008 (PWA): `manifest.json` defines icons/splash screens; `sw.js` caches core assets and manages versions, prompting or activating updates.

## ICD
- **Data / Events Summary**
  - Character: `{id,type,pos(x,y),vel(vx,vy),state,dir,hitbox,anim}`
  - Object: `{id,kind,bounds,mask(2x2),solid?,trigger?}`
  - Traffic light: `{phase: green|blink|red, tRemaining, area}`
  - Events: `npcSpawned, npcBumped, stomp, slide, lightPhaseChanged, goalReached, timeUp, restart`
- **Dependencies and Compatibility**
  - No framework dependencies (vanilla JS); tooling such as Babel and Jest is used only during development and testing.

## RTM
- **R-FR-031 Pedestrian signal 3/2/4** → Design: `trafficLights` state machine, collision exemption → Test: `redLightSlide.test.js`
- **R-FR-022 Camera 60 % scroll** → Design: `camera.scrollThreshold = 0.6` → Test: `render/scroll.test.js` (recommended)
- **R-FR-020 Slide dust** → Design: `effects.dust()` → Test: `style.test.js`
- **R-NFR-002 Pixel sharpness** → Design: `ctx.imageSmoothingEnabled = false`, DPR Canvas → Test: `style.test.js`
- **R-FR-050 PWA** → Design: `sw.js`, `manifest.json` → Test: `pwa.test.js` (recommended)

## Risks and Constraints
- Device `devicePixelRatio` differences and varying browser UI heights may cause viewport miscalculations (mitigated by fit-height and `renderScale`).
- High NPC counts or effects may reduce frame rate; control entity count and cull off-screen objects.
