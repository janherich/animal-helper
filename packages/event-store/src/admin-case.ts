import type { Sql } from "postgres";

export type AdminMode = "passive" | "review" | "active" | "closed";
export type AdminUrgency = "acute" | "high" | "normal";

export type AdminAction = Readonly<{
  id: string;
  kind: string;
  at: string;
  by: string;
  result: string;
}>;

export type AdminStep = Readonly<{
  id: string;
  text: string;
  due: string;
  done: boolean;
}>;

export type AdminVolunteer = Readonly<{
  name: string;
  task: string;
  result: string;
}>;

export type AdminInspection = Readonly<{
  id: string;
  on: string;
  by: string;
  outcome: string;
  findings: string;
}>;

export type AdminReferral = Readonly<{
  id: string;
  recipient: string;
  sentOn: string;
  replyFileName: string;
  inspections: readonly AdminInspection[];
}>;

export type AdminCaseDocument = Readonly<{
  mode: AdminMode;
  urgency: AdminUrgency;
  ownerEmail: string;
  nextStep: string;
  deadline: string;
  note: string;
  seenBy: Readonly<Record<string, string>>;
  volunteer?: AdminVolunteer;
  actions: readonly AdminAction[];
  referrals: readonly AdminReferral[];
  steps: readonly AdminStep[];
}>;

export type AdminCommand =
  | Readonly<{ type: "seen"; at: string; email: string }>
  | Readonly<{ type: "take_over"; at: string; email: string }>
  | Readonly<{ type: "leave_passive" }>
  | Readonly<{ type: "close" }>
  | Readonly<{
      type: "set_work";
      urgency: AdminUrgency;
      nextStep: string;
      deadline: string;
      note: string;
    }>
  | Readonly<{
      type: "add_action";
      id: string;
      at: string;
      email: string;
      kind: string;
      result: string;
    }>
  | Readonly<{ type: "add_step"; id: string; text: string; due: string }>
  | Readonly<{ type: "remove_step"; id: string }>
  | Readonly<{
      type: "add_volunteer";
      name: string;
      task: string;
      result: string;
    }>
  | Readonly<{
      type: "add_referral";
      id: string;
      recipient: string;
      sentOn: string;
      replyFileName: string;
    }>
  | Readonly<{
      type: "add_inspection";
      id: string;
      referralId: string;
      on: string;
      by: string;
      outcome: string;
      findings: string;
    }>;

export type AppCaseFacts = Readonly<{
  situationType: string;
  speciesKey: string;
  address: string;
  latitude?: number;
  longitude?: number;
  symptoms: readonly string[];
  description: string;
  reporterName: string;
  reporterPhone: string;
  reporterEmail: string;
  shareWithAuthorities: boolean;
  mediaCount: number;
}>;

export type PrivateRecordRow = Readonly<{
  kind: string;
  payload: unknown;
}>;

const emptyFacts = (): AppCaseFacts => ({
  situationType: "",
  speciesKey: "",
  address: "",
  symptoms: [],
  description: "",
  reporterName: "",
  reporterPhone: "",
  reporterEmail: "",
  shareWithAuthorities: false,
  mediaCount: 0,
});

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const text = (value: unknown): string =>
  typeof value === "string" ? value.trim() : "";

export const initialAdminDocument = (
  situationType: string,
): AdminCaseDocument => ({
  mode:
    situationType === "cruelty" || situationType === "dead"
      ? "active"
      : "passive",
  urgency:
    situationType === "cruelty" || situationType === "dead" ? "high" : "normal",
  ownerEmail: "",
  nextStep: "",
  deadline: "",
  note: "",
  seenBy: {},
  actions: [],
  referrals: [],
  steps: [],
});

