import { z } from "zod";

export const PRIVATE_PAYLOAD_MAX_BYTES = 16_384;
export const PRIVATE_RECORD_SCHEMA_VERSION = 1;
export const FORM_SNAPSHOT_SCHEMA_VERSION = PRIVATE_RECORD_SCHEMA_VERSION;
export const MAX_MEDIA_ATTACHMENTS = 6;

const withinBudget = <Schema extends z.ZodType>(schema: Schema) =>
  schema.refine(
    (value) => JSON.stringify(value).length <= PRIVATE_PAYLOAD_MAX_BYTES,
    { message: "private payload exceeds 16 KiB" },
  );

const catalogKeySchema = z
  .string()
  .min(1)
  .max(64)
  .regex(/^[a-z][a-z0-9_]*$/);

const ternarySchema = z.enum(["yes", "no", "unknown"]);

export const situationTypeSchema = z.enum(["injured", "stray"]);

export const speciesSourceSchema = z.enum([
  "ai",
  "manual",
  "failed",
  "skipped",
]);

export const conditionSymptomSchema = z.enum([
  "bleeding",
  "hit",
  "poison_suspected",
  "vomiting",
  "foam",
  "unknown",
  "other",
]);

export const formSnapshotV1Schema = withinBudget(
  z
    .strictObject({
      schemaVersion: z.literal(PRIVATE_RECORD_SCHEMA_VERSION),
      situationType: situationTypeSchema,
      species: z.strictObject({
        source: speciesSourceSchema,
        groupKey: catalogKeySchema.optional(),
        categoryKey: catalogKeySchema.optional(),
        kindKey: catalogKeySchema.optional(),
      }),
      condition: z.strictObject({
        symptoms: z.array(conditionSymptomSchema).max(8),
        otherText: z.string().trim().min(1).max(2000).optional(),
        conscious: ternarySchema.optional(),
        isJuvenile: ternarySchema.optional(),
      }),
      mediaRecordIds: z.array(z.uuid()).max(MAX_MEDIA_ATTACHMENTS),
    })
    .superRefine((snapshot, context) => {
      const identified =
        snapshot.species.source === "ai" ||
        snapshot.species.source === "manual";
      if (identified && snapshot.species.kindKey === undefined) {
        context.addIssue({
          code: "custom",
          path: ["species", "kindKey"],
          message: "kindKey is required when the species was identified",
        });
      }

      const uniqueSymptoms = new Set(snapshot.condition.symptoms);
      if (uniqueSymptoms.size !== snapshot.condition.symptoms.length) {
        context.addIssue({
          code: "custom",
          path: ["condition", "symptoms"],
          message: "symptoms must be unique",
        });
      }

      if (
        snapshot.condition.symptoms.includes("unknown") &&
        snapshot.condition.symptoms.length > 1
      ) {
        context.addIssue({
          code: "custom",
          path: ["condition", "symptoms"],
          message: "unknown cannot be combined with other symptoms",
        });
      }

      const hasOther = snapshot.condition.symptoms.includes("other");
      if (hasOther && snapshot.condition.otherText === undefined) {
        context.addIssue({
          code: "custom",
          path: ["condition", "otherText"],
          message: "otherText is required when the other symptom is selected",
        });
      }

      if (!hasOther && snapshot.condition.otherText !== undefined) {
        context.addIssue({
          code: "custom",
          path: ["condition", "otherText"],
          message: "otherText is only allowed with the other symptom",
        });
      }

      if (
        new Set(snapshot.mediaRecordIds).size !== snapshot.mediaRecordIds.length
      ) {
        context.addIssue({
          code: "custom",
          path: ["mediaRecordIds"],
          message: "mediaRecordIds must be unique",
        });
      }
    }),
);

export const locationPayloadV1Schema = withinBudget(
  z.strictObject({
    schemaVersion: z.literal(PRIVATE_RECORD_SCHEMA_VERSION),
    address: z.string().trim().min(1).max(500),
    coordinates: z
      .strictObject({
        latitude: z.number().gte(-90).lte(90),
        longitude: z.number().gte(-180).lte(180),
      })
      .optional(),
  }),
);

export const contactPayloadV1Schema = withinBudget(
  z.strictObject({
    schemaVersion: z.literal(PRIVATE_RECORD_SCHEMA_VERSION),
    name: z.string().trim().min(1).max(200).optional(),
    phone: z
      .string()
      .trim()
      .regex(/^\+?[0-9][0-9\s-]{6,30}$/)
      .max(32)
      .optional(),
    email: z.email().max(320).optional(),
    shareWithAuthorities: z.boolean(),
    newsletter: z.boolean(),
  }),
);

export const mediaRefPayloadV1Schema = withinBudget(
  z.strictObject({
    schemaVersion: z.literal(PRIVATE_RECORD_SCHEMA_VERSION),
    contentType: z.enum([
      "image/jpeg",
      "image/png",
      "image/webp",
      "image/heic",
      "video/mp4",
      "video/quicktime",
    ]),
    byteSize: z.int().positive().max(52_428_800),
    checksumSha256: z.string().regex(/^[a-f0-9]{64}$/),
  }),
);

export const textPayloadSchema = withinBudget(
  z.record(z.string().max(64), z.string().max(4000)),
);

export type FormSnapshotV1 = z.infer<typeof formSnapshotV1Schema>;
export type LocationPayloadV1 = z.infer<typeof locationPayloadV1Schema>;
export type ContactPayloadV1 = z.infer<typeof contactPayloadV1Schema>;
export type MediaRefPayloadV1 = z.infer<typeof mediaRefPayloadV1Schema>;
export type TextPayload = z.infer<typeof textPayloadSchema>;

export type PrivateRecordPayload =
  | FormSnapshotV1
  | LocationPayloadV1
  | ContactPayloadV1
  | MediaRefPayloadV1
  | TextPayload;

export const parseFormSnapshot = (
  value: unknown,
): z.ZodSafeParseResult<FormSnapshotV1> =>
  formSnapshotV1Schema.safeParse(value);
