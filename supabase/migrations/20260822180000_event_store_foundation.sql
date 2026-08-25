-- Event-store foundation for the local platform spike.
--
-- Compatibility: additive schema `ah` on PostgreSQL 15+. Existing empty
-- repositories have no dependents. After this migration, application code
-- must append events only through ah.append_event.
--
-- Locking: ah.append_event takes a row lock on ah.streams so concurrent
-- writers to the same case serialise. Unrelated streams do not block each
-- other.
--
-- Private data / retention: ah.private_records.payload is erasable. Event
-- payloads, projections, audit rows, and outbox items must not contain
-- report text, contact details, locations, capabilities, or media. Purging
-- nulls payload and sets deleted_at; event history remains.
--
-- Recovery: roll forward. If this migration is applied and unused, drop
-- schema ah. After synthetic or real streams exist, do not drop the schema;
-- add a later migration instead.

create schema if not exists ah;

create table ah.streams (
  stream_id uuid primary key,
  current_version integer not null default 0 check (current_version >= 0),
  created_at timestamptz not null default now()
);

create table ah.events (
  event_id uuid primary key,
  stream_id uuid not null references ah.streams (stream_id),
  stream_version integer not null check (stream_version > 0),
  event_type text not null,
  schema_version integer not null check (schema_version > 0),
  occurred_at timestamptz not null,
  recorded_at timestamptz not null default now(),
  actor_kind text not null check (
    actor_kind in ('reporter', 'administrator', 'system')
  ),
  actor_reference text,
  command_id uuid not null,
  correlation_id uuid not null,
  causation_id uuid,
  payload jsonb not null default '{}'::jsonb,
  unique (stream_id, stream_version)
);

create index ah_events_stream_id_idx on ah.events (stream_id, stream_version);
create index ah_events_command_id_idx on ah.events (command_id);

create table ah.accepted_commands (
  command_id uuid primary key,
  stream_id uuid not null references ah.streams (stream_id),
  content_hash bytea not null,
  committed_version integer not null check (committed_version > 0),
  public_state text not null check (
    public_state in ('draft', 'received', 'closed')
  ),
  accepted_at timestamptz not null default now()
);

create table ah.private_records (
  private_record_id uuid primary key,
  stream_id uuid not null references ah.streams (stream_id),
  kind text not null check (
    kind in ('contact', 'text', 'location', 'media_ref', 'form_snapshot')
  ),
  payload jsonb,
  created_at timestamptz not null default now(),
  deleted_at timestamptz
);

create index ah_private_records_stream_id_idx on ah.private_records (stream_id);

create table ah.capabilities (
  stream_id uuid primary key references ah.streams (stream_id),
  capability_hash bytea not null unique,
  created_at timestamptz not null default now(),
  expires_at timestamptz,
  mutation_allowed boolean not null default true
);

create table ah.case_status_projection (
  stream_id uuid primary key references ah.streams (stream_id),
  public_state text not null check (
    public_state in ('draft', 'received', 'closed')
  ),
  created_at timestamptz not null,
  updated_at timestamptz not null
);

create table ah.case_queue_projection (
  stream_id uuid primary key references ah.streams (stream_id),
  workflow_state text not null check (
    workflow_state in (
      'draft',
      'submitted',
      'in_review',
      'completed',
      'expired'
    )
  ),
  has_private_data boolean not null default false,
  private_data_purged boolean not null default false,
  created_at timestamptz not null,
  updated_at timestamptz not null
);

create table ah.outbox (
  outbox_id uuid primary key,
  stream_id uuid not null references ah.streams (stream_id),
  command_id uuid not null,
  effect_type text not null,
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  claimed_at timestamptz,
  delivered_at timestamptz,
  idempotency_key text not null unique,
  attempt_count integer not null default 0
);

create index ah_outbox_pending_idx on ah.outbox (created_at)
where
  delivered_at is null;

