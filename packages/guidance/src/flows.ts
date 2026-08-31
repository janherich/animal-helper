import type { FlowKey, ScreenKey, SituationKey } from "./keys.js";

export type FlowDefinition = {
  key: FlowKey;
  situation: SituationKey;
  matrixId?: string;
  screens: readonly ScreenKey[];
};

const injuredPrefix = [
  "w01",
  "w03a",
  "w03b",
  "w04",
  "w09",
  "w09b",
  "w11",
] as const;

const injuredEnding = ["w24", "w25a", "w25b"] as const;

export const flows = {
  cruelty_standard: {
    key: "cruelty_standard",
    situation: "cruelty",
    screens: [
      "w01",
      "w02",
      "w03a",
      "w03b",
      "w04",
      "w06a",
      "w06b",
      "w11",
      "w24",
    ],
  },
  injured_companion: {
    key: "injured_companion",
    situation: "injured",
    matrixId: "FLOW-ZR-DOM",
    screens: [
      ...injuredPrefix,
      "w14",
      "w15",
      "w18",
      "w21",
      "w22",
      "w23",
      ...injuredEnding,
    ],
  },
  injured_farm: {
    key: "injured_farm",
    situation: "injured",
    matrixId: "FLOW-ZR-HOSP",
    screens: [
      ...injuredPrefix,
      "w13",
      "w14",
      "w15",
      "w18",
      "w21",
      "w22",
      "w23",
      ...injuredEnding,
    ],
  },
  injured_protected_standard: {
    key: "injured_protected_standard",
    situation: "injured",
    matrixId: "FLOW-ZR-CHR-STD",
    screens: [
      ...injuredPrefix,
      "w14",
      "w15",
      "w19",
      "w21",
      "w22",
      "w23",
      ...injuredEnding,
    ],
  },
  injured_game: {
    key: "injured_game",
    situation: "injured",
    matrixId: "FLOW-ZR-ZVER",
    screens: [...injuredPrefix, "w13", "w14", "w15", "w21", ...injuredEnding],
  },
  injured_exotic: {
    key: "injured_exotic",
    situation: "injured",
    matrixId: "FLOW-ZR-EXOTIC",
    screens: [
      ...injuredPrefix,
      "w13",
      "w14",
      "w15",
      "w18",
      "w21",
      "w22",
      "w23",
      ...injuredEnding,
    ],
  },
  injured_exotic_dangerous: {
    key: "injured_exotic_dangerous",
    situation: "injured",
    matrixId: "FLOW-ZR-EXOTIC-NEBEZPECNE",
    screens: [...injuredPrefix, "w20", ...injuredEnding],
  },
  injured_small_wild: {
    key: "injured_small_wild",
    situation: "injured",
    matrixId: "FLOW-ZR-MALY-WILD",
    screens: [...injuredPrefix, "w14", "w21", "w26", ...injuredEnding],
  },
  injured_pigeon_identify: {
    key: "injured_pigeon_identify",
    situation: "injured",
    matrixId: "FLOW-ZR-HOLUB-ROZLISENIE",
    screens: [
      ...injuredPrefix,
      "w15",
      "w18",
      "w21",
      "w22",
      "w23",
      ...injuredEnding,
    ],
  },
  injured_turtle_identify: {
    key: "injured_turtle_identify",
    situation: "injured",
    matrixId: "FLOW-ZR-KORYTNACKA-ID",
    screens: [...injuredPrefix, "w13", "w14", "w15", "w21", ...injuredEnding],
  },
} as const satisfies Record<FlowKey, FlowDefinition>;

export const flowFor = (key: FlowKey): (typeof flows)[FlowKey] => flows[key];
