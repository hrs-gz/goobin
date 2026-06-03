"use client";

import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import type { Tile } from "@/lib/types";
import { isTileComplete } from "@/lib/bingo";
import { Squircle } from "./Squircle";
import { GoobinLogo } from "./GoobinLogo";
import { cn } from "@/lib/utils";

interface FreeSpaceTileProps {
  tile: Tile;
  onTap: (tile: Tile) => void;
  glitch?: boolean;
}

export function FreeSpaceTile({
  tile,
  onTap,
  glitch = false,
}: FreeSpaceTileProps) {
  const complete = isTileComplete(tile);
  const hasMarkup = tile.markupData?.hasMarkup;

  return (
    <motion.button
      type="button"
      onClick={() => onTap(tile)}
      className="aspect-square w-full min-h-[44px] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]"
      whileTap={{ scale: 0.95 }}
      aria-label="Free space"
    >
      <Squircle
        size="md"
        className={cn(
          "relative w-full h-full flex flex-col items-center justify-center gap-1 p-1",
          "bg-[var(--bg-tile)] border-2 border-dashed border-[var(--accent)]",
          glitch && "glitch-active"
        )}
      >
        {complete && tile.photoUrl ? (
          <>
            <Squircle size="md" className="absolute inset-0 w-full h-full">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={tile.photoUrl}
                alt="Free space"
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
            <GoobinLogo size="sm" />
            <span className="text-[9px] text-[var(--text-muted)] font-medium">
              free space
            </span>
          </>
        )}
      </Squircle>
    </motion.button>
  );
}
