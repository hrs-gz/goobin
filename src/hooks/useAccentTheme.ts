"use client";

import { useCallback, useMemo, useSyncExternalStore } from "react";
import type { ThemeId } from "@/lib/types";

export const GLOBAL_ACCENT_KEY = "goobin-accent-theme";

export function accentThemeStorageKey(scope?: string): string {
  return scope ? `goobin-theme-${scope}` : GLOBAL_ACCENT_KEY;
}

function readTheme(scope: string | undefined, boardDefault: ThemeId): ThemeId {
  if (typeof window === "undefined") return boardDefault;
  const scoped = localStorage.getItem(
    accentThemeStorageKey(scope)
  ) as ThemeId | null;
  if (scoped) return scoped;
  if (scope) {
    const global = localStorage.getItem(GLOBAL_ACCENT_KEY) as ThemeId | null;
    if (global) return global;
  }
  return boardDefault;
}

function subscribe(onStoreChange: () => void) {
  window.addEventListener("storage", onStoreChange);
  window.addEventListener("goobin-accent-theme", onStoreChange);
  return () => {
    window.removeEventListener("storage", onStoreChange);
    window.removeEventListener("goobin-accent-theme", onStoreChange);
  };
}

export function useAccentTheme(
  scope?: string,
  boardDefault: ThemeId = "neon-pink"
) {
  const themeId = useSyncExternalStore(
    subscribe,
    () => readTheme(scope, boardDefault),
    () => boardDefault
  );

  const setThemeId = useCallback(
    (id: ThemeId) => {
      localStorage.setItem(accentThemeStorageKey(scope), id);
      if (scope) {
        localStorage.setItem(GLOBAL_ACCENT_KEY, id);
      }
      window.dispatchEvent(new Event("goobin-accent-theme"));
    },
    [scope]
  );

  const resolvedDefault = useMemo(() => boardDefault, [boardDefault]);

  return { themeId, setThemeId, boardDefault: resolvedDefault };
}
