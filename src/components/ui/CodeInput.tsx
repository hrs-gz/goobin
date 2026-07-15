"use client";

import { useRef, type ClipboardEvent, type KeyboardEvent } from "react";
import { cn } from "@/lib/utils";

interface CodeInputProps {
  value: string;
  onChange: (value: string) => void;
  length?: number;
  onComplete?: (value: string) => void;
  autoFocus?: boolean;
  disabled?: boolean;
}

/** Segmented numeric code entry with auto-advance, paste, and backspace nav. */
export function CodeInput({
  value,
  onChange,
  length = 6,
  onComplete,
  autoFocus,
  disabled,
}: CodeInputProps) {
  const refs = useRef<(HTMLInputElement | null)[]>([]);
  const digits = Array.from({ length }, (_, i) => value[i] ?? "");

  const commit = (next: string) => {
    onChange(next);
    if (next.length === length) onComplete?.(next);
  };

  const setAt = (index: number, digit: string) => {
    const chars = value.split("");
    chars[index] = digit;
    const next = chars.join("").slice(0, length).replace(/\D/g, "");
    commit(next);
    if (digit && index < length - 1) refs.current[index + 1]?.focus();
  };

  const handleKeyDown = (index: number, e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace") {
      e.preventDefault();
      if (digits[index]) {
        setAt(index, "");
      } else if (index > 0) {
        refs.current[index - 1]?.focus();
        setAt(index - 1, "");
      }
    } else if (e.key === "ArrowLeft" && index > 0) {
      refs.current[index - 1]?.focus();
    } else if (e.key === "ArrowRight" && index < length - 1) {
      refs.current[index + 1]?.focus();
    }
  };

  const handlePaste = (e: ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, length);
    if (!pasted) return;
    commit(pasted);
    const focusIndex = Math.min(pasted.length, length - 1);
    refs.current[focusIndex]?.focus();
  };

  return (
    <div className="flex justify-center gap-2" role="group" aria-label="Join code">
      {digits.map((digit, i) => (
        <input
          key={i}
          ref={(el) => {
            refs.current[i] = el;
          }}
          value={digit}
          disabled={disabled}
          inputMode="numeric"
          autoComplete={i === 0 ? "one-time-code" : "off"}
          pattern="[0-9]*"
          maxLength={1}
          autoFocus={autoFocus && i === 0}
          aria-label={`Digit ${i + 1}`}
          onChange={(e) => {
            const d = e.target.value.replace(/\D/g, "").slice(-1);
            setAt(i, d);
          }}
          onKeyDown={(e) => handleKeyDown(i, e)}
          onPaste={handlePaste}
          onFocus={(e) => e.target.select()}
          className={cn(
            "h-14 w-11 sm:w-12 text-center text-2xl font-display font-semibold",
            "rounded-[var(--radius-sm)] bg-[var(--bg-surface)]",
            "border border-[var(--border-strong)] text-[var(--text-primary)]",
            "focus:outline-none focus:border-[var(--accent)] focus:ring-3 focus:ring-[var(--ring)]",
            "transition-colors"
          )}
        />
      ))}
    </div>
  );
}
