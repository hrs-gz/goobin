"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { QRCodeSVG } from "qrcode.react";
import { Check, Copy, Eye, Play, Share2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { setPublishedAction } from "@/app/boards/actions";
import type { OwnBoardDetail } from "@/lib/types";

export function BoardShare({
  board,
  opens,
  origin,
}: {
  board: OwnBoardDetail;
  opens: number;
  origin: string;
}) {
  const [copied, setCopied] = useState(false);
  const [isPublic, setIsPublic] = useState(board.is_public);
  const [isPending, startTransition] = useTransition();

  const playUrl = `${origin}/play/${board.join_code}`;

  const copyLink = async () => {
    if (!playUrl) return;
    try {
      await navigator.clipboard.writeText(playUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      // clipboard unavailable
    }
  };

  const share = async () => {
    if (!playUrl || !navigator.share) return;
    try {
      await navigator.share({
        title: board.title,
        text: `Join my photo bingo board: ${board.title}`,
        url: playUrl,
      });
    } catch {
      // dismissed
    }
  };

  const togglePublish = () => {
    const next = !isPublic;
    setIsPublic(next);
    startTransition(() => setPublishedAction(board.id, next));
  };

  return (
    <div className="mx-auto w-full max-w-md px-5 pb-16 pt-6">
      <h1 className="text-center font-display text-2xl font-semibold">
        {board.title}
      </h1>
      <p className="mt-1 text-center text-sm text-[var(--text-muted)]">
        Share this board so anyone can play — no account needed.
      </p>

      {/* Join code */}
      <div className="mt-6 rounded-[var(--radius-lg)] border border-[var(--border-soft)] bg-[var(--bg-surface)] p-6 text-center shadow-[var(--shadow-sm)]">
        <span className="text-xs font-medium uppercase tracking-wide text-[var(--text-muted)]">
          Join code
        </span>
        <div className="mt-1 font-display text-4xl font-semibold tracking-[0.3em]">
          {board.join_code}
        </div>

        <div className="mt-5 flex justify-center">
          <div className="rounded-[var(--radius-md)] bg-white p-3">
            {playUrl ? (
              <QRCodeSVG value={playUrl} size={168} marginSize={0} />
            ) : (
              <div className="h-[168px] w-[168px]" />
            )}
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="mt-4 grid grid-cols-2 gap-2">
        <Button variant="secondary" size="lg" onClick={copyLink}>
          {copied ? <Check size={18} /> : <Copy size={18} />}
          {copied ? "Copied" : "Copy link"}
        </Button>
        <Button variant="secondary" size="lg" onClick={share}>
          <Share2 size={18} />
          Share
        </Button>
      </div>

      <Link href={`/play/${board.join_code}`} className="mt-2 block">
        <Button size="lg" fullWidth>
          <Play size={18} />
          Open board
        </Button>
      </Link>

      {/* Publish toggle */}
      <div className="mt-6 flex items-center justify-between rounded-[var(--radius-md)] border border-[var(--border-soft)] bg-[var(--bg-surface)] p-4">
        <div>
          <div className="font-medium">List on Discover</div>
          <p className="text-sm text-[var(--text-muted)]">
            {board.latitude != null
              ? "Show this board to players nearby."
              : "Add a location to appear on the map."}
          </p>
        </div>
        <button
          type="button"
          role="switch"
          aria-checked={isPublic}
          disabled={isPending || board.latitude == null}
          onClick={togglePublish}
          className={`relative h-7 w-12 shrink-0 rounded-full transition-colors disabled:opacity-40 ${
            isPublic ? "bg-[var(--accent)]" : "bg-[var(--border-strong)]"
          }`}
        >
          <span
            className={`absolute top-1 h-5 w-5 rounded-full bg-white transition-transform ${
              isPublic ? "translate-x-6" : "translate-x-1"
            }`}
          />
        </button>
      </div>

      <p className="mt-4 flex items-center justify-center gap-1.5 text-sm text-[var(--text-muted)]">
        <Eye size={15} />
        {opens} {opens === 1 ? "open" : "opens"}
      </p>

      <Link
        href="/boards"
        className="mt-6 block text-center text-sm text-[var(--text-muted)] hover:underline"
      >
        Back to my boards
      </Link>
    </div>
  );
}
