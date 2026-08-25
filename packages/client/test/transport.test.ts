import { describe, expect, it } from "vitest";

import { syntheticCreateDraftCommand } from "@animal-helper/contracts";

import { createFetchTransport, type FetchLike } from "../src/index.js";

describe("fetch transport", () => {
  it("posts commands and reads status without query strings", async () => {
    const calls: Array<
      Readonly<{ url: string; init: Parameters<FetchLike>[1] }>
    > = [];

    const fetchImpl: FetchLike = (url, init) => {
      calls.push({ url, init });
      return Promise.resolve({
        status: 200,
        json: () =>
          Promise.resolve({
            ok: true,
            value: {
              outcome: "applied",
              committedVersion: 1,
              publicState: "draft",
            },
          }),
      });
    };

    const transport = createFetchTransport({
      baseUrl: "http://127.0.0.1:8787/",
      fetch: fetchImpl,
    });

    await transport.sendCommand({
      authorization: "Capability test",
      command: syntheticCreateDraftCommand,
    });
    await transport.getStatus({ authorization: "Capability test" });

    expect(calls[0]?.url).toBe("http://127.0.0.1:8787/commands");
    expect(calls[0]?.init.method).toBe("POST");
    expect(calls[0]?.init.credentials).toBe("omit");
    expect(calls[0]?.init.body).toContain("create_draft");
    expect(calls[1]?.url).toBe("http://127.0.0.1:8787/status");
    expect(calls[1]?.init.method).toBe("GET");
    expect(calls[1]?.init.body).toBeUndefined();
  });
});
