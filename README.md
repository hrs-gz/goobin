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
