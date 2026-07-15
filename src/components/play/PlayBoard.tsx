"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { TileSheet } from "@/components/play/TileSheet";
import { BoardThemePattern } from "@/components/board/BoardThemePattern";
import { usePlayProgress } from "@/hooks/usePlayProgress";
import { useColorMode } from "@/providers/ColorModeProvider";
import { getBoardTheme, boardThemeVars } from "@/lib/boardThemes";
import { centerIndex } from "@/lib/bingo";
import { celebrateBlackout, celebrateLine } from "@/lib/confetti";
import { recordBoardOpen } from "@/lib/play/api";
import type { BoardByCode } from "@/lib/types";

export function PlayBoard({ board }: { board: BoardByCode }) {
  const { mode } = useColorMode();
  const theme = getBoardTheme(board.theme_id);
  const size = board.grid_size;
  const center = centerIndex(size);
  const tiles = board.definition.tiles;

  const {
    loading,
    completion,
    photoUrls,
    lines,
    blackout,
    celebratedLines,
    celebratedBlackout,
    addPhoto,
    removePhoto,
    markCelebrated,
  } = usePlayProgress(board);

  const [selected, setSelected] = useState<number | null>(null);

  // Fire an "open" event once per browser session.
  useEffect(() => {
    const key = `goobin-open-${board.join_code}`;
    if (sessionStorage.getItem(key)) return;
    sessionStorage.setItem(key, "1");
    void recordBoardOpen(board.join_code);
  }, [board.join_code]);

  // Celebrations — only when crossing a threshold not yet celebrated.
  const confettiColors = [
    theme[mode].accent,
    theme.light.accent,
    theme[mode].accentSoft,
    "#ffffff",
  ];
  useEffect(() => {
    if (loading) return;
    if (blackout && !celebratedBlackout) {
      celebrateBlackout(confettiColors);
      markCelebrated(lines, true);
    } else if (lines > celebratedLines) {
      celebrateLine(confettiColors);
      markCelebrated(lines, blackout);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading, lines, blackout, celebratedLines, celebratedBlackout]);

  const boardVars = boardThemeVars(theme.id, mode);
  const completedCount = completion.filter(Boolean).length;

  return (
    <div className="mx-auto flex w-full max-w-md flex-1 flex-col px-4 pb-10">
      <div className="flex items-center justify-between py-3">
        <Link
          href="/"
          aria-label="Back"
          className="grid h-9 w-9 place-items-center rounded-full text-[var(--text-muted)] hover:bg-[var(--bg-tile)]"
        >
          <ChevronLeft size={20} />
        </Link>
        <span className="rounded-full bg-[var(--bg-tile)] px-3 py-1 font-mono text-sm tracking-widest text-[var(--text-muted)]">
          {board.join_code}
        </span>
      </div>

      <div className="text-center">
        <h1 className="font-display text-xl font-semibold">
          {board.definition.title}
        </h1>
        <p className="mt-1 text-sm text-[var(--text-muted)]">
          {blackout
            ? "Blackout! Every tile filled."
            : lines > 0
              ? `${lines} bingo${lines > 1 ? "s" : ""} • ${completedCount}/${size * size} tiles`
              : `${completedCount}/${size * size} tiles`}
        </p>
      </div>

      <div
        className="relative mt-5 rounded-[var(--radius-lg)] p-3"
        style={{ ...boardVars, background: "var(--board-bg)" }}
      >
        <BoardThemePattern themeId={theme.id} opacity={0.06} />
        <div
          className="relative grid gap-2"
          style={{ gridTemplateColumns: `repeat(${size}, minmax(0, 1fr))` }}
        >
          {tiles.map((tile, i) => {
            const isCenter = i === center;
            const url = photoUrls[i];
            const done = completion[i];
            const FreeIcon = theme.freeSpaceIcon;

            return (
              <button
                key={i}
                type="button"
                onClick={() => setSelected(i)}
                aria-label={isCenter ? "Free space" : tile.prompt}
                className="relative aspect-square overflow-hidden rounded-[var(--radius-sm)] text-left transition-transform active:scale-[0.97]"
                style={{
                  background: isCenter
                    ? "var(--board-accent-soft)"
                    : "var(--board-tile)",
                  boxShadow: done
                    ? `0 0 0 2px var(--board-accent)`
                    : `inset 0 0 0 1px var(--border-soft)`,
                }}
              >
                {isCenter ? (
                  <span
                    className="flex h-full w-full flex-col items-center justify-center gap-1"
                    style={{ color: "var(--board-accent)" }}
                  >
                    <FreeIcon size={size === 3 ? 26 : 20} />
                    <span className="text-[0.6rem] font-semibold uppercase tracking-wide">
                      Free
                    </span>
                  </span>
                ) : url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={url}
                    alt={tile.prompt}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <span className="relative flex h-full w-full items-center justify-center p-1.5">
                    <BoardThemePattern
                      themeId={theme.id}
                      columns={2}
                      rows={2}
                      opacity={0.05}
                      iconSize={16}
                    />
                    <span className="relative line-clamp-4 text-center text-[0.66rem] leading-tight text-[var(--text-muted)]">
                      {tile.prompt}
                    </span>
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {loading && (
        <p className="mt-4 text-center text-sm text-[var(--text-faint)]">
          Loading your progress…
        </p>
      )}

      <TileSheet
        open={selected !== null}
        onClose={() => setSelected(null)}
        tile={selected !== null ? tiles[selected] : null}
        index={selected ?? -1}
        isFreeSpace={selected === center}
        photoUrl={selected !== null ? photoUrls[selected] : undefined}
        theme={theme}
        onPickPhoto={(file) => {
          if (selected !== null) void addPhoto(selected, file);
        }}
        onRemovePhoto={() => {
          if (selected !== null) void removePhoto(selected);
        }}
      />
    </div>
  );
}
