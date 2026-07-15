import { createClient } from "@/lib/supabase/client";
import type { NearbyBoard } from "@/lib/types";

/** Record an "open" event for a board (guarded once per session by callers). */
export async function recordBoardOpen(code: string): Promise<void> {
  const supabase = createClient();
  await supabase.rpc("record_board_open", { p_code: code });
}

/** Public boards near a point, nearest first (default 0.5 mi radius). */
export async function fetchBoardsNearby(
  lat: number,
  lng: number,
  radiusMeters?: number
): Promise<NearbyBoard[]> {
  const supabase = createClient();
  const { data, error } = await supabase.rpc("boards_nearby", {
    p_lat: lat,
    p_lng: lng,
    ...(radiusMeters != null ? { p_radius_m: radiusMeters } : {}),
  });
  if (error || !data) return [];
  return (data as NearbyBoard[]).map((b) => ({
    ...b,
    distance_m: Number(b.distance_m),
  }));
}
