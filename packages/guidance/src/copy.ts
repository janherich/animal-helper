import { COPY_MAX_LENGTH } from "./slots.js";

const UNSAFE_COPY =
  /https?:\/\/|[<>]|javascript:|data:|tel:|\+?\d[\d\s./-]{8,}\d/i;

export const copyLooksSafe = (value: string): boolean => {
  if (value.length > COPY_MAX_LENGTH) {
    return false;
  }
  return !UNSAFE_COPY.test(value);
};

export const guidanceLines = (text: string): readonly string[] =>
  text.split(/\r?\n/).flatMap((line) => {
    const trimmed = line.replace(/^[•\-\u2022]\s*/, "").trim();
    return trimmed === "" ? [] : [trimmed];
  });
