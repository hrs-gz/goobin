import { forwardRef } from "react";
import { BoardThemePattern } from "@/components/board/BoardThemePattern";
import { boardThemeVars, getBoardTheme } from "@/lib/boardThemes";
import { centerIndex } from "@/lib/bingo";
import type { BoardByCode } from "@/lib/types";

interface CollageRenderProps {
  board: BoardByCode;
  photoUrls: Record<number, string>;
  origin: string;
}

const WIDTH = 1080;
const PAD = 48;
const GAP = 16;

/**
 * Fixed 1080px collage mirror of the board, rendered off-screen for
 * html-to-image capture. Always uses the theme's light palette for a bright,
 * predictable shareable image. Photos stay in place; empty tiles become themed
 * placeholders; footer carries the wordmark + play URL.
 */
export const CollageRender = forwardRef<HTMLDivElement, CollageRenderProps>(
  function CollageRender({ board, photoUrls, origin }, ref) {
    const theme = getBoardTheme(board.theme_id);
    const size = board.grid_size;
    const center = centerIndex(size);
    const tiles = board.definition.tiles;
    const cell = (WIDTH - PAD * 2 - GAP * (size - 1)) / size;
    const FreeIcon = theme.freeSpaceIcon;
    const playUrl = `${origin.replace(/^https?:\/\//, "")}/play/${board.join_code}`;

    return (
      <div
        ref={ref}
        style={{
          ...boardThemeVars(theme.id, "light"),
          width: WIDTH,
          background: theme.light.board,
          padding: PAD,
          fontFamily: "var(--font-body), system-ui, sans-serif",
          color: "#2b2926",
        }}
      >
        <div
          style={{
            fontFamily: "var(--font-display), system-ui, sans-serif",
            fontWeight: 600,
            fontSize: 52,
            textAlign: "center",
            marginBottom: PAD,
            lineHeight: 1.1,
          }}
        >
          {board.definition.title}
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: `repeat(${size}, ${cell}px)`,
            gap: GAP,
          }}
        >
          {tiles.map((tile, i) => {
            const isCenter = i === center;
            const url = photoUrls[i];
            const done = isCenter || Boolean(url);
            return (
              <div
                key={i}
                style={{
                  position: "relative",
                  width: cell,
                  height: cell,
                  borderRadius: 20,
                  overflow: "hidden",
                  background: isCenter ? theme.light.accentSoft : theme.light.tile,
                  boxShadow: done
                    ? `0 0 0 4px ${theme.light.accent}`
                    : "inset 0 0 0 2px #e8e3d9",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {isCenter ? (
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      gap: 6,
                      color: theme.light.accent,
                    }}
                  >
                    <FreeIcon size={Math.round(cell * 0.28)} />
                    <span
                      style={{
                        fontSize: 15,
                        fontWeight: 700,
                        textTransform: "uppercase",
                        letterSpacing: 1,
                      }}
                    >
                      Free
                    </span>
                  </div>
                ) : url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={url}
                    alt=""
                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                  />
                ) : (
                  <div
                    style={{
                      position: "relative",
                      width: "100%",
                      height: "100%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      padding: 12,
                    }}
                  >
                    <BoardThemePattern
                      themeId={theme.id}
                      columns={2}
                      rows={2}
                      opacity={0.08}
                      iconSize={Math.round(cell * 0.16)}
                    />
                    <span
                      style={{
                        position: "relative",
                        textAlign: "center",
                        fontSize: Math.max(14, Math.round(cell * 0.11)),
                        lineHeight: 1.2,
                        color: "#8c867c",
                      }}
                    >
                      {tile.prompt}
                    </span>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div
          style={{
            marginTop: PAD,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <span
            style={{
              fontFamily: "var(--font-display), system-ui, sans-serif",
              fontWeight: 600,
              fontSize: 34,
              textTransform: "lowercase",
              color: theme.light.accent,
            }}
          >
            goobin
          </span>
          <span style={{ fontSize: 26, color: "#8c867c" }}>{playUrl}</span>
        </div>
      </div>
    );
  }
);
