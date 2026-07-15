import { describe, expect, it } from "vitest";
import { isValidJoinCode, normalizeJoinCode } from "./joinCode";

describe("normalizeJoinCode", () => {
  it("strips non-digits", () => {
    expect(normalizeJoinCode("12-34 56")).toBe("123456");
    expect(normalizeJoinCode("abc123def456ghi")).toBe("123456");
  });

  it("caps at 6 digits", () => {
    expect(normalizeJoinCode("1234567890")).toBe("123456");
  });

  it("preserves leading zeros", () => {
    expect(normalizeJoinCode("000123")).toBe("000123");
  });
});

describe("isValidJoinCode", () => {
  it("accepts exactly six digits including leading zeros", () => {
    expect(isValidJoinCode("123456")).toBe(true);
    expect(isValidJoinCode("000000")).toBe(true);
    expect(isValidJoinCode("007042")).toBe(true);
  });

  it("rejects wrong length or non-numeric", () => {
    expect(isValidJoinCode("12345")).toBe(false);
    expect(isValidJoinCode("1234567")).toBe(false);
    expect(isValidJoinCode("12a456")).toBe(false);
    expect(isValidJoinCode("")).toBe(false);
  });
});
