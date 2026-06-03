"use client";

const ICON_OPTIONS = [
  "✨", "📸", "🍿", "🔍", "⭐", "👕", "💙", "🎨", "🐾", "☁️",
  "😜", "🏛️", "🌅", "💎", "🎵", "🚪", "🚚", "🪞", "🎁", "😂",
  "🔲", "📻", "🌿", "🪧", "🎯", "☕", "🌮", "🎪", "🛹", "🧢",
];

interface IconPickerProps {
  value: string;
  onChange: (icon: string) => void;
}

export function IconPicker({ value, onChange }: IconPickerProps) {
  return (
    <div className="flex flex-wrap gap-1 max-h-24 overflow-y-auto">
      {ICON_OPTIONS.map((icon) => (
        <button
          key={icon}
          type="button"
          onClick={() => onChange(icon)}
          className={`w-9 h-9 squircle-sm text-lg flex items-center justify-center ${
            value === icon ? "ring-2 ring-[var(--accent)] bg-[var(--bg-tray)]" : ""
          }`}
        >
          {icon}
        </button>
      ))}
    </div>
  );
}
