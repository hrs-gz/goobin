"use client";

import { useState, useMemo } from "react";
import { QRCodeSVG } from "qrcode.react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AppShell } from "./AppShell";
import { PromptEditor } from "./PromptEditor";
import { IconPicker } from "./IconPicker";
import { useAuth } from "@/hooks/useAuth";
import { createBoard } from "@/lib/cloud/boards";
import {
  buildPlayUrl,
  encodeBoardDefinition,
} from "@/lib/persistence/boardCodec";
import { defaultBoardDefinition } from "@/lib/defaultBoard";
import type { BoardDefinition, ThemeId } from "@/lib/types";

export function BoardBuilder() {
  const router = useRouter();
  const { user } = useAuth();
  const [title, setTitle] = useState("My goobin");
  const [themeId, setThemeId] = useState<ThemeId>("neon-pink");
  const [tiles, setTiles] = useState(
    () => defaultBoardDefinition.tiles.map((t) => ({ ...t }))
  );
  const [copied, setCopied] = useState(false);
  const [useLocation, setUseLocation] = useState(false);
  const [isPublic, setIsPublic] = useState(false);
  const [locationLabel, setLocationLabel] = useState("");
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

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

  const saveToAccount = async () => {
    if (!user) {
      router.push("/login?next=/build");
      return;
    }
    setSaving(true);
    setSaveError(null);

    let latitude: number | undefined;
    let longitude: number | undefined;

    if (useLocation && navigator.geolocation) {
      try {
        const pos = await new Promise<GeolocationPosition>((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, {
            timeout: 12000,
          });
        });
        latitude = pos.coords.latitude;
        longitude = pos.coords.longitude;
      } catch {
        setSaveError("Could not get location. Save without location or try again.");
        setSaving(false);
        return;
      }
    }

    const record = await createBoard({
      definition,
      latitude,
      longitude,
      location_label: locationLabel.trim() || undefined,
      is_public: isPublic && latitude != null && longitude != null,
    });

    setSaving(false);
    if (!record) {
      setSaveError("Could not save board. Check you are signed in.");
      return;
    }
    router.push(`/play/cloud/${record.id}`);
  };

  return (
    <AppShell
      themeId={themeId}
      onThemeChange={setThemeId}
      showBuildLink={false}
    >
      <div className="w-full max-w-lg space-y-6">
        <div>
          <h1 className="font-display text-2xl font-semibold mb-1">
            Create a board
          </h1>
          <p className="text-sm text-[var(--text-muted)]">
            Customize 24 prompts. Center is always free space. Set theme in the
            menu.
          </p>
        </div>

        <label className="block">
          <span className="text-sm font-medium mb-1 block">Board title</span>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="input-rect"
          />
        </label>

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

        {user && (
          <div className="squircle-lg p-4 bg-[var(--bg-tray)] space-y-3 border border-[var(--border-soft)]">
            <p className="text-sm font-medium">Save to your account</p>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={useLocation}
                onChange={(e) => setUseLocation(e.target.checked)}
              />
              Attach my location (for Discover)
            </label>
            {useLocation && (
              <input
                type="text"
                placeholder="Location label (e.g. Dolores Park)"
                value={locationLabel}
                onChange={(e) => setLocationLabel(e.target.value)}
                className="input-rect"
              />
            )}
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={isPublic}
                disabled={!useLocation}
                onChange={(e) => setIsPublic(e.target.checked)}
              />
              List on Discover (requires location)
            </label>
            {saveError && (
              <p className="text-sm text-red-500">{saveError}</p>
            )}
            <button
              type="button"
              onClick={saveToAccount}
              disabled={saving}
              className="w-full py-3 squircle bg-[var(--accent)] text-white font-medium disabled:opacity-50"
            >
              {saving ? "Saving..." : "Save and play"}
            </button>
          </div>
        )}

        {!user && (
          <p className="text-sm text-[var(--text-muted)]">
            <Link href="/login?next=/build" className="text-[var(--accent)] font-medium">
              Sign in
            </Link>{" "}
            to save boards to your account and sync progress.
          </p>
        )}

        {playUrl && (
          <div className="squircle-lg p-4 bg-[var(--bg-tray)] space-y-4">
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
