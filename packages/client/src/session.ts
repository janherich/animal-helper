import {
  parseApiErrorBody,
  parseCommandAcceptedBody,
  parsePublicCaseStatusBody,
  type ContactPayloadV1,
  type FormSnapshotV1,
  type LocationPayloadV1,
  type MediaRefPayloadV1,
  type TextPayload,
  type TransportCaseCommand,
} from "@animal-helper/contracts";
import { err, ok, type Result } from "@animal-helper/domain";

import {
  capabilityAuthorization,
  capabilityFragment as toCapabilityFragment,
  createCapability,
  decodeCapability,
  encodeCapability,
  parseCapabilityFragment,
} from "./capability.js";
import {
  buildAttachContactCommand,
  buildAttachFormSnapshotCommand,
  buildAttachLocationCommand,
  buildAttachMediaRefCommand,
  buildAttachTextCommand,
  buildCreateDraftCommand,
  buildSubmitDraftCommand,
  type CommandClock,
} from "./commands.js";
import {
  apiError,
  caseAlreadyOpen,
  caseReadOnly,
  invalidResponse,
  networkFailure,
  noOpenCase,
  versionConflict,
  type ClientError,
} from "./errors.js";
import {
  durabilityOf,
  hydrateStoredCase,
  type CaseStore,
  type Durability,
  type StoredCase,
} from "./store.js";
import type { ApiTransport } from "./transport.js";

export type CaseSnapshot = Readonly<{
  streamId: string;
  expectedVersion: number;
  durability: Durability;
  pendingCount: number;
  pendingCommandIds: readonly string[];
  mutationAllowed: boolean;
  publicState?: "draft" | "received" | "closed";
  lastError?: ClientError;
}>;

export type CaseSession = Readonly<{
  openDraft: () => Promise<Result<CaseSnapshot, ClientError>>;
  importFromFragment: (
    fragment: string,
  ) => Promise<Result<CaseSnapshot, ClientError>>;
  attachFormSnapshot: (
    payload: FormSnapshotV1,
  ) => Promise<Result<CaseSnapshot, ClientError>>;
  attachLocation: (
    payload: LocationPayloadV1,
  ) => Promise<Result<CaseSnapshot, ClientError>>;
  attachContact: (
    payload: ContactPayloadV1,
  ) => Promise<Result<CaseSnapshot, ClientError>>;
  attachMediaRef: (
    payload: MediaRefPayloadV1,
  ) => Promise<Result<CaseSnapshot, ClientError>>;
  attachText: (
    payload: TextPayload,
  ) => Promise<Result<CaseSnapshot, ClientError>>;
  submit: () => Promise<Result<CaseSnapshot, ClientError>>;
  flush: () => Promise<Result<CaseSnapshot, ClientError>>;
  refreshStatus: () => Promise<Result<CaseSnapshot, ClientError>>;
  snapshot: () => Promise<CaseSnapshot | undefined>;
  exportCapabilityToken: () => Promise<string | undefined>;
  capabilityFragment: () => Promise<string | undefined>;
  removeLocal: () => Promise<void>;
}>;

export type CaseSessionOptions = Readonly<{
  store: CaseStore;
  transport: ApiTransport;
  now?: () => Date;
  createId?: () => string;
  createCapabilityBytes?: () => Uint8Array;
}>;

const snapshotOf = (record: StoredCase): CaseSnapshot => ({
  streamId: record.streamId,
  expectedVersion: record.expectedVersion,
  durability: durabilityOf(record),
  pendingCount: record.queue.length,
  pendingCommandIds: record.queue.map((command) => command.commandId),
  mutationAllowed: record.mutationAllowed,
  ...(record.lastPublicStatus === undefined
    ? {}
    : { publicState: record.lastPublicStatus.publicState }),
  ...(record.lastError === undefined ? {} : { lastError: record.lastError }),
});

