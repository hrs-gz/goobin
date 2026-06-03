import type { Board, BoardDefinition } from "./types";

const PROMPTS: { prompt: string; icon: string }[] = [
  { prompt: "weird sign", icon: "🪧" },
  { prompt: "group photo", icon: "📸" },
  { prompt: "best snack", icon: "🍿" },
  { prompt: "tiny detail", icon: "🔍" },
  { prompt: "main character moment", icon: "⭐" },
  { prompt: "matching outfits", icon: "👕" },
  { prompt: "something blue", icon: "💙" },
  { prompt: "street art", icon: "🎨" },
  { prompt: "cute animal", icon: "🐾" },
  { prompt: "cloud shape", icon: "☁️" },
  { prompt: "funny face", icon: "😜" },
  { prompt: "local landmark", icon: "🏛️" },
  { prompt: "sunset glow", icon: "🌅" },
  { prompt: "hidden gem", icon: "💎" },
  { prompt: "street musician", icon: "🎵" },
  { prompt: "colorful door", icon: "🚪" },
  { prompt: "food truck", icon: "🚚" },
  { prompt: "reflection", icon: "🪞" },
  { prompt: "unexpected find", icon: "🎁" },
  { prompt: "laughing moment", icon: "😂" },
  { prompt: "pattern", icon: "🔲" },
  { prompt: "vintage vibe", icon: "📻" },
  { prompt: "nature break", icon: "🌿" },
  { prompt: "squad energy", icon: "✨" },
];

export const DEFAULT_BOARD_ID = "demo-outing";

export function createBoardFromDefinition(
  def: BoardDefinition,
  id: string = DEFAULT_BOARD_ID
): Board {
  const tiles = buildTiles(def.tiles);
  return {
    id,
    title: def.title,
    size: 5,
    themeId: def.themeId,
    tiles,
    freeSpace: { tapCount: 0, state: "standard" },
    createdAt: new Date().toISOString(),
  };
}

export function buildTiles(
  definitions: { prompt: string; icon: string }[]
): Board["tiles"] {
  const tiles: Board["tiles"] = [];
  let defIndex = 0;

  for (let i = 0; i < 25; i++) {
    const isFreeSpace = i === 12;
    if (isFreeSpace) {
      tiles.push({
        id: `tile-${i}`,
        index: i,
        prompt: "free space",
        icon: "🎯",
        isFreeSpace: true,
        completedAt: undefined,
      });
    } else {
      const def = definitions[defIndex++] ?? { prompt: "your moment", icon: "✨" };
      tiles.push({
        id: `tile-${i}`,
        index: i,
        prompt: def.prompt,
        icon: def.icon,
        isFreeSpace: false,
      });
    }
  }

  return tiles;
}

export const defaultBoardDefinition: BoardDefinition = {
  title: "Outing Bingo",
  themeId: "neon-pink",
  tiles: PROMPTS,
};

export const defaultBoard = createBoardFromDefinition(
  defaultBoardDefinition,
  DEFAULT_BOARD_ID
);
