"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { listUserBoards } from "@/lib/cloud/boards";
import {
  getAchievementById,
  type AchievementDefinition,
  type AchievementId,
} from "@/lib/achievements/catalog";
import {
  fetchEarnedTimestamps,
  persistEarnedToCloud,
  persistFreeSpaceUnlockedCloud,
} from "@/lib/achievements/cloud";
import {
  buildAchievementContext,
  evaluateNewAchievements,
  getLocalEarnedIds,
} from "@/lib/achievements/engine";
import {
  hydrateEarnedIds,
  hydrateFreeSpaceUnlocked,
  syncFreeSpaceToCloud,
  syncLocalEarnedToCloud,
} from "@/lib/achievements/sync";
import {
  setFreeSpaceUnlockedLocal,
  setLocalEarnedIds,
} from "@/lib/achievements/local";
import { emitAchievementToast } from "@/lib/achievementToasts";
import { useAuthContext } from "./AuthProvider";

interface AchievementsContextValue {
  earnedIds: Set<AchievementId>;
  ready: boolean;
  freeSpaceUnlocked: boolean;
  earnedAt: Record<string, string>;
  refreshEarned: () => Promise<Set<AchievementId>>;
  refreshEarnedAt: () => Promise<void>;
  checkAndAward: (options?: {
    freeSpaceUnlocked?: boolean;
  }) => Promise<AchievementDefinition[]>;
  awardById: (id: AchievementId) => Promise<void>;
  unlockFreeSpace: () => Promise<void>;
  getLocalEarnedIds: () => AchievementId[];
}

const AchievementsContext = createContext<AchievementsContextValue | null>(null);

export function AchievementsProvider({ children }: { children: ReactNode }) {
  const { user } = useAuthContext();
  const userId = user?.id ?? null;
  const [earnedIds, setEarnedIds] = useState<Set<AchievementId>>(new Set());
  const [ready, setReady] = useState(false);
  const [freeSpaceUnlocked, setFreeSpaceUnlocked] = useState(false);
  const [earnedAt, setEarnedAt] = useState<Record<string, string>>({});

  const refreshEarnedAt = useCallback(async () => {
    if (!userId) {
      setEarnedAt({});
      return;
    }
    const map = await fetchEarnedTimestamps(userId);
    setEarnedAt(map);
  }, [userId]);

  const refreshEarned = useCallback(async () => {
    const merged = await hydrateEarnedIds(userId);
    setEarnedIds(merged);
    setReady(true);
    return merged;
  }, [userId]);

  const hydrateAll = useCallback(async () => {
    const merged = await refreshEarned();
    const unlocked = await hydrateFreeSpaceUnlocked(userId);
    setFreeSpaceUnlocked(unlocked);
    if (unlocked) {
      const next = new Set(merged);
      next.add("free_space_goob");
      setEarnedIds(next);
    }
    await refreshEarnedAt();
  }, [userId, refreshEarned, refreshEarnedAt]);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      if (userId) {
        await syncLocalEarnedToCloud(userId);
        await syncFreeSpaceToCloud(userId);
      }
      if (!cancelled) await hydrateAll();
    })();
    return () => {
      cancelled = true;
    };
  }, [userId, hydrateAll]);

  const persistNewAwards = useCallback(
    async (defs: AchievementDefinition[], next: Set<AchievementId>) => {
      setLocalEarnedIds([...next]);
      setEarnedIds(next);

      for (const def of defs) {
        emitAchievementToast(def);
        if (userId) {
          await persistEarnedToCloud(userId, def.id);
        }
      }

      if (userId && defs.length > 0) {
        await refreshEarnedAt();
      }
    },
    [userId, refreshEarnedAt]
  );

  const checkAndAward = useCallback(
    async (options?: { freeSpaceUnlocked?: boolean }) => {
      const boards = userId ? await listUserBoards() : [];
      const freeSpace =
        options?.freeSpaceUnlocked ??
        (freeSpaceUnlocked || earnedIds.has("free_space_goob"));

      const ctx = buildAchievementContext(boards, freeSpace);
      const current = new Set(earnedIds);
      const newly = evaluateNewAchievements(ctx, current);

      if (newly.length === 0) return newly;

      const next = new Set(current);
      for (const def of newly) next.add(def.id);
      await persistNewAwards(newly, next);
      return newly;
    },
    [userId, earnedIds, freeSpaceUnlocked, persistNewAwards]
  );

  const awardById = useCallback(
    async (id: AchievementId) => {
      if (earnedIds.has(id)) return;
      const def = getAchievementById(id);
      if (!def) return;

      const next = new Set(earnedIds);
      next.add(id);
      await persistNewAwards([def], next);
    },
    [earnedIds, persistNewAwards]
  );

  const unlockFreeSpace = useCallback(async () => {
    setFreeSpaceUnlockedLocal();
    setFreeSpaceUnlocked(true);
    if (userId) {
      await persistFreeSpaceUnlockedCloud(userId);
    }
  }, [userId]);

  const value = useMemo(
    () => ({
      earnedIds,
      ready,
      freeSpaceUnlocked,
      earnedAt,
      refreshEarned,
      refreshEarnedAt,
      checkAndAward,
      awardById,
      unlockFreeSpace,
      getLocalEarnedIds,
    }),
    [
      earnedIds,
      ready,
      freeSpaceUnlocked,
      earnedAt,
      refreshEarned,
      refreshEarnedAt,
      checkAndAward,
      awardById,
      unlockFreeSpace,
    ]
  );

  return (
    <AchievementsContext.Provider value={value}>
      {children}
    </AchievementsContext.Provider>
  );
}

export function useAchievementsContext(): AchievementsContextValue {
  const ctx = useContext(AchievementsContext);
  if (!ctx) {
    throw new Error(
      "useAchievements must be used within AchievementsProvider"
    );
  }
  return ctx;
}