export const parseAdminDocument = (
  value: unknown,
  situationType: string,
): AdminCaseDocument => {
  const base = initialAdminDocument(situationType);
  if (!isRecord(value)) {
    return base;
  }
  const mode = value.mode;
  const urgency = value.urgency;
  return {
    ...base,
    mode:
      mode === "passive" ||
      mode === "review" ||
      mode === "active" ||
      mode === "closed"
        ? mode
        : base.mode,
    urgency:
      urgency === "acute" || urgency === "high" || urgency === "normal"
        ? urgency
        : base.urgency,
    ownerEmail: text(value.ownerEmail),
    nextStep: text(value.nextStep).slice(0, 500),
    deadline: text(value.deadline),
    note: text(value.note).slice(0, 4000),
    seenBy: isRecord(value.seenBy)
      ? Object.fromEntries(
          Object.entries(value.seenBy).flatMap(([key, seen]) =>
            typeof seen === "string" ? [[key, seen]] : [],
          ),
        )
      : {},
    ...(isRecord(value.volunteer)
      ? {
          volunteer: {
            name: text(value.volunteer.name).slice(0, 200),
            task: text(value.volunteer.task).slice(0, 200),
            result: text(value.volunteer.result).slice(0, 2000),
          },
        }
      : {}),
    actions: Array.isArray(value.actions)
      ? value.actions.flatMap((item) => {
          if (!isRecord(item) || text(item.id) === "") {
            return [];
          }
          return [
            {
              id: text(item.id),
              kind: text(item.kind).slice(0, 80),
              at: text(item.at),
              by: text(item.by).slice(0, 200),
              result: text(item.result).slice(0, 2000),
            },
          ];
        })
      : [],
    steps: Array.isArray(value.steps)
      ? value.steps.flatMap((item) => {
          if (!isRecord(item) || text(item.id) === "") {
            return [];
          }
          return [
            {
              id: text(item.id),
              text: text(item.text).slice(0, 500),
              due: text(item.due),
              done: item.done === true,
            },
          ];
        })
      : [],
    referrals: Array.isArray(value.referrals)
      ? value.referrals.flatMap((item) => {
          if (!isRecord(item) || text(item.id) === "") {
            return [];
          }
          return [
            {
              id: text(item.id),
              recipient: text(item.recipient).slice(0, 200),
              sentOn: text(item.sentOn),
              replyFileName: text(item.replyFileName).slice(0, 300),
              inspections: Array.isArray(item.inspections)
                ? item.inspections.flatMap((inspection) => {
                    if (!isRecord(inspection) || text(inspection.id) === "") {
                      return [];
                    }
                    return [
                      {
                        id: text(inspection.id),
                        on: text(inspection.on),
                        by: text(inspection.by).slice(0, 200),
                        outcome: text(inspection.outcome).slice(0, 80),
                        findings: text(inspection.findings).slice(0, 2000),
                      },
                    ];
                  })
                : [],
            },
          ];
        })
      : [],
  };
};

const activeOnly = (
  document: AdminCaseDocument,
): { ok: false; code: "not_allowed" } | undefined =>
  document.mode === "active" ? undefined : { ok: false, code: "not_allowed" };

