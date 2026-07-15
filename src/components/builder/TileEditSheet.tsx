"use client";

import { useState } from "react";
import { Sheet } from "@/components/ui/Sheet";
import { Button } from "@/components/ui/Button";
import type { TileDef } from "@/lib/types";

interface TileEditSheetProps {
  open: boolean;
  onClose: () => void;
  position: number;
  tile: TileDef | null;
  onSave: (tile: TileDef) => void;
  onClear: () => void;
}

export function TileEditSheet({
  open,
  onClose,
  position,
  tile,
  onSave,
  onClear,
}: TileEditSheetProps) {
  // Seeded from props; the parent remounts this component (via `key`) when a
  // different tile is opened, so a plain initial value stays in sync.
  const [prompt, setPrompt] = useState(tile?.prompt ?? "");
  const [details, setDetails] = useState(tile?.details ?? "");

  const save = () => {
    const trimmed = prompt.trim();
    if (!trimmed) return;
    onSave({ prompt: trimmed, details: details.trim() || undefined });
    onClose();
  };

  return (
    <Sheet open={open} onClose={onClose} label={`Tile ${position}`}>
      <div className="pb-4">
        <h2 className="font-display text-lg font-semibold">Tile {position}</h2>
        <label className="mt-4 block">
          <span className="mb-1 block text-sm font-medium">Prompt</span>
          <input
            className="input-rect"
            value={prompt}
            autoFocus
            placeholder="e.g. Something red"
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                save();
              }
            }}
          />
        </label>
        <label className="mt-3 block">
          <span className="mb-1 block text-sm font-medium">
            Details <span className="text-[var(--text-faint)]">(optional)</span>
          </span>
          <textarea
            className="input-rect resize-none"
            rows={2}
            value={details}
            placeholder="A hint or extra rule"
            onChange={(e) => setDetails(e.target.value)}
          />
        </label>

        <div className="mt-5 flex gap-2">
          {tile?.prompt && (
            <Button
              variant="secondary"
              fullWidth
              onClick={() => {
                onClear();
                onClose();
              }}
            >
              Clear
            </Button>
          )}
          <Button fullWidth onClick={save} disabled={!prompt.trim()}>
            Save
          </Button>
        </div>
      </div>
    </Sheet>
  );
}
