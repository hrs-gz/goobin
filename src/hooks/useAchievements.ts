"use client";

import { useAchievementsContext } from "@/providers/AchievementsProvider";
import { fetchCloudEarnedIds } from "@/lib/achievements/cloud";
import { getLocalEarnedIds } from "@/lib/achievements/local";
import { useAuth } from "./useAuth";

export function useAchievements() {
  const { user } = useAuth();
  const ctx = useAchievementsContext();

  return {
    earnedIds: ctx.earnedIds,
    ready: ctx.ready,
    earnedAt: ctx.earnedAt,
    refreshEarned: ctx.refreshEarned,
    refreshEarnedAt: ctx.refreshEarnedAt,
    checkAndAward: ctx.checkAndAward,
    awardById: ctx.awardById,
    fetchCloudEarnedIds: () =>
      user ? fetchCloudEarnedIds(user.id) : Promise.resolve([]),
    getLocalEarnedIds,
  };
}
