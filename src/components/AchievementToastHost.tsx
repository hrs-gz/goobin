"use client";

import { useEffect, useState } from "react";
import type { AchievementDefinition } from "@/lib/achievements/catalog";
import { subscribeAchievementToasts } from "@/lib/achievementToasts";
import { AchievementToast } from "./AchievementToast";

export function AchievementToastHost() {
  const [current, setCurrent] = useState<AchievementDefinition | null>(null);

  useEffect(() => {
    return subscribeAchievementToasts((achievement) => {
      setCurrent(achievement);
      window.setTimeout(() => setCurrent(null), 5000);
    });
  }, []);

  return (
    <AchievementToast
      achievement={current}
      onDismiss={() => setCurrent(null)}
    />
  );
}
