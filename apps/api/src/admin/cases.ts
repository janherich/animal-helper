import {
  applyAdminCommand,
  caseNumber,
  isUnread,
  loadAdminCases,
  saveAdminDocument,
  type AdminCaseDocument,
  type AdminCommand,
  type AdminUrgency,
  type StoredAdminCase,
} from "@animal-helper/event-store";
import type { Sql } from "postgres";

const urgencyOf = (value: unknown): AdminUrgency | undefined =>
  value === "acute" || value === "high" || value === "normal"
    ? value
    : undefined;

const text = (value: unknown): string =>
  typeof value === "string" ? value.trim() : "";

export const adminCommandFromBody = (
  body: unknown,
  email: string,
  now: Date,
  createId: () => string,
): AdminCommand | undefined => {
  if (typeof body !== "object" || body === null || Array.isArray(body)) {
    return undefined;
  }
  const record = body as Record<string, unknown>;
  const at = now.toISOString();
  switch (record.type) {
    case "seen":
      return { type: "seen", at, email };
    case "take_over":
      return { type: "take_over", at, email };
    case "leave_passive":
      return { type: "leave_passive" };
    case "close":
      return { type: "close" };
    case "set_work": {
      const urgency = urgencyOf(record.urgency);
      if (urgency === undefined) {
        return undefined;
      }
      return {
        type: "set_work",
        urgency,
        nextStep: text(record.nextStep),
        deadline: text(record.deadline),
        note: text(record.note),
      };
    }
    case "add_action":
      return {
        type: "add_action",
        id: createId(),
        at,
        email,
        kind: text(record.kind),
        result: text(record.result),
      };
    case "add_step":
      return {
        type: "add_step",
        id: createId(),
        text: text(record.text),
        due: text(record.due),
      };
    case "remove_step":
      return text(record.id) === ""
        ? undefined
        : { type: "remove_step", id: text(record.id) };
    case "add_volunteer":
      return {
        type: "add_volunteer",
        name: text(record.name),
        task: text(record.task),
        result: text(record.result),
      };
    case "add_referral":
      return {
        type: "add_referral",
        id: createId(),
        recipient: text(record.recipient),
        sentOn: text(record.sentOn) || at.slice(0, 10),
        replyFileName: text(record.replyFileName),
      };
    case "add_inspection":
      return text(record.referralId) === ""
        ? undefined
        : {
            type: "add_inspection",
            id: createId(),
            referralId: text(record.referralId),
            on: text(record.on) || at.slice(0, 10),
            by: text(record.by),
            outcome: text(record.outcome),
            findings: text(record.findings),
          };
    default:
      return undefined;
  }
};

const summaryOf = (item: StoredAdminCase, email: string) => ({
  streamId: item.streamId,
  caseNumber: caseNumber(item.streamId, item.createdAt),
  createdAt: item.createdAt.toISOString(),
  updatedAt: item.updatedAt.toISOString(),
  workflowState: item.workflowState,
  situationType: item.facts.situationType,
  speciesKey: item.facts.speciesKey,
  address: item.facts.address,
  mode: item.document.mode,
  urgency: item.document.urgency,
  ownerEmail: item.document.ownerEmail,
  nextStep: item.document.nextStep,
  deadline: item.document.deadline,
  unread: isUnread(item.document, email, item.updatedAt.toISOString()),
  waitingOnAuthority: item.document.referrals.some(
    (referral) => referral.sentOn !== "" && referral.inspections.length === 0,
  ),
});

const detailOf = (item: StoredAdminCase, email: string) => ({
  ...summaryOf(item, email),
  facts: item.facts,
  work: item.document,
});

export const adminCaseList = async (sql: Sql, email: string) => ({
  cases: (await loadAdminCases(sql)).map((item) => summaryOf(item, email)),
});

export const adminCaseDetail = async (
  sql: Sql,
  streamId: string,
  email: string,
) => {
  const item = (await loadAdminCases(sql)).find(
    (entry) => entry.streamId === streamId,
  );
  return item === undefined ? undefined : detailOf(item, email);
};

export const adminUpdateCase = async (
  sql: Sql,
  streamId: string,
  email: string,
  command: AdminCommand,
): Promise<
  | Readonly<{ ok: true; case: ReturnType<typeof detailOf> }>
  | Readonly<{ ok: false; code: "not_found" | "not_allowed" | "invalid" }>
> => {
  const current = (await loadAdminCases(sql)).find(
    (entry) => entry.streamId === streamId,
  );
  if (current === undefined) {
    return { ok: false, code: "not_found" };
  }
  const applied = applyAdminCommand(current.document, command);
  if (!applied.ok) {
    return applied;
  }
  await saveAdminDocument(sql, streamId, applied.document);
  const saved: StoredAdminCase = {
    ...current,
    document: applied.document,
  };
  return { ok: true, case: detailOf(saved, email) };
};

export type { AdminCaseDocument };
