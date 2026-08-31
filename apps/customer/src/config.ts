export const DEFAULT_API_BASE_URL = "http://127.0.0.1:8787";

export const apiBaseUrl = (
  env: Pick<ImportMetaEnv, "VITE_API_BASE_URL"> = import.meta.env,
): string => {
  const value = env.VITE_API_BASE_URL;
  return typeof value === "string" && value.length > 0
    ? value.replace(/\/+$/, "")
    : DEFAULT_API_BASE_URL;
};
