import type { FormSnapshotV1 } from "@animal-helper/contracts";
import {
  findAnimalKind,
  groupKeys,
  kindsForSituation,
  type AnimalKind,
} from "@animal-helper/guidance";

export const DETAILS_WALK_STEP = 3;
export const OTHER_TEXT_MAX = 2000;

export type ConditionSymptom = FormSnapshotV1["condition"]["symptoms"][number];
export type ConditionTernary = NonNullable<
  FormSnapshotV1["condition"]["conscious"]
>;
export type DetailsSituationType = FormSnapshotV1["situationType"];

export type DetailsConditionInput = {
  symptoms?: readonly ConditionSymptom[];
  otherText?: string;
  conscious?: ConditionTernary;
  isJuvenile?: ConditionTernary;
};

export const symptomChoices = [
  "bleeding",
  "hit",
  "poison_suspected",
  "vomiting",
  "foam",
  "unknown",
] as const satisfies readonly ConditionSymptom[];

export const ternaryChoices = [
  "yes",
  "no",
  "unknown",
] as const satisfies readonly ConditionTernary[];

export const groupedInjuredKinds = (): readonly {
  key: (typeof groupKeys)[number];
  kinds: readonly AnimalKind[];
}[] => {
  const injuredKinds = kindsForSituation("injured");
  return groupKeys
    .map((groupKey) => ({
      key: groupKey,
      kinds: injuredKinds.filter((kind) => kind.groupKey === groupKey),
    }))
    .filter((group) => group.kinds.length > 0);
};

export const toggleSymptom = (
  current: readonly ConditionSymptom[],
  key: ConditionSymptom,
): ConditionSymptom[] => {
  if (key === "unknown") {
    return current.includes("unknown") ? [] : ["unknown"];
  }

  const withoutUnknown = current.filter((item) => item !== "unknown");
  if (withoutUnknown.includes(key)) {
    return withoutUnknown.filter((item) => item !== key);
  }

  return [...withoutUnknown, key];
};

export const detailsCondition = (
  input: DetailsConditionInput = {},
): FormSnapshotV1["condition"] => {
  const symptoms = [...(input.symptoms ?? [])];
  const trimmedOther = input.otherText?.trim() ?? "";
  const hasOther = symptoms.includes("other");

  return {
    symptoms,
    ...(hasOther && trimmedOther !== "" ? { otherText: trimmedOther } : {}),
    ...(input.conscious === undefined ? {} : { conscious: input.conscious }),
    ...(input.isJuvenile === undefined ? {} : { isJuvenile: input.isJuvenile }),
  };
};

export const shouldAskConscious = (
  situationType: DetailsSituationType,
  kind: AnimalKind | undefined,
): boolean =>
  situationType === "injured" && kind?.injured?.askConscious !== false;

export const shouldAskJuvenile = (
  situationType: DetailsSituationType,
  kind: AnimalKind | undefined,
): boolean =>
  situationType === "injured" && kind?.injured?.askJuvenile !== false;

export const detailsCanContinue = (
  situationType: DetailsSituationType,
  kind: AnimalKind | undefined,
  symptoms: readonly ConditionSymptom[],
  otherText: string,
): boolean => {
  if (situationType === "injured" && kind === undefined) {
    return false;
  }

  return !symptoms.includes("other") || otherText.trim() !== "";
};

export const kindByKey = (key: string): AnimalKind | undefined =>
  key === "" ? undefined : findAnimalKind(key);