create table ah.audit_events (
  audit_id uuid primary key,
  occurred_at timestamptz not null default now(),
  actor_kind text not null check (
    actor_kind in ('reporter', 'administrator', 'system')
  ),
  actor_reference text,
  action text not null,
  stream_id uuid,
  outcome text not null check (outcome in ('accepted', 'rejected')),
  error_code text
);

create index ah_audit_events_stream_id_idx on ah.audit_events (stream_id);

create or replace function ah.reject_direct_event_write ()
returns trigger
language plpgsql
as $$
begin
  if current_setting('ah.appending', true) is distinct from '1' then
    raise exception 'events are append-only via ah.append_event'
      using errcode = '42501';
  end if;

  if tg_op = 'DELETE' then
    return old;
  end if;

  return new;
end;
$$;

create trigger ah_events_append_only
before insert or update or delete on ah.events
for each row
execute function ah.reject_direct_event_write ();

create or replace function ah.append_event (
  p_event_id uuid,
  p_stream_id uuid,
  p_expected_previous_version integer,
  p_event_type text,
  p_schema_version integer,
  p_occurred_at timestamptz,
  p_actor_kind text,
  p_actor_reference text,
  p_command_id uuid,
  p_correlation_id uuid,
  p_causation_id uuid,
  p_payload jsonb
)
returns integer
language plpgsql
security definer
set search_path = ah, pg_temp
as $$
declare
  v_current integer;
  v_next integer;
begin
  if p_expected_previous_version < 0 then
    raise exception 'STREAM_VERSION_MUST_BE_NONNEGATIVE'
      using errcode = '22023';
  end if;

  insert into ah.streams (stream_id, current_version)
  values (p_stream_id, 0)
  on conflict (stream_id) do nothing;

  select current_version
  into v_current
  from ah.streams
  where stream_id = p_stream_id
  for update;

  if v_current is distinct from p_expected_previous_version then
    raise exception 'STREAM_VERSION_CONFLICT: expected %, actual %',
      p_expected_previous_version,
      v_current
      using errcode = 'P0001';
  end if;

  v_next := v_current + 1;

  perform set_config('ah.appending', '1', true);

  insert into ah.events (
    event_id,
    stream_id,
    stream_version,
    event_type,
    schema_version,
    occurred_at,
    actor_kind,
    actor_reference,
    command_id,
    correlation_id,
    causation_id,
    payload
  )
  values (
    p_event_id,
    p_stream_id,
    v_next,
    p_event_type,
    p_schema_version,
    p_occurred_at,
    p_actor_kind,
    p_actor_reference,
    p_command_id,
    p_correlation_id,
    p_causation_id,
    coalesce(p_payload, '{}'::jsonb)
  );

  update ah.streams
  set current_version = v_next
  where stream_id = p_stream_id;

  return v_next;
end;
$$;

revoke all on function ah.append_event (
  uuid,
  uuid,
  integer,
  text,
  integer,
  timestamptz,
  text,
  text,
  uuid,
  uuid,
  uuid,
  jsonb
) from public;

do $$
begin
  if exists (select 1 from pg_roles where rolname = 'anon') then
    revoke all on schema ah from anon;
    revoke all on all tables in schema ah from anon;
    revoke all on all functions in schema ah from anon;
  end if;

  if exists (select 1 from pg_roles where rolname = 'authenticated') then
    revoke all on schema ah from authenticated;
    revoke all on all tables in schema ah from authenticated;
    revoke all on all functions in schema ah from authenticated;
  end if;
end
$$;

alter table ah.streams enable row level security;
alter table ah.events enable row level security;
alter table ah.accepted_commands enable row level security;
alter table ah.private_records enable row level security;
alter table ah.capabilities enable row level security;
alter table ah.case_status_projection enable row level security;
alter table ah.case_queue_projection enable row level security;
alter table ah.outbox enable row level security;
alter table ah.audit_events enable row level security;
