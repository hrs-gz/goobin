/**
 * Edit achievements here: id, title, description, secret, and requirement text.
 * Logic lives in engine.ts; thresholds in config.ts.
 */

import {
  BOARD_COUNT_MILESTONES,
  NEARBY_MIN_BOARDS,
  NEARBY_RADIUS_KM,
} from "./config";

export interface AchievementContext {
  boardCount: number;
  completedCount: number;
  hasNearbyCluster: boolean;
  freeSpaceUnlocked: boolean;
}

export type AchievementId =
  | "first_board"
  | "boards_5"
  | "boards_10"
  | "boards_100"
  | "first_blackout"
  | "nearby_cluster"
  | "free_space_goob";

export interface AchievementDefinition {
  id: AchievementId;
  title: string;
  description: string;
  /** Shown on locked cards in the achievements page */
  requirement: string;
  secret?: boolean;
  icon?: string;
  check: (ctx: AchievementContext) => boolean;
}

export const ACHIEVEMENT_CATALOG: AchievementDefinition[] = [
  {
    id: "first_board",
    title: "First board",
    description: "Saved your first goobin to your account.",
    requirement: "Save one board to your account.",
    icon: "🎯",
    check: (ctx) => ctx.boardCount >= 1,
  },
  {
    id: "boards_5",
    title: "Collector",
    description: "Five boards in your library.",
    requirement: `Save ${BOARD_COUNT_MILESTONES[0]} boards.`,
    icon: "📚",
    check: (ctx) => ctx.boardCount >= BOARD_COUNT_MILESTONES[0],
  },
  {
    id: "boards_10",
    title: "Archivist",
    description: "Ten boards — you're on a roll.",
    requirement: `Save ${BOARD_COUNT_MILESTONES[1]} boards.`,
    icon: "🗂️",
    check: (ctx) => ctx.boardCount >= BOARD_COUNT_MILESTONES[1],
  },
  {
    id: "boards_100",
    title: "Goobin legend",
    description: "One hundred boards. Unreal.",
    requirement: `Save ${BOARD_COUNT_MILESTONES[2]} boards.`,
    icon: "👑",
    check: (ctx) => ctx.boardCount >= BOARD_COUNT_MILESTONES[2],
  },
  {
    id: "first_blackout",
    title: "Blackout",
    description: "Completed a board with a full blackout.",
    requirement: "Finish any saved board with a blackout.",
    icon: "✨",
    check: (ctx) => ctx.completedCount >= 1,
  },
  {
    id: "nearby_cluster",
    title: "Local legend",
    description: `Created ${NEARBY_MIN_BOARDS}+ boards near the same place.`,
    requirement: `${NEARBY_MIN_BOARDS}+ boards with location within ${NEARBY_RADIUS_KM} km of each other.`,
    icon: "📍",
    check: (ctx) => ctx.hasNearbyCluster,
  },
  {
    id: "free_space_goob",
    title: "Free space",
    description: "Posted your #goob selfie once.",
    requirement: "Post a selfie with #goob on the demo or a board without a secret center.",
    secret: true,
    icon: "🤫",
    check: (ctx) => ctx.freeSpaceUnlocked,
  },
];

export function getAchievementById(
  id: AchievementId
): AchievementDefinition | undefined {
  return ACHIEVEMENT_CATALOG.find((a) => a.id === id);
}
