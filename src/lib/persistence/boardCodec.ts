import {
  compressToEncodedURIComponent,
  decompressFromEncodedURIComponent,
} from "lz-string";
import type { BoardDefinition } from "../types";

const MAX_URL_LENGTH = 2000;

export function encodeBoardDefinition(def: BoardDefinition): string {
  const json = JSON.stringify(def);
  return compressToEncodedURIComponent(json);
}

export function decodeBoardDefinition(encoded: string): BoardDefinition | null {
  try {
    const json = decompressFromEncodedURIComponent(encoded);
    if (!json) return null;
    const parsed = JSON.parse(json) as BoardDefinition;
    if (!parsed.title || !parsed.tiles || !parsed.themeId) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function buildPlayUrl(def: BoardDefinition, origin?: string): string {
  const encoded = encodeBoardDefinition(def);
  const base = origin ?? (typeof window !== "undefined" ? window.location.origin : "");
  const url = `${base}/play?b=${encoded}`;
  if (url.length > MAX_URL_LENGTH) {
    throw new Error("Board too large for URL. Shorten prompts.");
  }
  return url;
}

export function getBoardIdFromEncoded(encoded: string): string {
  let hash = 0;
  for (let i = 0; i < encoded.length; i++) {
    hash = (hash << 5) - hash + encoded.charCodeAt(i);
    hash |= 0;
  }
  return `custom-${Math.abs(hash)}`;
}
