import { isFreeSpaceUnlockedLocal } from "@/lib/achievements/engine";
import { DEFAULT_BOARD_ID } from "@/lib/defaultBoard";
import type { Board, FreeSpaceState } from "./types";

export const GOOB_CHALLENGE_COPY =
  "Post a selfie to social media with the caption #goob. This is a one-time unlock for your account.";

export const GOOB_SHARE_TEXT = "Playing goobin! #goob";

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

/** One-time #goob ritual: achievement + builder secret center */
export function hasGlobalGoobUnlocked(): boolean {
  return isFreeSpaceUnlockedLocal();
}

/** Per-board: 21 taps unlocks center photo on this board */
export function isFreeSpaceUnlocked(tapCount: number): boolean {
  return tapCount >= 21;
}

export function isFreeSpacePlayUnlocked(tapCount: number): boolean {
  return isFreeSpaceUnlocked(tapCount);
}

export function getFreeSpaceState(tapCount: number): FreeSpaceState {
  if (tapCount >= 21) return "unlocked";
  if (tapCount >= 11) return "impatient";
  return "standard";
}

export function getFreeSpaceMessage(tapCount: number): string {
  if (tapCount >= 21) return SECRET_CLUE;
  if (tapCount >= 11) {
    return IMPATIENT[(tapCount - 11) % IMPATIENT.length];
  }
  return CASUAL[(tapCount - 1) % CASUAL.length];
}

export function shouldGlitch(tapCount: number): boolean {
  return tapCount >= 21;
}

/** Show #goob modal on center tap (demo or boards without creator secret center) */
export function shouldShowGoobChallenge(
  board: Board,
  globalGoobUnlocked: boolean
): boolean {
  if (globalGoobUnlocked) return false;
  if (isFreeSpaceUnlocked(board.freeSpace.tapCount)) return false;
  return board.id === DEFAULT_BOARD_ID || !board.hasSecretCenter;
}
