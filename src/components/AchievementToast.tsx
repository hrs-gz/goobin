"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Trophy, X } from "lucide-react";
import type { AchievementDefinition } from "@/lib/achievements/catalog";

interface AchievementToastProps {
  achievement: AchievementDefinition | null;
  onDismiss: () => void;
}

export function AchievementToast({
  achievement,
  onDismiss,
}: AchievementToastProps) {
  return (
    <AnimatePresence>
      {achievement && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 10 }}
          className="fixed top-20 left-4 right-4 z-[60] mx-auto max-w-sm pointer-events-auto"
          role="status"
        >
          <div className="w-full p-4 squircle shadow-lg bg-[var(--bg-tile)] border-2 border-[var(--accent)] flex gap-3 items-start">
            <span className="text-2xl shrink-0" aria-hidden>
              {achievement.icon ?? "🏆"}
            </span>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-[var(--accent)] uppercase tracking-wide">
                Achievement unlocked
              </p>
              <p className="font-display font-semibold">{achievement.title}</p>
              <p className="text-sm text-[var(--text-muted)] mt-0.5">
                {achievement.description}
              </p>
            </div>
            <button
              type="button"
              onClick={onDismiss}
              className="min-h-8 min-w-8 flex items-center justify-center rounded-full hover:bg-black/5 shrink-0"
              aria-label="Dismiss"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
