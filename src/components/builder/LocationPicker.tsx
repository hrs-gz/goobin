"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { LocateFixed, MapPin, Search, X } from "lucide-react";
import { nominatimProvider, type GeoPlace } from "@/lib/geo/provider";
import type { BoardLocation } from "@/lib/types";

const MapView = dynamic(() => import("@/components/map/MapView"), {
  ssr: false,
  loading: () => (
    <div className="grid h-full w-full place-items-center bg-[var(--bg-tile)] text-sm text-[var(--text-faint)]">
      Loading map…
    </div>
  ),
});

interface LocationPickerProps {
  value: BoardLocation | null;
  onChange: (value: BoardLocation | null) => void;
}

export function LocationPicker({ value, onChange }: LocationPickerProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<GeoPlace[]>([]);
  const [searching, setSearching] = useState(false);
  const [geoLoading, setGeoLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Debounced Nominatim search (setState only inside async callbacks).
  useEffect(() => {
    const q = query.trim();
    const ctrl = new AbortController();
    const timer = setTimeout(async () => {
      if (!q) {
        setResults([]);
        return;
      }
      setSearching(true);
      try {
        const places = await nominatimProvider.searchPlaces(q, ctrl.signal);
        setResults(places);
      } catch {
        // aborted or offline
      } finally {
        setSearching(false);
      }
    }, 400);
    return () => {
      clearTimeout(timer);
      ctrl.abort();
    };
  }, [query]);

  const pick = (place: GeoPlace) => {
    onChange(place);
    setQuery("");
    setResults([]);
  };

  const useMyLocation = () => {
    if (!navigator.geolocation) {
      setError("Location isn't available on this device.");
      return;
    }
    setError(null);
    setGeoLoading(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        const place = await nominatimProvider.reverseGeocode(latitude, longitude);
        onChange(place ?? { label: "My location", lat: latitude, lng: longitude });
        setGeoLoading(false);
      },
      () => {
        setGeoLoading(false);
        setError("Couldn't get your location. Search for a place instead.");
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <span className="text-sm font-medium">
          Location <span className="text-[var(--text-faint)]">(optional)</span>
        </span>
        <button
          type="button"
          onClick={useMyLocation}
          disabled={geoLoading}
          className="inline-flex items-center gap-1.5 rounded-full px-2 py-1 text-xs font-medium text-[var(--accent-strong)] disabled:opacity-50"
        >
          <LocateFixed size={14} />
          {geoLoading ? "Locating…" : "Use my location"}
        </button>
      </div>

      {value ? (
        <div>
          <div className="flex items-center gap-2 rounded-[var(--radius-sm)] border border-[var(--border-soft)] bg-[var(--bg-surface)] px-3 py-2">
            <MapPin size={16} className="shrink-0 text-[var(--accent-strong)]" />
            <span className="min-w-0 flex-1 truncate text-sm">{value.label}</span>
            <button
              type="button"
              aria-label="Remove location"
              onClick={() => onChange(null)}
              className="grid h-7 w-7 place-items-center rounded-full text-[var(--text-muted)] hover:bg-[var(--bg-tile)]"
            >
              <X size={15} />
            </button>
          </div>
          <div className="mt-2 h-44 overflow-hidden rounded-[var(--radius-md)] border border-[var(--border-soft)]">
            <MapView
              center={[value.lat, value.lng]}
              zoom={15}
              draggablePin
              onPinMove={(lat, lng) => onChange({ ...value, lat, lng })}
            />
          </div>
          <p className="mt-1.5 text-xs text-[var(--text-faint)]">
            Drag the pin to fine-tune. A location lets you list the board on
            Discover.
          </p>
        </div>
      ) : (
        <div className="relative">
          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-faint)]">
            <Search size={16} />
          </span>
          <input
            className="input-rect pl-9"
            value={query}
            placeholder="Search for a place"
            onChange={(e) => setQuery(e.target.value)}
          />
          {(results.length > 0 || searching) && (
            <ul className="mt-2 overflow-hidden rounded-[var(--radius-sm)] border border-[var(--border-soft)] bg-[var(--bg-surface)]">
              {searching && results.length === 0 && (
                <li className="px-3 py-2 text-sm text-[var(--text-faint)]">
                  Searching…
                </li>
              )}
              {results.map((r, i) => (
                <li key={`${r.lat}-${r.lng}-${i}`}>
                  <button
                    type="button"
                    onClick={() => pick(r)}
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
      )}

      {error && <p className="mt-2 text-xs text-[#c0563f]">{error}</p>}
    </div>
  );
}
