import { createHash } from "node:crypto";

import {
  bundledContentHash,
  bundledGuidanceDocument,
  bundledPublicGuidance,
  canonicalizeGuidanceDocument,
  guidanceScope,
  parseGuidanceDocument,
  resolvePublicGuidance,
  type GuidanceDocument,
  type PublicGuidance,
} from "@animal-helper/guidance";
import {
  loadGuidanceDocument,
  loadGuidanceDraft,
  loadGuidancePublication,
} from "@animal-helper/event-store";
import type { Sql } from "postgres";

export const GUIDANCE_SOURCE_REFERENCES = [
  "docs/product/case-matrices/source/injured-and-stray.csv",
] as const;

export const hashGuidanceDocument = (document: GuidanceDocument): string =>
  createHash("sha256")
    .update(canonicalizeGuidanceDocument(document))
    .digest("hex");

export const publicGuidanceFor = async (
  sql: Sql | undefined,
): Promise<PublicGuidance> => {
  if (sql === undefined) {
    return bundledPublicGuidance();
  }

  try {
    const published = await loadGuidancePublication(sql, guidanceScope);
    if (published === undefined) {
      return bundledPublicGuidance();
    }
    const stored = await loadGuidanceDocument(sql, published.revisionId);
    if (stored === undefined) {
      return bundledPublicGuidance();
    }
    const document = parseGuidanceDocument(stored);
    return resolvePublicGuidance(document, {
      revisionId: published.revisionId,
      contentHash: published.contentHash,
      source: "published",
    });
  } catch {
    return bundledPublicGuidance();
  }
};

export const editableGuidance = async (
  sql: Sql,
): Promise<{
  source: "draft" | "published" | "bundled";
  revisionId: string;
  contentHash: string;
  document: GuidanceDocument;
}> => {
  const draft = await loadGuidanceDraft(sql, guidanceScope);
  if (draft !== undefined) {
    const stored = await loadGuidanceDocument(sql, draft.revisionId);
    if (stored !== undefined) {
      return {
        source: "draft",
        revisionId: draft.revisionId,
        contentHash: draft.contentHash,
        document: parseGuidanceDocument(stored),
      };
    }
  }

  const published = await loadGuidancePublication(sql, guidanceScope);
  if (published !== undefined) {
    const stored = await loadGuidanceDocument(sql, published.revisionId);
    if (stored !== undefined) {
      return {
        source: "published",
        revisionId: published.revisionId,
        contentHash: published.contentHash,
        document: parseGuidanceDocument(stored),
      };
    }
  }

  const document = bundledGuidanceDocument();
  return {
    source: "bundled",
    revisionId: "bundled",
    contentHash: bundledContentHash(),
    document,
  };
};
