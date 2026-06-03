interface ColorSwatchProps {
  color: string;
  label: string;
  selected: boolean;
  onSelect: () => void;
}

export function ColorSwatch({
  color,
  label,
  selected,
  onSelect,
}: ColorSwatchProps) {
  return (
    <button
      type="button"
      onClick={onSelect}
      aria-label={label}
      className={`w-9 h-9 squircle-sm border-2 transition-transform ${
        selected ? "scale-110 border-[var(--text-primary)]" : "border-transparent"
      }`}
      style={{ backgroundColor: color }}
    />
  );
}
