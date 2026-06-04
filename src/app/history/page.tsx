"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { AppShell } from "@/components/AppShell";
import { BoardLibraryCard } from "@/components/BoardLibraryCard";
import { useAuth } from "@/providers/AuthProvider";
import { deleteBoard, listUserBoards } from "@/lib/cloud/boards";
import type { BoardRecord } from "@/lib/types";

export default function HistoryPage() {
  const { user, loading: authLoading } = useAuth();
  const [boards, setBoards] = useState<BoardRecord[]>([]);
  const [boardsLoading, setBoardsLoading] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    void (async () => {
      setBoardsLoading(true);
      const list = await listUserBoards();
      if (cancelled) return;
      setBoards(list);
      setBoardsLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [user]);

  const inProgress = useMemo(
    () => boards.filter((b) => b.status === "in_progress"),
    [boards]
  );
  const completed = useMemo(
    () => boards.filter((b) => b.status === "completed"),
    [boards]
  );

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    const ok = await deleteBoard(id);
    setDeletingId(null);
    if (ok) setBoards((prev) => prev.filter((b) => b.id !== id));
  };

  if (authLoading) {
    return (
      <AppShell>
        <p className="text-[var(--text-muted)]">Loading...</p>
      </AppShell>
    );
  }

  if (!user) {
    return (
      <AppShell>
        <div className="w-full max-w-lg text-center space-y-4 py-12">
          <h1 className="font-display text-2xl font-semibold">Your boards</h1>
          <p className="text-sm text-[var(--text-muted)]">
            Sign in to save progress and revisit completed blackouts.
          </p>
          <Link
            href="/login?next=/history"
            className="inline-block py-3 px-6 squircle bg-[var(--accent)] text-white font-medium"
          >
            Sign in
          </Link>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell title="History">
      <div className="w-full max-w-lg space-y-8">
        {boardsLoading ? (
          <p className="text-[var(--text-muted)]">Loading boards...</p>
        ) : boards.length === 0 ? (
          <div className="text-center space-y-4 py-8">
            <p className="text-sm text-[var(--text-muted)]">
              No saved boards yet. Create one and use Save to account.
            </p>
            <Link
              href="/build"
              className="inline-block py-3 px-6 squircle border border-[var(--border-soft)] font-medium"
            >
              Create a board
            </Link>
          </div>
        ) : (
          <>
            {inProgress.length > 0 && (
              <section className="space-y-3">
                <h2 className="font-display text-lg font-semibold">
                  In progress
                </h2>
                {inProgress.map((board) => (
                  <BoardLibraryCard
                    key={board.id}
                    board={board}
                    onDelete={handleDelete}
                    deleting={deletingId === board.id}
                  />
                ))}
              </section>
            )}
            {completed.length > 0 && (
              <section className="space-y-3">
                <h2 className="font-display text-lg font-semibold">Completed</h2>
                <p className="text-xs text-[var(--text-muted)]">
                  Blackout boards — open to view your photos.
                </p>
                {completed.map((board) => (
                  <BoardLibraryCard
                    key={board.id}
                    board={board}
                    onDelete={handleDelete}
                    deleting={deletingId === board.id}
                  />
                ))}
              </section>
            )}
          </>
        )}
      </div>
    </AppShell>
  );
}
