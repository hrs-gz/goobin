"use client";

import { useRef } from "react";
import { Camera } from "lucide-react";

interface CameraButtonProps {
  onCapture: (file: File) => void;
  disabled?: boolean;
}

export function CameraButton({ onCapture, disabled }: CameraButtonProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) onCapture(file);
          e.target.value = "";
        }}
      />
      <button
        type="button"
        disabled={disabled}
        onClick={() => inputRef.current?.click()}
        className="min-h-[56px] min-w-[56px] squircle-sm flex items-center justify-center bg-[var(--accent)] text-white shadow-lg hover:opacity-90 disabled:opacity-40 transition-opacity"
        aria-label="Take photo"
      >
        <Camera className="w-7 h-7" strokeWidth={2} />
      </button>
    </>
  );
}
