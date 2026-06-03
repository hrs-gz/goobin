"use client";

interface PromptEditorProps {
  value: string;
  onChange: (value: string) => void;
  index: number;
}

export function PromptEditor({ value, onChange, index }: PromptEditorProps) {
  return (
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={`Tile ${index + 1} prompt`}
      maxLength={40}
      className="input-rect"
    />
  );
}
