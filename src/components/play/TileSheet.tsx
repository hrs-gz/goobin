"use client";

import { useRef, useState } from "react";
import { Camera, ImageIcon, Trash2 } from "lucide-react";
import { Sheet } from "@/components/ui/Sheet";
import { Button } from "@/components/ui/Button";
import type { BoardTheme } from "@/lib/boardThemes";
import type { TileDef } from "@/lib/types";

interface TileSheetProps {
  open: boolean;
  onClose: () => void;
  tile: TileDef | null;
  index: number;
  isFreeSpace: boolean;
  photoUrl?: string;
  theme: BoardTheme;
  onPickPhoto: (file: File) => void;
  onRemovePhoto: () => void;
}

export function TileSheet({
  open,
  onClose,
  tile,
  isFreeSpace,
  photoUrl,
  theme,
  onPickPhoto,
  onRemovePhoto,
}: TileSheetProps) {
  const cameraRef = useRef<HTMLInputElement>(null);
  const galleryRef = useRef<HTMLInputElement>(null);
  const [confirmRemove, setConfirmRemove] = useState(false);

  const close = () => {
    setConfirmRemove(false);
    onClose();
  };

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (file) {
      onPickPhoto(file);
      close();
    }
  };

  const FreeIcon = theme.freeSpaceIcon;

  return (
    <Sheet open={open} onClose={close} label={tile?.prompt ?? "Tile"}>
      <div className="pb-4">
        {isFreeSpace ? (
          <div className="flex flex-col items-center gap-3 py-4 text-center">
            <span
              className="grid h-16 w-16 place-items-center rounded-full"
              style={{ background: "var(--board-accent-soft)", color: "var(--board-accent)" }}
            >
              <FreeIcon size={30} />
            </span>
            <h2 className="font-display text-lg font-semibold">Free space</h2>
            <p className="text-sm text-[var(--text-muted)]">
              This one&apos;s on the house — it already counts toward your lines.
            </p>
          </div>
        ) : (
          <>
            <h2 className="font-display text-lg font-semibold">{tile?.prompt}</h2>
            {tile?.details && (
              <p className="mt-1 text-sm text-[var(--text-muted)]">{tile.details}</p>
            )}

            {photoUrl && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={photoUrl}
                alt={tile?.prompt ?? "Your photo"}
                className="mt-4 aspect-square w-full rounded-[var(--radius-md)] object-cover"
              />
            )}

            <div className="mt-5 flex flex-col gap-2.5">
              <Button size="lg" fullWidth onClick={() => cameraRef.current?.click()}>
                <Camera size={18} />
                {photoUrl ? "Retake photo" : "Take photo"}
              </Button>
              <Button
                variant="secondary"
                size="lg"
                fullWidth
                onClick={() => galleryRef.current?.click()}
              >
                <ImageIcon size={18} />
                Choose from gallery
              </Button>

              {photoUrl &&
                (confirmRemove ? (
                  <div className="flex gap-2">
                    <Button
                      variant="secondary"
                      fullWidth
                      onClick={() => setConfirmRemove(false)}
                    >
                      Cancel
                    </Button>
                    <Button
                      variant="danger"
                      fullWidth
                      onClick={() => {
                        onRemovePhoto();
                        close();
                      }}
                    >
                      Remove
                    </Button>
                  </div>
                ) : (
                  <Button
                    variant="danger"
                    fullWidth
                    onClick={() => setConfirmRemove(true)}
                  >
                    <Trash2 size={18} />
                    Remove photo
                  </Button>
                ))}
            </div>
          </>
        )}

        <input
          ref={cameraRef}
          type="file"
          accept="image/*"
          capture="environment"
          className="hidden"
          onChange={handleFile}
        />
        <input
          ref={galleryRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFile}
        />
      </div>
    </Sheet>
  );
}
