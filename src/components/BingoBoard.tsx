"use client";

import type { Board } from "@/lib/types";
import { BingoTile } from "./BingoTile";
import { FreeSpaceTile } from "./FreeSpaceTile";

interface BingoBoardProps {
  board: Board;
  onTileTap: (tile: Board["tiles"][0]) => void;
  isFreeSpaceGlitch?: boolean;
  selectedTileId?: string | null;
}

export function BingoBoard({
  board,
  onTileTap,
  isFreeSpaceGlitch = false,
  selectedTileId,
}: BingoBoardProps) {
  return (
    <div
      className="grid grid-cols-5 gap-1.5 sm:gap-2 w-full"
      role="grid"
      aria-label="Bingo board"
    >
      {board.tiles.map((tile) => {
        const layoutId =
          selectedTileId === tile.id ? `tile-${tile.id}` : undefined;

        if (tile.isFreeSpace) {
          return (
            <FreeSpaceTile
              key={tile.id}
              tile={tile}
              onTap={onTileTap}
              glitch={isFreeSpaceGlitch}
              layoutId={layoutId ?? `tile-${tile.id}`}
            />
          );
        }

        return (
          <BingoTile
            key={tile.id}
            tile={tile}
            onTap={onTileTap}
            layoutId={layoutId ?? `tile-${tile.id}`}
          />
        );
      })}
    </div>
  );
}
