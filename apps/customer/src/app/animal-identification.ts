// One authoritative result; hierarchy context is represented only by path.
export type AnimalIdentification = { path: string[] } & (
  | { kind: 'species'; speciesId: string; description?: never }
  | { kind: 'other'; description: string; speciesId?: never }
  | { kind: 'unknown'; speciesId?: never; description?: never }
)
