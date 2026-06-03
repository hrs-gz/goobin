"use client";

import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import type { Tile } from "@/lib/types";
import { isTileComplete } from "@/lib/bingo";
import { Squircle } from "./Squircle";
import { cn } from "@/lib/utils";

interface BingoTileProps {
  tile: Tile;
  onTap: (tile: Tile) => void;
}

export function BingoTile({ tile, onTap }: BingoTileProps) {
  const complete = isTileComplete(tile);
  const hasMarkup = tile.markupData?.hasMarkup;

  return (
    <motion.button
      type="button"
      onClick={() => onTap(tile)}
      className="aspect-square w-full min-h-[44px] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2"
      whileTap={{ scale: 0.95 }}
      aria-label={tile.prompt}
    >
      <Squircle
        size="md"
        className={cn(
          "relative w-full h-full flex flex-col items-center justify-center gap-0.5 p-1 border border-[var(--border-soft)]",
          "bg-[var(--bg-tile)] transition-shadow hover:shadow-md"
        )}
      >
        {complete && tile.photoUrl ? (
          <>
            <Squircle size="md" className="absolute inset-0 w-full h-full">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={tile.photoUrl}
                alt={tile.prompt}
                className="w-full h-full object-cover"
              />
            </Squircle>
            {hasMarkup && (
              <span className="absolute top-1 right-1 z-10 bg-black/50 rounded-full p-0.5">
                <Sparkles className="w-3 h-3 text-[var(--markup-pink)]" />
              </span>
            )}
          </>
        ) : (
          <>
            <span className="text-xl sm:text-2xl leading-none" aria-hidden>
              {tile.icon}
            </span>
            <span className="text-[9px] sm:text-[10px] leading-tight text-center text-[var(--text-muted)] font-medium px-0.5 line-clamp-2">
              {tile.prompt}
            </span>
          </>
        )}
      </Squircle>
    </motion.button>
  );
}
