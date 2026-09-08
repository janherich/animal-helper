/** Keep in sync with packages/guidance/src/canonical.ts */
export const canonicalize = (value) => {
  if (value === null || typeof value !== "object") {
    return JSON.stringify(value);
  }

  if (Array.isArray(value)) {
    return `[${value.map((entry) => canonicalize(entry)).join(",")}]`;
  }

  const entries = Object.entries(value).sort(([left], [right]) =>
    left.localeCompare(right),
  );

  return `{${entries
    .map(([key, entry]) => `${JSON.stringify(key)}:${canonicalize(entry)}`)
    .join(",")}}`;
};

export const guidanceDocumentValue = (document) => ({
  cells: [...document.cells]
    .map((cell) => ({
      applicability: cell.applicability,
      copy: cell.copy,
      instructionKey: cell.instructionKey,
      kindKey: cell.kindKey,
      sortOrder: cell.sortOrder,
      ...(cell.actionTargetKey === undefined
        ? {}
        : { actionTargetKey: cell.actionTargetKey }),
    }))
    .sort((left, right) => {
      const kind = left.kindKey.localeCompare(right.kindKey);
      if (kind !== 0) {
        return kind;
      }
      return left.instructionKey.localeCompare(right.instructionKey);
    }),
  copy: document.copy,
});

export const canonicalizeGuidanceDocument = (document) =>
  canonicalize(guidanceDocumentValue(document));
