import { describe, expect, it } from "vitest";
import {
  validateBoardDefinition,
  validateBoardLocation,
  MAX_PROMPT_LENGTH,
} from "./boardValidation";
import { centerIndex } from "./bingo";
import type { GridSize } from "./types";

function makeDefinition(size: GridSize) {
  const center = centerIndex(size);
  return {
    v: 1,
    title: "Trip bingo",
    gridSize: size,
    theme: "park",
    tiles: Array.from({ length: size * size }, (_, i) => ({
      prompt: i === center ? "Free space" : `Tile ${i}`,
    })),
  };
}

describe("validateBoardDefinition", () => {
  it("accepts well-formed 3×3 and 5×5 definitions", () => {
    expect(validateBoardDefinition(makeDefinition(3))).toBe(true);
    expect(validateBoardDefinition(makeDefinition(5))).toBe(true);
  });

  it("rejects non-objects and wrong versions", () => {
    expect(validateBoardDefinition(null)).toBe(false);
    expect(validateBoardDefinition("board")).toBe(false);
    expect(validateBoardDefinition({ ...makeDefinition(3), v: 2 })).toBe(false);
  });

  it("rejects tile counts that disagree with gridSize", () => {
    const def = makeDefinition(5);
    def.tiles = def.tiles.slice(0, 9);
    expect(validateBoardDefinition(def)).toBe(false);
  });

  it("rejects unknown grid sizes and themes", () => {
    expect(
      validateBoardDefinition({ ...makeDefinition(3), gridSize: 4 })
    ).toBe(false);
    expect(
      validateBoardDefinition({ ...makeDefinition(3), theme: "space" })
    ).toBe(false);
  });

  it("rejects blank prompts on non-center tiles but allows blank center", () => {
    const def = makeDefinition(3);
    def.tiles[0] = { prompt: "   " };
    expect(validateBoardDefinition(def)).toBe(false);

    const withBlankCenter = makeDefinition(3);
    withBlankCenter.tiles[centerIndex(3)] = { prompt: "" };
    expect(validateBoardDefinition(withBlankCenter)).toBe(true);
  });

  it("rejects blank titles and over-length fields", () => {
    expect(validateBoardDefinition({ ...makeDefinition(3), title: " " })).toBe(
      false
    );
    const def = makeDefinition(3);
    def.tiles[0] = { prompt: "x".repeat(MAX_PROMPT_LENGTH + 1) };
    expect(validateBoardDefinition(def)).toBe(false);
  });
});

describe("validateBoardLocation", () => {
  it("accepts null and well-formed locations", () => {
    expect(validateBoardLocation(null)).toBe(true);
    expect(
      validateBoardLocation({ label: "Rice University", lat: 29.72, lng: -95.4 })
    ).toBe(true);
  });

  it("rejects out-of-range coordinates and blank labels", () => {
    expect(validateBoardLocation({ label: "x", lat: 91, lng: 0 })).toBe(false);
    expect(validateBoardLocation({ label: "x", lat: 0, lng: 181 })).toBe(false);
    expect(validateBoardLocation({ label: "  ", lat: 0, lng: 0 })).toBe(false);
    expect(validateBoardLocation({ label: "x", lat: NaN, lng: 0 })).toBe(false);
  });
});
