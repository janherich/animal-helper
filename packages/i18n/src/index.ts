import skSk from "../locales/sk-SK/messages.json" with { type: "json" };

export const DEFAULT_LOCALE = "sk-SK";
export const messages = skSk;

export const t = (key: string): string => {
  const parts = key.split(".");
  let current: unknown = messages;

  for (const part of parts) {
    if (
      typeof current !== "object" ||
      current === null ||
      !Object.hasOwn(current, part)
    ) {
      throw new Error(`Missing locale key: ${key}`);
    }

    current = (current as Record<string, unknown>)[part];
  }

  if (typeof current !== "string") {
    throw new Error(`Locale key is not a string: ${key}`);
  }

  return current;
};
