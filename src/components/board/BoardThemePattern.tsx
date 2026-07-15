import { getBoardTheme } from "@/lib/boardThemes";
import type { BoardThemeId } from "@/lib/types";

interface BoardThemePatternProps {
  themeId: BoardThemeId;
  /** Icons across the width. Higher = denser/smaller. */
  columns?: number;
  /** Rows of icons. Defaults to columns + 1. */
  rows?: number;
  className?: string;
  opacity?: number;
  /** Pixel size of each icon. */
  iconSize?: number;
}

/**
 * A repeated, staggered, slightly-rotated icon field used behind boards, in
 * empty-tile placeholders, and in the export collage. Rendered as inline SVG
 * (lucide) so html-to-image captures it. Purely decorative.
 */
export function BoardThemePattern({
  themeId,
  columns = 6,
  rows,
  className,
  opacity = 0.08,
  iconSize = 26,
}: BoardThemePatternProps) {
  const theme = getBoardTheme(themeId);
  const icons = theme.icons;
  const rowCount = rows ?? columns + 1;
  const cells: React.ReactNode[] = [];

  for (let r = 0; r < rowCount; r++) {
    for (let c = 0; c < columns; c++) {
      const i = r * columns + c;
      const Icon = icons[i % icons.length];
      const rotate = ((i * 37) % 34) - 17;
      cells.push(
        <div
          key={i}
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            transform: `rotate(${rotate}deg)`,
          }}
        >
          <Icon size={iconSize} strokeWidth={2} />
        </div>
      );
    }
  }

  return (
    <div
      aria-hidden
      className={className}
      style={{
        position: "absolute",
        inset: 0,
        overflow: "hidden",
        pointerEvents: "none",
        display: "grid",
        gridTemplateColumns: `repeat(${columns}, 1fr)`,
        gridTemplateRows: `repeat(${rowCount}, 1fr)`,
        placeItems: "center",
        color: "var(--board-accent)",
        opacity,
      }}
    >
      {cells}
    </div>
  );
}
