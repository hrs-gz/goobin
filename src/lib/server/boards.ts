import { createClient } from "@/lib/supabase/server";
import type {
  BoardByCode,
  BoardDefinition,
  BoardLocation,
  OwnBoard,
  OwnBoardDetail,
} from "@/lib/types";

const OWN_BOARD_COLUMNS =
  "id, title, theme_id, grid_size, join_code, is_public, published_at, latitude, longitude, location_label, created_at";

/** Fetch a board by join code via the anon-safe RPC (never exposes user_id). */
export async function getBoardByCode(
  code: string
): Promise<BoardByCode | null> {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("get_board_by_code", {
    p_code: code,
  });
  if (error || !data) return null;
  const rows = data as BoardByCode[];
  return rows[0] ?? null;
}

/** The signed-in user's boards, newest first (RLS-scoped). */
export async function getOwnBoards(): Promise<OwnBoard[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("boards")
    .select(OWN_BOARD_COLUMNS)
    .order("created_at", { ascending: false });
  if (error || !data) return [];
  return data as unknown as OwnBoard[];
}

/** A single own board with its full definition (RLS-scoped). */
export async function getOwnBoardDetail(
  id: string
): Promise<OwnBoardDetail | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("boards")
    .select(`${OWN_BOARD_COLUMNS}, definition`)
    .eq("id", id)
    .maybeSingle();
  if (error || !data) return null;
  return data as unknown as OwnBoardDetail;
}

/** Map of board id -> open count for the caller's boards. */
export async function getMyBoardOpenCounts(): Promise<Record<string, number>> {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("get_my_board_open_counts");
  if (error || !data) return {};
  const rows = data as { board_id: string; open_count: number }[];
  const counts: Record<string, number> = {};
  for (const row of rows) counts[row.board_id] = Number(row.open_count);
  return counts;
}

/** Insert a new board owned by the current user. Returns id + join code. */
export async function insertBoard(
  definition: BoardDefinition,
  location: BoardLocation | null,
  isPublic: boolean
): Promise<{ id: string; join_code: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { data, error } = await supabase
    .from("boards")
    .insert({
      user_id: user.id,
      title: definition.title,
      theme_id: definition.theme,
      grid_size: definition.gridSize,
      definition,
      latitude: location?.lat ?? null,
      longitude: location?.lng ?? null,
      location_label: location?.label ?? null,
      is_public: isPublic,
      published_at: isPublic ? new Date().toISOString() : null,
    })
    .select("id, join_code")
    .single();

  if (error || !data) throw new Error(error?.message ?? "Failed to create board");
  return data as { id: string; join_code: string };
}

/** Toggle a board's published/public state (RLS ensures ownership). */
export async function setBoardPublished(
  id: string,
  isPublic: boolean
): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase
    .from("boards")
    .update({
      is_public: isPublic,
      published_at: isPublic ? new Date().toISOString() : null,
    })
    .eq("id", id);
  if (error) throw new Error(error.message);
}

/** Delete an own board (RLS ensures ownership). */
export async function deleteBoard(id: string): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase.from("boards").delete().eq("id", id);
  if (error) throw new Error(error.message);
}
