-- Administered injured-guidance revisions. Published rows are immutable.
-- Public clients read only the active publication pointer, never drafts.
--
-- Compatibility: additive tables in schema ah on PostgreSQL 15+.
-- Recovery: drop these tables if unused; after publications exist, add a later
-- migration instead of dropping.

create table ah.guidance_revisions (
  revision_id uuid primary key,
  flow_key text not null,
  schema_version integer not null check (schema_version >= 1),
  locale text not null,
  jurisdiction text not null,
  status text not null check (status in ('draft', 'published', 'withdrawn')),
  based_on_revision_id uuid references ah.guidance_revisions (revision_id),
  created_by text not null,
  created_at timestamptz not null,
  updated_at timestamptz not null,
  published_at timestamptz,
  description text check (
    description is null
    or (
      char_length(description) > 0
      and char_length(description) <= 500
    )
  ),
  content_hash text not null check (content_hash ~ '^[0-9a-f]{64}$'),
  source_references text[] not null default '{}',
  content_reviewed_at timestamptz,
  check (updated_at >= created_at),
  check (
    (
      status = 'draft'
      and published_at is null
      and description is null
    )
    or (
      status in ('published', 'withdrawn')
      and published_at is not null
    )
  )
);

create unique index ah_guidance_revisions_one_draft
  on ah.guidance_revisions (flow_key, schema_version, locale, jurisdiction)
where
  status = 'draft';

create index ah_guidance_revisions_scope_idx
  on ah.guidance_revisions (
    flow_key,
    schema_version,
    locale,
    jurisdiction,
    status
  );

create table ah.guidance_copy (
  revision_id uuid not null references ah.guidance_revisions (revision_id)
    on delete cascade,
  copy_slot_key text not null,
  plain_text text not null check (char_length(plain_text) <= 4000),
  primary key (revision_id, copy_slot_key)
);

create table ah.guidance_cells (
  revision_id uuid not null references ah.guidance_revisions (revision_id)
    on delete cascade,
  kind_key text not null,
  instruction_key text not null,
  applicability text not null check (applicability in ('on', 'off')),
  sort_order integer not null,
  copy_json jsonb not null default '{}'::jsonb,
  action_target_key text,
  primary key (revision_id, kind_key, instruction_key)
);

create table ah.guidance_publications (
  flow_key text not null,
  schema_version integer not null,
  locale text not null,
  jurisdiction text not null,
  active_revision_id uuid not null references ah.guidance_revisions (
    revision_id
  ),
  published_at timestamptz not null,
  primary key (flow_key, schema_version, locale, jurisdiction)
);

alter table ah.guidance_revisions enable row level security;
alter table ah.guidance_copy enable row level security;
alter table ah.guidance_cells enable row level security;
alter table ah.guidance_publications enable row level security;

do $$
begin
  if exists (select 1 from pg_roles where rolname = 'anon') then
    revoke all on table ah.guidance_revisions from anon;
    revoke all on table ah.guidance_copy from anon;
    revoke all on table ah.guidance_cells from anon;
    revoke all on table ah.guidance_publications from anon;
  end if;

  if exists (select 1 from pg_roles where rolname = 'authenticated') then
    revoke all on table ah.guidance_revisions from authenticated;
    revoke all on table ah.guidance_copy from authenticated;
    revoke all on table ah.guidance_cells from authenticated;
    revoke all on table ah.guidance_publications from authenticated;
  end if;
end
$$;
