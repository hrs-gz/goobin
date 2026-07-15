"use client";

import { useMemo, useState, useTransition } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { BoardThemePattern } from "@/components/board/BoardThemePattern";
import { TileEditSheet } from "@/components/builder/TileEditSheet";
import { createBoardAction } from "@/app/create/actions";
import { BOARD_THEMES, boardThemeVars, getBoardTheme } from "@/lib/boardThemes";
import { centerIndex } from "@/lib/bingo";
import { useColorMode } from "@/providers/ColorModeProvider";
import { BOARD_THEME_IDS, GRID_SIZES } from "@/lib/types";
import type { BoardDefinition, BoardThemeId, GridSize, TileDef } from "@/lib/types";

function makeTiles(size: GridSize, previous?: TileDef[]): TileDef[] {
  const count = size * size;
  const center = centerIndex(size);
  return Array.from({ length: count }, (_, i) => {
    if (i === center) return { prompt: "Free space" };
    return previous?.[i] ?? { prompt: "" };
  });
}

export function BoardBuilder() {
  const { mode } = useColorMode();
  const [isPending, startTransition] = useTransition();

  const [title, setTitle] = useState("");
  const [gridSize, setGridSize] = useState<GridSize>(5);
  const [theme, setTheme] = useState<BoardThemeId>("park");
  const [tiles, setTiles] = useState<TileDef[]>(() => makeTiles(5));
  const [editing, setEditing] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const center = centerIndex(gridSize);
  const activeTheme = getBoardTheme(theme);

  const remaining = useMemo(
    () => tiles.filter((t, i) => i !== center && !t.prompt.trim()).length,
    [tiles, center]
  );
  const canSave = title.trim().length > 0 && remaining === 0;

  const changeSize = (size: GridSize) => {
    setGridSize(size);
    setTiles((prev) => makeTiles(size, prev));
  };

  const setTile = (index: number, next: TileDef) => {
    setTiles((prev) => prev.map((t, i) => (i === index ? next : t)));
  };

  const save = () => {
    setError(null);
    if (!canSave) {
      setError(
        title.trim().length === 0
          ? "Give your board a title."
          : `Fill in ${remaining} more tile${remaining > 1 ? "s" : ""}.`
      );
      return;
    }
    const definition: BoardDefinition = {
      v: 1,
      title: title.trim(),
      gridSize,
      theme,
      tiles: tiles.map((t, i) =>
        i === center ? { prompt: "Free space" } : t
      ),
    };
    startTransition(async () => {
      const result = await createBoardAction(definition, null, false);
      if (result?.error) setError(result.error);
    });
  };

  return (
    <div className="mx-auto w-full max-w-md px-5 pb-28 pt-6">
      <h1 className="font-display text-2xl font-semibold">Create a board</h1>

      <label className="mt-5 block">
        <span className="mb-1 block text-sm font-medium">Title</span>
        <input
          className="input-rect"
          value={title}
          placeholder="Saturday at the park"
          onChange={(e) => setTitle(e.target.value)}
        />
      </label>

      {/* Grid size */}
      <div className="mt-5">
        <span className="mb-2 block text-sm font-medium">Grid size</span>
        <div className="inline-flex rounded-full border border-[var(--border-strong)] bg-[var(--bg-surface)] p-1">
          {GRID_SIZES.map((size) => (
            <button
              key={size}
              type="button"
              onClick={() => changeSize(size)}
              className={`rounded-full px-5 py-1.5 text-sm font-medium transition-colors ${
                gridSize === size
                  ? "bg-[var(--accent)] text-[var(--on-accent)]"
                  : "text-[var(--text-muted)]"
              }`}
            >
              {size}×{size}
            </button>
          ))}
        </div>
      </div>

      {/* Theme */}
      <div className="mt-5">
        <span className="mb-2 block text-sm font-medium">Theme</span>
        <div className="grid grid-cols-4 gap-2">
          {BOARD_THEME_IDS.map((id) => {
            const t = BOARD_THEMES[id];
            const selected = theme === id;
            return (
              <button
                key={id}
                type="button"
                onClick={() => setTheme(id)}
                className="flex flex-col items-center gap-1.5"
                aria-pressed={selected}
              >
                <span
                  className="relative aspect-square w-full overflow-hidden rounded-[var(--radius-sm)]"
                  style={{
                    ...boardThemeVars(id, mode),
                    background: "var(--board-bg)",
                    boxShadow: selected
                      ? "0 0 0 2px var(--accent)"
                      : "inset 0 0 0 1px var(--border-soft)",
                  }}
                >
                  <BoardThemePattern themeId={id} columns={3} rows={3} opacity={0.5} />
                </span>
                <span
                  className={`text-xs ${selected ? "font-semibold text-[var(--text-primary)]" : "text-[var(--text-muted)]"}`}
                >
                  {t.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Tiles */}
      <div className="mt-6">
        <div className="mb-2 flex items-center justify-between">
          <span className="text-sm font-medium">Tiles</span>
          {remaining > 0 && (
            <span className="text-xs text-[var(--text-muted)]">
              {remaining} left
            </span>
          )}
        </div>
        <div
          className="relative rounded-[var(--radius-lg)] p-3"
          style={{ ...boardThemeVars(theme, mode), background: "var(--board-bg)" }}
        >
          <div
            className="grid gap-2"
            style={{ gridTemplateColumns: `repeat(${gridSize}, minmax(0, 1fr))` }}
          >
            {tiles.map((tile, i) => {
              const isCenter = i === center;
              const FreeIcon = activeTheme.freeSpaceIcon;
              const filled = Boolean(tile.prompt.trim());
              return (
                <button
                  key={i}
                  type="button"
                  onClick={() => !isCenter && setEditing(i)}
                  className="relative flex aspect-square items-center justify-center overflow-hidden rounded-[var(--radius-sm)] p-1.5 text-center"
                  style={{
                    background: isCenter
                      ? "var(--board-accent-soft)"
                      : "var(--board-tile)",
                    boxShadow:
                      !isCenter && filled
                        ? "0 0 0 2px var(--board-accent)"
                        : "inset 0 0 0 1px var(--border-soft)",
                    cursor: isCenter ? "default" : "pointer",
                  }}
                >
                  {isCenter ? (
                    <span
                      className="flex flex-col items-center gap-0.5"
                      style={{ color: "var(--board-accent)" }}
                    >
                      <FreeIcon size={gridSize === 3 ? 24 : 18} />
                      <span className="text-[0.55rem] font-semibold uppercase">
                        Free
                      </span>
                    </span>
                  ) : filled ? (
                    <span className="line-clamp-4 text-[0.66rem] leading-tight text-[var(--text-primary)]">
                      {tile.prompt}
                    </span>
                  ) : (
                    <Plus size={18} className="text-[var(--text-faint)]" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {error && <p className="mt-4 text-sm text-[#c0563f]">{error}</p>}

      {/* Sticky save bar */}
      <div className="fixed inset-x-0 bottom-0 border-t border-[var(--border-soft)] bg-[var(--bg-page)]/90 backdrop-blur">
        <div className="mx-auto w-full max-w-md px-5 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
          <Button
            size="lg"
            fullWidth
            onClick={save}
            disabled={!canSave || isPending}
          >
            {isPending ? "Creating…" : "Create board"}
          </Button>
        </div>
      </div>

      <TileEditSheet
        key={editing ?? "none"}
        open={editing !== null}
        onClose={() => setEditing(null)}
        position={editing !== null ? editing + 1 : 0}
        tile={editing !== null ? tiles[editing] : null}
        onSave={(t) => editing !== null && setTile(editing, t)}
        onClear={() => editing !== null && setTile(editing, { prompt: "" })}
      />
    </div>
  );
}
