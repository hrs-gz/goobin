export const JOIN_CODE_LENGTH = 6;

/** Keep only digits, capped at the code length. Preserves leading zeros. */
export function normalizeJoinCode(input: string): string {
  return input.replace(/\D/g, "").slice(0, JOIN_CODE_LENGTH);
}

/** True for exactly a 6-digit numeric string (leading zeros allowed). */
export function isValidJoinCode(code: string): boolean {
  return new RegExp(`^\\d{${JOIN_CODE_LENGTH}}$`).test(code);
}

/** Format a code for display (mirrors DB storage: no separators). */
export function formatJoinCode(code: string): string {
  return normalizeJoinCode(code);
}
