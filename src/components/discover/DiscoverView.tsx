"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { LocateFixed, MapIcon, MapPin, List, Search } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { boardThemeVars, getBoardTheme } from "@/lib/boardThemes";
import { BoardThemePattern } from "@/components/board/BoardThemePattern";
import { useColorMode } from "@/providers/ColorModeProvider";
import { fetchBoardsNearby } from "@/lib/play/api";
import { nominatimProvider, type GeoPlace } from "@/lib/geo/provider";
import type { NearbyBoard } from "@/lib/types";

const RADIUS_M = 804.67; // 0.5 mi

const MapView = dynamic(() => import("@/components/map/MapView"), {
  ssr: false,
  loading: () => (
    <div className="grid h-full w-full place-items-center bg-[var(--bg-tile)] text-sm text-[var(--text-faint)]">
      Loading map…
    </div>
  ),
});

function formatDistance(m: number): string {
  if (m < 50) return "right here";
  const mi = m / 1609.34;
  return `${mi.toFixed(1)} mi away`;
}

export function DiscoverView() {
  const router = useRouter();
  const { mode } = useColorMode();

  const [center, setCenter] = useState<[number, number] | null>(null);
  const [boards, setBoards] = useState<NearbyBoard[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [view, setView] = useState<"list" | "map">("list");

  // Manual place search (fallback when geolocation is denied).
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<GeoPlace[]>([]);

  useEffect(() => {
    const q = query.trim();
    const ctrl = new AbortController();
    const timer = setTimeout(async () => {
      if (!q) {
        setResults([]);
        return;
      }
      try {
        setResults(await nominatimProvider.searchPlaces(q, ctrl.signal));
      } catch {
        // ignore
      }
    }, 400);
    return () => {
      clearTimeout(timer);
      ctrl.abort();
    };
  }, [query]);

  // Fetch nearby boards whenever the center changes.
  useEffect(() => {
    if (!center) return;
    const ctrl = { cancelled: false };
    (async () => {
      setLoading(true);
      const found = await fetchBoardsNearby(center[0], center[1], RADIUS_M);
      if (!ctrl.cancelled) {
        setBoards(found);
        setLoading(false);
      }
    })();
    return () => {
      ctrl.cancelled = true;
    };
  }, [center]);

  const useMyLocation = () => {
    if (!navigator.geolocation) {
      setError("Location isn't available. Search for a place instead.");
      return;
    }
    setError(null);
    setLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => setCenter([pos.coords.latitude, pos.coords.longitude]),
      () => {
        setLoading(false);
        setError("Location denied. Search for a place instead.");
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  if (!center) {
    return (
      <div className="mx-auto w-full max-w-md px-5 pb-16 pt-8">
        <h1 className="font-display text-2xl font-semibold">Discover</h1>
        <p className="mt-1 text-[var(--text-muted)]">
          Find public photo bingo boards within half a mile.
        </p>

        <Button size="lg" fullWidth className="mt-6" onClick={useMyLocation}>
          <LocateFixed size={18} />
          Use my location
        </Button>

        <div className="mt-6">
          <div className="relative">
            <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-faint)]">
              <Search size={16} />
            </span>
            <input
              className="input-rect pl-9"
              value={query}
              placeholder="Or search for a place"
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
          {results.length > 0 && (
            <ul className="mt-2 overflow-hidden rounded-[var(--radius-sm)] border border-[var(--border-soft)] bg-[var(--bg-surface)]">
              {results.map((r, i) => (
                <li key={`${r.lat}-${r.lng}-${i}`}>
                  <button
                    type="button"
                    onClick={() => setCenter([r.lat, r.lng])}
                    className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm hover:bg-[var(--bg-tile)]"
                  >
                    <MapPin size={14} className="shrink-0 text-[var(--text-muted)]" />
                    <span className="truncate">{r.label}</span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        {error && <p className="mt-4 text-sm text-[#c0563f]">{error}</p>}
      </div>
    );
  }

  return (
    <div className="mx-auto flex w-full max-w-md flex-1 flex-col px-5 pb-16 pt-6">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-semibold">Nearby</h1>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={useMyLocation}
            aria-label="Recenter on my location"
            className="grid h-9 w-9 place-items-center rounded-full text-[var(--text-muted)] hover:bg-[var(--bg-tile)]"
          >
            <LocateFixed size={18} />
          </button>
          <div className="inline-flex rounded-full border border-[var(--border-strong)] p-1">
            <button
              type="button"
              onClick={() => setView("list")}
              aria-label="List view"
              className={`grid h-7 w-8 place-items-center rounded-full ${view === "list" ? "bg-[var(--accent)] text-[var(--on-accent)]" : "text-[var(--text-muted)]"}`}
            >
              <List size={16} />
            </button>
            <button
              type="button"
              onClick={() => setView("map")}
              aria-label="Map view"
              className={`grid h-7 w-8 place-items-center rounded-full ${view === "map" ? "bg-[var(--accent)] text-[var(--on-accent)]" : "text-[var(--text-muted)]"}`}
            >
              <MapIcon size={16} />
            </button>
          </div>
        </div>
      </div>

      {loading ? (
        <p className="mt-10 text-center text-sm text-[var(--text-faint)]">
          Looking for boards nearby…
        </p>
      ) : boards.length === 0 ? (
        <p className="mt-10 text-center text-sm text-[var(--text-muted)]">
          No public boards within half a mile. Try another spot.
        </p>
      ) : view === "map" ? (
        <div className="mt-4 h-[60vh] overflow-hidden rounded-[var(--radius-lg)] border border-[var(--border-soft)]">
          <MapView
            center={center}
            zoom={15}
            radiusMeters={RADIUS_M}
            markers={boards.map((b) => ({
              id: b.id,
              lat: b.latitude,
              lng: b.longitude,
              label: b.title,
              onClick: () => router.push(`/play/${b.join_code}`),
            }))}
          />
        </div>
      ) : (
        <div className="mt-4 flex flex-col gap-3">
          {boards.map((b) => {
            const theme = getBoardTheme(b.theme_id);
            return (
              <button
                key={b.id}
                type="button"
                onClick={() => router.push(`/play/${b.join_code}`)}
                className="flex items-center gap-3 rounded-[var(--radius-lg)] border border-[var(--border-soft)] bg-[var(--bg-surface)] p-3 text-left shadow-[var(--shadow-sm)] transition-transform active:scale-[0.99]"
              >
                <span
                  className="relative h-14 w-14 shrink-0 overflow-hidden rounded-[var(--radius-sm)]"
                  style={{ ...boardThemeVars(theme.id, mode), background: "var(--board-bg)" }}
                >
                  <BoardThemePattern themeId={theme.id} columns={3} rows={3} opacity={0.45} />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate font-medium">{b.title}</span>
                  <span className="mt-0.5 block text-xs text-[var(--text-muted)]">
                    {b.location_label ? `${b.location_label} · ` : ""}
                    {formatDistance(b.distance_m)}
                  </span>
                </span>
                <span className="text-xs font-mono tracking-widest text-[var(--text-faint)]">
                  {b.join_code}
                </span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
