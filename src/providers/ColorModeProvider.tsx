"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useSyncExternalStore,
  type ReactNode,
} from "react";

export type ColorMode = "light" | "dark";

const STORAGE_KEY = "goobin-color-mode";

/**
 * Inline script that runs before hydration to set the color-mode attribute,
 * preventing a flash of the wrong theme. Injected into the document head.
 */
export const colorModeScript = `(function(){try{var m=localStorage.getItem('${STORAGE_KEY}');if(!m){m=window.matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light';}document.documentElement.setAttribute('data-color-mode',m);}catch(e){}})();`;

function getSnapshot(): ColorMode {
  if (typeof window === "undefined") return "light";
  const stored = localStorage.getItem(STORAGE_KEY) as ColorMode | null;
  if (stored) return stored;
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

function subscribe(onStoreChange: () => void) {
  const mq = window.matchMedia("(prefers-color-scheme: dark)");
  mq.addEventListener("change", onStoreChange);
  window.addEventListener("storage", onStoreChange);
  window.addEventListener("goobin-color-mode-change", onStoreChange);
  return () => {
    mq.removeEventListener("change", onStoreChange);
    window.removeEventListener("storage", onStoreChange);
    window.removeEventListener("goobin-color-mode-change", onStoreChange);
  };
}

interface ColorModeContextValue {
  mode: ColorMode;
  toggle: () => void;
  setMode: (mode: ColorMode) => void;
}

const ColorModeContext = createContext<ColorModeContextValue | null>(null);

export function ColorModeProvider({ children }: { children: ReactNode }) {
  const mode = useSyncExternalStore(
    subscribe,
    getSnapshot,
    () => "light" as ColorMode
  );

  const setMode = useCallback((next: ColorMode) => {
    localStorage.setItem(STORAGE_KEY, next);
    document.documentElement.setAttribute("data-color-mode", next);
    window.dispatchEvent(new Event("goobin-color-mode-change"));
  }, []);

  const toggle = useCallback(() => {
    setMode(getSnapshot() === "light" ? "dark" : "light");
  }, [setMode]);

  useEffect(() => {
    document.documentElement.setAttribute("data-color-mode", mode);
  }, [mode]);

  return (
    <ColorModeContext.Provider value={{ mode, toggle, setMode }}>
      {children}
    </ColorModeContext.Provider>
  );
}

export function useColorMode(): ColorModeContextValue {
  const ctx = useContext(ColorModeContext);
  if (!ctx) {
    throw new Error("useColorMode must be used within ColorModeProvider");
  }
  return ctx;
}
