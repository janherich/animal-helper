import type {
  AuthenticationResponseJSON,
  PublicKeyCredentialCreationOptionsJSON,
  PublicKeyCredentialRequestOptionsJSON,
  RegistrationResponseJSON,
} from "@simplewebauthn/browser";

export type Operator = Readonly<{
  id: string;
  email: string;
}>;

export type QueueCase = Readonly<{
  streamId: string;
  workflowState: string;
  hasPrivateData: boolean;
  privateDataPurged: boolean;
  createdAt: string;
  updatedAt: string;
}>;

export type AdminError = Error & { status?: number; code?: string };

const adminFetch = async (path: string, body?: unknown): Promise<unknown> => {
  let response: Response;
  try {
    response = await fetch(
      path,
      body === undefined
        ? {
            method: "GET",
            credentials: "same-origin",
            cache: "no-store",
            signal: AbortSignal.timeout(12_000),
          }
        : {
            method: "POST",
            credentials: "same-origin",
            cache: "no-store",
            headers: { "content-type": "application/json" },
            body: JSON.stringify(body),
            signal: AbortSignal.timeout(12_000),
          },
    );
  } catch {
    throw Object.assign(new Error("unreachable"), {
      code: "unreachable",
    });
  }

  if (response.status === 204) {
    return null;
  }

  const value: unknown = await response.json().catch(() => ({}));
  if (!response.ok) {
    const error = Object.assign(new Error("request_failed"), {
      status: response.status,
      code: readErrorCode(value),
    }) as AdminError;
    throw error;
  }

  return value;
};

export const fetchRegistrationOptions = (bootstrapToken: string) =>
  adminFetch("/admin/auth/register/options", { bootstrapToken }) as Promise<{
    options: PublicKeyCredentialCreationOptionsJSON;
  }>;

export const verifyRegistration = (response: RegistrationResponseJSON) =>
  adminFetch("/admin/auth/register/verify", { response }) as Promise<{
    operator: Operator;
    environment: string;
    expiresAt: string;
  }>;

export const fetchLoginOptions = () =>
  adminFetch("/admin/auth/login/options", {}) as Promise<{
    options: PublicKeyCredentialRequestOptionsJSON;
  }>;

export const verifyLogin = (response: AuthenticationResponseJSON) =>
  adminFetch("/admin/auth/login/verify", { response }) as Promise<{
    operator: Operator;
    environment: string;
    expiresAt: string;
  }>;

export const fetchSession = () =>
  adminFetch("/admin/session") as Promise<{
    operator: Operator;
    environment: string;
    expiresAt: string;
  }>;

export const fetchQueue = () =>
  adminFetch("/admin/queue") as Promise<{ cases: QueueCase[] }>;

export const logoutSession = () => adminFetch("/admin/auth/logout", {});

export type GuidanceEditorCell = {
  instructionKey: string;
  applicability: "on" | "off";
  sortOrder: number;
  copy: Record<string, string>;
  slotKeys: readonly string[];
  screenKey?: string;
  actionTargetKey?: string;
};

export type GuidanceKindResponse = {
  source: "draft" | "published" | "bundled";
  revisionId: string;
  contentHash: string;
  kindKey: string;
  cells: GuidanceEditorCell[];
  items: {
    screenKey: string;
    instructionKey: string;
    polarity: string;
    slots: Record<string, string>;
    action?: { kind: string; targetKey: string };
  }[];
};

export const fetchGuidanceKind = (kindKey: string) =>
  adminFetch(
    `/admin/guidance/kind/injured/${kindKey}`,
  ) as Promise<GuidanceKindResponse>;

export const saveGuidanceCell = (body: {
  expectedHash: string;
  kindKey: string;
  instructionKey: string;
  applicability: "on" | "off";
  copy: Record<string, string>;
  actionTargetKey?: string;
}) =>
  adminFetch("/admin/guidance/cells", body) as Promise<GuidanceKindResponse>;

export const publishGuidance = (body: {
  expectedHash: string;
  description: string;
}) =>
  adminFetch("/admin/guidance/publish", body) as Promise<{
    source: "published";
    revisionId: string;
    contentHash: string;
  }>;

const readErrorCode = (value: unknown): string | undefined => {
  if (typeof value !== "object" || value === null || !("error" in value)) {
    return undefined;
  }
  const error = value.error;
  if (typeof error !== "object" || error === null || !("code" in error)) {
    return undefined;
  }
  const code = error.code;
  return typeof code === "string" ? code : undefined;
};
