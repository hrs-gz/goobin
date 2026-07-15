// Goobin domain types (spec v2).

export type GridSize = 3 | 5;

export type BoardThemeId = "park" | "museum" | "zoo" | "city";

export const BOARD_THEME_IDS: BoardThemeId[] = [
  "park",
  "museum",
  "zoo",
  "city",
];

export const GRID_SIZES: GridSize[] = [3, 5];

/** A single bingo prompt. `details` is optional flavor text shown in the tile sheet. */
export interface TileDef {
  prompt: string;
  details?: string;
}

/**
 * Serialized board definition (stored in `boards.definition` jsonb).
 * The center tile (index `(gridSize² − 1) / 2`) is the free space; its
 * `TileDef` still carries a prompt for display but is auto-complete in play.
 */
export interface BoardDefinition {
  v: 1;
  title: string;
  gridSize: GridSize;
  theme: BoardThemeId;
  tiles: TileDef[];
}

/** Client-only play progress, persisted in IndexedDB keyed by join code. */
export interface PlayProgress {
  code: string;
  tiles: Record<number, { photoBlobId: string; completedAt: string }>;
  celebratedLines: number;
  celebratedBlackout: boolean;
}

/** Board as returned by the `get_board_by_code` RPC (never exposes user_id). */
export interface BoardByCode {
  id: string;
  title: string;
  theme_id: BoardThemeId;
  grid_size: GridSize;
  definition: BoardDefinition;
  latitude: number | null;
  longitude: number | null;
  location_label: string | null;
  join_code: string;
}

/** Own board row for the My Boards list (RLS-scoped select). */
export interface OwnBoard {
  id: string;
  title: string;
  theme_id: BoardThemeId;
  grid_size: GridSize;
  join_code: string;
  is_public: boolean;
  published_at: string | null;
  latitude: number | null;
  longitude: number | null;
  location_label: string | null;
  created_at: string;
}

/** Board row for `/boards/[id]` share/manage page (own board, full detail). */
export interface OwnBoardDetail extends OwnBoard {
  definition: BoardDefinition;
}

/** Nearby public board from the `boards_nearby` RPC. */
export interface NearbyBoard {
  id: string;
  title: string;
  theme_id: BoardThemeId;
  grid_size: GridSize;
  join_code: string;
  latitude: number;
  longitude: number;
  location_label: string | null;
  distance_m: number;
}

/** A tagged location for a board. */
export interface BoardLocation {
  label: string;
  lat: number;
  lng: number;
}