export const applyAdminCommand = (
  document: AdminCaseDocument,
  command: AdminCommand,
):
  | Readonly<{ ok: true; document: AdminCaseDocument }>
  | Readonly<{ ok: false; code: "not_allowed" | "invalid" }> => {
  switch (command.type) {
    case "seen":
      return {
        ok: true,
        document: {
          ...document,
          seenBy: { ...document.seenBy, [command.email]: command.at },
        },
      };
    case "take_over":
      if (document.mode !== "passive" && document.mode !== "review") {
        return { ok: false, code: "not_allowed" };
      }
      return {
        ok: true,
        document: {
          ...document,
          mode: "active",
          ownerEmail: document.ownerEmail || command.email,
        },
      };
    case "leave_passive":
      if (document.mode !== "review") {
        return { ok: false, code: "not_allowed" };
      }
      return { ok: true, document: { ...document, mode: "passive" } };
    case "close":
      if (document.mode !== "active") {
        return { ok: false, code: "not_allowed" };
      }
      return { ok: true, document: { ...document, mode: "closed" } };
    case "set_work": {
      const blocked = activeOnly(document);
      if (blocked) {
        return blocked;
      }
      return {
        ok: true,
        document: {
          ...document,
          urgency: command.urgency,
          nextStep: command.nextStep.slice(0, 500),
          deadline: command.deadline,
          note: command.note.slice(0, 4000),
          ownerEmail: document.ownerEmail,
        },
      };
    }
    case "add_action": {
      const blocked = activeOnly(document);
      if (
        blocked ||
        command.kind.trim() === "" ||
        command.result.trim() === ""
      ) {
        return blocked ?? { ok: false, code: "invalid" };
      }
      return {
        ok: true,
        document: {
          ...document,
          ownerEmail: document.ownerEmail || command.email,
          actions: [
            ...document.actions,
            {
              id: command.id,
              kind: command.kind.trim().slice(0, 80),
              at: command.at,
              by: command.email,
              result: command.result.trim().slice(0, 2000),
            },
          ],
        },
      };
    }
    case "add_step": {
      const blocked = activeOnly(document);
      if (blocked || command.text.trim() === "") {
        return blocked ?? { ok: false, code: "invalid" };
      }
      return {
        ok: true,
        document: {
          ...document,
          steps: [
            ...document.steps,
            {
              id: command.id,
              text: command.text.trim().slice(0, 500),
              due: command.due,
              done: false,
            },
          ],
        },
      };
    }
    case "remove_step": {
      const blocked = activeOnly(document);
      if (blocked) {
        return blocked;
      }
      return {
        ok: true,
        document: {
          ...document,
          steps: document.steps.filter((step) => step.id !== command.id),
        },
      };
    }
    case "add_volunteer": {
      const blocked = activeOnly(document);
      if (blocked || command.name.trim() === "") {
        return blocked ?? { ok: false, code: "invalid" };
      }
      return {
        ok: true,
        document: {
          ...document,
          volunteer: {
            name: command.name.trim().slice(0, 200),
            task: command.task.trim().slice(0, 200),
            result: command.result.trim().slice(0, 2000),
          },
        },
      };
    }
    case "add_referral": {
      const blocked = activeOnly(document);
      if (blocked || command.recipient.trim() === "") {
        return blocked ?? { ok: false, code: "invalid" };
      }
      return {
        ok: true,
        document: {
          ...document,
          referrals: [
            ...document.referrals,
            {
              id: command.id,
              recipient: command.recipient.trim().slice(0, 200),
              sentOn: command.sentOn,
              replyFileName: command.replyFileName.trim().slice(0, 300),
              inspections: [],
            },
          ],
        },
      };
    }
    case "add_inspection": {
      const blocked = activeOnly(document);
      const referral = document.referrals.find(
        (item) => item.id === command.referralId,
      );
      if (blocked || referral === undefined || command.findings.trim() === "") {
        return blocked ?? { ok: false, code: "invalid" };
      }
      return {
        ok: true,
        document: {
          ...document,
          referrals: document.referrals.map((item) =>
            item.id === referral.id
              ? {
                  ...item,
                  inspections: [
                    ...item.inspections,
                    {
                      id: command.id,
                      on: command.on,
                      by: command.by.trim().slice(0, 200),
                      outcome: command.outcome.trim().slice(0, 80),
                      findings: command.findings.trim().slice(0, 2000),
                    },
                  ],
                }
              : item,
          ),
        },
      };
    }
  }
};

