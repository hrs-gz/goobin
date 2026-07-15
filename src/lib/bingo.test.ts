import { describe, expect, it } from "vitest";
import {
  centerIndex,
  countCompletedLines,
  isBlackout,
  linesFor,
} from "./bingo";

describe("centerIndex", () => {
  it("finds the middle tile", () => {
    expect(centerIndex(3)).toBe(4);
    expect(centerIndex(5)).toBe(12);
  });
});

describe("linesFor", () => {
  it("produces rows + cols + 2 diagonals for 3x3", () => {
    const lines = linesFor(3);
    expect(lines).toHaveLength(8); // 3 rows + 3 cols + 2 diags
    expect(lines).toContainEqual([0, 1, 2]);
    expect(lines).toContainEqual([0, 3, 6]);
    expect(lines).toContainEqual([0, 4, 8]);
    expect(lines).toContainEqual([2, 4, 6]);
  });

  it("produces 12 lines for 5x5", () => {
    const lines = linesFor(5);
    expect(lines).toHaveLength(12); // 5 rows + 5 cols + 2 diags
    expect(lines).toContainEqual([0, 1, 2, 3, 4]);
    expect(lines).toContainEqual([0, 6, 12, 18, 24]);
    expect(lines).toContainEqual([4, 8, 12, 16, 20]);
  });

  it("memoizes and returns the same array instance", () => {
    expect(linesFor(3)).toBe(linesFor(3));
  });
});

describe("countCompletedLines", () => {
  it("counts a single completed row on 3x3", () => {
    const completion = [true, true, true, false, false, false, false, false, false];
    expect(countCompletedLines(completion, 3)).toBe(1);
  });

  it("counts intersecting lines (row + col + diagonal share center)", () => {
    // Center column complete on 3x3: [1,4,7]
    const completion = [false, true, false, false, true, false, false, true, false];
    expect(countCompletedLines(completion, 3)).toBe(1);
  });

  it("counts multiple lines through a full 5x5 blackout", () => {
    const completion = Array(25).fill(true);
    expect(countCompletedLines(completion, 5)).toBe(12);
  });

  it("treats the free-space center as complete when caller sets it", () => {
    // Middle row on 3x3: [3,4,5]; caller marks center(4) true.
    const completion = [false, false, false, true, true, true, false, false, false];
    expect(countCompletedLines(completion, 3)).toBe(1);
  });
});

describe("isBlackout", () => {
  it("is true only when all tiles complete", () => {
    expect(isBlackout(Array(9).fill(true))).toBe(true);
    const almost = Array(9).fill(true);
    almost[0] = false;
    expect(isBlackout(almost)).toBe(false);
  });

  it("is false for an empty board", () => {
    expect(isBlackout([])).toBe(false);
  });
});
