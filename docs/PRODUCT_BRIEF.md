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
| Win rule | Host picks per game: one line, blackout, or points. |
| Photo verification | Honor system. Any photo fills the square; other players can react or flag. |
| Location branding | Built-in category themes (park, museum, party, city, campus). The place name and pin are stamped on the keepsake. No venue partnerships at launch. |
| Visual direction | Scrapbook and stickers: polaroid frames, tape, stamps, warm paper. The keepsake is the hero. |
| Name | Goobin |

## Core loop

1. **Join.** Enter a six-digit game code and a display name. No account needed to play.
2. **Play.** A 5×5 grid of prompts with a free centre square. Tap a square, take a
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
- 5×5 with free space (exists).
- Custom boards: write your own prompts (exists via `/build`).
- AI-drafted prompts for the chosen theme; the creator keeps, edits or discards each one (new).
- Optional location pin so people nearby can discover the board (discover exists; pin-at-create is new).

### Keepsake (extends existing PNG export)
- Category theme sets colours, icon and header.
- Place name, date, player name, completion time, earned stamp.

### Sharing (extends existing share)
- X, Instagram, save image, post to Goobin feed, keep private.
- Location shown only if the player leaves the toggle on.

### Profile (extends existing achievements and history)
- Weekly streak: finish one board per week to keep it.
- Totals: squares snapped, blackouts, places pinned.
- Scrapbook of past keepsakes.
- Stamps (achievements shown as ink stamps).

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
6. Category themes and the themed keepsake renderer.
7. Share targets and per-share location toggle.
8. Streaks and the redesigned profile.
9. Goobin feed.
10. Visual restyle to the scrapbook direction.

## Open questions

- Points mode: how are squares scored (flat, by difficulty, speed bonus)?
- Do players need an account to keep a streak, or is it device-local until sign-in (as achievements are today)?
- Moderation for the public feed and flagged photos.
- Photo privacy: who can see a game's photos after it ends, and for how long are they kept?
- Maximum players per game for the first release.

## Mockups

Six screens (join, board in play, snap a square, keepsake + share, create a board,
profile + streaks): https://claude.ai/artifact/MGp14FHkB2sbk8NEEHyeBr (private to the owner
unless shared).
