"use client";

import { motion } from "framer-motion";
import type { BorderTier } from "@/lib/types";
import { cn } from "@/lib/utils";

interface CompletionBorderProps {
  tier: BorderTier;
  children: React.ReactNode;
  className?: string;
}

export function CompletionBorder({
  tier,
  children,
  className,
}: CompletionBorderProps) {
  const borderClass = cn(
    "relative transition-all duration-400 squircle w-full",
    tier === "standard" && "p-0",
    tier === "dualTone" &&
      "p-1 ring-[3px] ring-[var(--accent)] ring-offset-0",
    tier === "goldBlackout" && "p-1",
    className
  );

  return (
    <motion.div
      className={borderClass}
      initial={tier === "dualTone" ? { opacity: 0.85 } : false}
      animate={{ opacity: 1 }}
      style={
        tier === "goldBlackout"
          ? {
              boxShadow: `0 0 0 4px transparent, 0 0 24px rgba(255, 215, 0, 0.4)`,
              background:
                "linear-gradient(var(--bg-tray), var(--bg-tray)) padding-box, linear-gradient(135deg, var(--gold-start), var(--gold-end)) border-box",
              border: "4px solid transparent",
            }
          : tier === "dualTone"
            ? {
                animation: "borderShine 2s ease-in-out infinite",
              }
            : undefined
      }
    >
      {children}
    </motion.div>
  );
}
