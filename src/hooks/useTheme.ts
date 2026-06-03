"use client";

import { useCallback, useEffect, useSyncExternalStore } from "react";

export type ColorMode = "light" | "dark";

function getSnapshot(): ColorMode {
  if (typeof window === "undefined") return "light";
  const stored = localStorage.getItem("goobin-color-mode") as ColorMode | null;
  if (stored) return stored;
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

function subscribe(onStoreChange: () => void) {
  const mq = window.matchMedia("(prefers-color-scheme: dark)");
  mq.addEventListener("change", onStoreChange);
  window.addEventListener("storage", onStoreChange);
  return () => {
    mq.removeEventListener("change", onStoreChange);
    window.removeEventListener("storage", onStoreChange);
  };
}

export function useColorMode() {
  const mode = useSyncExternalStore(subscribe, getSnapshot, () => "light" as ColorMode);

  const toggle = useCallback(() => {
    const next = getSnapshot() === "light" ? "dark" : "light";
    localStorage.setItem("goobin-color-mode", next);
    document.documentElement.setAttribute("data-color-mode", next);
    window.dispatchEvent(new Event("storage"));
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute("data-color-mode", mode);
  }, [mode]);

  return { mode, toggle };
}
