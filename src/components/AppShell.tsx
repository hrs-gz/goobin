"use client";

import { useState } from "react";
import { useAccentTheme } from "@/hooks/useAccentTheme";
import { useColorMode } from "@/hooks/useTheme";
import type { ThemeId } from "@/lib/types";
import { Header } from "./Header";
import { AppMenu } from "./AppMenu";

interface AppShellProps {
  children: React.ReactNode;
  title?: string;
  /** Per-board or page scope for accent override (e.g. board id). */
  accentScope?: string;
  defaultThemeId?: ThemeId;
  /** Controlled mode (e.g. board builder definition theme). */
  themeId?: ThemeId;
  onThemeChange?: (theme: ThemeId) => void;
  onShare?: () => void;
  showBuildLink?: boolean;
}

export function AppShell({
  children,
  title,
  accentScope,
  defaultThemeId = "neon-pink",
  themeId: controlledThemeId,
  onThemeChange: controlledOnThemeChange,
  onShare,
  showBuildLink = true,
}: AppShellProps) {
  const { mode, toggle } = useColorMode();
  const [menuOpen, setMenuOpen] = useState(false);
  const internalAccent = useAccentTheme(accentScope, defaultThemeId);

  const isControlled =
    controlledThemeId !== undefined && controlledOnThemeChange !== undefined;
  const themeId = isControlled ? controlledThemeId : internalAccent.themeId;

  const handleThemeChange = (id: ThemeId) => {
    if (isControlled) {
      controlledOnThemeChange(id);
    } else {
      internalAccent.setThemeId(id);
    }
  };

  return (
    <div
      data-theme={themeId}
      data-color-mode={mode}
      className="min-h-dvh flex flex-col bg-[var(--bg-page)] text-[var(--text-primary)] transition-colors duration-300"
    >
      <Header onShare={onShare} onOpenMenu={() => setMenuOpen(true)} />
      <AppMenu
        open={menuOpen}
        onClose={() => setMenuOpen(false)}
        colorMode={mode}
        onToggleColorMode={toggle}
        themeId={themeId}
        onThemeChange={handleThemeChange}
        showBuildLink={showBuildLink}
      />
      {title && (
        <div className="px-4 pb-2 text-center">
          <h1 className="font-display text-xl font-semibold">{title}</h1>
        </div>
      )}
      <main className="flex-1 flex flex-col items-center px-4 pb-8">{children}</main>
    </div>
  );
}
