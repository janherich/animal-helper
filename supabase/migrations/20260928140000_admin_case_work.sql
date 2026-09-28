-- Admin workspace for a reported case. The reporter payload stays in
-- ah.private_records. This document is the operator's own working state.
--
-- Compatibility: additive table in schema ah on PostgreSQL 15+.
-- Recovery: drop ah.admin_case_work if unused.

create table ah.admin_case_work (
  stream_id uuid primary key references ah.streams (stream_id),
  document jsonb not null,
  updated_at timestamptz not null default now()
);

alter table ah.admin_case_work enable row level security;
