# Goobin game center: product brief

Written 2026-11-24 from a founder interview. Describes where Goobin goes next: from a
single-player photo bingo board to a game center for bingo scavenger hunts.

## One line

Photo bingo scavenger hunts you join with a code, play with friends, and leave with a
keepsake of the place.

Reference points: Kahoot (join by code, live games), Pokémon Go (go outside, location),
Strava (streaks, profile, a shareable record of what you did).

## Decisions from the interview

| Question | Decision |
| --- | --- |
| Platform | Mobile web app. Guests join from a code or link with no install. |
| Play style | Host picks per game: live timed race or open-ended own pace. |
| Board size | 3×3, nine prompts, no free square. Chosen so squares and photos have room; replaces the 5×5 board with a free centre. |
| Win rule | Host picks per game: one line, blackout, or points. |
| Photo verification | Honor system. Any photo fills the square; other players can react or flag. |
| Location branding | Three built-in board treatments (Field Notes, City Notes, Studio Notes) chosen by place type. The place name is printed on the keepsake. No venue partnerships at launch. |
| Visual direction | Editorial Fieldwork: a contemporary observation kit rather than a rustic scrapbook. See "Design language" below. |
| Name | Goobin |

## Design language: Editorial Fieldwork

Source: `Goobin_Editorial_Fieldwork.pdf` (2026-11-24). Its palettes, type and theme system
are proposed extensions, not validated production specs.

**Principles.** Playfulness and precision; analog materiality and contemporary technology;
personal expression and systematic collection. Physical, but no longer only rustic.
Board-centric, not map-centric.

**Typography**
- Fraunces: wordmark and occasional expressive headings.
- Space Grotesk: interface and prompts.
- IBM Plex Mono: game codes, timers, square numbers, dates, counts.
- Handwriting is optional, not foundational.

**Palette**

| Group | Colours |
| --- | --- |
| Core | Parchment `#EAE7D5`, Forest `#315D50`, Sage `#A8BE91`, Marigold `#E6AE65`, Blue `#769CAF`, Terracotta `#D87858` |
| Urban + industrial | Chalk `#F4F4F0`, Concrete `#D5D7D8`, Steel `#929CA3`, Graphite `#23282C`, Cobalt `#294BC7`, Citron `#D4E85C` |
| Professional + editorial | Porcelain `#F8F7F2`, Putty `#C7C2B8`, Pewter `#777D73`, Ink navy `#252D3B`, Oxide `#79423D`, Lilac `#BCA6C9` |

Cobalt and citron are used sparingly.

**Treatments.** One board structure, three graphic treatments. Grid, interactions and
photo proportions never change between them.

| Treatment | Look | Default for |
| --- | --- | --- |
| Field Notes | Parchment, forest, tape, slight tilt, serif captions | Parks, vacations, picnics |
| City Notes | Concrete, graphite, cobalt, contact-sheet frames, numbered labels | Cities, nightlife, galleries, museums |
| Studio Notes | Chalk, steel, fine rules, mono type, citron accent | Campuses, offices, conferences, studios |

The host can override the default. Which treatment parties default to is undecided.

**Shared conventions.** Squares are numbered 01–09. Boards carry a collection number
("GOOBIN / COLLECTION 004"). Achievements are printed seals rather than rubber stamps.

**Export templates.** Chosen at export, independent of the play treatment: field journal,
city contact sheet, exhibition poster, specimen archive.

The current app (dark theme, Fredoka + Plus Jakarta Sans) predates this direction.

## Core loop

1. **Join.** Enter a six-digit game code and a display name. No account needed to play.
2. **Play.** A 3×3 grid of nine prompts, no free square. Tap a square, take a
   selfie, add an optional caption, stick it on the board.
3. **Finish.** Hit the host's win rule, or fill the board.
4. **Keep.** Get a themed keepsake image of the finished board with the place and date.
5. **Share.** Post to X, Instagram, the Goobin feed, save the image, or keep it private.
   Showing the location is a per-share choice.

## Features

### Games and join codes (new)
- Host creates a game from a board and gets a six-digit code.
- Lobby, start, live standings, timer for live races.
- Everyone's photos visible to players in the same game; reactions and flags.

### Boards
- 3×3, nine prompts, no free space (the app is 5×5 with a free space today).
- Custom boards: write your own prompts (exists via `/build`).
- AI-drafted prompts for the chosen theme; the creator keeps, edits or discards each one (new).
- Optional location pin so people nearby can discover the board (discover exists; pin-at-create is new).

### Keepsake (extends existing PNG export)
- Four export templates: field journal, city contact sheet, exhibition poster, specimen archive.
- Collection number, place name, date, player name, completion time, earned seal.

### Sharing (extends existing share)
- X, Instagram, save image, post to Goobin feed, keep private.
- Location shown only if the player leaves the toggle on.

### Profile (extends existing achievements and history)
- Weekly streak: finish one board per week to keep it.
- Totals: squares snapped, blackouts, places pinned.
- Scrapbook of past keepsakes.
- Collections: past boards, numbered, shown in their treatment.
- Seals (achievements shown as printed seals).

### Demo board

The nine prompts used for the demo board and in the mockups, in square order:

1. guy named donald
2. someone cute
3. someone w glasses
4. someone with red hair
5. someone much taller than u
6. someone wearing a hat
7. someone with a tuff fit
8. someone with nice shoes
9. someone doing a handstand

## What already exists in this repo

- 5×5 board, photo capture/upload per tile, line and blackout detection.
- Markup tools, PNG export/share.
- Custom boards via compressed URL and QR.
- Supabase auth, cloud boards, history, discover (nearby public boards), achievements.

## Gaps to build

1. Game sessions: code, lobby, membership, per-player progress, realtime standings.
2. Host settings: win rule, pace, timer.
3. Photo storage in the cloud (photos are in IndexedDB today), needed for shared games and the feed.
4. Reactions and flags on photos.
5. AI prompt generation.
6. The three treatments as a theme system, and the keepsake renderer with four export templates.
7. Share targets and per-share location toggle.
8. Streaks and the redesigned profile.
9. Goobin feed.
10. Visual restyle of the app to Editorial Fieldwork.
11. Move the board from 5×5 to 3×3: grid, line detection, free-space logic and its easter egg, existing saved boards, and achievement thresholds that assume 25 squares.

## Open questions

- Points mode: how are squares scored (flat, by difficulty, speed bonus)?
- Do players need an account to keep a streak, or is it device-local until sign-in (as achievements are today)?
- Moderation for the public feed and flagged photos.
- Photo privacy: who can see a game's photos after it ends, and for how long are they kept?
- Maximum players per game for the first release.
- Which treatment a party board defaults to.
- With nine squares a one-line win takes three photos. Is that too short for a live race, and should blackout be the default there?
- What happens to boards already saved as 5×5?
- Layout of the specimen archive export template (not yet designed).

## Mockups

Six screens in Field Notes (join, board in play, snap a square, keepsake + share, create a
board, profile + streaks), the board and keepsake in City Notes and Studio Notes, and a
direction board with palettes and type: https://claude.ai/artifact/MGp14FHkB2sbk8NEEHyeBr
(private to the owner unless shared).