export const appFactsFromRecords = (
  records: readonly PrivateRecordRow[],
): AppCaseFacts => {
  const facts = emptyFacts();
  let description = "";
  let mediaCount = 0;
  let situationType = "";
  let speciesKey = "";
  let address = "";
  let latitude: number | undefined;
  let longitude: number | undefined;
  let symptoms: string[] = [];
  let reporterName = "";
  let reporterPhone = "";
  let reporterEmail = "";
  let shareWithAuthorities = false;

  for (const record of records) {
    if (!isRecord(record.payload)) {
      if (record.kind === "media_ref") {
        mediaCount += 1;
      }
      continue;
    }
    if (record.kind === "form_snapshot") {
      situationType = text(record.payload.situationType) || situationType;
      const species = isRecord(record.payload.species)
        ? record.payload.species
        : undefined;
      speciesKey = text(species?.kindKey) || speciesKey;
      const condition = isRecord(record.payload.condition)
        ? record.payload.condition
        : undefined;
      if (Array.isArray(condition?.symptoms)) {
        symptoms = condition.symptoms.flatMap((item) =>
          typeof item === "string" ? [item] : [],
        );
      }
      description = text(condition?.otherText) || description;
    }
    if (record.kind === "location") {
      address = text(record.payload.address) || address;
      const coordinates = isRecord(record.payload.coordinates)
        ? record.payload.coordinates
        : undefined;
      if (typeof coordinates?.latitude === "number") {
        latitude = coordinates.latitude;
      }
      if (typeof coordinates?.longitude === "number") {
        longitude = coordinates.longitude;
      }
    }
    if (record.kind === "contact") {
      reporterName = text(record.payload.name);
      reporterPhone = text(record.payload.phone);
      reporterEmail = text(record.payload.email);
      shareWithAuthorities = record.payload.shareWithAuthorities === true;
    }
    if (record.kind === "media_ref") {
      mediaCount += 1;
    }
  }

  return {
    ...facts,
    situationType,
    speciesKey,
    address,
    ...(latitude === undefined ? {} : { latitude }),
    ...(longitude === undefined ? {} : { longitude }),
    symptoms,
    description,
    reporterName,
    reporterPhone,
    reporterEmail,
    shareWithAuthorities,
    mediaCount,
  };
};

export const caseNumber = (streamId: string, createdAt: Date): string =>
  `ZV-${createdAt.getUTCFullYear()}-${streamId.replaceAll("-", "").slice(0, 8).toUpperCase()}`;

export const isUnread = (
  document: AdminCaseDocument,
  email: string,
  updatedAt: string,
): boolean => {
  const seen = document.seenBy[email];
  return seen === undefined || seen < updatedAt;
};

type QueueRow = {
  stream_id: string;
  workflow_state: string;
  created_at: Date;
  updated_at: Date;
  document: unknown;
};

type PrivateRow = {
  stream_id: string;
  kind: string;
  payload: unknown;
};

export type StoredAdminCase = Readonly<{
  streamId: string;
  workflowState: string;
  createdAt: Date;
  updatedAt: Date;
  document: AdminCaseDocument;
  facts: AppCaseFacts;
}>;

const groupFacts = (
  rows: readonly PrivateRow[],
): Map<string, PrivateRecordRow[]> => {
  const grouped = new Map<string, PrivateRecordRow[]>();
  for (const row of rows) {
    const current = grouped.get(row.stream_id) ?? [];
    current.push({ kind: row.kind, payload: row.payload });
    grouped.set(row.stream_id, current);
  }
  return grouped;
};

export const loadAdminCases = async (
  sql: Sql,
): Promise<readonly StoredAdminCase[]> => {
  const queues = await sql<QueueRow[]>`
    select
      queue.stream_id,
      queue.workflow_state,
      queue.created_at,
      queue.updated_at,
      work.document
    from ah.case_queue_projection queue
    left join ah.admin_case_work work on work.stream_id = queue.stream_id
    where queue.workflow_state <> 'expired'
    order by queue.updated_at desc
    limit 100
  `;
  if (queues.length === 0) {
    return [];
  }
  const ids = queues.map((row) => row.stream_id);
  const records = await sql<PrivateRow[]>`
    select stream_id, kind, payload
    from ah.private_records
    where deleted_at is null
      and stream_id in ${sql(ids)}
  `;
  const facts = groupFacts(records);
  return queues.map((row) => {
    const app = appFactsFromRecords(facts.get(row.stream_id) ?? []);
    return {
      streamId: row.stream_id,
      workflowState: row.workflow_state,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      document: parseAdminDocument(row.document, app.situationType),
      facts: app,
    };
  });
};

export const saveAdminDocument = async (
  sql: Sql,
  streamId: string,
  document: AdminCaseDocument,
): Promise<void> => {
  await sql`
    insert into ah.admin_case_work (stream_id, document, updated_at)
    values (${streamId}::uuid, ${sql.json(document)}, now())
    on conflict (stream_id) do update
    set document = excluded.document,
        updated_at = now()
  `;
};
