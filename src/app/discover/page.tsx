"use client";

import { Suspense, useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { AppShell } from "@/components/AppShell";
import { BoardLibraryCard } from "@/components/BoardLibraryCard";
import { useAuth } from "@/providers/AuthProvider";
import { discoverNearby } from "@/lib/cloud/boards";
import type { DiscoverBoard } from "@/lib/cloud/boards";

function DiscoverPageContent() {
  const searchParams = useSearchParams();
  const autoSearch = searchParams.get("auto") === "1";
  const autoRan = useRef(false);
  const mountedRef = useRef(true);

  const { user, loading: authLoading } = useAuth();
  const [boards, setBoards] = useState<DiscoverBoard[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searched, setSearched] = useState(false);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const searchNearby = useCallback(async () => {
    setError(null);
    setLoading(true);
    setSearched(true);

    if (!navigator.geolocation) {
      setError("Geolocation is not supported in this browser.");
      setLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const list = await discoverNearby(
          pos.coords.latitude,
          pos.coords.longitude,
          25
        );
        if (!mountedRef.current) return;
        setBoards(list);
        setLoading(false);
      },
      () => {
        if (!mountedRef.current) return;
        setError("Location permission denied. Enable location to discover boards.");
        setLoading(false);
      },
      { enableHighAccuracy: true, timeout: 15000 }
    );
  }, []);

  useEffect(() => {
    if (!autoSearch || autoRan.current || authLoading || !user) return;
    autoRan.current = true;
    void searchNearby();
  }, [autoSearch, authLoading, user, searchNearby]);

  if (authLoading) {
    return (
      <AppShell>
        <p className="text-[var(--text-muted)]">Loading...</p>
      </AppShell>
    );
  }

  if (!user) {
    return (
      <AppShell>
        <div className="w-full max-w-lg text-center space-y-4 py-12">
          <h1 className="font-display text-2xl font-semibold">Discover</h1>
          <p className="text-sm text-[var(--text-muted)]">
            Sign in to find public boards near you.
          </p>
          <Link
            href="/login"
            className="inline-block py-3 px-6 squircle bg-[var(--accent)] text-white font-medium"
          >
            Sign in
          </Link>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell title="Discover">
      <div className="w-full max-w-lg space-y-6">
        <p className="text-sm text-[var(--text-muted)]">
          Public boards shared within about 25 km of your location.
        </p>
        <button
          type="button"
          onClick={searchNearby}
          disabled={loading}
          className="w-full py-3 squircle bg-[var(--accent)] text-white font-medium disabled:opacity-50"
        >
          {loading ? "Finding boards..." : "Use my location"}
        </button>
        {error && <p className="text-sm text-red-500">{error}</p>}
        {searched && !loading && boards.length === 0 && !error && (
          <p className="text-sm text-[var(--text-muted)]">
            No public boards nearby. Save a board as public with location from
            the builder.
          </p>
        )}
        <div className="space-y-3">
          {boards.map((board) => (
            <BoardLibraryCard
              key={board.id}
              board={board}
              distanceKm={board.distanceKm}
            />
          ))}
        </div>
      </div>
    </AppShell>
  );
}

export default function DiscoverPage() {
  return (
    <Suspense
      fallback={
        <AppShell>
          <p className="text-[var(--text-muted)]">Loading...</p>
        </AppShell>
      }
    >
      <DiscoverPageContent />
    </Suspense>
  );
}
