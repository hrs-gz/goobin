"use client";

import { THEMES } from "@/lib/themes";
import type { ThemeId } from "@/lib/types";

interface ThemePillPickerProps {
  value: ThemeId;
  onChange: (theme: ThemeId) => void;
}

export function ThemePillPicker({ value, onChange }: ThemePillPickerProps) {
  return (
    <div
      className="flex gap-2 overflow-x-auto pb-1 snap-x snap-mandatory scrollbar-none"
      role="radiogroup"
      aria-label="Accent theme"
    >
      {(Object.keys(THEMES) as ThemeId[]).map((id) => {
        const selected = value === id;
        const darkText = id === "warm-yellow" || id === "toxic-green";
        return (
          <button
            key={id}
            type="button"
            role="radio"
            aria-checked={selected}
            onClick={() => onChange(id)}
            className={`shrink-0 snap-start px-4 py-2 rounded-full text-sm font-medium border-2 transition-all ${
              selected
                ? "ring-2 ring-[var(--text-primary)] ring-offset-2 ring-offset-[var(--bg-page)] border-transparent"
                : "border-transparent opacity-80 hover:opacity-100"
            }`}
            style={{
              background: `linear-gradient(135deg, ${THEMES[id].primary}, ${THEMES[id].secondary})`,
              color: darkText ? "#1a1a1a" : "#fff",
            }}
          >
            {THEMES[id].name}
          </button>
        );
      })}
    </div>
  );
}
