import { createClient } from "@/lib/supabase/client";
import { haversineKm, isWithinRadiusKm } from "@/lib/cloud/geo";
import type {
  BoardRecord,
  BoardStatus,
  CreateBoardInput,
  PlaySession,
} from "@/lib/types";

function localBoardKey(cloudId: string): string {
  return `cloud-${cloudId}`;
}

export function getLocalBoardId(cloudId: string): string {
  return localBoardKey(cloudId);
}

function parseProgress(rowId: string, raw: unknown): PlaySession {
  const localId = localBoardKey(rowId);
  if (raw && typeof raw === "object" && "tiles" in raw) {
    const p = raw as { tiles?: PlaySession["tiles"] };
    return { boardId: localId, tiles: p.tiles ?? {} };
  }
  return { boardId: localId, tiles: {} };
}

function rowToRecord(row: Record<string, unknown>): BoardRecord {
  return {
    id: row.id as string,
    user_id: row.user_id as string,
    title: row.title as string,
    theme_id: row.theme_id as BoardRecord["theme_id"],
    definition: row.definition as BoardRecord["definition"],
    status: row.status as BoardStatus,
    progress: parseProgress(row.id as string, row.progress),
    completed_at: (row.completed_at as string | null) ?? null,
    latitude: (row.latitude as number | null) ?? null,
    longitude: (row.longitude as number | null) ?? null,
    location_label: (row.location_label as string | null) ?? null,
    is_public: Boolean(row.is_public),
    created_at: row.created_at as string,
    updated_at: row.updated_at as string,
  };
}

export async function createBoard(
  input: CreateBoardInput
): Promise<BoardRecord | null> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { definition, latitude, longitude, location_label, is_public } = input;
  const localId = "pending";

  const { data, error } = await supabase
    .from("boards")
    .insert({
      user_id: user.id,
      title: definition.title,
      theme_id: definition.themeId,
      definition,
      status: "in_progress",
      progress: { boardId: localId, tiles: {} },
      latitude: latitude ?? null,
      longitude: longitude ?? null,
      location_label: location_label ?? null,
      is_public: is_public ?? false,
    })
    .select()
    .single();

  if (error || !data) return null;

  const progress: PlaySession = {
    boardId: localBoardKey(data.id),
    tiles: {},
  };
  await supabase
    .from("boards")
    .update({ progress })
    .eq("id", data.id);

  return rowToRecord({ ...data, progress });
}

export async function listUserBoards(): Promise<BoardRecord[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("boards")
    .select("*")
    .order("updated_at", { ascending: false });

  if (error || !data) return [];
  return data.map((row) => rowToRecord(row));
}

export async function getBoard(id: string): Promise<BoardRecord | null> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("boards")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error || !data) return null;
  return rowToRecord(data);
}

export async function updateBoardTheme(
  id: string,
  themeId: BoardRecord["theme_id"]
): Promise<boolean> {
  const supabase = createClient();
  const { data: row } = await supabase
    .from("boards")
    .select("definition")
    .eq("id", id)
    .maybeSingle();

  if (!row?.definition || typeof row.definition !== "object") return false;

  const definition = {
    ...(row.definition as BoardRecord["definition"]),
    themeId,
  };

  const { error } = await supabase
    .from("boards")
    .update({ theme_id: themeId, definition })
    .eq("id", id);

  return !error;
}

export async function updateProgress(
  id: string,
  progress: PlaySession
): Promise<boolean> {
  const supabase = createClient();
  const payload = {
    progress: {
      boardId: localBoardKey(id),
      tiles: progress.tiles,
    },
  };
  const { error } = await supabase.from("boards").update(payload).eq("id", id);
  return !error;
}

export async function markCompleted(id: string): Promise<boolean> {
  const supabase = createClient();
  const { error } = await supabase
    .from("boards")
    .update({
      status: "completed",
      completed_at: new Date().toISOString(),
    })
    .eq("id", id);
  return !error;
}

export async function deleteBoard(id: string): Promise<boolean> {
  const supabase = createClient();
  const { error } = await supabase.from("boards").delete().eq("id", id);
  return !error;
}

export interface DiscoverBoard extends BoardRecord {
  distanceKm: number;
}

export async function discoverNearby(
  lat: number,
  lng: number,
  radiusKm = 25
): Promise<DiscoverBoard[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("boards")
    .select("*")
    .eq("is_public", true)
    .not("latitude", "is", null)
    .not("longitude", "is", null);

  if (error || !data) return [];

  const results: DiscoverBoard[] = [];
  for (const row of data) {
    const record = rowToRecord(row);
    if (record.latitude == null || record.longitude == null) continue;
    if (
      !isWithinRadiusKm(lat, lng, record.latitude, record.longitude, radiusKm)
    ) {
      continue;
    }
    results.push({
      ...record,
      distanceKm:
        Math.round(
          haversineKm(lat, lng, record.latitude, record.longitude) * 10
        ) / 10,
    });
  }

  return results.sort((a, b) => a.distanceKm - b.distanceKm);
}
