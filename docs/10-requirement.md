
# Requirements

_Updated for v2.7.1: clarified SDS implementation details; requirement mapping remains unchanged._

## URS
- **URS-001: Start menu and language choice**
  - *Scenario*: A first-time player lands on the home page.
  - *User story*: As a new player, I want a visible **START** button and the ability to choose my language so that I can begin play in a language I understand.
  - *Success*: The start screen is obvious, and switching language updates all on-screen text before gameplay begins.
- **URS-002: Responsive movement and actions**
  - *Scenario*: During play, the character needs to traverse the stage and avoid obstacles.
  - *User story*: As a player, I want to move left or right, jump, slide, and stomp NPCs so that I can navigate the world and overcome challenges.
  - *Success*: Controls feel immediate and allow the player to clear obstacles and interact with NPCs without delay.
- **URS-003: Traffic and NPC interaction**
  - *Scenario*: The player meets other characters and traffic signals along the route.
  - *User story*: I want characters and signals that require me to time my actions, adding risk and variety.
  - *Success*: Red lights and NPC behavior force the player to pause or adjust timing without using traffic lights as platforms; mistakes lead to setbacks or failure.
- **URS-004: Countdown and session feedback**
  - *Scenario*: Each run has a time limit and ends in success or failure.
  - *User story*: I want to see how much time remains and receive a clear or fail screen with an option to restart.
  - *Success*: A visible timer counts down, flashes near zero, and the game displays clear/fail messages with a restart control.
- **URS-005: Cross-platform, fullscreen, and offline play**
  - *Scenario*: Players try the game on various devices or without a network connection.
  - *User story*: I want the game to work on mobile and desktop, support fullscreen, and remain playable offline so I can enjoy it anywhere.
  - *Success*: The same content runs on touch and keyboard devices, fullscreen mode is available, and the game launches after installation even when offline.
- **URS-006: Informative HUD and guidance**
  - *Scenario*: Players need status information and orientation hints.
  - *User story*: I want a HUD that shows essential info and warns me when the device is rotated so I stay oriented.
  - *Success*: The HUD displays the timer and controls, and portrait orientation shows a rotate prompt.
- **URS-007: Coin collection feedback**
  - *Scenario*: Players move through the stage encountering coins.
  - *User story*: I want coins to disappear, increase my score, and play a sound when collected so I know I grabbed them.
  - *Success*: Touching a coin removes it from the stage, increments the score, and plays the coin sound effect.
- **URS-008: Action audio and background music control**
  - *Scenario*: Players jump, slide, or clear the stage while listening to background music.
  - *User story*: I want distinct sound effects for actions and automatic BGM that I can mute or unmute from the interface.
  - *Success*: The game loads multiple sound effects and looping BGM, and the interface toggles BGM mute state.
- **URS-009: Live score and progress tracking**
  - *Scenario*: Players monitor their performance while navigating the stage.
  - *User story*: I want the HUD to display my current score, the stage label, and a countdown timer so I can gauge how well I'm doing.
  - *Success*: During gameplay, the HUD continuously shows an updating score, the active stage name, and a timer.
- **URS-010: Developer mode toggle (developer/tester only)**
  - *Scenario*: Developers or testers sometimes need additional insight while running the game.
  - *User story*: As a developer or tester, I want a switch in the settings gear that enables developer mode so I can access debugging tools when necessary.
  - *Success*: Turning on the developer switch enables developer mode; turning it off returns to the standard player experience.

- **URS-011: Debug panel and tools (developer/tester only)**
  - *Scenario*: Developers or testers investigate behavior or adjust level layout.
  - *User story*: As a developer or tester, I want a debug panel with log controls and a level editor so I can inspect and modify the game.
  - *Success*: In developer mode, the debug panel, log controls, and level editor are visible; in player mode they remain hidden.

- **URS-012: Officeman visibility**
  - *Scenario*: Officeman NPC sprites are smaller than other characters.
  - *User story*: As a player, I want Officeman NPCs to appear at a comparable size so they are easy to see while gameplay physics stay consistent.
  - *Success*: Officeman sprites display larger on screen without changing how their collision boxes interact.

