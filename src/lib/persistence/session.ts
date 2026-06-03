import { get, set, del, createStore } from "idb-keyval";
import type { PlaySession, TileSessionData } from "../types";

const sessionStore = createStore("goobin-sessions", "sessions");
const photoStore = createStore("goobin-photos", "photos");

const FREE_SPACE_KEY_PREFIX = "goobin-free-space-";

export async function loadSession(boardId: string): Promise<PlaySession | null> {
  return (await get(boardId, sessionStore)) ?? null;
}

export async function saveSession(session: PlaySession): Promise<void> {
  await set(session.boardId, session, sessionStore);
}

export async function savePhotoBlob(
  blobId: string,
  blob: Blob
): Promise<void> {
  await set(blobId, blob, photoStore);
}

export async function loadPhotoBlob(blobId: string): Promise<Blob | null> {
  return (await get(blobId, photoStore)) ?? null;
}

export async function deletePhotoBlob(blobId: string): Promise<void> {
  await del(blobId, photoStore);
}

export function createPhotoBlobId(tileId: string): string {
  return `photo-${tileId}-${Date.now()}`;
}

export async function updateTileSession(
  boardId: string,
  tileId: string,
  data: Partial<TileSessionData>
): Promise<PlaySession> {
  const existing = (await loadSession(boardId)) ?? {
    boardId,
    tiles: {},
  };

  existing.tiles[tileId] = {
    ...existing.tiles[tileId],
    ...data,
  };

  await saveSession(existing);
  return existing;
}

export function getFreeSpaceTapCount(boardId: string): number {
  if (typeof window === "undefined") return 0;
  const raw = localStorage.getItem(`${FREE_SPACE_KEY_PREFIX}${boardId}`);
  return raw ? parseInt(raw, 10) : 0;
}

export function setFreeSpaceTapCount(boardId: string, count: number): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(`${FREE_SPACE_KEY_PREFIX}${boardId}`, String(count));
}

export async function blobToObjectUrl(blob: Blob): Promise<string> {
  return URL.createObjectURL(blob);
}
