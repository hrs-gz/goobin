import type { ThemeId } from "./types";

export const THEMES: Record<
  ThemeId,
  { name: string; primary: string; secondary: string }
> = {
  "neon-pink": { name: "Neon Pink", primary: "#ff2d8a", secondary: "#ff6eb4" },
  "electric-blue": {
    name: "Electric Blue",
    primary: "#2d7bff",
    secondary: "#5ca3ff",
  },
  "toxic-green": {
    name: "Toxic Green",
    primary: "#39ff14",
    secondary: "#7aff5c",
  },
  "warm-yellow": {
    name: "Warm Yellow",
    primary: "#ffd60a",
    secondary: "#ffe566",
  },
  "coral-orange": {
    name: "Coral Orange",
    primary: "#ff6b4a",
    secondary: "#ff9478",
  },
  lavender: { name: "Lavender", primary: "#b57edc", secondary: "#d4a8f0" },
};

export const MARKUP_COLORS = [
  { id: "brand-black", label: "Brand Black", value: "#1a1a1a" },
  { id: "neon-pink", label: "Neon Pink", value: "#ff2d8a" },
  { id: "electric-blue", label: "Electric Blue", value: "#2d7bff" },
  { id: "toxic-green", label: "Toxic Green", value: "#39ff14" },
  { id: "chalk-white", label: "Chalk White", value: "#f5f5f0" },
] as const;