- **URS-013: Consistent NPC size during slides**
  - *Scenario*: The player is sliding while NPCs spawn.
  - *User story*: As a player, I want NPCs to spawn at their normal size even when I'm sliding so visuals stay consistent.
  - *Success*: NPCs always appear at their standard height and align with the ground regardless of player height changes.

- **URS-014: Resource loading feedback**
  - *Scenario*: Players wait for assets to load on the home screen.
  - *User story*: As a player, I want a progress indicator so I know when the game is ready to start.
  - *Success*: A visible progress bar reaches 100 % before the START button appears.

## SRS
### Functional Requirements (FR)
**Navigation / Launch**
- FR-001: The home page shows a **START** button and language settings; pressing START begins the game.
- FR-002: Language can be switched in the settings menu (English, Japanese, Traditional Chinese, Simplified Chinese); the HUD and pedestrian dialogs follow the selection.
- FR-003: The home page displays a loading progress indicator while assets download, reaching **100 %** before the **START** button is shown.

**Game Flow**
- FR-010: Each session has a **60-second countdown** that flashes during the final 10 seconds.
- FR-011: Reaching the goal displays a **clear screen** with a simple star animation and a **restart** option.
- FR-012: Timing out or failing shows a **fail screen** with a **restart** option.

**Characters & Physics**
- FR-020: The player can move left/right, jump, and slide (sliding triggers a brief dust effect).
- FR-021: The player can stomp NPCs to bounce; after three stomps the player passes through to avoid getting stuck; side collisions knock both back.
- FR-022: The camera begins horizontal scrolling once the player crosses **60 %** of the viewport width.

**NPCs and Traffic**
 - FR-030: Levels spawn various **NPCs** (including OL, Student, and Officeman characters) at random intervals of about **4–8 seconds** from the right; they may stop, run, or exit. OL NPCs walk fastest, Officemen move at a medium pace, Students walk more slowly, and the Student and Officeman walk animations use 11 frames for smooth motion.
- FR-031: **Pedestrian signals** cycle **green 3s → blink 2s → red 4s**; during red, nearby characters stop and display a dialog bubble with a Japanese-style figure.
 - FR-032: Red lights do not block collision pass-through and traffic lights provide no surface to stand on; brushing the side or passing underneath should not change vertical movement.

- FR-033: Officeman NPC sprites render 1.25× larger from their center while their collision boxes remain unchanged.
- FR-034: NPC spawn dimensions derive from the player's base height so sliding does not shrink NPCs or misalign them with the ground.

**UI / HUD**
- FR-040: The HUD includes a gear menu (ℹ, version, ⚙) to toggle the info panel; mobile shows virtual buttons.
- FR-041: Supports **fullscreen** toggle; start/clear/fail screens have clickable **restart** buttons.
- FR-042: Provides an **orientation guard overlay**: mobile portrait shows a mask and pauses the game, prompting rotation to landscape.
- FR-043: The settings menu offers a **developer switch** that reveals the debug panel, log controls, and a level editor for developers and testers when enabled.

**Platform / Release**
- FR-050: The game can be installed and launched offline with cached resources and versioning.

### Content and Levels
 - Default level **Stage 1-1** offers basic terrain (bricks/platforms/coins/pedestrian lights) with NPC combinations and spawn rates (OL, Student, and Officeman NPCs appear more often).
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
| FR-003 | DS-33 | T-33 |
| FR-010 | DS-8 | T-8 |
| FR-011 | DS-6 | T-6 |
| FR-012 | DS-6 | T-6 |
| FR-020 | DS-19 | T-19 |
| FR-021 | DS-10 | T-10 |
| FR-022 | DS-20 | T-20 |
| FR-030 | DS-10, DS-25, DS-26, DS-27, DS-30 | T-10, T-25, T-26, T-27, T-30 |
| FR-031 | DS-9 | T-9 |
| FR-032 | DS-9 | T-9 |
| FR-033 | DS-31 | T-31 |
| FR-034 | DS-32 | T-32 |
| FR-040 | DS-4, DS-6 | T-4, T-6 |
| FR-041 | DS-6, DS-21 | T-6, T-21 |
| FR-042 | DS-1 | T-1 |
| FR-043 | DS-28 | T-28 |
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
