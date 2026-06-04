"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Compass, History, Loader2, Trophy } from "lucide-react";

const segmentClass =
  "min-h-11 min-w-11 flex items-center justify-center squircle hover:bg-black/5 transition-colors";

export function PlayBoardDock() {
  const router = useRouter();
  const [discovering, setDiscovering] = useState(false);

  const handleDiscover = () => {
    if (discovering) return;
    setDiscovering(true);
    router.push("/discover?auto=1");
  };

  return (
    <nav
      className="fixed inset-x-0 z-30 pointer-events-none flex justify-center px-4 bottom-[max(1rem,env(safe-area-inset-bottom))]"
      aria-label="Board library"
    >
      <div className="pointer-events-auto inline-flex items-center gap-1 p-1 squircle-lg bg-[var(--bg-tray)] border border-[var(--border-soft)] shadow-md">
        <Link
          href="/achievements"
          className={segmentClass}
          aria-label="Achievements"
        >
          <Trophy className="w-5 h-5 shrink-0" aria-hidden />
        </Link>

        <button
          type="button"
          onClick={handleDiscover}
          disabled={discovering}
          className={`${segmentClass} disabled:opacity-70`}
          aria-label="Discover nearby boards"
        >
          {discovering ? (
            <Loader2 className="w-5 h-5 animate-spin shrink-0" aria-hidden />
          ) : (
            <Compass className="w-5 h-5 shrink-0" aria-hidden />
          )}
        </button>

        <Link
          href="/history"
          className={segmentClass}
          aria-label="My past boards"
        >
          <History className="w-5 h-5 shrink-0" aria-hidden />
        </Link>
      </div>
    </nav>
  );
}
