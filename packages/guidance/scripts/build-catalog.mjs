import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import {
  GROUP_BY_CATEGORY,
  kindKeyFor,
  resolveAskJuvenile,
  resolveAuthorityKey,
  resolveCategoryKey,
  resolveContactKind,
  resolveInjuredFlowKey,
  resolveSelfHelp,
  resolveSpeciesSlug,
  resolveSubcategoryKey,
  resolveVolunteers,
  resolveWarningFrame,
} from "./key-map.mjs";
import { parseCsv, rowsToObjects } from "./parse-csv.mjs";

const rootDir = join(dirname(fileURLToPath(import.meta.url)), "../../..");
const sourceDir = join(rootDir, "docs/product/case-matrices/source");
const outFile = join(
  rootDir,
  "packages/guidance/src/generated/animal-kinds.json",
);

const identityFor = (record) => {
  const categoryKey = resolveCategoryKey(record["Kategória"].trim());
  const subcategoryKey = resolveSubcategoryKey(record["Podkategória"] ?? "");
  const speciesSlug = resolveSpeciesSlug(record["Druh zvieraťa"].trim());
  const key = kindKeyFor(categoryKey, subcategoryKey, speciesSlug);
  return { key, categoryKey, subcategoryKey, speciesSlug };
};

const upsertKind = (kinds, record) => {
  const identity = identityFor(record);
  const existing = kinds.get(identity.key);
  if (existing === undefined) {
    kinds.set(identity.key, {
      key: identity.key,
      groupKey: GROUP_BY_CATEGORY[identity.categoryKey],
      categoryKey: identity.categoryKey,
      ...(identity.subcategoryKey === undefined
        ? {}
        : { subcategoryKey: identity.subcategoryKey }),
      labelSk: record["Druh zvieraťa"].trim(),
      matrix: {},
    });
    return kinds.get(identity.key);
  }

  if (existing.categoryKey !== identity.categoryKey) {
    throw new Error(`kind ${identity.key} changed category`);
  }
  return existing;
};

const loadCruelty = async (kinds) => {
  const text = await readFile(join(sourceDir, "animal-cruelty.csv"), "utf8");
  for (const record of rowsToObjects(parseCsv(text))) {
    const kind = upsertKind(kinds, record);
    kind.matrix.crueltyId = record.ID.trim();
    kind.cruelty = {
      flowKey: "cruelty_standard",
      authorityKey: resolveAuthorityKey(record["Interný návrh orgánu"].trim()),
    };
  }
};

const loadInjuredAndStray = async (kinds) => {
  const text = await readFile(join(sourceDir, "injured-and-stray.csv"), "utf8");
  for (const record of rowsToObjects(parseCsv(text))) {
    const kind = upsertKind(kinds, record);
    const situation = record["Typ situácie"].trim();
    const id = record.ID.trim();

    if (situation === "Zatúlané") {
      kind.matrix.strayId = id;
      kind.stray = { content: "stub" };
      continue;
    }

    if (situation !== "Zranené") {
      throw new Error(`unknown situation type: ${situation}`);
    }

    kind.matrix.injuredId = id;
    const flowKey = resolveInjuredFlowKey(
      record["Flow ID"],
      record["Vyplniť na úrovni"],
    );
    if (flowKey === undefined) {
      throw new Error(`missing injured flow for ${id}`);
    }

    const warningFrame = resolveWarningFrame(record["W13/W14 – vybraný frame"]);
    const primaryContact = resolveContactKind(
      record["W15/W20 – kontakt 1 typ"],
    );
    const secondaryContact = resolveContactKind(
      record["W19/W15 – kontakt 2 typ"],
    );
    const showVolunteers = resolveVolunteers(record["W21 – zobraziť?"]);
    const selfHelp = resolveSelfHelp(record["W22/W23 – zobraziť?"]);
    const askJuvenile = resolveAskJuvenile(record["W09 – Ide o mláďa?"]);

    kind.injured = {
      content: "ready",
      flowKey,
      askConscious: true,
      ...(askJuvenile === undefined ? {} : { askJuvenile }),
      ...(warningFrame === undefined ? {} : { warningFrame }),
      ...(primaryContact === undefined ? {} : { primaryContact }),
      ...(secondaryContact === undefined ? {} : { secondaryContact }),
      ...(showVolunteers === undefined ? {} : { showVolunteers }),
      ...(selfHelp === undefined ? {} : { selfHelp }),
    };
  }
};

const kinds = new Map();
await loadCruelty(kinds);
await loadInjuredAndStray(kinds);

const catalog = [...kinds.values()].sort((left, right) =>
  left.key.localeCompare(right.key),
);

await mkdir(dirname(outFile), { recursive: true });
await writeFile(outFile, `${JSON.stringify(catalog, null, 2)}\n`, "utf8");
console.log(`wrote ${catalog.length} animal kinds to ${outFile}`);
