-- Operator passkeys for the authenticated backoffice. Named accounts are
-- created only by a trusted bootstrap CLI. Sessions and challenges store
-- SHA-256 token hashes, never the bearer values.
--
-- Compatibility: additive tables in schema ah on PostgreSQL 15+.
-- Recovery: drop these tables if unused; after operators exist, add a later
-- migration instead of dropping.

create table ah.operators (
  operator_id uuid primary key,
  email text not null unique,
  enabled boolean not null default true,
  created_at timestamptz not null default now()
);

create table ah.operator_passkeys (
  credential_id text primary key,
  operator_id uuid not null references ah.operators (operator_id),
  public_key bytea not null,
  counter bigint not null check (counter >= 0),
  transports jsonb not null check (jsonb_typeof(transports) = 'array'),
  created_at timestamptz not null default now()
);

create index ah_operator_passkeys_operator_id_idx
  on ah.operator_passkeys (operator_id);

create table ah.operator_bootstraps (
  token_hash bytea primary key check (octet_length(token_hash) = 32),
  operator_id uuid not null references ah.operators (operator_id),
  expires_at timestamptz not null,
  consumed_at timestamptz
);

create table ah.operator_challenges (
  token_hash bytea primary key check (octet_length(token_hash) = 32),
  kind text not null check (kind in ('registration', 'authentication')),
  challenge text not null,
  operator_id uuid references ah.operators (operator_id),
  bootstrap_hash bytea references ah.operator_bootstraps (token_hash),
  expires_at timestamptz not null,
  check (
    (
      kind = 'registration'
      and operator_id is not null
      and bootstrap_hash is not null
    )
    or (
      kind = 'authentication'
      and operator_id is null
      and bootstrap_hash is null
    )
  )
);

create table ah.operator_sessions (
  token_hash bytea primary key check (octet_length(token_hash) = 32),
  operator_id uuid not null references ah.operators (operator_id),
  created_at timestamptz not null,
  expires_at timestamptz not null,
  revoked_at timestamptz,
  check (expires_at > created_at)
);

create index ah_operator_sessions_operator_id_idx
  on ah.operator_sessions (operator_id);

alter table ah.operators enable row level security;
alter table ah.operator_passkeys enable row level security;
alter table ah.operator_bootstraps enable row level security;
alter table ah.operator_challenges enable row level security;
alter table ah.operator_sessions enable row level security;

do $$
begin
  if exists (select 1 from pg_roles where rolname = 'anon') then
    revoke all on table ah.operators from anon;
    revoke all on table ah.operator_passkeys from anon;
    revoke all on table ah.operator_bootstraps from anon;
    revoke all on table ah.operator_challenges from anon;
    revoke all on table ah.operator_sessions from anon;
  end if;

  if exists (select 1 from pg_roles where rolname = 'authenticated') then
    revoke all on table ah.operators from authenticated;
    revoke all on table ah.operator_passkeys from authenticated;
    revoke all on table ah.operator_bootstraps from authenticated;
    revoke all on table ah.operator_challenges from authenticated;
    revoke all on table ah.operator_sessions from authenticated;
  end if;
end
$$;
