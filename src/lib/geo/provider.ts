import type { BoardLocation } from "@/lib/types";

export type GeoPlace = BoardLocation;

/** Pluggable geocoding interface — swap Nominatim for Google Maps later. */
export interface GeoProvider {
  searchPlaces(query: string, signal?: AbortSignal): Promise<GeoPlace[]>;
  reverseGeocode(
    lat: number,
    lng: number,
    signal?: AbortSignal
  ): Promise<GeoPlace | null>;
}

const NOMINATIM = "https://nominatim.openstreetmap.org";

interface NominatimResult {
  display_name: string;
  lat: string;
  lon: string;
  name?: string;
}

function toLabel(r: NominatimResult): string {
  // Prefer a short leading name; fall back to first two comma-parts.
  if (r.name) return r.name;
  const parts = r.display_name.split(",").map((p) => p.trim());
  return parts.slice(0, 2).join(", ");
}

/**
 * OpenStreetMap Nominatim provider. No API key required.
 * (Browsers set Referer automatically, satisfying the usage policy.)
 */
export const nominatimProvider: GeoProvider = {
  async searchPlaces(query, signal) {
    const q = query.trim();
    if (!q) return [];
    const url = `${NOMINATIM}/search?format=jsonv2&addressdetails=0&limit=6&q=${encodeURIComponent(q)}`;
    const res = await fetch(url, {
      signal,
      headers: { Accept: "application/json" },
    });
    if (!res.ok) return [];
    const data = (await res.json()) as NominatimResult[];
    return data.map((r) => ({
      label: toLabel(r),
      lat: Number(r.lat),
      lng: Number(r.lon),
    }));
  },

  async reverseGeocode(lat, lng, signal) {
    const url = `${NOMINATIM}/reverse?format=jsonv2&lat=${lat}&lon=${lng}`;
    const res = await fetch(url, {
      signal,
      headers: { Accept: "application/json" },
    });
    if (!res.ok) return null;
    const r = (await res.json()) as NominatimResult;
    if (!r?.lat) return null;
    return { label: toLabel(r), lat: Number(r.lat), lng: Number(r.lon) };
  },
};
