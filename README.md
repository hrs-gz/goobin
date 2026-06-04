# goobin

Experience bingo — turn outings and events into a shareable 5×5 photo board.

## Quick start

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to play the demo board.

- **/** — default outing bingo
- **/play?b=…** — custom board from encoded link
- **/build** — create a board, copy link, or scan QR

## MVP features

- 5×5 squircle board with photo capture/upload per tile
- Bingo line detection and completion borders (standard → dual-tone → gold blackout)
- Free Space tap easter egg (glitch + clue at 21+ taps)
- Markup tools (brush, eraser, text, five colors)
- Export/share board as PNG
- Custom boards via compressed URL + QR

## Stack

Next.js, React, Tailwind CSS, Framer Motion, IndexedDB, Konva, html-to-image, lz-string

## Data

- Board definitions: URL (`?b=` compressed JSON)
- Photos and progress: browser IndexedDB (no account required)
- Free Space tap count: localStorage per board

## Supabase (cloud accounts)

Agent skills for Supabase (RLS, migrations, etc.) live in [`.agents/skills/`](.agents/skills/) — install or refresh with `npx skills add supabase/agent-skills`.

1. Create a project at [supabase.com](https://supabase.com).
2. Copy **Project URL** and **publishable key** (`sb_publishable_...`) into `.env.local` (see `.env.local.example`). Do not use the legacy anon JWT in new setups.
3. Apply the schema (both migrations):

   ```bash
   npx supabase link --project-ref YOUR_REF   # optional, if using CLI
   npx supabase db push                       # or paste SQL from supabase/migrations/ in order:
   ```

   - `supabase/migrations/20250603120000_boards.sql` — boards table
   - `supabase/migrations/20250604120000_user_achievements.sql` — achievements + profiles

4. In **Authentication → URL configuration**, add redirect URL:  
   `http://localhost:3000/auth/callback` (and your production URL).
5. Optional: create Storage bucket `tile-photos` and apply policies from comments in the migration file (progress sync works without it; photos stay in IndexedDB for now).

### Cloud routes

- **/login**, **/signup** — email/password auth
- **/history** — your in-progress and completed (blackout) boards; delete from here
- **/discover** — public boards near you (requires location + sign-in)
- **/play/cloud/[id]** — play a saved board; syncs progress when you own it; completed boards open read-only

URL-based **/play?b=** and the demo on **/** still work without an account.

### Achievements

- **/achievements** — milestone gallery; works signed out (progress stored in localStorage) with a sign-in CTA to back up and sync across devices
- **Persistence:** earned IDs in `localStorage`; when signed in, rows in `user_achievements` and `user_profiles` (free-space unlock). Local-only awards upload on login.
- **Customize milestones:** `src/lib/achievements/catalog.ts` — titles, descriptions, `check()` logic, achievement ids
- **Customize geo / count rules:** `src/lib/achievements/config.ts` — `NEARBY_RADIUS_KM`, `NEARBY_MIN_BOARDS`, board-count thresholds
