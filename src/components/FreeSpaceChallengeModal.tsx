"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Share2, X } from "lucide-react";
import { GOOB_CHALLENGE_COPY, GOOB_SHARE_TEXT } from "@/lib/freeSpace";

interface FreeSpaceChallengeModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export function FreeSpaceChallengeModal({
  open,
  onClose,
  onConfirm,
}: FreeSpaceChallengeModalProps) {
  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ text: GOOB_SHARE_TEXT });
      } catch {
        /* user cancelled */
      }
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.button
            type="button"
            className="fixed inset-0 z-50 bg-black/50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            aria-label="Close"
          />
          <motion.div
            className="fixed inset-x-4 top-[max(20%,8rem)] z-50 mx-auto max-w-sm squircle-lg p-6 bg-[var(--bg-page)] border border-[var(--border-soft)] shadow-2xl space-y-4"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            role="dialog"
            aria-labelledby="free-space-challenge-title"
          >
            <div className="flex justify-between items-start gap-2">
              <h2
                id="free-space-challenge-title"
                className="font-display text-lg font-semibold"
              >
                Unlock free space
              </h2>
              <button
                type="button"
                onClick={onClose}
                className="min-h-10 min-w-10 flex items-center justify-center rounded-full hover:bg-black/5"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-sm text-[var(--text-muted)]">
              You reached 21 center taps on this board. {GOOB_CHALLENGE_COPY}
            </p>
            <p className="text-sm text-[var(--text-muted)]">
              This one-time account unlock does not skip the 21-tap ritual on
              other boards — each board still needs its own center taps for a
              photo.
            </p>
            {typeof navigator !== "undefined" && "share" in navigator && (
              <button
                type="button"
                onClick={handleShare}
                className="w-full py-2.5 squircle border border-[var(--border-soft)] flex items-center justify-center gap-2 text-sm font-medium"
              >
                <Share2 className="w-4 h-4" />
                Share #goob
              </button>
            )}
            <button
              type="button"
              onClick={onConfirm}
              className="w-full py-3 squircle bg-[var(--accent)] text-white font-medium"
            >
              I&apos;ve posted
            </button>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
