import {
  Bird,
  Building2,
  Bus,
  Cat,
  Fish,
  Flower2,
  Frame,
  Landmark,
  Palette,
  PawPrint,
  Sparkles,
  Star,
  Sun,
  TrafficCone,
  Trees,
  type LucideIcon,
} from "lucide-react";
import type { BoardThemeId } from "./types";

export interface BoardThemeColors {
  /** Primary theme accent (buttons, active states, pattern strokes). */
  accent: string;
  /** Soft tint for placeholders, selected tiles, pattern fills. */
  accentSoft: string;
  /** Board container background. */
  board: string;
  /** Empty tile background. */
  tile: string;
}

export interface BoardTheme {
  id: BoardThemeId;
  label: string;
  /** Decorative icons used in the repeated background pattern. */
  icons: LucideIcon[];
  /** Icon shown on the highlighted free-space center tile. */
  freeSpaceIcon: LucideIcon;
  light: BoardThemeColors;
  dark: BoardThemeColors;
}

export const BOARD_THEMES: Record<BoardThemeId, BoardTheme> = {
  park: {
    id: "park",
    label: "Park",
    icons: [Trees, Flower2, Bird, Sun],
    freeSpaceIcon: Sun,
    light: {
      accent: "#6fa368",
      accentSoft: "#e4efdf",
      board: "#f2f7ee",
      tile: "#ffffff",
    },
    dark: {
      accent: "#86b97e",
      accentSoft: "#25311f",
      board: "#182017",
      tile: "#212a1f",
    },
  },
  museum: {
    id: "museum",
    label: "Museum",
    icons: [Landmark, Palette, Frame],
    freeSpaceIcon: Sparkles,
    light: {
      accent: "#c39a56",
      accentSoft: "#f3e9d6",
      board: "#f8f3e9",
      tile: "#ffffff",
    },
    dark: {
      accent: "#d4ab63",
      accentSoft: "#31291a",
      board: "#201c13",
      tile: "#292418",
    },
  },
  zoo: {
    id: "zoo",
    label: "Zoo",
    icons: [PawPrint, Cat, Fish, Bird],
    freeSpaceIcon: Star,
    light: {
      accent: "#dd934f",
      accentSoft: "#f7e6d3",
      board: "#fbf1e6",
      tile: "#ffffff",
    },
    dark: {
      accent: "#e8a35f",
      accentSoft: "#33251a",
      board: "#221a12",
      tile: "#2b2117",
    },
  },
  city: {
    id: "city",
    label: "City",
    icons: [Building2, Bus, TrafficCone],
    freeSpaceIcon: Star,
    light: {
      accent: "#7089bf",
      accentSoft: "#e2e7f2",
      board: "#f0f3f8",
      tile: "#ffffff",
    },
    dark: {
      accent: "#8ba1d1",
      accentSoft: "#212734",
      board: "#161a22",
      tile: "#1e232d",
    },
  },
};

export function getBoardTheme(id: BoardThemeId): BoardTheme {
  return BOARD_THEMES[id];
}

/**
 * CSS custom properties for a board container. Both light + dark values are
 * emitted; the active set is chosen by the `[data-color-mode]` selectors in
 * the board wrapper's inline style consumers pick from. Because inline styles
 * can't be media/attribute-scoped, callers pass the resolved `mode`.
 */
export function boardThemeVars(
  id: BoardThemeId,
  mode: "light" | "dark"
): React.CSSProperties {
  const c = BOARD_THEMES[id][mode];
  return {
    ["--board-accent" as string]: c.accent,
    ["--board-accent-soft" as string]: c.accentSoft,
    ["--board-bg" as string]: c.board,
    ["--board-tile" as string]: c.tile,
  };
}
