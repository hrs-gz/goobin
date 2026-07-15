import type { GridSize } from "./types";

/** Index of the center (free space) tile for a given grid size. */
export function centerIndex(size: GridSize): number {
  return (size * size - 1) / 2;
}

const linesCache = new Map<number, number[][]>();

/**
 * All winning lines for an `size × size` board: every row, every column,
 * and the two main diagonals. Memoized per size.
 */
export function linesFor(size: number): number[][] {
  const cached = linesCache.get(size);
  if (cached) return cached;

  const lines: number[][] = [];

  // Rows
  for (let r = 0; r < size; r++) {
    const row: number[] = [];
    for (let c = 0; c < size; c++) row.push(r * size + c);
    lines.push(row);
  }

  // Columns
  for (let c = 0; c < size; c++) {
    const col: number[] = [];
    for (let r = 0; r < size; r++) col.push(r * size + c);
    lines.push(col);
  }

  // Diagonals
  const diag: number[] = [];
  const anti: number[] = [];
  for (let i = 0; i < size; i++) {
    diag.push(i * size + i);
    anti.push(i * size + (size - 1 - i));
  }
  lines.push(diag, anti);

  linesCache.set(size, lines);
  return lines;
}

/**
 * Number of fully completed winning lines.
 * `completion[i]` is true when tile `i` is complete (center/free space
 * should be passed as `true` by the caller).
 */
export function countCompletedLines(completion: boolean[], size: number): number {
  return linesFor(size).filter((line) => line.every((idx) => completion[idx]))
    .length;
}

/** True when every tile is complete (blackout). */
export function isBlackout(completion: boolean[]): boolean {
  return completion.length > 0 && completion.every(Boolean);
}
