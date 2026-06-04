"use client";

import { useAchievementsContext } from "@/providers/AchievementsProvider";

export function useFreeSpaceUnlock() {
  const { freeSpaceUnlocked, unlockFreeSpace } = useAchievementsContext();

  return {
    unlocked: freeSpaceUnlocked,
    unlock: unlockFreeSpace,
  };
}
