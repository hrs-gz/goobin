"use client";

import type { Board } from "@/lib/types";
import { BingoTile } from "./BingoTile";
import { FreeSpaceTile } from "./FreeSpaceTile";

import { isFreeSpaceUnlocked, shouldGlitch } from "@/lib/freeSpace";

interface BingoBoardProps {
  board: Board;
  onTileTap: (tile: Board["tiles"][0]) => void;
  isFreeSpaceGlitch?: boolean;
}

export function BingoBoard({
  board,
  onTileTap,
  isFreeSpaceGlitch = shouldGlitch(board.freeSpace.tapCount),
}: BingoBoardProps) {
  const centerPlayUnlocked = isFreeSpaceUnlocked(board.freeSpace.tapCount);
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
            glitch={isFreeSpaceGlitch}
            unlocked={centerPlayUnlocked}
          />
        ) : (
          <BingoTile key={tile.id} tile={tile} onTap={onTileTap} />
        )
      )}
    </div>
  );
}
