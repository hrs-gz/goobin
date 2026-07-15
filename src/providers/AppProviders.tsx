"use client";

import type { ReactNode } from "react";
import { AuthProvider } from "./AuthProvider";
import { ColorModeProvider } from "./ColorModeProvider";

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <ColorModeProvider>
      <AuthProvider>{children}</AuthProvider>
    </ColorModeProvider>
  );
}
