"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X, RotateCcw } from "lucide-react";
import dynamic from "next/dynamic";
import type { Tile } from "@/lib/types";
import { isTileComplete } from "@/lib/bingo";
import { CameraButton } from "./CameraButton";
import { GalleryButton } from "./GalleryButton";
import { MarkupButton } from "./MarkupButton";

const MarkupEditor = dynamic(
  () => import("./MarkupEditor").then((m) => m.MarkupEditor),
  { ssr: false }
);

const panelTransition = { type: "spring" as const, stiffness: 300, damping: 28 };

interface TileSpinOutCardProps {
  tile: Tile;
  onClose: () => void;
  onPhoto?: (file: File) => void;
  onSaveMarkup?: (data: import("@/lib/types").MarkupData) => void;
  flipped: boolean;
  onFlip: () => void;
  readOnly?: boolean;
}

export function TileSpinOutCard({
  tile,
  onClose,
  onPhoto,
  onSaveMarkup,
  flipped,
  onFlip,
  readOnly = false,
}: TileSpinOutCardProps) {
  const [showMarkup, setShowMarkup] = useState(false);
  const complete = isTileComplete(tile) && Boolean(tile.photoUrl);

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <motion.button
          type="button"
          className="absolute inset-0 bg-black/50"
          onClick={onClose}
          aria-label="Close"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        />
        <motion.div
          className="relative z-10 w-[min(92vw,28rem)] max-h-[min(85dvh,640px)] flex flex-col rounded-3xl bg-[var(--bg-tile)] shadow-2xl border border-[var(--border-soft)] p-6 overflow-hidden"
          initial={{ opacity: 0, scale: 0.92, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.92, y: 12 }}
          transition={panelTransition}
        >
          <div className="flex justify-end mb-2 shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="min-h-11 min-w-11 flex items-center justify-center rounded-full hover:bg-black/5"
              aria-label="Close card"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {showMarkup && tile.photoUrl && onSaveMarkup ? (
            <div className="flex-1 min-h-0 overflow-y-auto">
              <MarkupEditor
                photoUrl={tile.photoUrl}
                initialData={tile.markupData}
                onSave={onSaveMarkup}
                onClose={() => setShowMarkup(false)}
              />
            </div>
          ) : (
            <>
              <div
                className="relative w-full flex-1 min-h-[min(45dvh,360px)] mb-6"
                style={{ perspective: 800 }}
              >
                <motion.div
                  className="w-full h-full min-h-[min(45dvh,360px)]"
                  animate={{ rotateY: flipped ? 180 : 0 }}
                  transition={{ duration: 0.35 }}
                  style={{ transformStyle: "preserve-3d" }}
                >
                  <div
                    className="absolute inset-0 flex flex-col items-center justify-center rounded-2xl overflow-hidden"
                    style={{
                      backfaceVisibility: "hidden",
                      transform: flipped ? "rotateY(180deg)" : undefined,
                    }}
                  >
                    {complete && tile.photoUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={tile.photoUrl}
                        alt={tile.prompt}
                        className="w-full h-full object-cover rounded-2xl"
                      />
                    ) : (
                      <>
                        <span className="text-5xl mb-3">{tile.icon}</span>
                        <p className="text-lg font-medium text-center px-4">
                          {tile.prompt}
                        </p>
                      </>
                    )}
                  </div>
                  {complete && (
                    <div
                      className="absolute inset-0 flex flex-col items-center justify-center bg-[var(--bg-tile)] rounded-2xl p-4"
                      style={{
                        backfaceVisibility: "hidden",
                        transform: "rotateY(180deg)",
                      }}
                    >
                      <span className="text-4xl mb-2">{tile.icon}</span>
                      <p className="text-center text-[var(--text-muted)]">
                        {tile.prompt}
                      </p>
                    </div>
                  )}
                </motion.div>
              </div>

              {!readOnly && onPhoto && (
                <div className="flex items-center justify-between gap-3 shrink-0">
                  <MarkupButton
                    disabled={!complete || !onSaveMarkup}
                    active={showMarkup}
                    onClick={() => onSaveMarkup && setShowMarkup(true)}
                  />
                  <CameraButton onCapture={onPhoto} />
                  <GalleryButton onSelect={onPhoto} />
                </div>
              )}

              {complete && (
                <button
                  type="button"
                  onClick={onFlip}
                  className="mt-4 w-full flex items-center justify-center gap-2 text-sm text-[var(--text-muted)] min-h-11 shrink-0"
                >
                  <RotateCcw className="w-4 h-4" />
                  {flipped ? "Show photo" : "View prompt"}
                </button>
              )}
            </>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
