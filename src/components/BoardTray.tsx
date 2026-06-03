import { CompletionBorder } from "./CompletionBorder";
import type { BorderTier } from "@/lib/types";
import { cn } from "@/lib/utils";

interface BoardTrayProps {
  children: React.ReactNode;
  borderTier: BorderTier;
  exportRef?: React.RefObject<HTMLDivElement | null>;
  completionLabel?: string;
  title?: string;
}

export function BoardTray({
  children,
  borderTier,
  exportRef,
  completionLabel,
  title,
}: BoardTrayProps) {
  return (
    <div
      ref={exportRef}
      className="w-full max-w-[min(100%,480px)] mx-auto"
      data-export-root
    >
      {title && (
        <p className="text-center font-display text-lg font-semibold mb-3">
          {title}
        </p>
      )}
      {completionLabel && completionLabel !== "No Bingo" && (
        <p
          className={cn(
            "text-center text-sm font-medium mb-2",
            completionLabel === "Blackout"
              ? "text-[var(--gold-start)]"
              : "text-[var(--accent)]"
          )}
        >
          {completionLabel}
        </p>
      )}
      <div
        className="squircle-lg p-2 sm:p-3"
        style={{
          background: "var(--bg-tray)",
          boxShadow: "var(--shadow-tray)",
        }}
      >
        <CompletionBorder tier={borderTier}>{children}</CompletionBorder>
      </div>
      <div className="flex justify-center mt-3 opacity-60">
        <span className="font-display text-sm lowercase">goobin</span>
      </div>
    </div>
  );
}
