"use client";

import Link from "next/link";
import { Menu, Share2 } from "lucide-react";
import { GoobinLogo } from "./GoobinLogo";

interface HeaderProps {
  onShare?: () => void;
  onOpenMenu: () => void;
}

export function Header({ onShare, onOpenMenu }: HeaderProps) {
  return (
    <header className="flex items-center justify-between px-4 py-4 w-full max-w-lg mx-auto">
      <Link href="/" className="min-h-11 flex items-center" aria-label="Home">
        <GoobinLogo size="md" />
      </Link>
      <div className="flex items-center gap-1">
        <button
          type="button"
          onClick={onOpenMenu}
          className="min-h-11 min-w-11 flex items-center justify-center rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
          aria-label="Open menu"
        >
          <Menu className="w-5 h-5" strokeWidth={2} />
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
