"use client";

import type { Board } from "@/lib/types";
import { BingoTile } from "./BingoTile";
import { FreeSpaceTile } from "./FreeSpaceTile";
import { shouldShowCenterUnlockVisuals } from "@/lib/freeSpace";

interface BingoBoardProps {
  board: Board;
  onTileTap: (tile: Board["tiles"][0]) => void;
  globalGoobUnlocked?: boolean;
}

export function BingoBoard({
  board,
  onTileTap,
  globalGoobUnlocked = false,
}: BingoBoardProps) {
  const tapCount = board.freeSpace.tapCount;
  const centerVisualsUnlocked = shouldShowCenterUnlockVisuals(
    board,
    globalGoobUnlocked,
    tapCount
  );
  return (
    <div
      className="grid grid-cols-5 gap-1 w-full"
      role="grid"
      aria-label="Bingo board"
    >
      {board.tiles.map((tile) =>
        tile.isFreeSpace ? (
          <FreeSpaceTile
            key={tile.id}
            tile={tile}
            onTap={onTileTap}
            glitch={centerVisualsUnlocked}
            unlocked={centerVisualsUnlocked}
          />
        ) : (
          <BingoTile key={tile.id} tile={tile} onTap={onTileTap} />
        )
      )}
    </div>
  );
}
