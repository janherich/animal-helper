import { flowFor } from "./flows.js";
import { type ContactKey, type FlowKey, type ScreenKey } from "./keys.js";

export const GUIDANCE_SCHEMA_VERSION = 1;
export const GUIDANCE_LOCALE = "sk-SK";
export const GUIDANCE_JURISDICTION = "SK";
export const GUIDANCE_FLOW_KEY = "injured";
export const COPY_MAX_LENGTH = 4000;
export const BUNDLED_REVISION_ID = "bundled";

export const guidanceScope = {
  schemaVersion: GUIDANCE_SCHEMA_VERSION,
  locale: GUIDANCE_LOCALE,
  jurisdiction: GUIDANCE_JURISDICTION,
  flowKey: GUIDANCE_FLOW_KEY,
} as const;

export const instructionKeys = [
  "warning.do_not",
  "warning.do_before",
  "contact.primary",
  "contact.secondary",
  "volunteers",
  "self_help",
] as const;

export type InstructionKey = (typeof instructionKeys)[number];

export const copySlotKeys = [
  "warning.do_not",
  "warning.do_before",
  "contact.primary.title",
  "contact.primary.body",
  "contact.secondary.title",
  "contact.secondary.body",
  "volunteers.body",
  "self_help.intro",
] as const;

export type CopySlotKey = (typeof copySlotKeys)[number];

export const instructionSlotKeys: Readonly<
  Record<InstructionKey, readonly CopySlotKey[]>
> = {
  "warning.do_not": ["warning.do_not"],
  "warning.do_before": ["warning.do_before"],
  "contact.primary": ["contact.primary.title", "contact.primary.body"],
  "contact.secondary": ["contact.secondary.title", "contact.secondary.body"],
  volunteers: ["volunteers.body"],
  self_help: ["self_help.intro"],
};

export type InstructionPolarity = "do" | "do_not" | "info";

export const polarityFor: Readonly<
  Record<InstructionKey, InstructionPolarity>
> = {
  "warning.do_not": "do_not",
  "warning.do_before": "do",
  "contact.primary": "info",
  "contact.secondary": "info",
  volunteers: "info",
  self_help: "do",
};

export const instructionSortOrder: Readonly<Record<InstructionKey, number>> = {
  "warning.do_not": 10,
  "warning.do_before": 20,
  "contact.primary": 30,
  "contact.secondary": 40,
  volunteers: 50,
  self_help: 60,
};

const includesKey = <Key extends string>(
  keys: readonly Key[],
  value: string,
): value is Key => (keys as readonly string[]).includes(value);

export const isInstructionKey = (value: string): value is InstructionKey =>
  includesKey(instructionKeys, value);

export const isCopySlotKey = (value: string): value is CopySlotKey =>
  includesKey(copySlotKeys, value);

export const isInstructionPolarity = (
  value: string,
): value is InstructionPolarity =>
  value === "do" || value === "do_not" || value === "info";

export const screenForInstruction = (
  instructionKey: InstructionKey,
  flowKey: FlowKey,
): ScreenKey | undefined => {
  const screens: readonly ScreenKey[] = flowFor(flowKey).screens;
  const has = (key: ScreenKey): boolean => screens.includes(key);

  switch (instructionKey) {
    case "warning.do_not":
      if (has("w13")) {
        return "w13";
      }
      return has("w14") ? "w14" : undefined;
    case "warning.do_before":
      return has("w14") ? "w14" : undefined;
    case "contact.primary":
      if (has("w20")) {
        return "w20";
      }
      return has("w15") ? "w15" : undefined;
    case "contact.secondary":
      if (has("w19")) {
        return "w19";
      }
      return has("w18") ? "w18" : undefined;
    case "volunteers":
      return has("w21") ? "w21" : undefined;
    case "self_help":
      return has("w22") ? "w22" : undefined;
  }
};

export const actionTargetForInstruction = (
  instructionKey: InstructionKey,
  primaryContact: ContactKey | undefined,
  secondaryContact: ContactKey | undefined,
): ContactKey | undefined => {
  if (instructionKey === "contact.primary") {
    return primaryContact;
  }
  if (instructionKey === "contact.secondary") {
    return secondaryContact;
  }
  return undefined;
};
