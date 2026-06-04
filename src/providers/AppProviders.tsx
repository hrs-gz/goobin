"use client";

import type { ReactNode } from "react";
import { AuthProvider } from "./AuthProvider";
import { AchievementsProvider } from "./AchievementsProvider";

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <AuthProvider>
      <AchievementsProvider>{children}</AchievementsProvider>
    </AuthProvider>
  );
}
