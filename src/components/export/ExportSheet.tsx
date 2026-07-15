"use client";

import { useRef, useState } from "react";
import { Download, Loader2, Share2 } from "lucide-react";
import { Sheet } from "@/components/ui/Sheet";
import { Button } from "@/components/ui/Button";
import { CollageRender } from "@/components/export/CollageRender";
import {
  downloadBlob,
  exportBoardElement,
  shareBoardBlob,
} from "@/lib/export";
import type { BoardByCode } from "@/lib/types";

interface ExportSheetProps {
  open: boolean;
  onClose: () => void;
  board: BoardByCode;
  photoUrls: Record<number, string>;
  origin: string;
}

export function ExportSheet({
  open,
  onClose,
  board,
  photoUrls,
  origin,
}: ExportSheetProps) {
  const collageRef = useRef<HTMLDivElement>(null);
  const [busy, setBusy] = useState<"share" | "download" | null>(null);

  const capture = async (): Promise<Blob | null> => {
    const node = collageRef.current;
    if (!node) return null;
    // Give the off-screen node + images a moment to settle.
    await new Promise((r) => setTimeout(r, 60));
    return exportBoardElement(node);
  };

  const handleShare = async () => {
    setBusy("share");
    try {
      const blob = await capture();
      if (!blob) return;
      const shared = await shareBoardBlob(blob, board.title);
      // TODO(leaderboards): record a 'board_events' export event when shared.
      if (!shared) downloadBlob(blob, `goobin-${board.join_code}.png`);
    } finally {
      setBusy(null);
    }
  };

  const handleDownload = async () => {
    setBusy("download");
    try {
      const blob = await capture();
      if (blob) downloadBlob(blob, `goobin-${board.join_code}.png`);
    } finally {
      setBusy(null);
    }
  };

  return (
    <Sheet open={open} onClose={onClose} label="Share your board">
      <div className="pb-4">
        <h2 className="font-display text-lg font-semibold">Share your board</h2>
        <p className="mt-1 text-sm text-[var(--text-muted)]">
          Save a photo collage or send it straight to your apps. Photos stay on
          your device.
        </p>

        <div className="mt-5 flex flex-col gap-2.5">
          <Button size="lg" fullWidth onClick={handleShare} disabled={busy !== null}>
            {busy === "share" ? (
              <Loader2 size={18} className="animate-spin" />
            ) : (
              <Share2 size={18} />
            )}
            Share
          </Button>
          <Button
            variant="secondary"
            size="lg"
            fullWidth
            onClick={handleDownload}
            disabled={busy !== null}
          >
            {busy === "download" ? (
              <Loader2 size={18} className="animate-spin" />
            ) : (
              <Download size={18} />
            )}
            Download image
          </Button>
        </div>
      </div>

      {/* Off-screen render target for html-to-image. */}
      <div
        aria-hidden
        style={{ position: "fixed", left: -10000, top: 0, pointerEvents: "none" }}
      >
        <CollageRender
          ref={collageRef}
          board={board}
          photoUrls={photoUrls}
          origin={origin}
        />
      </div>
    </Sheet>
  );
}
