"use client";

import { useRef } from "react";
import { ImagePlus } from "lucide-react";

interface GalleryButtonProps {
  onSelect: (file: File) => void;
  disabled?: boolean;
}

export function GalleryButton({ onSelect, disabled }: GalleryButtonProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) onSelect(file);
          e.target.value = "";
        }}
      />
      <button
        type="button"
        disabled={disabled}
        onClick={() => inputRef.current?.click()}
        className="min-h-[48px] min-w-[48px] squircle-sm flex items-center justify-center bg-[var(--bg-tile)] border border-[var(--border-soft)] hover:bg-black/5 transition-colors disabled:opacity-40"
        aria-label="Upload from gallery"
      >
        <ImagePlus className="w-6 h-6" strokeWidth={2} />
      </button>
    </>
  );
}
