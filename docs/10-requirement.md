
# Requirements

## URS
- URS-001: Players start from a menu that offers a clear **START** option and language choice.
- URS-002: Players guide a character through a side-scrolling world with movement, jumping, sliding, and stomping.
- URS-003: Players encounter characters and traffic signals that require timing and offer interactive challenges.
- URS-004: Players track a visible countdown and see clear or fail screens with the ability to restart.
- URS-005: Players enjoy the game on both mobile and desktop, with fullscreen and offline play available.
- URS-006: Players access a HUD for essential info, orientation hints, and optional debug details.

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
 - FR-030: Levels spawn various **NPCs** (including OL and Student characters) at random intervals of about **4–8 seconds** from the right; they may stop, run, or exit. OL NPCs walk faster while Students move more slowly, and the Student walk animation uses 11 frames for smooth motion.
- FR-031: **Pedestrian signals** cycle **green 3s → blink 2s → red 4s**; during red, nearby characters stop and display a dialog bubble with a Japanese-style figure.
- FR-032: Red lights do not block collision pass-through but must pause nearby characters; brushing the side or passing underneath should not change vertical movement.

**UI / HUD**
- FR-040: The HUD includes a gear menu (ℹ, version, ⚙) to toggle the info and debug panels; mobile shows virtual buttons.
- FR-041: Supports **fullscreen** toggle; start/clear/fail screens have clickable **restart** buttons.
- FR-042: Provides an **orientation guard overlay**: mobile portrait shows a mask and pauses the game, prompting rotation to landscape.

**Platform / Release**
- FR-050: The game can be installed and launched offline with cached resources and versioning.

### Content and Levels
- Default level **Stage 1-1** offers basic terrain (bricks/platforms/coins/pedestrian lights) with NPC combinations and spawn rates (OL and Student NPCs appear more often).
- Level data uses object lists and **24 px sub-grid** collision masks (2×2) to support half tiles and custom patterns.

## NFR
- NFR-001 (Performance): Target **60 FPS** and process only what is visible to maintain smooth play on most devices.
- NFR-002 (Visual Quality): Graphics stay sharp at full resolution, regenerating backgrounds as needed and avoiding smoothing artifacts.
- NFR-003 (Layout): Maintain a **16:9** aspect; fullscreen centers the stage with black bars and adapts to orientation changes while keeping controls unobstructed.
- NFR-004 (Compatibility): Operate on current major desktop and mobile browsers across common screen sizes, scaling virtual buttons with the viewport.
- NFR-005 (i18n): UI, dialog bubbles, buttons, and prompts fully follow the selected language.
- NFR-006 (Usability): START/Restart buttons remain visible and clickable; touch targets are at least **40 px**.
- NFR-007 (Maintainability): Game assets and level data stay organized; enabling design mode/export must not break existing content.
- NFR-008 (Offline): Installation defines icons and splash screens; offline caching manages versions and informs users of updates.

## RTM

### Functional Requirements
| Requirement | Design Spec | Test |
| --- | --- | --- |
| FR-001 | DS-5, DS-18 | T-5, T-18 |
| FR-002 | DS-18 | T-18 |
| FR-010 | DS-8 | T-8 |
| FR-011 | DS-6 | T-6 |
| FR-012 | DS-6 | T-6 |
| FR-020 | DS-19 | T-19 |
| FR-021 | DS-10 | T-10 |
| FR-022 | DS-20 | T-20 |
| FR-030 | DS-10, DS-25, DS-26, DS-27 | T-10, T-25, T-26, T-27 |
| FR-031 | DS-9 | T-9 |
| FR-032 | DS-9 | T-9 |
| FR-040 | DS-4, DS-6 | T-4, T-6 |
| FR-041 | DS-6, DS-21 | T-6, T-21 |
| FR-042 | DS-1 | T-1 |
| FR-050 | DS-14 | T-14 |

### Non-Functional Requirements
| Requirement | Design Spec | Test |
| --- | --- | --- |
| NFR-001 | DS-22 | T-22 |
| NFR-002 | DS-17 | T-17 |
| NFR-003 | DS-3, DS-21 | T-3, T-21 |
| NFR-004 | DS-23 | T-23 |
| NFR-005 | DS-18 | T-18 |
| NFR-006 | DS-5, DS-6 | T-5, T-6 |
| NFR-007 | DS-12, DS-13 | T-12, T-13 |
| NFR-008 | DS-14 | T-14 |
