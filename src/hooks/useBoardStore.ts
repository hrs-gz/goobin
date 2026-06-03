"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  createBoardFromDefinition,
  defaultBoard,
  DEFAULT_BOARD_ID,
} from "@/lib/defaultBoard";
import { getCompletionStatus } from "@/lib/bingo";
import {
  getFreeSpaceMessage,
  getFreeSpaceState,
  shouldGlitch,
} from "@/lib/freeSpace";
import {
  decodeBoardDefinition,
  getBoardIdFromEncoded,
} from "@/lib/persistence/boardCodec";
import {
  blobToObjectUrl,
  createPhotoBlobId,
  deletePhotoBlob,
  getFreeSpaceTapCount,
  loadPhotoBlob,
  loadSession,
  savePhotoBlob,
  setFreeSpaceTapCount,
  updateTileSession,
} from "@/lib/persistence/session";
import { processImageFile } from "@/lib/photo";
import type { Board, MarkupData, Tile } from "@/lib/types";

function mergeSessionIntoBoard(
  board: Board,
  session: Awaited<ReturnType<typeof loadSession>>,
  photoUrls: Record<string, string>
): Board {
  if (!session) return board;

  const tiles = board.tiles.map((tile) => {
    const data = session.tiles[tile.id];
    if (!data) return tile;
    return {
      ...tile,
      photoUrl: photoUrls[tile.id] ?? tile.photoUrl,
      markupData: data.markupData,
      completedAt: data.completedAt,
    };
  });

  const tapCount = getFreeSpaceTapCount(board.id);
  return {
    ...board,
    tiles,
    freeSpace: {
      tapCount,
      state: getFreeSpaceState(tapCount),
      secretClue: tapCount >= 21 ? getFreeSpaceMessage(tapCount) : undefined,
    },
  };
}

export function useBoardStore(encodedBoard?: string | null) {
  const [board, setBoard] = useState<Board>(defaultBoard);
  const [loading, setLoading] = useState(true);
  const [selectedTileId, setSelectedTileId] = useState<string | null>(null);
  const [freeSpaceMessage, setFreeSpaceMessage] = useState<string | null>(null);
  const [cardFlipped, setCardFlipped] = useState(false);

  const boardId = useMemo(() => {
    if (encodedBoard) return getBoardIdFromEncoded(encodedBoard);
    return DEFAULT_BOARD_ID;
  }, [encodedBoard]);

  const hydrate = useCallback(async () => {
    setLoading(true);
    let baseBoard = defaultBoard;

    if (encodedBoard) {
      const def = decodeBoardDefinition(encodedBoard);
      if (def) {
        baseBoard = createBoardFromDefinition(def, boardId);
      }
    } else {
      baseBoard = { ...defaultBoard, id: boardId };
    }

    const session = await loadSession(boardId);
    const photoUrls: Record<string, string> = {};

    if (session) {
      for (const [tileId, data] of Object.entries(session.tiles)) {
        if (data.photoBlobId) {
          const blob = await loadPhotoBlob(data.photoBlobId);
          if (blob) photoUrls[tileId] = await blobToObjectUrl(blob);
        }
      }
    }

    const tapCount = getFreeSpaceTapCount(boardId);
    const merged = mergeSessionIntoBoard(baseBoard, session, photoUrls);

    if (tapCount > 0) {
      merged.freeSpace = {
        tapCount,
        state: getFreeSpaceState(tapCount),
        secretClue: tapCount >= 21 ? getFreeSpaceMessage(tapCount) : undefined,
      };
    }

    setBoard(merged);
    setLoading(false);
  }, [encodedBoard, boardId]);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      await hydrate();
      if (cancelled) return;
    })();
    return () => {
      cancelled = true;
    };
  }, [hydrate]);

  const completion = useMemo(
    () => getCompletionStatus(board.tiles),
    [board.tiles]
  );

  const selectedTile = useMemo(
    () => board.tiles.find((t) => t.id === selectedTileId) ?? null,
    [board.tiles, selectedTileId]
  );

  const completeTileWithPhoto = useCallback(
    async (tileId: string, file: File) => {
      const blob = await processImageFile(file);
      const blobId = createPhotoBlobId(tileId);
      const oldSession = await loadSession(boardId);
      const oldBlobId = oldSession?.tiles[tileId]?.photoBlobId;
      if (oldBlobId) await deletePhotoBlob(oldBlobId);

      await savePhotoBlob(blobId, blob);
      const url = await blobToObjectUrl(blob);
      const completedAt = new Date().toISOString();

      await updateTileSession(boardId, tileId, {
        photoBlobId: blobId,
        completedAt,
      });

      setBoard((prev) => ({
        ...prev,
        tiles: prev.tiles.map((t) =>
          t.id === tileId
            ? { ...t, photoUrl: url, completedAt, markupData: undefined }
            : t
        ),
      }));
    },
    [boardId]
  );

  const saveMarkup = useCallback(
    async (tileId: string, markupData: MarkupData) => {
      await updateTileSession(boardId, tileId, { markupData });
      setBoard((prev) => ({
        ...prev,
        tiles: prev.tiles.map((t) =>
          t.id === tileId ? { ...t, markupData } : t
        ),
      }));
    },
    [boardId]
  );

  const handleFreeSpaceTap = useCallback(async () => {
    const tile = board.tiles.find((t) => t.isFreeSpace);
    if (!tile) return;

    const nextCount = board.freeSpace.tapCount + 1;
    setFreeSpaceTapCount(boardId, nextCount);
    const message = getFreeSpaceMessage(nextCount);
    setFreeSpaceMessage(message);

    const completedAt = new Date().toISOString();
    await updateTileSession(boardId, tile.id, {
      completedAt,
      freeSpaceCompleted: true,
    });

    setBoard((prev) => ({
      ...prev,
      freeSpace: {
        tapCount: nextCount,
        state: getFreeSpaceState(nextCount),
        secretClue: nextCount >= 21 ? message : undefined,
      },
      tiles: prev.tiles.map((t) =>
        t.isFreeSpace ? { ...t, completedAt } : t
      ),
    }));
  }, [board.freeSpace.tapCount, board.tiles, boardId]);

  const openTile = useCallback(
    (tile: Tile) => {
      if (tile.isFreeSpace) {
        handleFreeSpaceTap();
        return;
      }
      setSelectedTileId(tile.id);
      setCardFlipped(false);
    },
    [handleFreeSpaceTap]
  );

  const closeCard = useCallback(() => {
    setSelectedTileId(null);
    setCardFlipped(false);
  }, []);

  const isFreeSpaceGlitch = shouldGlitch(board.freeSpace.tapCount);

  return {
    board,
    setBoard,
    loading,
    completion,
    selectedTile,
    selectedTileId,
    openTile,
    closeCard,
    completeTileWithPhoto,
    saveMarkup,
    freeSpaceMessage,
    setFreeSpaceMessage,
    isFreeSpaceGlitch,
    cardFlipped,
    setCardFlipped,
    boardId,
  };
}