const withoutError = (record: StoredCase): StoredCase => ({
  capabilityToken: record.capabilityToken,
  streamId: record.streamId,
  correlationId: record.correlationId,
  expectedVersion: record.expectedVersion,
  mutationAllowed: record.mutationAllowed,
  acknowledgedCommandIds: record.acknowledgedCommandIds,
  queue: record.queue,
  ...(record.lastPublicStatus === undefined
    ? {}
    : { lastPublicStatus: record.lastPublicStatus }),
});

const withError = (record: StoredCase, lastError: ClientError): StoredCase => ({
  ...record,
  lastError,
});

const authorizationFor = (record: StoredCase): Result<string, ClientError> => {
  const capability = decodeCapability(record.capabilityToken);
  if (!capability.ok) {
    return capability;
  }

  return ok(capabilityAuthorization(capability.value));
};

const mapApiFailure = (body: unknown): ClientError => {
  const parsed = parseApiErrorBody(body);
  if (!parsed.success) {
    return invalidResponse;
  }

  return parsed.data.error.code === "VERSION_CONFLICT"
    ? versionConflict
    : apiError(parsed.data.error.code);
};

export const createCaseSession = (options: CaseSessionOptions): CaseSession => {
  const clock: CommandClock = {
    now: options.now ?? (() => new Date()),
    createId: options.createId ?? (() => crypto.randomUUID()),
  };

  const load = async (): Promise<
    Result<StoredCase | undefined, ClientError>
  > => {
    const record = await options.store.load();
    if (record === undefined) {
      return ok(undefined);
    }

    return hydrateStoredCase(record);
  };

  const saveSnapshot = async (
    record: StoredCase,
  ): Promise<Result<CaseSnapshot, ClientError>> => {
    await options.store.save(record);
    return ok(snapshotOf(record));
  };

  const requireRecord = async (): Promise<Result<StoredCase, ClientError>> => {
    const loaded = await load();
    if (!loaded.ok) {
      return loaded;
    }

    return loaded.value === undefined ? err(noOpenCase) : ok(loaded.value);
  };

  const enqueue = async (
    build: (draft: {
      streamId: string;
      correlationId: string;
      expectedVersion: number;
    }) => Result<TransportCaseCommand, ClientError>,
  ): Promise<Result<CaseSnapshot, ClientError>> => {
    const loaded = await requireRecord();
    if (!loaded.ok) {
      return loaded;
    }

    const record = loaded.value;
    if (!record.mutationAllowed) {
      return err(caseReadOnly);
    }

    const built = build({
      streamId: record.streamId,
      correlationId: record.correlationId,
      expectedVersion: record.expectedVersion + record.queue.length,
    });
    if (!built.ok) {
      return built;
    }

    return flushRecord({
      ...withoutError(record),
      queue: [...record.queue, built.value],
    });
  };

  const flushRecord = async (
    record: StoredCase,
  ): Promise<Result<CaseSnapshot, ClientError>> => {
    let current = record;
    const authorization = authorizationFor(current);
    if (!authorization.ok) {
      return authorization;
    }

    while (current.queue[0] !== undefined) {
      const command = current.queue[0];
      let response;
      try {
        response = await options.transport.sendCommand({
          authorization: authorization.value,
          command,
        });
      } catch {
        const failed = withError(current, networkFailure);
        await options.store.save(failed);
        return err(networkFailure);
      }

      const accepted = parseCommandAcceptedBody(response.body);
      if (response.status >= 200 && response.status < 300 && accepted.success) {
        current = {
          ...withoutError(current),
          expectedVersion: accepted.data.value.committedVersion,
          mutationAllowed:
            current.mutationAllowed &&
            accepted.data.value.publicState === "draft",
          acknowledgedCommandIds: [
            ...current.acknowledgedCommandIds,
            command.commandId,
          ],
          queue: current.queue.slice(1),
          lastPublicStatus: {
            streamId: current.streamId,
            publicState: accepted.data.value.publicState,
            createdAt:
              current.lastPublicStatus?.createdAt ?? command.occurredAt,
            updatedAt: command.occurredAt,
          },
        };
        continue;
      }

      const failure = mapApiFailure(response.body);
      const failed = withError(current, failure);
      await options.store.save(failed);
      return err(failure);
    }

    return saveSnapshot(current);
  };

  return {
    openDraft: async () => {
      const loaded = await load();
      if (!loaded.ok) {
        return loaded;
      }

      if (loaded.value !== undefined) {
        return err(caseAlreadyOpen);
      }

      const streamId = clock.createId();
      const correlationId = clock.createId();
      const created = buildCreateDraftCommand(
        { streamId, correlationId },
        clock,
      );
      if (!created.ok) {
        return created;
      }

      const capability =
        options.createCapabilityBytes?.() ?? createCapability();

      return flushRecord({
        capabilityToken: encodeCapability(capability),
        streamId,
        correlationId,
        expectedVersion: 0,
        mutationAllowed: true,
        acknowledgedCommandIds: [],
        queue: [created.value],
      });
    },

    importFromFragment: async (fragment) => {
      const loaded = await load();
      if (!loaded.ok) {
        return loaded;
      }

      if (loaded.value !== undefined) {
        return err(caseAlreadyOpen);
      }

      const capability = parseCapabilityFragment(fragment);
      if (!capability.ok) {
        return capability;
      }

      let response;
      try {
        response = await options.transport.getStatus({
          authorization: capabilityAuthorization(capability.value),
        });
      } catch {
        return err(networkFailure);
      }

      const status = parsePublicCaseStatusBody(response.body);
      if (!status.success) {
        return err(mapApiFailure(response.body));
      }

      return saveSnapshot({
        capabilityToken: encodeCapability(capability.value),
        streamId: status.data.value.streamId,
        correlationId: clock.createId(),
        expectedVersion: 0,
        mutationAllowed: false,
        acknowledgedCommandIds: [],
        queue: [],
        lastPublicStatus: status.data.value,
      });
    },

    attachFormSnapshot: (payload) =>
      enqueue((draft) => buildAttachFormSnapshotCommand(draft, payload, clock)),

    attachLocation: (payload) =>
      enqueue((draft) => buildAttachLocationCommand(draft, payload, clock)),

    attachContact: (payload) =>
      enqueue((draft) => buildAttachContactCommand(draft, payload, clock)),

    attachMediaRef: (payload) =>
      enqueue((draft) => buildAttachMediaRefCommand(draft, payload, clock)),

    attachText: (payload) =>
      enqueue((draft) => buildAttachTextCommand(draft, payload, clock)),

    submit: () => enqueue((draft) => buildSubmitDraftCommand(draft, clock)),

    flush: async () => {
      const loaded = await requireRecord();
      if (!loaded.ok) {
        return loaded;
      }

      return flushRecord(loaded.value);
    },

    refreshStatus: async () => {
      const loaded = await requireRecord();
      if (!loaded.ok) {
        return loaded;
      }

      const authorization = authorizationFor(loaded.value);
      if (!authorization.ok) {
        return authorization;
      }

      let response;
      try {
        response = await options.transport.getStatus({
          authorization: authorization.value,
        });
      } catch {
        const failed = withError(loaded.value, networkFailure);
        await options.store.save(failed);
        return err(networkFailure);
      }

      const status = parsePublicCaseStatusBody(response.body);
      if (!status.success) {
        const failure = mapApiFailure(response.body);
        const failed = withError(loaded.value, failure);
        await options.store.save(failed);
        return err(failure);
      }

      return saveSnapshot({
        ...withoutError(loaded.value),
        lastPublicStatus: status.data.value,
      });
    },

    snapshot: async () => {
      const loaded = await load();
      if (!loaded.ok || loaded.value === undefined) {
        return undefined;
      }

      return snapshotOf(loaded.value);
    },

    exportCapabilityToken: async () => {
      const loaded = await load();
      if (!loaded.ok || loaded.value === undefined) {
        return undefined;
      }

      return loaded.value.capabilityToken;
    },

    capabilityFragment: async () => {
      const loaded = await load();
      if (!loaded.ok || loaded.value === undefined) {
        return undefined;
      }

      const capability = decodeCapability(loaded.value.capabilityToken);
      return capability.ok ? toCapabilityFragment(capability.value) : undefined;
    },

    removeLocal: () => options.store.clear(),
  };
};
