import { describe, expect, it } from "vitest";

import { type StoredCase } from "../src/index.js";
import { createIdbCaseStore } from "../src/idb-case-store.js";

const succeed = <T>(value: T): IDBRequest<T> => {
  const request = {
    result: value,
    error: null,
    onsuccess: null,
    onerror: null,
  } as IDBRequest<T>;
  queueMicrotask(() => {
    request.onsuccess?.(new Event("success"));
  });
  return request;
};

const createFakeIndexedDb = (): IDBFactory => {
  const databases = new Map<string, Map<string, Map<IDBValidKey, unknown>>>();

  return {
    open(name: string) {
      let stores = databases.get(name);
      const upgrade = stores === undefined;
      if (stores === undefined) {
        stores = new Map();
        databases.set(name, stores);
      }
      const owned = stores;
      const database = {
        objectStoreNames: {
          contains: (storeName: string) => owned.has(storeName),
        },
        createObjectStore(storeName: string) {
          owned.set(storeName, new Map());
        },
        transaction(storeName: string) {
          const records = owned.get(storeName);
          if (records === undefined) {
            throw new Error(`missing store ${storeName}`);
          }
          const transaction = {
            oncomplete: null as (() => void) | null,
            onerror: null as (() => void) | null,
            onabort: null as (() => void) | null,
            objectStore: () => ({
              get: (key: IDBValidKey) => {
                const request = succeed(records.get(key));
                queueMicrotask(() => transaction.oncomplete?.());
                return request;
              },
              put: (value: unknown, key: IDBValidKey) => {
                records.set(key, structuredClone(value));
                const request = succeed(undefined);
                queueMicrotask(() => transaction.oncomplete?.());
                return request;
              },
              delete: (key: IDBValidKey) => {
                records.delete(key);
                const request = succeed(undefined);
                queueMicrotask(() => transaction.oncomplete?.());
                return request;
              },
            }),
          };
          return transaction;
        },
        close() {},
      };
      const request = {
        result: database,
        error: null,
        onsuccess: null,
        onerror: null,
        onupgradeneeded: null,
      } as unknown as IDBOpenDBRequest;
      queueMicrotask(() => {
        if (upgrade) {
          request.onupgradeneeded?.({} as IDBVersionChangeEvent);
        }
        request.onsuccess?.(new Event("success"));
      });
      return request;
    },
  } as IDBFactory;
};

const storedCase = (): StoredCase => ({
  capabilityToken: "capability",
  streamId: "6f1b0c2e-1a4d-4f2a-9c3b-8e7d6a5b4c3d",
  correlationId: "7a2c1d3f-2b5e-4051-8d4c-9f8e7d6c5b4a",
  expectedVersion: 2,
  mutationAllowed: true,
  acknowledgedCommandIds: [],
  queue: [],
  lastPublicStatus: {
    streamId: "6f1b0c2e-1a4d-4f2a-9c3b-8e7d6a5b4c3d",
    publicState: "draft",
    createdAt: "2026-09-26T10:00:00.000Z",
    updatedAt: "2026-09-26T10:05:00.000Z",
  },
});

describe("indexedDB case store", () => {
  it("keeps the case id and capability across a new store instance", async () => {
    const indexedDb = createFakeIndexedDb();
    const first = createIdbCaseStore(indexedDb);
    await first.save(storedCase());

    const second = createIdbCaseStore(indexedDb);
    await expect(second.load()).resolves.toEqual(storedCase());

    await second.clear();
    await expect(second.load()).resolves.toBeUndefined();
  });
});
