"use client";

import { useCallback, useRef, useState } from "react";
import { motion } from "framer-motion";
import { AppShell } from "./AppShell";
import { BoardTray } from "./BoardTray";
import { BingoBoard } from "./BingoBoard";
import { TileSpinOutCard } from "./TileSpinOutCard";
import { FreeSpaceToast } from "./FreeSpaceToast";
import { useBoardStore } from "@/hooks/useBoardStore";
import {
  downloadBlob,
  exportBoardElement,
  shareBoardBlob,
} from "@/lib/export";

interface PlayViewProps {
  encodedBoard?: string | null;
}

export function PlayView({ encodedBoard }: PlayViewProps) {
  const exportRef = useRef<HTMLDivElement>(null);
  const [exporting, setExporting] = useState(false);

  const {
    board,
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
  } = useBoardStore(encodedBoard);

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

  if (loading) {
    return (
      <AppShell themeId={board.themeId}>
        <div className="flex-1 flex items-center justify-center">
          <p className="text-[var(--text-muted)]">Loading board...</p>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell
      themeId={board.themeId}
      onShare={handleShare}
      showBuildLink
    >
      <motion.div
        className="w-full flex flex-col items-center"
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
            isFreeSpaceGlitch={isFreeSpaceGlitch}
            selectedTileId={selectedTileId}
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

      {selectedTile && selectedTileId && (
        <TileSpinOutCard
          tile={selectedTile}
          layoutId={`tile-${selectedTile.id}`}
          onClose={closeCard}
          onPhoto={(file) => completeTileWithPhoto(selectedTile.id, file)}
          onSaveMarkup={(data) => saveMarkup(selectedTile.id, data)}
          flipped={cardFlipped}
          onFlip={() => setCardFlipped(!cardFlipped)}
        />
      )}
    </AppShell>
  );
}
