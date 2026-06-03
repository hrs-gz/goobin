"use client";

import { AnimatePresence, motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface FreeSpaceToastProps {
  message: string | null;
  glitch?: boolean;
  onDismiss: () => void;
}

export function FreeSpaceToast({
  message,
  glitch = false,
  onDismiss,
}: FreeSpaceToastProps) {
  return (
    <AnimatePresence>
      {message && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 10 }}
          className="fixed bottom-8 left-4 right-4 z-40 mx-auto max-w-sm"
        >
          <button
            type="button"
            onClick={onDismiss}
            className={cn(
              "w-full p-4 squircle text-left text-sm shadow-lg",
              "bg-[var(--bg-tile)] border border-[var(--border-soft)]",
              glitch && "glitch-active font-mono text-xs"
            )}
          >
            {message}
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
