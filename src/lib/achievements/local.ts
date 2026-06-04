import { ACHIEVEMENT_CATALOG, type AchievementId } from "./catalog";

export const LOCAL_EARNED_KEY = "goobin-earned-achievements";
export const FREE_SPACE_UNLOCK_KEY = "goobin-free-space-unlocked";

export function isFreeSpaceUnlockedLocal(): boolean {
  if (typeof window === "undefined") return false;
  return localStorage.getItem(FREE_SPACE_UNLOCK_KEY) === "true";
}

export function setFreeSpaceUnlockedLocal(): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(FREE_SPACE_UNLOCK_KEY, "true");
}

export function getLocalEarnedIds(): AchievementId[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(LOCAL_EARNED_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as string[];
    return parsed.filter((id): id is AchievementId =>
      ACHIEVEMENT_CATALOG.some((a) => a.id === id)
    );
  } catch {
    return [];
  }
}

export function setLocalEarnedIds(ids: AchievementId[]): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(LOCAL_EARNED_KEY, JSON.stringify(ids));
}
