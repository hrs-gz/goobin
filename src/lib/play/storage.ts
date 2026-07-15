import { createStore, del, get, set } from "idb-keyval";
import type { PlayProgress } from "../types";

// Progress + photos live only on-device (spec: photos never leave the client).
const sessionStore = createStore("goobin-sessions", "sessions");
const photoStore = createStore("goobin-photos", "photos");

function emptyProgress(code: string): PlayProgress {
  return { code, tiles: {}, celebratedLines: 0, celebratedBlackout: false };
}

export async function loadProgress(code: string): Promise<PlayProgress> {
  const stored = (await get<PlayProgress>(code, sessionStore)) ?? null;
  return stored ?? emptyProgress(code);
}

export async function saveProgress(progress: PlayProgress): Promise<void> {
  await set(progress.code, progress, sessionStore);
}

export async function savePhotoBlob(blobId: string, blob: Blob): Promise<void> {
  await set(blobId, blob, photoStore);
}

export async function loadPhotoBlob(blobId: string): Promise<Blob | null> {
  return (await get<Blob>(blobId, photoStore)) ?? null;
}

export async function deletePhotoBlob(blobId: string): Promise<void> {
  await del(blobId, photoStore);
}

export function createPhotoBlobId(code: string, index: number): string {
  return `photo-${code}-${index}-${Date.now()}`;
}

/** Remove all on-device progress + photos for a board. */
export async function clearProgress(code: string): Promise<void> {
  const progress = (await get<PlayProgress>(code, sessionStore)) ?? null;
  if (progress) {
    for (const tile of Object.values(progress.tiles)) {
      if (tile.photoBlobId) await deletePhotoBlob(tile.photoBlobId);
    }
  }
  await del(code, sessionStore);
}
