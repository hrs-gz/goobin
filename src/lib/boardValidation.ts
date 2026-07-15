import { centerIndex } from "./bingo";
import { BOARD_THEME_IDS, GRID_SIZES } from "./types";
import type {
  BoardDefinition,
  BoardLocation,
  BoardThemeId,
  GridSize,
  TileDef,
} from "./types";

export const MAX_TITLE_LENGTH = 80;
export const MAX_PROMPT_LENGTH = 80;
export const MAX_DETAILS_LENGTH = 500;
export const MAX_LOCATION_LABEL_LENGTH = 120;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isTileDef(value: unknown): value is TileDef {
  if (!isRecord(value)) return false;
  if (typeof value.prompt !== "string") return false;
  if (value.prompt.length > MAX_PROMPT_LENGTH) return false;
  if (value.details !== undefined) {
    if (typeof value.details !== "string") return false;
    if (value.details.length > MAX_DETAILS_LENGTH) return false;
  }
  return true;
}

/**
 * Validate an untrusted board definition before it is stored serverside.
 * Server actions receive client-controlled payloads, so the shape must be
 * re-checked here even though the builder UI enforces the same rules.
 */
export function validateBoardDefinition(
  value: unknown
): value is BoardDefinition {
  if (!isRecord(value)) return false;
  if (value.v !== 1) return false;
  if (typeof value.title !== "string") return false;
  const title = value.title.trim();
  if (title.length === 0 || value.title.length > MAX_TITLE_LENGTH) return false;
  if (!GRID_SIZES.includes(value.gridSize as GridSize)) return false;
  if (!BOARD_THEME_IDS.includes(value.theme as BoardThemeId)) return false;

  const size = value.gridSize as GridSize;
  const tiles = value.tiles;
  if (!Array.isArray(tiles) || tiles.length !== size * size) return false;
  if (!tiles.every(isTileDef)) return false;

  const center = centerIndex(size);
  return tiles.every(
    (tile, i) => i === center || tile.prompt.trim().length > 0
  );
}

/** Validate an untrusted (nullable) board location payload. */
export function validateBoardLocation(
  value: unknown
): value is BoardLocation | null {
  if (value === null) return true;
  if (!isRecord(value)) return false;
  if (typeof value.label !== "string") return false;
  const label = value.label.trim();
  if (label.length === 0 || value.label.length > MAX_LOCATION_LABEL_LENGTH) {
    return false;
  }
  if (typeof value.lat !== "number" || !Number.isFinite(value.lat)) return false;
  if (typeof value.lng !== "number" || !Number.isFinite(value.lng)) return false;
  return value.lat >= -90 && value.lat <= 90 && value.lng >= -180 && value.lng <= 180;
}
