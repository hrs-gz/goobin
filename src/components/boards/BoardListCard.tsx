"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { Eye, Globe, Lock, Trash2 } from "lucide-react";
import { boardThemeVars, getBoardTheme } from "@/lib/boardThemes";
import { BoardThemePattern } from "@/components/board/BoardThemePattern";
import { useColorMode } from "@/providers/ColorModeProvider";
import { deleteBoardAction } from "@/app/boards/actions";
import type { OwnBoard } from "@/lib/types";

export function BoardListCard({
  board,
  opens,
}: {
  board: OwnBoard;
  opens: number;
}) {
  const { mode } = useColorMode();
  const theme = getBoardTheme(board.theme_id);
  const [confirm, setConfirm] = useState(false);
  const [isPending, startTransition] = useTransition();

  return (
    <div className="relative flex items-center gap-3 rounded-[var(--radius-lg)] border border-[var(--border-soft)] bg-[var(--bg-surface)] p-3 shadow-[var(--shadow-sm)]">
      <Link href={`/boards/${board.id}`} className="flex min-w-0 flex-1 items-center gap-3">
        <span
          className="relative h-14 w-14 shrink-0 overflow-hidden rounded-[var(--radius-sm)]"
          style={{ ...boardThemeVars(theme.id, mode), background: "var(--board-bg)" }}
        >
          <BoardThemePattern themeId={theme.id} columns={3} rows={3} opacity={0.45} />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block truncate font-medium">{board.title}</span>
          <span className="mt-0.5 flex items-center gap-2 text-xs text-[var(--text-muted)]">
            <span className="font-mono tracking-widest">{board.join_code}</span>
            <span>·</span>
            <span>{board.grid_size}×{board.grid_size}</span>
            <span className="inline-flex items-center gap-1">
              <Eye size={12} /> {opens}
            </span>
            {board.is_public ? (
              <span className="inline-flex items-center gap-1 text-[var(--accent-strong)]">
                <Globe size={12} /> Public
              </span>
            ) : (
              <span className="inline-flex items-center gap-1">
                <Lock size={12} /> Private
              </span>
            )}
          </span>
        </span>
      </Link>

      {confirm ? (
        <span className="flex items-center gap-1">
          <button
            type="button"
            className="rounded-full px-2 py-1 text-xs text-[var(--text-muted)]"
            onClick={() => setConfirm(false)}
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={isPending}
            className="rounded-full bg-[#f7e7e2] px-2 py-1 text-xs font-medium text-[#c0563f] disabled:opacity-50 dark:bg-[#2c1c18] dark:text-[#f0a591]"
            onClick={() => startTransition(() => deleteBoardAction(board.id))}
          >
            {isPending ? "Deleting…" : "Delete"}
          </button>
        </span>
      ) : (
        <button
          type="button"
          aria-label="Delete board"
          className="grid h-9 w-9 shrink-0 place-items-center rounded-full text-[var(--text-muted)] hover:bg-[var(--bg-tile)]"
          onClick={() => setConfirm(true)}
        >
          <Trash2 size={17} />
        </button>
      )}
    </div>
  );
}
