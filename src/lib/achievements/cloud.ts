import { createClient } from "@/lib/supabase/client";
import { ACHIEVEMENT_CATALOG, type AchievementId } from "./catalog";

export async function fetchCloudEarnedIds(
  userId: string
): Promise<AchievementId[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("user_achievements")
    .select("achievement_id")
    .eq("user_id", userId);

  if (error || !data) return [];
  return data
    .map((r) => r.achievement_id as string)
    .filter((id): id is AchievementId =>
      ACHIEVEMENT_CATALOG.some((a) => a.id === id)
    );
}

export async function fetchEarnedTimestamps(
  userId: string
): Promise<Record<string, string>> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("user_achievements")
    .select("achievement_id, earned_at")
    .eq("user_id", userId);

  if (error || !data) return {};
  const map: Record<string, string> = {};
  for (const row of data) {
    map[row.achievement_id] = row.earned_at;
  }
  return map;
}

export async function persistEarnedToCloud(
  userId: string,
  id: AchievementId
): Promise<void> {
  const supabase = createClient();
  await supabase.from("user_achievements").upsert(
    {
      user_id: userId,
      achievement_id: id,
      earned_at: new Date().toISOString(),
    },
    { onConflict: "user_id,achievement_id" }
  );
}

export async function fetchCloudFreeSpaceUnlocked(
  userId: string
): Promise<boolean> {
  const supabase = createClient();
  const { data } = await supabase
    .from("user_profiles")
    .select("free_space_unlocked")
    .eq("user_id", userId)
    .maybeSingle();

  return Boolean(data?.free_space_unlocked);
}

export async function persistFreeSpaceUnlockedCloud(
  userId: string
): Promise<void> {
  const supabase = createClient();
  await supabase.from("user_profiles").upsert({
    user_id: userId,
    free_space_unlocked: true,
  });
}
