import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import { canonicalizeGuidanceDocument } from "./canonical.mjs";
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
import { sanitizeImportedCopy } from "./sanitize-copy.mjs";

const rootDir = join(dirname(fileURLToPath(import.meta.url)), "../../..");
const sourceDir = join(rootDir, "docs/product/case-matrices/source");
const generatedDir = join(rootDir, "packages/guidance/src/generated");
const catalogFile = join(generatedDir, "animal-kinds.json");
const fallbackFile = join(generatedDir, "guidance-fallback.json");
const sourceReference =
  "docs/product/case-matrices/source/injured-and-stray.csv";

const COPY_COLUMNS = {
  doNot: "W13/W14 – Čo nerobiť (doslova, všetky body)",
  doBefore: "W14 – Čo urobiť pred ďalším postupom (doslova, všetky body)",
  primaryTitle: "Kontakt 1 – CTA / nadpis",
  primaryBody: "Kontakt 1 – text pod nadpisom",
  secondaryTitle: "Kontakt 2 – CTA / nadpis",
  secondaryBody: "Kontakt 2 – text pod nadpisom",
  volunteers: "W21 – text pod nadpisom",
  selfHelp: "W22/W23 – intro",
};

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

const slotCopy = (slots) => {
  const copy = {};
  for (const [key, value] of Object.entries(slots)) {
    if (value !== "") {
      copy[key] = value;
    }
  }
  return copy;
};

const pushCell = (cells, cell) => {
  cells.push({
    kindKey: cell.kindKey,
    instructionKey: cell.instructionKey,
    applicability: cell.applicability,
    sortOrder: cell.sortOrder,
    copy: cell.copy,
    ...(cell.actionTargetKey === undefined
      ? {}
      : { actionTargetKey: cell.actionTargetKey }),
  });
};

const cellsForInjured = (kind, record) => {
  const doNot = sanitizeImportedCopy(record[COPY_COLUMNS.doNot] ?? "");
  const doBefore = sanitizeImportedCopy(record[COPY_COLUMNS.doBefore] ?? "");
  const primaryTitle = sanitizeImportedCopy(
    record[COPY_COLUMNS.primaryTitle] ?? "",
  );
  const primaryBody = sanitizeImportedCopy(
    record[COPY_COLUMNS.primaryBody] ?? "",
  );
  const secondaryTitle = sanitizeImportedCopy(
    record[COPY_COLUMNS.secondaryTitle] ?? "",
  );
  const secondaryBody = sanitizeImportedCopy(
    record[COPY_COLUMNS.secondaryBody] ?? "",
  );
  const volunteers = sanitizeImportedCopy(
    record[COPY_COLUMNS.volunteers] ?? "",
  );
  const selfHelp = sanitizeImportedCopy(record[COPY_COLUMNS.selfHelp] ?? "");
  const injured = kind.injured;
  const cells = [];

  pushCell(cells, {
    kindKey: kind.key,
    instructionKey: "warning.do_not",
    applicability: doNot === "" ? "off" : "on",
    sortOrder: 10,
    copy: slotCopy({ "warning.do_not": doNot }),
  });
  pushCell(cells, {
    kindKey: kind.key,
    instructionKey: "warning.do_before",
    applicability: doBefore === "" ? "off" : "on",
    sortOrder: 20,
    copy: slotCopy({ "warning.do_before": doBefore }),
  });
  pushCell(cells, {
    kindKey: kind.key,
    instructionKey: "contact.primary",
    applicability:
      injured.primaryContact === undefined ||
      (primaryTitle === "" && primaryBody === "")
        ? "off"
        : "on",
    sortOrder: 30,
    copy: slotCopy({
      "contact.primary.title": primaryTitle,
      "contact.primary.body": primaryBody,
    }),
    actionTargetKey: injured.primaryContact,
  });
  pushCell(cells, {
    kindKey: kind.key,
    instructionKey: "contact.secondary",
    applicability:
      injured.secondaryContact === undefined ||
      (secondaryTitle === "" && secondaryBody === "")
        ? "off"
        : "on",
    sortOrder: 40,
    copy: slotCopy({
      "contact.secondary.title": secondaryTitle,
      "contact.secondary.body": secondaryBody,
    }),
    actionTargetKey: injured.secondaryContact,
  });
  pushCell(cells, {
    kindKey: kind.key,
    instructionKey: "volunteers",
    applicability:
      injured.showVolunteers === true && volunteers !== "" ? "on" : "off",
    sortOrder: 50,
    copy: slotCopy({ "volunteers.body": volunteers }),
  });
  pushCell(cells, {
    kindKey: kind.key,
    instructionKey: "self_help",
    applicability:
      injured.selfHelp !== undefined &&
      injured.selfHelp !== "none" &&
      selfHelp !== ""
        ? "on"
        : "off",
    sortOrder: 60,
    copy: slotCopy({ "self_help.intro": selfHelp }),
  });

  return cells;
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

const loadInjuredAndStray = async (kinds, cells) => {
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
    cells.push(...cellsForInjured(kind, record));
  }
};

const kinds = new Map();
const cells = [];
await loadCruelty(kinds);
await loadInjuredAndStray(kinds, cells);

const catalog = [...kinds.values()].sort((left, right) =>
  left.key.localeCompare(right.key),
);

const document = { copy: {}, cells };
const contentHash = createHash("sha256")
  .update(canonicalizeGuidanceDocument(document))
  .digest("hex");

const fallback = {
  schemaVersion: 1,
  locale: "sk-SK",
  jurisdiction: "SK",
  flowKey: "injured",
  sourceReferences: [sourceReference],
  contentHash,
  copy: {},
  cells,
};

await mkdir(generatedDir, { recursive: true });
await writeFile(catalogFile, `${JSON.stringify(catalog, null, 2)}\n`, "utf8");
await writeFile(fallbackFile, `${JSON.stringify(fallback, null, 2)}\n`, "utf8");
console.log(
  `wrote ${catalog.length} animal kinds and ${cells.length} guidance cells`,
);
