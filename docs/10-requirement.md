
# Requirements

_Updated for v2.16.3: Trunk NPC renders 1.25× larger from its center without affecting collisions._

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
  - *Success*: The HUD displays the timer and circular touch controls at the screen corners, and portrait orientation shows a rotate prompt.
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
- **URS-015: Collision box visibility in design mode**
  - *Scenario*: Developers or testers adjust level layouts.
  - *User story*: As a developer or tester, I want collision boxes for all objects and characters visible so I can place elements accurately.
  - *Success*: Enabling design mode draws green outlines around every object, the player, and NPCs.

- **URS-016: Stable collision during idle**
  - *Scenario*: The player character pauses without input.
  - *User story*: As a player, I want the character's collision box to stay the same when idle so positioning remains reliable.
  - *Success*: Idling only narrows the sprite visually; collisions remain one tile wide and interactions are unaffected.

- **URS-017: Stomp visual feedback**
  - *Scenario*: The player jumps onto an NPC.
  - *User story*: As a player, I want a visible effect when I stomp an NPC so I know the bounce registered.
  - *Success*: Stomping an NPC produces a brief star effect at the contact point.

- **URS-018: Impactful home title**
  - *Scenario*: A player views the home screen before starting.
  - *User story*: I want the game title to appear large and stylized so the start screen feels exciting.
  - *Success*: The title is prominently displayed with bold styling on the home screen.

- **URS-019: Intro splash screen**
  - *Scenario*: The game launches before the home screen appears.
  - *User story*: I want a brief branded splash so I know who made the game.
  - *Success*: A black screen fades in "HPC Games" then fades out to reveal an immediately interactive home screen.

- **URS-020: Animated NPC waiting**
  - *Scenario*: NPCs pause at pedestrian red lights.
  - *User story*: I want characters to show motion even when stopped so the world feels alive.
  - *Success*: When waiting at a red light, OL and Officeman NPCs play idle animations instead of standing frozen.

- **URS-021: Passing Trunk obstacle**
  - *Scenario*: A log slides across the stage faster than other characters.
  - *User story*: As a player, I want occasional trunks to move from the left without knocking me back so I react to unexpected scenery.
  - *Success*: A trunk glides from the left toward the right, displays 1.25× larger from its center, cannot be stood on, and does not impede the player.

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

- FR-023: While idle on the ground, the player sprite may narrow visually but the collision box width remains one tile wide.

**NPCs and Traffic**
 - FR-030: Levels spawn various **NPCs** (including OL, Student, and Officeman characters) at random intervals of about **4–8 seconds** from the right; they may stop, run, or exit. OL NPCs walk fastest, Officemen move at a medium pace, Students walk more slowly, and the Student and Officeman walk animations use 11 frames for smooth motion.
- FR-031: **Pedestrian signals** cycle **green 3s → blink 2s → red 4s**; during red, nearby characters stop and display a dialog bubble with a Japanese-style figure.
 - FR-032: Red lights do not block collision pass-through and traffic lights provide no surface to stand on; brushing the side or passing underneath should not change vertical movement.

- FR-033: Officeman NPC sprites render 1.25× larger from their center while their collision boxes remain unchanged.
- FR-034: NPC spawn dimensions derive from the player's base height so sliding does not shrink NPCs or misalign them with the ground.
 - FR-056: OL, Officeman, and Student NPCs display idle animations when paused by red lights.
- FR-057: A Trunk NPC may slide in from the left, moves to the right faster than OL, renders 1.25× larger from its center without altering collisions, cannot be stood on, and causes no collision response; pass-through persists even after the player lands.

**UI / HUD**
- FR-040: The HUD includes a gear menu (ℹ, version, ⚙) to toggle the info panel; mobile shows virtual buttons.
- FR-041: Supports **fullscreen** toggle; start/clear/fail screens have clickable **restart** buttons.
- FR-042: Provides an **orientation guard overlay**: mobile portrait shows a mask and pauses the game, prompting rotation to landscape.
- FR-043: The settings menu offers a **developer switch** that reveals the debug panel, log controls, and a level editor for developers and testers when enabled.
- FR-044: Touch controls use circular buttons pinned to the bottom corners for ergonomic thumb reach.

**Platform / Release**
- FR-050: The game can be installed and launched offline with cached resources and versioning.
- FR-051: Enabling design mode draws green collision box outlines for all objects, the player, and NPCs.
- FR-052: NPC collision boxes span exactly one tile width for consistent interactions.
- FR-053: Stomping an NPC spawns a brief star effect at the contact point.
- FR-054: The home screen displays the game title in 72 px stylized lettering.
- FR-055: On launch, a black splash screen briefly fades in and out "HPC Games" before showing the home screen, and it must not block the start button if scripts load slowly.

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
| FR-023 | DS-37 | T-37 |
| FR-030 | DS-10, DS-25, DS-26, DS-27, DS-30 | T-10, T-25, T-26, T-27, T-30 |
| FR-031 | DS-9 | T-9 |
| FR-032 | DS-9 | T-9 |
| FR-033 | DS-31 | T-31 |
| FR-034 | DS-32 | T-32 |
| FR-040 | DS-4, DS-6 | T-4, T-6 |
| FR-041 | DS-6, DS-21 | T-6, T-21 |
| FR-042 | DS-1 | T-1 |
| FR-043 | DS-28 | T-28 |
| FR-044 | DS-35 | T-35 |
| FR-050 | DS-14 | T-14 |
| FR-051 | DS-34 | T-34 |
| FR-052 | DS-36 | T-36 |
| FR-053 | DS-38 | T-38 |
| FR-054 | DS-39 | T-39 |
| FR-055 | DS-40 | T-40 |
| FR-056 | DS-41, DS-42, DS-43 | T-41, T-42, T-43 |
| FR-057 | DS-44 | T-44, T-45, T-46, T-47 |

### Non-Functional Requirements
| Requirement | Design Spec | Test |
| --- | --- | --- |
| NFR-001 | DS-22 | T-22 |
| NFR-002 | DS-17 | T-17 |
| NFR-003 | DS-3, DS-21 | T-3, T-21 |
| NFR-004 | DS-23 | T-23 |
| NFR-005 | DS-18 | T-18 |
| NFR-006 | DS-5, DS-6, DS-35 | T-5, T-6, T-35 |
| NFR-007 | DS-12, DS-13 | T-12, T-13 |
| NFR-008 | DS-14 | T-14 |
