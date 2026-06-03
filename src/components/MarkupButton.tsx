"use client";

import { Paintbrush } from "lucide-react";

interface MarkupButtonProps {
  onClick: () => void;
  disabled?: boolean;
  active?: boolean;
}

export function MarkupButton({ onClick, disabled, active }: MarkupButtonProps) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={`min-h-[48px] min-w-[48px] squircle flex items-center justify-center border transition-colors disabled:opacity-40 ${
        active
          ? "bg-[var(--accent)] text-white border-[var(--accent)]"
          : "bg-[var(--bg-tile)] border-[var(--border-soft)] hover:bg-black/5"
      }`}
      aria-label="Markup tools"
    >
      <Paintbrush className="w-6 h-6" strokeWidth={2} />
    </button>
  );
}
