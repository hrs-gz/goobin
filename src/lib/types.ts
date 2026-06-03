export type BoardSize = 3 | 4 | 5;

export type BorderTier =
  | "standard"
  | "dualTone"
  | "goldBlackout"
  | "iridescentSecret";

export type FreeSpaceState = "standard" | "impatient" | "glitched" | "unlocked";

export type ThemeId =
  | "neon-pink"
  | "electric-blue"
  | "toxic-green"
  | "warm-yellow"
  | "coral-orange"
  | "lavender";

export interface BrushStroke {
  points: number[];
  color: string;
  width: number;
}

export interface TextOverlay {
  id: string;
  text: string;
  x: number;
  y: number;
  color: string;
  fontSize: number;
}

export interface MarkupData {
  brushStrokes: BrushStroke[];
  textOverlays: TextOverlay[];
  hasMarkup: boolean;
}

export interface Tile {
  id: string;
  index: number;
  prompt: string;
  icon: string;
  isFreeSpace: boolean;
  photoUrl?: string;
  markupData?: MarkupData;
  completedAt?: string;
}

export interface FreeSpace {
  tapCount: number;
  state: FreeSpaceState;
  secretClue?: string;
}

export interface CompletionStatus {
  completedTiles: number;
  completedLines: number;
  isBlackout: boolean;
  borderTier: BorderTier;
  label: string;
}

export interface Board {
  id: string;
  title: string;
  size: BoardSize;
  themeId: ThemeId;
  tiles: Tile[];
  freeSpace: FreeSpace;
  createdAt: string;
  createdBy?: string;
}

export interface BoardDefinition {
  title: string;
  themeId: ThemeId;
  tiles: { prompt: string; icon: string }[];
}

export interface TileSessionData {
  photoBlobId?: string;
  markupData?: MarkupData;
  completedAt?: string;
  freeSpaceCompleted?: boolean;
}

export interface PlaySession {
  boardId: string;
  tiles: Record<string, TileSessionData>;
}

export type BoardStatus = "in_progress" | "completed";

export interface BoardRecord {
  id: string;
  user_id: string;
  title: string;
  theme_id: ThemeId;
  definition: BoardDefinition;
  status: BoardStatus;
  progress: PlaySession;
  completed_at: string | null;
  latitude: number | null;
  longitude: number | null;
  location_label: string | null;
  is_public: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateBoardInput {
  definition: BoardDefinition;
  latitude?: number;
  longitude?: number;
  location_label?: string;
  is_public?: boolean;
}
