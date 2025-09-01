# Changelog

All notable changes to this project are documented here.

## Unreleased

### Added
- No entries.

### Changed
- No entries.

## v2.6.0 - 2025-09-05

### Added
- Officeman sprites now render 1.5× larger from their center without altering collision boxes (DS-31, T-31).

## v2.5.0 - 2025-09-04

### Added
- Added ICD section and detailed SAS/SDS in design document.
- Expanded design specifications and test plan to cover countdown timer, pedestrian traffic lights, NPC behavior, audio, stage configuration, a level editor, PWA support, and build versioning (DS-8–DS-15, T-8–T-15).
- Build script now handles full Semantic Versioning, including prerelease versions (DS-16, T-16).
- Background rendering uses device pixel ratio to stay sharp in full-screen mode (DS-17, T-17).
- Added language switching, player movement and slide dust, camera scroll threshold, fullscreen letterboxing, performance culling, and cross-browser compatibility to design specs and test plan (DS-18–DS-23, T-18–T-23).
- Added URS entries for coin collection feedback and audio control (URS-007–URS-008).
- Added URS entry for live score, stage label, and timer visibility during gameplay (URS-009).
- Added Officeman NPC with dedicated sprite set and medium walk speed between Student and OL (DS-30, T-30).

### Changed
- Renamed version sync script to `scripts/update-version.mjs` and updated references (DS-16, T-16).
- Restructured documentation: `10-requirement.md`, `20-design.md`, `30-dev.md`, and `40-test.md` replace previous files.
- Removed "Recent Changes" section from README.
- Clarified pedestrian traffic light behavior and NPC pass-through after the third stomp (DS-9–DS-10, T-9–T-10).
- Converted design specifications list into a table aligned with requirements and tests.
- Clarified UI architecture: `src/ui/index.js` handles HUD interactions while `hud.js` exposes only `showHUD` (DS-4).
- Removed outdated development server references to reflect static build workflow.
- Clarified build step to focus on version updates, removing asset bundling references (DS-16, T-15).
- CI documentation now highlights only Jest testing, removing the lint step (DS-24, T-24).
- Renamed requirement document to `docs/10-requirement.md`, rewrote URS to focus on player needs, and removed ICD section.
- Expanded URS with detailed scenarios and success criteria and linked UAT items to URS IDs.
- Moved level design mode requirement from URS to SRS and renumbered subsequent URS items.
- HUD requirement no longer references debug data; debug tools are consolidated under a developer-only requirement and SRS entry (URS-006, URS-011, FR-040, FR-043, DS-4, DS-28, T-4, T-28).

## v2.4.1 - 2025-09-03

### Fixed
- ICD documents the actual game state fields and removes nonexistent start/restart custom events (DS-29, T-29).

## v2.4.0 - 2025-09-03

### Added
- Developer toggle in settings reveals debug panel, log controls, and a level editor for developers and testers (DS-28, T-28).
## v2.3.1 - 2025-09-03

### Changed
- OL NPC walk speed increased while Student NPC walk speed decreased (DS-27, T-27).

## v2.3.0 - 2025-09-02

### Added
- Student NPC walk animation now uses 11 frames for smoother motion (DS-25, T-25).

## v2.2.1 - 2025-09-01

### Fixed
- OL and Student NPC walk animations now cycle through all sprite frames for smoother movement (DS-26, T-26).

## v2.2.0 - 2025-08-31

### Added
- Student NPC for Stage 1-1 with walk sprites for frames 0–8 and shared spawn logic with OL NPCs (DS-25, T-25).

## v2.1.2 - 2025-08-27

### Fixed
- Background regeneration now uses the canvas height to preserve full-resolution imagery in fullscreen mode (DS-17, T-17).

## v2.1.1 - 2025-08-27

### Fixed
- Letterboxing styles now apply when fullscreen is requested on the root container, allowing the canvas to resize (DS-21, T-21).

## v2.1.0 - 2025-08-26

### Changed
- Fullscreen now centers the stage with black bars and recalculates canvas size on `fullscreenchange` (DS-21, T-21).

## v2.0.0 - 2025-08-25

### Added
- Initial public release with orientation guard, slide cancellation at red lights, landscape fit height, HUD visibility helpers, start page defaults, UI styling and responsiveness, and OL NPC walk sprites (DS-1–DS-7, T-1–T-7)

## v1.5.163 - 2025-08-25

### Added
- Orientation guard for mobile portrait (DS-1, T-1)
- Slide cancellation and height restoration at red lights (DS-2, T-2)
- Canvas fit-to-height behavior in mobile landscape with unified UI layer (DS-3, T-3)
- HUD reveal helper that keeps debug panel hidden (DS-4, T-4)
- Start page with visible start button, pointer events, and correct title (DS-5, T-5)
- Comprehensive UI styling including responsive touch controls and clear/fail overlays (DS-6, T-6)
- OL NPC walk sprites 0–11 (DS-7, T-7)
