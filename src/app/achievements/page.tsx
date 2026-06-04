"use client";

import { useEffect, useMemo, useRef } from "react";
import Link from "next/link";
import { Check } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { useAuth } from "@/hooks/useAuth";
import { useAchievements } from "@/hooks/useAchievements";
import { useFreeSpaceUnlock } from "@/hooks/useFreeSpaceUnlock";
import { ACHIEVEMENT_CATALOG } from "@/lib/achievements/catalog";

export default function AchievementsPage() {
  const { user, loading: authLoading } = useAuth();
  const { unlocked: freeSpaceUnlocked } = useFreeSpaceUnlock();
  const { earnedIds, earnedAt, ready, checkAndAward } = useAchievements();
  const recheckedRef = useRef(false);
  const lastUserIdRef = useRef<string | undefined>(undefined);

  useEffect(() => {
    if (user?.id !== lastUserIdRef.current) {
      lastUserIdRef.current = user?.id;
      recheckedRef.current = false;
    }
  }, [user?.id]);

  useEffect(() => {
    if (!ready || authLoading || !user) return;
    if (recheckedRef.current) return;
    recheckedRef.current = true;
    void checkAndAward({ freeSpaceUnlocked });
    // checkAndAward intentionally omitted — one-shot after ready; stable enough via ref guard
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready, authLoading, user?.id, freeSpaceUnlocked]);

  const visibleCatalog = useMemo(() => {
    const hasSecret = earnedIds.has("free_space_goob");
    return ACHIEVEMENT_CATALOG.filter((a) => !a.secret || hasSecret);
  }, [earnedIds]);

  const earnedCount = useMemo(
    () => visibleCatalog.filter((a) => earnedIds.has(a.id)).length,
    [visibleCatalog, earnedIds]
  );

  if (authLoading || !ready) {
    return (
      <AppShell>
        <p className="text-[var(--text-muted)]">Loading...</p>
      </AppShell>
    );
  }

  return (
    <AppShell title="Achievements">
      <div className="w-full max-w-lg space-y-6">
        {!user && (
          <div className="squircle-lg p-4 border border-[var(--border-soft)] bg-[var(--bg-tray)] text-sm text-[var(--text-muted)] space-y-2">
            <p>
              Showing achievements saved on this device. Sign in to back them up
              and sync across devices.
            </p>
            <Link
              href="/login?next=/achievements"
              className="inline-block py-2 px-4 squircle bg-[var(--accent)] text-white font-medium text-sm"
            >
              Sign in
            </Link>
          </div>
        )}

        <p className="text-sm font-medium">
          {earnedCount} / {visibleCatalog.length} unlocked
        </p>
        <ul className="space-y-3">
          {visibleCatalog.map((def) => {
            const earned = earnedIds.has(def.id);
            const secretHidden =
              def.secret && !earned && def.id === "free_space_goob";
            const title = secretHidden ? "???" : def.title;
            const description = secretHidden
              ? "A hidden challenge awaits."
              : def.description;

            return (
              <li
                key={def.id}
                className={`squircle-lg p-4 border flex gap-3 ${
                  earned
                    ? "bg-[var(--bg-tray)] border-[var(--accent)]"
                    : "border-[var(--border-soft)] opacity-80"
                }`}
              >
                <span className="text-2xl shrink-0" aria-hidden>
                  {earned ? (def.icon ?? "🏆") : "🔒"}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h2 className="font-display font-semibold">{title}</h2>
                    {earned && (
                      <Check
                        className="w-4 h-4 text-[var(--accent)] shrink-0"
                        aria-hidden
                      />
                    )}
                  </div>
                  <p className="text-sm text-[var(--text-muted)] mt-0.5">
                    {description}
                  </p>
                  {!earned && (
                    <p className="text-xs text-[var(--text-muted)] mt-2">
                      {def.requirement}
                    </p>
                  )}
                  {earned && user && earnedAt[def.id] && (
                    <p className="text-xs text-[var(--text-muted)] mt-2">
                      {new Date(earnedAt[def.id]).toLocaleDateString()}
                    </p>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </AppShell>
  );
}
