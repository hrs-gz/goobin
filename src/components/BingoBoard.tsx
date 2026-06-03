"use client";

import type { Board } from "@/lib/types";
import { BingoTile } from "./BingoTile";
import { FreeSpaceTile } from "./FreeSpaceTile";

interface BingoBoardProps {
  board: Board;
  onTileTap: (tile: Board["tiles"][0]) => void;
  isFreeSpaceGlitch?: boolean;
}

export function BingoBoard({
  board,
  onTileTap,
  isFreeSpaceGlitch = false,
}: BingoBoardProps) {
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
          />
        ) : (
          <BingoTile key={tile.id} tile={tile} onTap={onTileTap} />
        )
      )}
    </div>
  );
}
