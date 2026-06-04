"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  createBoardFromDefinition,
  defaultBoard,
  DEFAULT_BOARD_ID,
} from "@/lib/defaultBoard";
import { getCompletionStatus, isBlackout } from "@/lib/bingo";
import {
  getBoard,
  getLocalBoardId,
  markCompleted,
  updateProgress,
} from "@/lib/cloud/boards";
import {
  decodeBoardDefinition,
  getBoardIdFromEncoded,
} from "@/lib/persistence/boardCodec";
import {
  blobToObjectUrl,
  clearBoardLocalProgress,
  createPhotoBlobId,
  deletePhotoBlob,
  getFreeSpaceTapCount,
  loadPhotoBlob,
  loadSession,
  savePhotoBlob,
  saveSession,
  setFreeSpaceTapCount,
  updateTileSession,
} from "@/lib/persistence/session";
import {
  buildFreeSpaceFields,
  getFreeSpaceMessage,
  canOpenCenterPhoto,
  shouldShowCenterUnlockVisuals,
  shouldShowGoobChallenge,
} from "@/lib/freeSpace";
import { useAuth } from "@/providers/AuthProvider";
import { processImageFile } from "@/lib/photo";
import type { Board, MarkupData, PlaySession, Tile } from "@/lib/types";

interface UseBoardStoreOptions {
  encodedBoard?: string | null;
  cloudBoardId?: string | null;
  readOnly?: boolean;
  /** One-time global #goob completed */
  globalGoobUnlocked?: boolean;
  onRequestFreeSpaceChallenge?: () => void;
}

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
    freeSpace: buildFreeSpaceFields(tapCount),
  };
}

async function mergeCloudIntoLocal(
  localBoardId: string,
  cloudSession: PlaySession
): Promise<void> {
  const local =
    (await loadSession(localBoardId)) ?? {
      boardId: localBoardId,
      tiles: {},
    };

  for (const [tileId, data] of Object.entries(cloudSession.tiles)) {
    if (!local.tiles[tileId]) {
      local.tiles[tileId] = data;
    }
  }

  await saveSession(local);
}

