"use client";

import Link from "next/link";
import { Moon, Sun } from "lucide-react";
import { GoobinLogo } from "@/components/GoobinLogo";
import { useAuth } from "@/providers/AuthProvider";
import { useColorMode } from "@/providers/ColorModeProvider";
import { cn } from "@/lib/utils";

interface AppHeaderProps {
  /** Constrain to a centered column (default true). */
  contained?: boolean;
  className?: string;
}

export function AppHeader({ contained = true, className }: AppHeaderProps) {
  const { user, loading } = useAuth();
  const { mode, toggle } = useColorMode();

  return (
    <header
      className={cn(
        "w-full border-b border-[var(--border-soft)] bg-[var(--bg-page)]/80 backdrop-blur",
        "sticky top-0 z-30",
        className
      )}
    >
      <div
        className={cn(
          "flex items-center justify-between h-14 px-4",
          contained && "mx-auto w-full max-w-md"
        )}
      >
        <Link href="/" aria-label="goobin home" className="flex items-center">
          <GoobinLogo size="md" />
        </Link>
        <nav className="flex items-center gap-1 text-sm">
          <Link
            href="/discover"
            className="px-3 py-1.5 rounded-full text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-tile)] transition-colors"
          >
            Discover
          </Link>
          {!loading &&
            (user ? (
              <Link
                href="/boards"
                className="px-3 py-1.5 rounded-full text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-tile)] transition-colors"
              >
                My boards
              </Link>
            ) : (
              <Link
                href="/login"
                className="px-3 py-1.5 rounded-full text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-tile)] transition-colors"
              >
                Sign in
              </Link>
            ))}
          <button
            type="button"
            onClick={toggle}
            aria-label={mode === "dark" ? "Switch to light mode" : "Switch to dark mode"}
            className="ml-1 grid place-items-center h-9 w-9 rounded-full text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-tile)] transition-colors"
          >
            {mode === "dark" ? <Sun size={18} /> : <Moon size={18} />}
          </button>
        </nav>
      </div>
    </header>
  );
}
