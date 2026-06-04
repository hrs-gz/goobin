"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { AppShell } from "./AppShell";
import { BoardTray } from "./BoardTray";
import { BingoBoard } from "./BingoBoard";
import { TileSpinOutCard } from "./TileSpinOutCard";
import { FreeSpaceChallengeModal } from "./FreeSpaceChallengeModal";
import { FreeSpaceToast } from "./FreeSpaceToast";
import { PlayBoardDock } from "./PlayBoardDock";
import { useAccentTheme } from "@/hooks/useAccentTheme";
import { useBoardStore } from "@/hooks/useBoardStore";
import { useAchievements, useFreeSpaceUnlock } from "@/providers/AchievementsProvider";
import { updateBoardTheme } from "@/lib/cloud/boards";
import type { ThemeId } from "@/lib/types";
import {
  downloadBlob,
  exportBoardElement,
  shareBoardBlob,
} from "@/lib/export";

interface PlayViewProps {
  encodedBoard?: string | null;
  cloudBoardId?: string | null;
  readOnly?: boolean;
  showBoardDock?: boolean;
}

export function PlayView({
  encodedBoard,
  cloudBoardId,
  readOnly = false,
  showBoardDock = false,
}: PlayViewProps) {
  const exportRef = useRef<HTMLDivElement>(null);
  const [exporting, setExporting] = useState(false);
  const [challengeOpen, setChallengeOpen] = useState(false);
  const blackoutCheckedRef = useRef(false);

  const { unlocked: globalGoobUnlocked, unlock: unlockGlobalGoob } =
    useFreeSpaceUnlock();
  const { checkAndAward, awardById } = useAchievements();

  const {
    board,
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
    isCloudOwner,
  } = useBoardStore({
    encodedBoard,
    cloudBoardId,
    readOnly,
    globalGoobUnlocked,
    onRequestFreeSpaceChallenge: () => setChallengeOpen(true),
  });

  const { themeId, setThemeId } = useAccentTheme(boardId, board.themeId);

  const handleThemeChange = useCallback(
    (id: ThemeId) => {
      setThemeId(id);
      if (cloudBoardId && isCloudOwner) {
        void updateBoardTheme(cloudBoardId, id);
      }
    },
    [cloudBoardId, isCloudOwner, setThemeId]
  );

  const handleShare = useCallback(async () => {
    if (!exportRef.current) return;
    setExporting(true);
    try {
      const blob = await exportBoardElement(exportRef.current);
      const shared = await shareBoardBlob(blob, board.title);
      if (!shared) downloadBlob(blob, `${board.title}-goobin.png`);
    } finally {
      setExporting(false);
    }
  }, [board.title]);

  const handleChallengeConfirm = useCallback(async () => {
    await unlockGlobalGoob();
    setChallengeOpen(false);
    await awardById("free_space_goob");
    await checkAndAward({ freeSpaceUnlocked: true });
  }, [awardById, checkAndAward, unlockGlobalGoob]);

  useEffect(() => {
    if (!completion.isBlackout || blackoutCheckedRef.current) return;
    blackoutCheckedRef.current = true;
    void checkAndAward({ freeSpaceUnlocked: globalGoobUnlocked });
  }, [completion.isBlackout, checkAndAward, globalGoobUnlocked]);

  useEffect(() => {
    blackoutCheckedRef.current = false;
  }, [boardId]);

  if (loading) {
    return (
      <AppShell
        themeId={themeId}
        onThemeChange={handleThemeChange}
        defaultThemeId={board.themeId}
      >
        <div className="flex-1 flex items-center justify-center">
          <p className="text-[var(--text-muted)]">Loading board...</p>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell
      themeId={themeId}
      onThemeChange={handleThemeChange}
      defaultThemeId={board.themeId}
      onShare={handleShare}
      showBuildLink
      onResetBoard={readOnly ? undefined : resetBoard}
    >
      <motion.div
        className={`w-full flex flex-col items-center ${showBoardDock ? "pb-20" : ""}`}
        animate={{ scale: selectedTileId ? 0.95 : 1 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
      >
        <BoardTray
          exportRef={exportRef}
          borderTier={completion.borderTier}
          completionLabel={completion.label}
          title={board.title}
        >
          <BingoBoard
            board={board}
            onTileTap={openTile}
            globalGoobUnlocked={globalGoobUnlocked}
          />
        </BoardTray>
      </motion.div>

      {exporting && (
        <p className="fixed bottom-24 text-sm text-[var(--text-muted)]">
          Preparing export...
        </p>
      )}

      <FreeSpaceToast
        message={freeSpaceMessage}
        glitch={isFreeSpaceGlitch}
        onDismiss={() => setFreeSpaceMessage(null)}
      />

      <FreeSpaceChallengeModal
        open={challengeOpen}
        onClose={() => setChallengeOpen(false)}
        onConfirm={handleChallengeConfirm}
      />

      {showBoardDock && !readOnly && !selectedTileId && <PlayBoardDock />}

      {selectedTile && selectedTileId && (
        <TileSpinOutCard
          tile={selectedTile}
          onClose={closeCard}
          onPhoto={
            readOnly
              ? undefined
              : (file) => completeTileWithPhoto(selectedTile.id, file)
          }
          onSaveMarkup={
            readOnly
              ? undefined
              : (data) => saveMarkup(selectedTile.id, data)
          }
          flipped={cardFlipped}
          onFlip={() => setCardFlipped(!cardFlipped)}
          readOnly={readOnly}
        />
      )}
    </AppShell>
  );
}
