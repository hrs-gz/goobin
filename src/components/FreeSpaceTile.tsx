"use client";

import { motion } from "framer-motion";
import type { Tile } from "@/lib/types";
import { Squircle } from "./Squircle";
import { GoobinLogo } from "./GoobinLogo";
import { cn } from "@/lib/utils";

interface FreeSpaceTileProps {
  tile: Tile;
  onTap: (tile: Tile) => void;
  glitch?: boolean;
  layoutId?: string;
}

export function FreeSpaceTile({
  tile,
  onTap,
  glitch = false,
  layoutId,
}: FreeSpaceTileProps) {
  return (
    <motion.button
      type="button"
      layoutId={layoutId}
      onClick={() => onTap(tile)}
      className="aspect-square w-full min-h-[44px] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]"
      whileTap={{ scale: 0.95 }}
      aria-label="Free space"
    >
      <Squircle
        className={cn(
          "w-full h-full flex flex-col items-center justify-center gap-1 p-1",
          "bg-[var(--bg-tile)] border-2 border-dashed border-[var(--accent)]",
          glitch && "glitch-active"
        )}
      >
        <GoobinLogo size="sm" />
        <span className="text-[9px] text-[var(--text-muted)] font-medium">
          free space
        </span>
      </Squircle>
    </motion.button>
  );
}
