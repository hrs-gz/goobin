"use client";

import { useEffect, useRef, useState } from "react";
import { CameraOff } from "lucide-react";
import { Sheet } from "@/components/ui/Sheet";
import { normalizeJoinCode } from "@/lib/joinCode";

interface ScanQrModalProps {
  open: boolean;
  onClose: () => void;
  onCode: (code: string) => void;
}

// BarcodeDetector isn't in the TS DOM lib yet.
interface DetectedBarcode {
  rawValue: string;
}
interface BarcodeDetectorLike {
  detect: (source: CanvasImageSource) => Promise<DetectedBarcode[]>;
}
type BarcodeDetectorCtor = new (opts?: {
  formats?: string[];
}) => BarcodeDetectorLike;

/** Extract a 6-digit code from a scanned value (full play URL or bare code). */
function codeFromScan(raw: string): string | null {
  try {
    const url = new URL(raw);
    const match = url.pathname.match(/\/play\/(\d{6})/);
    if (match) return match[1];
  } catch {
    // not a URL — fall through
  }
  const digits = normalizeJoinCode(raw);
  return digits.length === 6 ? digits : null;
}

export function ScanQrModal({ open, onClose, onCode }: ScanQrModalProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [unsupported, setUnsupported] = useState(false);

  useEffect(() => {
    if (!open) return;

    let stream: MediaStream | null = null;
    let raf = 0;
    let cancelled = false;

    const detectorCtor = (
      window as unknown as { BarcodeDetector?: BarcodeDetectorCtor }
    ).BarcodeDetector;
    const detector = detectorCtor
      ? new detectorCtor({ formats: ["qr_code"] })
      : null;

    const scan = async () => {
      if (!detector) return;
      const video = videoRef.current;
      if (!video || cancelled) return;
      try {
        const results = await detector.detect(video);
        for (const r of results) {
          const code = codeFromScan(r.rawValue);
          if (code) {
            onCode(code);
            return;
          }
        }
      } catch {
        // transient decode error — keep scanning
      }
      raf = requestAnimationFrame(scan);
    };

    (async () => {
      setUnsupported(false);
      setError(null);
      if (!detector) {
        setUnsupported(true);
        return;
      }
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "environment" },
        });
        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        const video = videoRef.current;
        if (video) {
          video.srcObject = stream;
          await video.play();
          raf = requestAnimationFrame(scan);
        }
      } catch {
        setError("Camera unavailable. Enter the code by hand instead.");
      }
    })();

    return () => {
      cancelled = true;
      cancelAnimationFrame(raf);
      stream?.getTracks().forEach((t) => t.stop());
    };
  }, [open, onCode]);

  return (
    <Sheet open={open} onClose={onClose} label="Scan a board QR code">
      <div className="pb-4">
        <h2 className="font-display text-lg font-semibold text-center">
          Scan QR code
        </h2>
        {unsupported ? (
          <div className="mt-4 flex flex-col items-center gap-3 text-center text-[var(--text-muted)]">
            <CameraOff size={28} />
            <p className="text-sm">
              Your browser can&apos;t scan in-app. Point any camera app at the
              code — the QR opens the game directly.
            </p>
          </div>
        ) : error ? (
          <p className="mt-4 text-center text-sm text-[var(--text-muted)]">
            {error}
          </p>
        ) : (
          <div className="mt-4 overflow-hidden rounded-[var(--radius-md)] bg-black aspect-square relative">
            <video
              ref={videoRef}
              muted
              playsInline
              className="h-full w-full object-cover"
            />
            <div className="pointer-events-none absolute inset-6 rounded-[var(--radius-md)] border-2 border-white/70" />
          </div>
        )}
        <p className="mt-4 text-center text-xs text-[var(--text-faint)]">
          Line up the board&apos;s QR code inside the frame.
        </p>
      </div>
    </Sheet>
  );
}
