import { findAnimalKind } from "@animal-helper/guidance";
import { t } from "@animal-helper/i18n";

import { CUSTOMER_PATHS, type SituationType } from "./walk.js";

export const situationChoiceKeys = [
  "injured",
  "stray",
  "dead",
  "cruelty",
  "other",
] as const;

export type SituationChoiceKey = (typeof situationChoiceKeys)[number];

export const situationChoices = [
  { key: "injured", style: "filled" },
  { key: "stray", style: "filled" },
  { key: "dead", style: "filled" },
  { key: "cruelty", style: "filled" },
  { key: "other", style: "outlined" },
] as const satisfies readonly {
  key: SituationChoiceKey;
  style: "filled" | "outlined";
}[];

export const DRAFT_WALK_STEPS = 4;

export const isWalkableSituation = (
  key: SituationChoiceKey,
): key is SituationType => key === "injured" || key === "stray";

export const draftStepIndex = (kindKey: string | undefined): number =>
  kindKey === undefined ? 1 : 3;

export const draftProgressRatio = (kindKey: string | undefined): number =>
  draftStepIndex(kindKey) / DRAFT_WALK_STEPS;

export const formatWalkStep = (current: number): string =>
  t("customer.situation.draftStep")
    .replaceAll("{current}", String(current))
    .replaceAll("{total}", String(DRAFT_WALK_STEPS));

export const formatDraftStep = (kindKey: string | undefined): string =>
  formatWalkStep(draftStepIndex(kindKey));

export const draftSummary = (
  situationType: SituationType,
  kindKey: string | undefined,
): string => {
  const situation = t(`customer.situation.summary.${situationType}`);
  const kind = kindKey === undefined ? undefined : findAnimalKind(kindKey);
  if (kind === undefined) {
    return situation;
  }
  return `${situation}${t("customer.situation.draftSummarySeparator")}${kind.labelSk}`;
};

export const draftResumeFromPath = (kindKey: string | undefined): string =>
  kindKey === undefined ? CUSTOMER_PATHS.situation : CUSTOMER_PATHS.details;
