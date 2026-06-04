import type { AchievementDefinition } from "@/lib/achievements/catalog";

type Listener = (achievement: AchievementDefinition) => void;

const listeners = new Set<Listener>();

export function subscribeAchievementToasts(listener: Listener): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function emitAchievementToast(achievement: AchievementDefinition): void {
  listeners.forEach((l) => l(achievement));
}
