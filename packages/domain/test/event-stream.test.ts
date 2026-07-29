import { describe, expect, it } from "vitest";

import {
  foldEvents,
  validateEventStream,
  type RecordedEvent,
} from "../src/index.js";

type CounterEvent = Readonly<{ type: "incremented"; amount: number }>;

const event = (
  overrides: Partial<RecordedEvent<"counter.incremented", CounterEvent>> = {},
): RecordedEvent<"counter.incremented", CounterEvent> => ({
  id: "event-1",
  streamId: "case-1",
  streamVersion: 1,
  type: "counter.incremented",
  schemaVersion: 1,
  occurredAt: "2026-07-29T12:00:00.000Z",
  commandId: "command-1",
  correlationId: "correlation-1",
  payload: { type: "incremented", amount: 1 },
  ...overrides,
});

describe("foldEvents", () => {
  it("evolves state without side effects", () => {
    const total = foldEvents(
      0,
      (state, current: CounterEvent) => state + current.amount,
      [
        { type: "incremented", amount: 2 },
        { type: "incremented", amount: 3 },
      ],
    );

    expect(total).toBe(5);
  });
});

describe("validateEventStream", () => {
  it("accepts an empty or contiguous single-stream history", () => {
    expect(validateEventStream([])).toEqual({ ok: true });
    expect(
      validateEventStream([
        event(),
        event({ id: "event-2", streamVersion: 2 }),
      ]),
    ).toEqual({ ok: true });
  });

  it("rejects a version gap", () => {
    expect(
      validateEventStream([
        event(),
        event({ id: "event-3", streamVersion: 3 }),
      ]),
    ).toEqual({
      ok: false,
      error: {
        code: "STREAM_VERSION_GAP",
        expectedVersion: 2,
        actualVersion: 3,
        eventId: "event-3",
      },
    });
  });

  it("rejects events from another stream", () => {
    expect(
      validateEventStream([
        event(),
        event({ id: "event-2", streamId: "case-2", streamVersion: 2 }),
      ]),
    ).toEqual({
      ok: false,
      error: {
        code: "STREAM_ID_MISMATCH",
        expectedStreamId: "case-1",
        actualStreamId: "case-2",
        eventId: "event-2",
      },
    });
  });
});
