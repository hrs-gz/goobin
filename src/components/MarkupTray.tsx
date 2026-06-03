"use client";

import { motion } from "framer-motion";
import { Eraser, Paintbrush, Type } from "lucide-react";
import { MARKUP_COLORS } from "@/lib/themes";
import { ColorSwatch } from "./ColorSwatch";

export type MarkupTool = "brush" | "eraser" | "text";

interface MarkupTrayProps {
  activeTool: MarkupTool;
  activeColor: string;
  onToolChange: (tool: MarkupTool) => void;
  onColorChange: (color: string) => void;
}

export function MarkupTray({
  activeTool,
  activeColor,
  onToolChange,
  onColorChange,
}: MarkupTrayProps) {
  const tools: { id: MarkupTool; icon: typeof Paintbrush; label: string }[] = [
    { id: "brush", icon: Paintbrush, label: "Brush" },
    { id: "eraser", icon: Eraser, label: "Eraser" },
    { id: "text", icon: Type, label: "Text" },
  ];

  return (
    <motion.div
      initial={{ y: 40, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="flex flex-col gap-3 p-4 bg-[var(--bg-tray)] squircle border border-[var(--border-soft)]"
    >
      <div className="flex justify-center gap-2">
        {tools.map(({ id, icon: Icon, label }) => (
          <button
            key={id}
            type="button"
            onClick={() => onToolChange(id)}
            aria-label={label}
            className={`min-h-11 min-w-11 squircle flex items-center justify-center ${
              activeTool === id
                ? "bg-[var(--accent)] text-white"
                : "bg-[var(--bg-tile)]"
            }`}
          >
            <Icon className="w-5 h-5" />
          </button>
        ))}
      </div>
      <div className="flex justify-center gap-2 flex-wrap">
        {MARKUP_COLORS.map((c) => (
          <ColorSwatch
            key={c.id}
            color={c.value}
            label={c.label}
            selected={activeColor === c.value}
            onSelect={() => onColorChange(c.value)}
          />
        ))}
      </div>
    </motion.div>
  );
}
