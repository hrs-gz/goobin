"use client";

import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import { useState } from "react";
import { Moon, RotateCcw, Sun, X } from "lucide-react";
import { useAuth } from "@/providers/AuthProvider";
import type { ColorMode } from "@/hooks/useTheme";
import type { ThemeId } from "@/lib/types";
import { ThemePillPicker } from "./ThemePillPicker";

interface AppMenuProps {
  open: boolean;
  onClose: () => void;
  colorMode: ColorMode;
  onToggleColorMode: () => void;
  themeId: ThemeId;
  onThemeChange: (theme: ThemeId) => void;
  showBuildLink?: boolean;
  onResetBoard?: () => void | Promise<void>;
}

export function AppMenu({
  open,
  onClose,
  colorMode,
  onToggleColorMode,
  themeId,
  onThemeChange,
  showBuildLink = true,
  onResetBoard,
}: AppMenuProps) {
  const { user, loading: authLoading, signOut } = useAuth();
  const [resetting, setResetting] = useState(false);

  const handleResetBoard = async () => {
    if (!onResetBoard || resetting) return;
    const confirmed = window.confirm(
      "Clear all photos and progress for this board on this device? This cannot be undone."
    );
    if (!confirmed) return;
    setResetting(true);
    try {
      await onResetBoard();
      onClose();
    } finally {
      setResetting(false);
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.button
            type="button"
            className="fixed inset-0 z-40 bg-black/40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            aria-label="Close menu"
          />
          <motion.aside
            className="fixed top-0 right-0 z-50 h-full w-[min(100%,320px)] bg-[var(--bg-page)] border-l border-[var(--border-soft)] shadow-2xl flex flex-col"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 400, damping: 35 }}
            aria-label="Menu"
          >
            <div className="flex items-center justify-between px-4 py-4 border-b border-[var(--border-soft)]">
              <span className="font-display font-semibold">Menu</span>
              <button
                type="button"
                onClick={onClose}
                className="min-h-11 min-w-11 flex items-center justify-center rounded-full hover:bg-black/5"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <nav className="flex flex-col gap-1 p-4">
              <Link
                href="/"
                onClick={onClose}
                className="min-h-11 px-4 flex items-center rounded-full hover:bg-black/5 font-medium"
              >
                Play demo
              </Link>
              {showBuildLink && (
                <Link
                  href="/build"
                  onClick={onClose}
                  className="min-h-11 px-4 flex items-center rounded-full hover:bg-black/5 font-medium"
                >
                  Create board
                </Link>
              )}
              <Link
                href="/achievements"
                onClick={onClose}
                className="min-h-11 px-4 flex items-center rounded-full hover:bg-black/5 font-medium"
              >
                Achievements
              </Link>
              <Link
                href="/history"
                onClick={onClose}
                className="min-h-11 px-4 flex items-center rounded-full hover:bg-black/5 font-medium"
              >
                History
              </Link>
              <Link
                href="/discover"
                onClick={onClose}
                className="min-h-11 px-4 flex items-center rounded-full hover:bg-black/5 font-medium"
              >
                Discover
              </Link>
              {onResetBoard && (
                <button
                  type="button"
                  onClick={() => void handleResetBoard()}
                  disabled={resetting}
                  className="min-h-11 px-4 flex items-center gap-2 rounded-full hover:bg-black/5 font-medium text-left text-red-600 disabled:opacity-50"
                >
                  <RotateCcw className="w-4 h-4 shrink-0" aria-hidden />
                  {resetting ? "Resetting..." : "Reset board"}
                </button>
              )}
              {!authLoading && (
                user ? (
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      void signOut();
                    }}
                    className="min-h-11 px-4 flex items-center rounded-full hover:bg-black/5 font-medium text-left"
                  >
                    Sign out
                  </button>
                ) : (
                  <Link
                    href="/login"
                    onClick={onClose}
                    className="min-h-11 px-4 flex items-center rounded-full hover:bg-black/5 font-medium"
                  >
                    Sign in
                  </Link>
                )
              )}
            </nav>

            <div className="px-4 pt-2 pb-4 space-y-6 flex-1 overflow-y-auto">
              <div>
                <p className="text-sm font-medium mb-3">Appearance</p>
                <button
                  type="button"
                  onClick={onToggleColorMode}
                  className="w-full min-h-11 px-4 flex items-center gap-3 rounded-full border border-[var(--border-soft)] hover:bg-black/5"
                >
                  {colorMode === "light" ? (
                    <Moon className="w-5 h-5" />
                  ) : (
                    <Sun className="w-5 h-5" />
                  )}
                  <span className="text-sm font-medium">
                    {colorMode === "light" ? "Dark mode" : "Light mode"}
                  </span>
                </button>
              </div>

              <div className="overflow-visible">
                <p className="text-sm font-medium mb-3">Accent theme</p>
                <ThemePillPicker value={themeId} onChange={onThemeChange} />
              </div>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
