"use client";

import { THEMES } from "@/lib/themes";
import type { ThemeId } from "@/lib/types";

interface ThemePickerProps {
  value: ThemeId;
  onChange: (theme: ThemeId) => void;
}

export function ThemePicker({ value, onChange }: ThemePickerProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {(Object.keys(THEMES) as ThemeId[]).map((id) => (
        <button
          key={id}
          type="button"
          onClick={() => onChange(id)}
          className={`px-3 py-2 squircle text-sm font-medium border-2 transition-colors ${
            value === id
              ? "border-[var(--text-primary)]"
              : "border-transparent"
          }`}
          style={{
            background: `linear-gradient(135deg, ${THEMES[id].primary}, ${THEMES[id].secondary})`,
            color: id === "warm-yellow" || id === "toxic-green" ? "#1a1a1a" : "#fff",
          }}
        >
          {THEMES[id].name}
        </button>
      ))}
    </div>
  );
}
