export type OriginEvidence = Readonly<{
  origin: string | undefined;
  secFetchSite: string | undefined;
}>;

export const requestOriginIsAllowed = (
  allowedOrigin: string,
  evidence: OriginEvidence,
): boolean => {
  const site = evidence.secFetchSite?.toLowerCase();
  if (site === "cross-site" || site === "same-site") {
    return false;
  }
  return evidence.origin === allowedOrigin;
};
