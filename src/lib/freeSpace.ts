import { DEFAULT_BOARD_ID } from "@/lib/defaultBoard";
import type { Board, FreeSpace, FreeSpaceState } from "./types";

export const GOOB_CHALLENGE_COPY =
  "Post a selfie to social media with the caption #goob. This is a one-time unlock for your account.";

export const GOOB_SHARE_TEXT = "Playing goobin! #goob";

export const FREE_SPACE_IMPATIENT_TAPS = 11;
export const FREE_SPACE_UNLOCK_TAPS = 21;

const CASUAL = [
  "Aren't you glad it's free?",
  "Easiest tile on the board.",
  "Stop poking me.",
  "You already got this one.",
  "Free means free.",
  "No photo required here.",
  "This one's on the house.",
  "Tap elsewhere, adventurer.",
  "Consider it done.",
  "The center holds.",
];

const IMPATIENT = [
  "Seriously? Go outside.",
  "There's nothing else here...",
  "You're still tapping?",
  "The other tiles miss you.",
  "This is becoming a pattern.",
  "Have you tried the corners?",
  "I'm not a button.",
  "Persistence noted.",
  "The board is waiting.",
  "Okay, fine, keep going.",
];

export const SECRET_CLUE =
  "Coordinates whisper: 37.7749° N — look where the grid cracks meet the old pier.";

/** Per-board: 21 taps unlocks center photo on this board. Account #goob does not bypass this. */
export function isFreeSpaceUnlocked(tapCount: number): boolean {
  return tapCount >= FREE_SPACE_UNLOCK_TAPS;
}

/** Tap-only gate for opening the center photo card (ignores account #goob). */
export function canOpenCenterPhoto(tapCount: number): boolean {
  return isFreeSpaceUnlocked(tapCount);
}

export function getFreeSpaceState(tapCount: number): FreeSpaceState {
  if (tapCount >= FREE_SPACE_UNLOCK_TAPS) return "glitched";
  if (tapCount >= FREE_SPACE_IMPATIENT_TAPS) return "impatient";
  return "standard";
}

export function getFreeSpaceMessage(tapCount: number): string {
  if (tapCount >= FREE_SPACE_UNLOCK_TAPS) return SECRET_CLUE;
  if (tapCount >= FREE_SPACE_IMPATIENT_TAPS) {
    return IMPATIENT[(tapCount - FREE_SPACE_IMPATIENT_TAPS) % IMPATIENT.length];
  }
  return CASUAL[(tapCount - 1) % CASUAL.length];
}

export function buildFreeSpaceFields(tapCount: number): FreeSpace {
  return {
    tapCount,
    state: getFreeSpaceState(tapCount),
    secretClue:
      tapCount >= FREE_SPACE_UNLOCK_TAPS
        ? getFreeSpaceMessage(tapCount)
        : undefined,
  };
}

export function shouldGlitch(tapCount: number): boolean {
  return getFreeSpaceState(tapCount) === "glitched";
}

/**
 * Offer the one-time #goob ritual after 21 center taps on this board.
 * Account #goob does not bypass per-board tap count for photo play.
 */
export function shouldShowGoobChallenge(
  board: Board,
  globalGoobUnlocked: boolean,
  tapCount: number
): boolean {
  if (globalGoobUnlocked) return false;
  if (tapCount < FREE_SPACE_UNLOCK_TAPS) return false;
  if (board.id === DEFAULT_BOARD_ID || !board.hasSecretCenter) return true;
  return false;
}

/** Center tile border + glitch only when photo play is allowed and no #goob ritual is pending. */
export function shouldShowCenterUnlockVisuals(
  board: Board,
  globalGoobUnlocked: boolean,
  tapCount: number
): boolean {
  if (!canOpenCenterPhoto(tapCount)) return false;
  return !shouldShowGoobChallenge(board, globalGoobUnlocked, tapCount);
}
