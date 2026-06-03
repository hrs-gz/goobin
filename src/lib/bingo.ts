import type { BorderTier, CompletionStatus, Tile } from "./types";

export const LINES_5: number[][] = [
  [0, 1, 2, 3, 4],
  [5, 6, 7, 8, 9],
  [10, 11, 12, 13, 14],
  [15, 16, 17, 18, 19],
  [20, 21, 22, 23, 24],
  [0, 5, 10, 15, 20],
  [1, 6, 11, 16, 21],
  [2, 7, 12, 17, 22],
  [3, 8, 13, 18, 23],
  [4, 9, 14, 19, 24],
  [0, 6, 12, 18, 24],
  [4, 8, 12, 16, 20],
];

export function isTileComplete(tile: Tile): boolean {
  if (tile.isFreeSpace) {
    return Boolean(tile.completedAt);
  }
  return Boolean(tile.photoUrl || tile.completedAt);
}

export function countCompletedLines(tiles: Tile[]): number {
  return LINES_5.filter((line) =>
    line.every((idx) => isTileComplete(tiles[idx]))
  ).length;
}

export function countCompletedTiles(tiles: Tile[]): number {
  return tiles.filter(isTileComplete).length;
}

export function isBlackout(tiles: Tile[]): boolean {
  return tiles.every(isTileComplete);
}

function getLabel(lines: number, blackout: boolean): string {
  if (blackout) return "Blackout";
  if (lines >= 5) return "Mega Bingo";
  if (lines === 4) return "Triple Bingo";
  if (lines === 3) return "Double Bingo";
  if (lines >= 1) return "Bingo";
  return "No Bingo";
}

function getBorderTier(lines: number, blackout: boolean): BorderTier {
  if (blackout) return "goldBlackout";
  if (lines >= 2) return "dualTone";
  return "standard";
}

export function getCompletionStatus(tiles: Tile[]): CompletionStatus {
  const completedLines = countCompletedLines(tiles);
  const completedTiles = countCompletedTiles(tiles);
  const blackout = isBlackout(tiles);

  return {
    completedTiles,
    completedLines,
    isBlackout: blackout,
    borderTier: getBorderTier(completedLines, blackout),
    label: getLabel(completedLines, blackout),
  };
}
