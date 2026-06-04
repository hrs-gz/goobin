import { isWithinRadiusKm } from "@/lib/cloud/geo";
import type { BoardRecord } from "@/lib/types";
import {
  ACHIEVEMENT_CATALOG,
  type AchievementContext,
  type AchievementDefinition,
  type AchievementId,
} from "./catalog";
import { NEARBY_MIN_BOARDS, NEARBY_RADIUS_KM } from "./config";

function hasNearbyBoardCluster(boards: BoardRecord[]): boolean {
  const located = boards.filter(
    (b) => b.latitude != null && b.longitude != null
  );
  if (located.length < NEARBY_MIN_BOARDS) return false;

  for (let i = 0; i < located.length; i++) {
    let neighbors = 1;
    for (let j = 0; j < located.length; j++) {
      if (i === j) continue;
      if (
        isWithinRadiusKm(
          located[i].latitude!,
          located[i].longitude!,
          located[j].latitude!,
          located[j].longitude!,
          NEARBY_RADIUS_KM
        )
      ) {
        neighbors++;
      }
    }
    if (neighbors >= NEARBY_MIN_BOARDS) return true;
  }
  return false;
}

export function buildAchievementContext(
  boards: BoardRecord[],
  freeSpaceUnlocked: boolean
): AchievementContext {
  return {
    boardCount: boards.length,
    completedCount: boards.filter((b) => b.status === "completed").length,
    hasNearbyCluster: hasNearbyBoardCluster(boards),
    freeSpaceUnlocked,
  };
}

export function evaluateNewAchievements(
  ctx: AchievementContext,
  alreadyEarned: Set<AchievementId>
): AchievementDefinition[] {
  const newly: AchievementDefinition[] = [];
  for (const def of ACHIEVEMENT_CATALOG) {
    if (alreadyEarned.has(def.id)) continue;
    if (def.check(ctx)) newly.push(def);
  }
  return newly;
}
