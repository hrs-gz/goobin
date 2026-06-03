"use client";

import Link from "next/link";
import { Menu, Moon, Share2, Sun } from "lucide-react";
import { GoobinLogo } from "./GoobinLogo";
import type { ColorMode } from "@/hooks/useTheme";

interface HeaderProps {
  onShare?: () => void;
  onToggleTheme: () => void;
  colorMode: ColorMode;
  showBuildLink?: boolean;
}

export function Header({
  onShare,
  onToggleTheme,
  colorMode,
  showBuildLink = true,
}: HeaderProps) {
  return (
    <header className="flex items-center justify-between px-4 py-4 w-full max-w-lg mx-auto">
      <Link href="/" className="min-h-11 flex items-center" aria-label="Home">
        <GoobinLogo size="md" />
      </Link>
      <div className="flex items-center gap-1">
        {showBuildLink && (
          <Link
            href="/build"
            className="min-h-11 min-w-11 flex items-center justify-center rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
            aria-label="Create board"
          >
            <Menu className="w-5 h-5" strokeWidth={2} />
          </Link>
        )}
        <button
          type="button"
          onClick={onToggleTheme}
          className="min-h-11 min-w-11 flex items-center justify-center rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
          aria-label="Toggle color mode"
        >
          {colorMode === "light" ? (
            <Moon className="w-5 h-5" strokeWidth={2} />
          ) : (
            <Sun className="w-5 h-5" strokeWidth={2} />
          )}
        </button>
        {onShare && (
          <button
            type="button"
            onClick={onShare}
            className="min-h-11 min-w-11 flex items-center justify-center rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
            aria-label="Share board"
          >
            <Share2 className="w-5 h-5" strokeWidth={2} />
          </button>
        )}
      </div>
    </header>
  );
}
