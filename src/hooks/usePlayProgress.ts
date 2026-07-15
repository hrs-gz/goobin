"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { centerIndex, countCompletedLines, isBlackout } from "@/lib/bingo";
import { processImageFile } from "@/lib/photo";
import {
  createPhotoBlobId,
  deletePhotoBlob,
  loadPhotoBlob,
  loadProgress,
  saveProgress,
  savePhotoBlob,
} from "@/lib/play/storage";
import type { BoardByCode, PlayProgress } from "@/lib/types";

export interface PlayProgressState {
  loading: boolean;
  /** Per-tile completion; the free-space center is always true. */
  completion: boolean[];
  /** Object URLs for photographed tiles, keyed by tile index. */
  photoUrls: Record<number, string>;
  lines: number;
  blackout: boolean;
  celebratedLines: number;
  celebratedBlackout: boolean;
  addPhoto: (index: number, file: File) => Promise<void>;
  removePhoto: (index: number) => Promise<void>;
  markCelebrated: (lines: number, blackout: boolean) => void;
}

export function usePlayProgress(board: BoardByCode): PlayProgressState {
  const code = board.join_code;
  const size = board.grid_size;
  const tileCount = size * size;
  const center = centerIndex(size);

  const [progress, setProgress] = useState<PlayProgress>({
    code,
    tiles: {},
    celebratedLines: 0,
    celebratedBlackout: false,
  });
  const [photoUrls, setPhotoUrls] = useState<Record<number, string>>({});
  const [loading, setLoading] = useState(true);
  const urlsRef = useRef<Record<number, string>>({});

  // Load persisted progress + revive object URLs on mount.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const stored = await loadProgress(code);
      const urls: Record<number, string> = {};
      for (const [key, tile] of Object.entries(stored.tiles)) {
        const blob = await loadPhotoBlob(tile.photoBlobId);
        if (blob) urls[Number(key)] = URL.createObjectURL(blob);
      }
      if (cancelled) {
        Object.values(urls).forEach((u) => URL.revokeObjectURL(u));
        return;
      }
      urlsRef.current = urls;
      setProgress(stored);
      setPhotoUrls(urls);
      setLoading(false);
    })();
    return () => {
      cancelled = true;
      Object.values(urlsRef.current).forEach((u) => URL.revokeObjectURL(u));
      urlsRef.current = {};
    };
  }, [code]);

  const completion = Array.from({ length: tileCount }, (_, i) =>
    i === center ? true : Boolean(progress.tiles[i])
  );
  const lines = countCompletedLines(completion, size);
  const blackout = isBlackout(completion);

  const addPhoto = useCallback(
    async (index: number, file: File) => {
      if (index === center) return;
      const blob = await processImageFile(file);
      const blobId = createPhotoBlobId(code, index);
      await savePhotoBlob(blobId, blob);
      const url = URL.createObjectURL(blob);

      setProgress((prev) => {
        const next: PlayProgress = {
          ...prev,
          tiles: {
            ...prev.tiles,
            [index]: { photoBlobId: blobId, completedAt: new Date().toISOString() },
          },
        };
        void saveProgress(next);
        return next;
      });
      setPhotoUrls((prev) => {
        const old = prev[index];
        if (old) URL.revokeObjectURL(old);
        const next = { ...prev, [index]: url };
        urlsRef.current = next;
        return next;
      });
    },
    [code, center]
  );

  const removePhoto = useCallback(
    async (index: number) => {
      const tile = progress.tiles[index];
      if (tile) await deletePhotoBlob(tile.photoBlobId);

      setProgress((prev) => {
        const tiles = { ...prev.tiles };
        delete tiles[index];
        const next: PlayProgress = { ...prev, tiles };
        void saveProgress(next);
        return next;
      });
      setPhotoUrls((prev) => {
        const old = prev[index];
        if (old) URL.revokeObjectURL(old);
        const next = { ...prev };
        delete next[index];
        urlsRef.current = next;
        return next;
      });
    },
    [progress.tiles]
  );

  const markCelebrated = useCallback((newLines: number, newBlackout: boolean) => {
    setProgress((prev) => {
      const celebratedLines = Math.max(prev.celebratedLines, newLines);
      const celebratedBlackout = prev.celebratedBlackout || newBlackout;
      if (
        celebratedLines === prev.celebratedLines &&
        celebratedBlackout === prev.celebratedBlackout
      ) {
        return prev;
      }
      const next: PlayProgress = { ...prev, celebratedLines, celebratedBlackout };
      void saveProgress(next);
      return next;
    });
  }, []);

  return {
    loading,
    completion,
    photoUrls,
    lines,
    blackout,
    celebratedLines: progress.celebratedLines,
    celebratedBlackout: progress.celebratedBlackout,
    addPhoto,
    removePhoto,
    markCelebrated,
  };
}
