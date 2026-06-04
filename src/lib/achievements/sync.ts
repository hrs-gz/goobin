import type { AchievementId } from "./catalog";
import {
  fetchCloudEarnedIds,
  fetchCloudFreeSpaceUnlocked,
  persistEarnedToCloud,
  persistFreeSpaceUnlockedCloud,
} from "./cloud";
import {
  getLocalEarnedIds,
  isFreeSpaceUnlockedLocal,
  setFreeSpaceUnlockedLocal,
  setLocalEarnedIds,
} from "./local";

export function mergeEarnedSets(
  local: AchievementId[],
  cloud: AchievementId[]
): Set<AchievementId> {
  return new Set([...local, ...cloud]);
}

export async function hydrateEarnedIds(
  userId: string | null
): Promise<Set<AchievementId>> {
  const local = getLocalEarnedIds();
  if (!userId) return mergeEarnedSets(local, []);

  const cloud = await fetchCloudEarnedIds(userId);
  const merged = mergeEarnedSets(local, cloud);
  setLocalEarnedIds([...merged]);
  return merged;
}

export async function syncLocalEarnedToCloud(userId: string): Promise<void> {
  const local = getLocalEarnedIds();
  const cloud = await fetchCloudEarnedIds(userId);
  const cloudSet = new Set(cloud);
  const toUpload = local.filter((id) => !cloudSet.has(id));
  await Promise.all(
    toUpload.map((id) => persistEarnedToCloud(userId, id))
  );
  const merged = mergeEarnedSets(local, cloud);
  setLocalEarnedIds([...merged]);
}

export async function hydrateFreeSpaceUnlocked(
  userId: string | null
): Promise<boolean> {
  if (isFreeSpaceUnlockedLocal()) return true;
  if (!userId) return false;

  const cloud = await fetchCloudFreeSpaceUnlocked(userId);
  if (cloud) {
    setFreeSpaceUnlockedLocal();
    return true;
  }
  return false;
}

export async function syncFreeSpaceToCloud(userId: string): Promise<void> {
  if (!isFreeSpaceUnlockedLocal()) return;
  await persistFreeSpaceUnlockedCloud(userId);
}
