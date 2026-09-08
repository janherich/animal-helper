const canonicalize = (value: unknown): string => {
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

export type CanonicalGuidanceCell = {
  applicability: "on" | "off";
  copy: Readonly<Record<string, string>>;
  instructionKey: string;
  kindKey: string;
  sortOrder: number;
  actionTargetKey?: string;
};

export type CanonicalGuidanceDocument = {
  copy: Readonly<Record<string, string>>;
  cells: readonly CanonicalGuidanceCell[];
};

export const guidanceDocumentValue = (
  document: CanonicalGuidanceDocument,
): CanonicalGuidanceDocument => ({
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

export const canonicalizeGuidanceDocument = (
  document: CanonicalGuidanceDocument,
): string => canonicalize(guidanceDocumentValue(document));
