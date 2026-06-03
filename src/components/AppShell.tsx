"use client";

import { useColorMode } from "@/hooks/useTheme";
import type { ThemeId } from "@/lib/types";
import { Header } from "./Header";

interface AppShellProps {
  children: React.ReactNode;
  title?: string;
  themeId?: ThemeId;
  onShare?: () => void;
  showBuildLink?: boolean;
}

export function AppShell({
  children,
  title,
  themeId = "neon-pink",
  onShare,
  showBuildLink = true,
}: AppShellProps) {
  const { mode, toggle } = useColorMode();

  return (
    <div
      data-theme={themeId}
      data-color-mode={mode}
      className="min-h-dvh flex flex-col bg-[var(--bg-page)] text-[var(--text-primary)] transition-colors duration-300"
    >
      <Header
        onShare={onShare}
        onToggleTheme={toggle}
        colorMode={mode}
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
