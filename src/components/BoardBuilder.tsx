"use client";

import { useState, useMemo } from "react";
import { QRCodeSVG } from "qrcode.react";
import Link from "next/link";
import { AppShell } from "./AppShell";
import { ThemePicker } from "./ThemePicker";
import { PromptEditor } from "./PromptEditor";
import { IconPicker } from "./IconPicker";
import {
  buildPlayUrl,
  encodeBoardDefinition,
} from "@/lib/persistence/boardCodec";
import { defaultBoardDefinition } from "@/lib/defaultBoard";
import type { BoardDefinition, ThemeId } from "@/lib/types";

export function BoardBuilder() {
  const [title, setTitle] = useState("My goobin");
  const [themeId, setThemeId] = useState<ThemeId>("neon-pink");
  const [tiles, setTiles] = useState(
    () => defaultBoardDefinition.tiles.map((t) => ({ ...t }))
  );
  const [copied, setCopied] = useState(false);

  const definition: BoardDefinition = useMemo(
    () => ({ title, themeId, tiles }),
    [title, themeId, tiles]
  );

  const playPath = useMemo(() => {
    const encoded = encodeBoardDefinition(definition);
    const path = `/play?b=${encoded}`;
    if (path.length > 2000) return null;
    return path;
  }, [definition]);

  const urlError =
    playPath === null
      ? "Board too large for URL. Shorten prompts."
      : null;

  const playUrl = useMemo(() => {
    if (!playPath) return null;
    try {
      return buildPlayUrl(definition);
    } catch {
      return null;
    }
  }, [definition, playPath]);

  const updateTile = (index: number, field: "prompt" | "icon", value: string) => {
    setTiles((prev) =>
      prev.map((t, i) => (i === index ? { ...t, [field]: value } : t))
    );
  };

  const copyLink = async () => {
    if (!playUrl) return;
    await navigator.clipboard.writeText(playUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <AppShell showBuildLink={false}>
      <div className="w-full max-w-lg space-y-6">
        <div>
          <h1 className="font-display text-2xl font-semibold mb-1">
            Create a board
          </h1>
          <p className="text-sm text-[var(--text-muted)]">
            Customize 24 prompts. Center is always free space.
          </p>
        </div>

        <label className="block">
          <span className="text-sm font-medium mb-1 block">Board title</span>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-3 py-2 squircle bg-[var(--bg-tile)] border border-[var(--border-soft)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
          />
        </label>

        <div>
          <span className="text-sm font-medium mb-2 block">Theme</span>
          <ThemePicker value={themeId} onChange={setThemeId} />
        </div>

        <div className="space-y-4 max-h-[50vh] overflow-y-auto pr-1">
          {tiles.map((tile, i) => (
            <div key={i} className="space-y-2 pb-3 border-b border-[var(--border-soft)] last:border-0">
              <div className="flex items-center gap-2">
                <span className="text-xl w-8 text-center">{tile.icon}</span>
                <PromptEditor
                  index={i}
                  value={tile.prompt}
                  onChange={(prompt) => updateTile(i, "prompt", prompt)}
                />
              </div>
              <IconPicker
                value={tile.icon}
                onChange={(icon) => updateTile(i, "icon", icon)}
              />
            </div>
          ))}
        </div>

        {urlError && (
          <p className="text-sm text-red-500">{urlError}</p>
        )}

        {playUrl && (
          <div className="squircle p-4 bg-[var(--bg-tray)] space-y-4">
            <div className="flex justify-center">
              <QRCodeSVG value={playUrl} size={160} level="M" />
            </div>
            <p className="text-xs break-all text-[var(--text-muted)]">
              {playUrl}
            </p>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={copyLink}
                className="flex-1 py-3 squircle bg-[var(--accent)] text-white font-medium"
              >
                {copied ? "Copied!" : "Copy link"}
              </button>
              {playPath && (
                <Link
                  href={playPath}
                  className="flex-1 py-3 squircle border border-[var(--border-soft)] text-center font-medium flex items-center justify-center"
                >
                  Play
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}
