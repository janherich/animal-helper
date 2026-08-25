const TABLE =
  "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_";

const INDEX: Record<string, number> = {};
for (let index = 0; index < TABLE.length; index += 1) {
  const character = TABLE[index];
  if (character !== undefined) {
    INDEX[character] = index;
  }
}

const digit = (value: number): string => {
  const character = TABLE[value];
  if (character === undefined) {
    throw new Error("invalid base64 digit");
  }

  return character;
};

export const CAPABILITY_TOKEN_PATTERN = /^[A-Za-z0-9_-]+=*$/;

export const bytesToBase64Url = (bytes: Uint8Array): string => {
  let output = "";

  for (let index = 0; index < bytes.length; index += 3) {
    const remaining = bytes.length - index;
    const a = bytes[index] ?? 0;
    const b = bytes[index + 1] ?? 0;
    const c = bytes[index + 2] ?? 0;
    const triple = (a << 16) | (b << 8) | c;

    output += digit((triple >> 18) & 63);
    output += digit((triple >> 12) & 63);
    if (remaining > 1) {
      output += digit((triple >> 6) & 63);
    }

    if (remaining > 2) {
      output += digit(triple & 63);
    }
  }

  return output;
};

export const base64UrlToBytes = (token: string): Uint8Array | undefined => {
  if (!CAPABILITY_TOKEN_PATTERN.test(token)) {
    return undefined;
  }

  const normalized = token.replace(/=+$/, "");
  const bytes: number[] = [];

  for (let index = 0; index < normalized.length; index += 4) {
    const first = INDEX[normalized[index] ?? ""];
    const second = INDEX[normalized[index + 1] ?? ""];
    if (first === undefined || second === undefined) {
      return undefined;
    }

    const thirdChar = normalized[index + 2];
    const fourthChar = normalized[index + 3];
    const third = thirdChar === undefined ? 0 : INDEX[thirdChar];
    const fourth = fourthChar === undefined ? 0 : INDEX[fourthChar];
    if (thirdChar !== undefined && third === undefined) {
      return undefined;
    }

    if (fourthChar !== undefined && fourth === undefined) {
      return undefined;
    }

    bytes.push((first << 2) | (second >> 4));
    if (thirdChar !== undefined) {
      bytes.push(((second & 15) << 4) | ((third ?? 0) >> 2));
    }

    if (fourthChar !== undefined) {
      bytes.push((((third ?? 0) & 3) << 6) | (fourth ?? 0));
    }
  }

  return Uint8Array.from(bytes);
};
