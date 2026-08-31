import { describe, expect, it } from "vitest";

import {
  createCaseSession,
  createMemoryCaseStore,
  type ApiTransport,
  type TransportResponse,
} from "@animal-helper/client";
import type { TransportCaseCommand } from "@animal-helper/contracts";
import { customerImplementedWalk } from "@animal-helper/guidance";

import { apiBaseUrl } from "../src/config.js";
import {
  CUSTOMER_PATHS,
  confirmDetails,
  confirmLocation,
  confirmSituation,
  defaultContactPayload,
  detailsSnapshot,
  submitReport,
} from "../src/walk.js";

const applied = (
  committedVersion: number,
  publicState: "draft" | "received" | "closed" = "draft",
): TransportResponse => ({
  status: 200,
  body: {
    ok: true,
    value: {
      outcome: "applied",
      committedVersion,
      publicState,
    },
  },
});

const scriptedTransport = (): ApiTransport & {
  sent: TransportCaseCommand[];
} => {
  const sent: TransportCaseCommand[] = [];

  return {
    sent,
    sendCommand: ({ command }) => {
      sent.push(command);
      return Promise.resolve(
        applied(
          command.expectedVersion + 1,
          command.type === "submit_draft" ? "received" : "draft",
        ),
      );
    },
    getStatus: () =>
      Promise.resolve({
        status: 200,
        body: undefined,
      }),
  };
};

describe("customer walk", () => {
  it("keeps the injured/stray routes and a skipped-photo snapshot", () => {
    expect(CUSTOMER_PATHS).toEqual({
      situation: customerImplementedWalk.situation.path,
      location: customerImplementedWalk.location.path,
      details: customerImplementedWalk.details.path,
      contact: customerImplementedWalk.contact.path,
      thanks: customerImplementedWalk.thanks.path,
    });
    expect(CUSTOMER_PATHS).toEqual({
      situation: "/w01",
      location: "/w03",
      details: "/w09",
      contact: "/w24",
      thanks: "/thank-you",
    });
    expect(detailsSnapshot("stray")).toEqual({
      schemaVersion: 1,
      situationType: "stray",
      species: { source: "skipped" },
      condition: { symptoms: [] },
      mediaRecordIds: [],
    });
    expect(apiBaseUrl({ VITE_API_BASE_URL: "http://127.0.0.1:8787/" })).toBe(
      "http://127.0.0.1:8787",
    );
  });

  it("opens a draft once, then attaches location, snapshot, and contact", async () => {
    const transport = scriptedTransport();
    const session = createCaseSession({
      store: createMemoryCaseStore(),
      transport,
    });

    const opened = await confirmSituation(session);
    const again = await confirmSituation(session);
    expect(opened.ok).toBe(true);
    expect(again.ok).toBe(true);
    expect(transport.sent).toHaveLength(1);

    const located = await confirmLocation(session, {
      schemaVersion: 1,
      address: "Synthetic testerska 1",
    });
    const detailed = await confirmDetails(session, "injured");
    const submitted = await submitReport(session, defaultContactPayload());

    expect(located.ok).toBe(true);
    expect(detailed.ok).toBe(true);
    expect(submitted.ok).toBe(true);
    if (!submitted.ok) {
      throw new Error("expected walk submit to succeed");
    }

    expect(transport.sent.map((command) => command.type)).toEqual([
      "create_draft",
      "attach_private_data",
      "attach_private_data",
      "attach_private_data",
      "submit_draft",
    ]);
    expect(
      transport.sent.filter(
        (command) =>
          command.type === "attach_private_data" &&
          command.kind === "form_snapshot",
      ),
    ).toHaveLength(1);
    expect(submitted.value.publicState).toBe("received");
    expect(JSON.stringify(submitted.value)).not.toContain(
      "synthetic-reporter@example.invalid",
    );
  });
});
