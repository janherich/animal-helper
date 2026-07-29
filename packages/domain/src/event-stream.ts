export type RecordedEvent<
  Type extends string = string,
  Payload = unknown,
> = Readonly<{
  id: string;
  streamId: string;
  streamVersion: number;
  type: Type;
  schemaVersion: number;
  occurredAt: string;
  commandId: string;
  correlationId: string;
  causationId?: string;
  payload: Readonly<Payload>;
}>;

export type Evolver<State, Event> = (
  state: Readonly<State>,
  event: Readonly<Event>,
) => State;

export type StreamValidationError =
  | Readonly<{
      code: "STREAM_MUST_START_AT_ONE";
      actualVersion: number;
      eventId: string;
    }>
  | Readonly<{
      code: "STREAM_ID_MISMATCH";
      expectedStreamId: string;
      actualStreamId: string;
      eventId: string;
    }>
  | Readonly<{
      code: "STREAM_VERSION_GAP";
      expectedVersion: number;
      actualVersion: number;
      eventId: string;
    }>;

export type StreamValidationResult =
  | Readonly<{ ok: true }>
  | Readonly<{ ok: false; error: StreamValidationError }>;

export const validateEventStream = (
  events: readonly RecordedEvent[],
): StreamValidationResult => {
  const first = events.at(0);

  if (first === undefined) {
    return { ok: true };
  }

  if (first.streamVersion !== 1) {
    return {
      ok: false,
      error: {
        code: "STREAM_MUST_START_AT_ONE",
        actualVersion: first.streamVersion,
        eventId: first.id,
      },
    };
  }

  for (const [index, event] of events.entries()) {
    if (event.streamId !== first.streamId) {
      return {
        ok: false,
        error: {
          code: "STREAM_ID_MISMATCH",
          expectedStreamId: first.streamId,
          actualStreamId: event.streamId,
          eventId: event.id,
        },
      };
    }

    const expectedVersion = index + 1;
    if (event.streamVersion !== expectedVersion) {
      return {
        ok: false,
        error: {
          code: "STREAM_VERSION_GAP",
          expectedVersion,
          actualVersion: event.streamVersion,
          eventId: event.id,
        },
      };
    }
  }

  return { ok: true };
};

export const foldEvents = <State, Event>(
  initialState: State,
  evolve: Evolver<State, Event>,
  events: readonly Event[],
): State =>
  events.reduce<State>((state, event) => evolve(state, event), initialState);
