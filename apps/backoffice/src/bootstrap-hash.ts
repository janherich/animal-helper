export const bootstrapTokenFromHash = (hash: string): string | undefined => {
  const query = hash.startsWith("#") ? hash.slice(1) : hash;
  const token = new URLSearchParams(query).get("bootstrap");
  return token === null || token.length === 0 ? undefined : token;
};
