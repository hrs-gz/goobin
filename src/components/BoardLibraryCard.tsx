"use client";

import Link from "next/link";
import type { BoardRecord } from "@/lib/types";

interface BoardLibraryCardProps {
  board: BoardRecord;
  distanceKm?: number;
  onDelete?: (id: string) => void;
  deleting?: boolean;
}

export function BoardLibraryCard({
  board,
  distanceKm,
  onDelete,
  deleting,
}: BoardLibraryCardProps) {
  const isCompleted = board.status === "completed";
  const playHref = `/play/cloud/${board.id}`;
  const actionLabel = isCompleted ? "View board" : "Continue";

  const handleDelete = () => {
    if (!onDelete) return;
    if (
      !window.confirm(
        `Delete "${board.title}"? This cannot be undone.`
      )
    ) {
      return;
    }
    onDelete(board.id);
  };

  return (
    <article className="squircle-lg p-4 bg-[var(--bg-tray)] border border-[var(--border-soft)] space-y-3">
      <div className="flex items-start justify-between gap-2">
        <div>
          <h2 className="font-display font-semibold">{board.title}</h2>
          <p className="text-sm text-[var(--text-muted)]">
            {isCompleted ? (
              <span className="text-[var(--accent)] font-medium">Blackout complete</span>
            ) : (
              "In progress"
            )}
            {distanceKm != null && ` · ${distanceKm} km away`}
            {board.location_label && ` · ${board.location_label}`}
          </p>
        </div>
        <span
          className={`text-xs px-2 py-1 rounded-full shrink-0 ${
            isCompleted
              ? "bg-[var(--accent)]/15 text-[var(--accent)]"
              : "bg-black/5 text-[var(--text-muted)]"
          }`}
        >
          {isCompleted ? "Completed" : "Playing"}
        </span>
      </div>
      <div className="flex gap-2">
        <Link
          href={playHref}
          className="flex-1 py-2.5 squircle bg-[var(--accent)] text-white text-center text-sm font-medium"
        >
          {actionLabel}
        </Link>
        {onDelete && (
          <button
            type="button"
            onClick={handleDelete}
            disabled={deleting}
            className="px-4 py-2.5 squircle border border-[var(--border-soft)] text-sm text-red-600 disabled:opacity-50"
          >
            Delete
          </button>
        )}
      </div>
    </article>
  );
}
