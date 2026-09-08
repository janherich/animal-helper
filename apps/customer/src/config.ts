export const DEFAULT_API_BASE_URL = "http://127.0.0.1:8787";

export const apiBaseUrl = (
  env: Pick<ImportMetaEnv, "VITE_API_BASE_URL"> & {
    DEV?: boolean;
  } = import.meta.env,
): string => {
  const value = env.VITE_API_BASE_URL;
  if (typeof value === "string" && value.length > 0) {
    return value.replace(/\/+$/, "");
  }
  if (env.DEV === true) {
    return "";
  }
  return DEFAULT_API_BASE_URL;
};