export function useBoardStore(options: UseBoardStoreOptions = {}) {
  const { user } = useAuth();
  const {
    encodedBoard,
    cloudBoardId,
    readOnly = false,
    globalGoobUnlocked = false,
    onRequestFreeSpaceChallenge,
  } = options;
  const [board, setBoard] = useState<Board>(() => ({
    ...defaultBoard,
    freeSpace: { tapCount: 0, state: "standard" },
  }));
  const [loading, setLoading] = useState(true);
  const [selectedTileId, setSelectedTileId] = useState<string | null>(null);
  const [freeSpaceMessage, setFreeSpaceMessage] = useState<string | null>(
    null
  );
  const [cardFlipped, setCardFlipped] = useState(false);
  const [isCloudOwner, setIsCloudOwner] = useState(false);
  const markedCompleteRef = useRef(false);

  const boardId = useMemo(() => {
    if (cloudBoardId) return getLocalBoardId(cloudBoardId);
    if (encodedBoard) return getBoardIdFromEncoded(encodedBoard);
    return DEFAULT_BOARD_ID;
  }, [encodedBoard, cloudBoardId]);

  const syncToCloud = useCallback(
    async (session: PlaySession) => {
      if (!cloudBoardId || !isCloudOwner) return;
      await updateProgress(cloudBoardId, session);
    },
    [cloudBoardId, isCloudOwner]
  );

  const hydrate = useCallback(
    async (isCancelled: () => boolean) => {
      if (isCancelled()) return;
      setLoading(true);
      markedCompleteRef.current = false;
      let baseBoard = defaultBoard;
      let owner = false;

      if (cloudBoardId) {
        const record = await getBoard(cloudBoardId);
        if (isCancelled()) return;
        if (record) {
          baseBoard = createBoardFromDefinition(
            record.definition,
            getLocalBoardId(cloudBoardId)
          );
          owner = user?.id === record.user_id;
          if (!isCancelled()) setIsCloudOwner(owner);
          if (record.progress?.tiles) {
            await mergeCloudIntoLocal(boardId, record.progress);
            if (isCancelled()) return;
          }
        }
      } else if (encodedBoard) {
        const def = decodeBoardDefinition(encodedBoard);
        if (isCancelled()) return;
        if (def) {
          baseBoard = createBoardFromDefinition(def, boardId);
        }
      } else {
        baseBoard = { ...defaultBoard, id: boardId };
      }

      const session = await loadSession(boardId);
      if (isCancelled()) return;

      const photoUrls: Record<string, string> = {};

      if (session) {
        for (const [tileId, data] of Object.entries(session.tiles)) {
          if (data.photoBlobId) {
            const blob = await loadPhotoBlob(data.photoBlobId);
            if (isCancelled()) return;
            if (blob) photoUrls[tileId] = await blobToObjectUrl(blob);
            if (isCancelled()) return;
          }
        }
      }

      const merged = mergeSessionIntoBoard(baseBoard, session, photoUrls);

      merged.freeSpace = buildFreeSpaceFields(getFreeSpaceTapCount(boardId));

      if (isCancelled()) return;
      setBoard(merged);
      setLoading(false);

      if (owner && session) {
        await syncToCloud(session);
      }
    },
    [encodedBoard, boardId, cloudBoardId, syncToCloud, user?.id]
  );

  useEffect(() => {
    let cancelled = false;
    const isCancelled = () => cancelled;
    // Board hydration loads IndexedDB + optional cloud record on mount/param change.
    // eslint-disable-next-line react-hooks/set-state-in-effect -- async load with cancellation
    void hydrate(isCancelled);
    return () => {
      cancelled = true;
    };
  }, [hydrate]);

  const completion = useMemo(
    () => getCompletionStatus(board.tiles, board.hasSecretCenter),
    [board.tiles, board.hasSecretCenter]
  );

  useEffect(() => {
    if (
      !cloudBoardId ||
      !isCloudOwner ||
      readOnly ||
      markedCompleteRef.current
    ) {
      return;
    }
    if (!isBlackout(board.tiles, board.hasSecretCenter)) return;

    markedCompleteRef.current = true;
    void markCompleted(cloudBoardId);
  }, [board.tiles, board.hasSecretCenter, cloudBoardId, isCloudOwner, readOnly]);

  const selectedTile = useMemo(
    () => board.tiles.find((t) => t.id === selectedTileId) ?? null,
    [board.tiles, selectedTileId]
  );

  const persistSession = useCallback(
    async (session: PlaySession) => {
      await syncToCloud(session);
    },
    [syncToCloud]
  );

  const completeTileWithPhoto = useCallback(
    async (tileId: string, file: File) => {
      if (readOnly) return;
      const blob = await processImageFile(file);
      const blobId = createPhotoBlobId(tileId);
      const oldSession = await loadSession(boardId);
      const oldBlobId = oldSession?.tiles[tileId]?.photoBlobId;
      if (oldBlobId) await deletePhotoBlob(oldBlobId);

      await savePhotoBlob(blobId, blob);
      const url = await blobToObjectUrl(blob);
      const completedAt = new Date().toISOString();

      const session = await updateTileSession(boardId, tileId, {
        photoBlobId: blobId,
        completedAt,
      });
      await persistSession(session);

      setBoard((prev) => ({
        ...prev,
        tiles: prev.tiles.map((t) =>
          t.id === tileId
            ? { ...t, photoUrl: url, completedAt, markupData: undefined }
            : t
        ),
      }));
    },
    [boardId, readOnly, persistSession]
  );

  const saveMarkup = useCallback(
    async (tileId: string, markupData: MarkupData) => {
      if (readOnly) return;
      const session = await updateTileSession(boardId, tileId, { markupData });
      await persistSession(session);
      setBoard((prev) => ({
        ...prev,
        tiles: prev.tiles.map((t) =>
          t.id === tileId ? { ...t, markupData } : t
        ),
      }));
    },
    [boardId, readOnly, persistSession]
  );

  const handleFreeSpaceTap = useCallback(() => {
    if (readOnly) return;

    const nextCount = board.freeSpace.tapCount + 1;
    setFreeSpaceTapCount(boardId, nextCount);
    const message = getFreeSpaceMessage(nextCount);
    setFreeSpaceMessage(message);

    setBoard((prev) => ({
      ...prev,
      freeSpace: buildFreeSpaceFields(nextCount),
    }));

    if (shouldShowGoobChallenge(board, globalGoobUnlocked, nextCount)) {
      onRequestFreeSpaceChallenge?.();
    }
  }, [board, boardId, globalGoobUnlocked, onRequestFreeSpaceChallenge, readOnly]);

  const openTile = useCallback(
    (tile: Tile) => {
      if (readOnly) {
        if (tile.photoUrl || tile.completedAt) {
          setSelectedTileId(tile.id);
          setCardFlipped(false);
        }
        return;
      }
      if (tile.isFreeSpace) {
        const tapCount = board.freeSpace.tapCount;
        if (shouldShowGoobChallenge(board, globalGoobUnlocked, tapCount)) {
          onRequestFreeSpaceChallenge?.();
          return;
        }
        if (canOpenCenterPhoto(tapCount)) {
          setSelectedTileId(tile.id);
          setCardFlipped(false);
          return;
        }
        handleFreeSpaceTap();
        return;
      }
      setSelectedTileId(tile.id);
      setCardFlipped(false);
    },
    [
      board,
      globalGoobUnlocked,
      handleFreeSpaceTap,
      onRequestFreeSpaceChallenge,
      readOnly,
    ]
  );

  const closeCard = useCallback(() => {
    setSelectedTileId(null);
    setCardFlipped(false);
  }, []);

  const resetBoard = useCallback(async () => {
    if (readOnly) return;

    await clearBoardLocalProgress(boardId);

    if (cloudBoardId && isCloudOwner) {
      await updateProgress(cloudBoardId, { boardId, tiles: {} });
    }

    closeCard();
    setFreeSpaceMessage(null);
    markedCompleteRef.current = false;

    await hydrate(() => false);
  }, [
    boardId,
    cloudBoardId,
    closeCard,
    hydrate,
    isCloudOwner,
    readOnly,
  ]);

  const isFreeSpaceGlitch = shouldShowCenterUnlockVisuals(
    board,
    globalGoobUnlocked,
    board.freeSpace.tapCount
  );

  return {
    board,
    setBoard,
    loading,
    completion,
    selectedTile,
    selectedTileId,
    openTile,
    closeCard,
    resetBoard,
    completeTileWithPhoto,
    saveMarkup,
    freeSpaceMessage,
    setFreeSpaceMessage,
    isFreeSpaceGlitch,
    cardFlipped,
    setCardFlipped,
    boardId,
    readOnly,
    isCloudOwner,
  };
}
