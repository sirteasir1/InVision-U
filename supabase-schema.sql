-- ============================================================
-- inVision U — Supabase Schema
-- Run this in: supabase.com → your project → SQL Editor → Run
-- ============================================================

create extension if not exists "pgcrypto";

-- ── Main candidates table ────────────────────────────────────
create table if not exists public.candidates (
  id               uuid        primary key default gen_random_uuid(),
  full_name        text        not null check (char_length(full_name) between 2 and 200),
  email            text        not null check (email ~* '^[^@]+@[^@]+\.[^@]+$'),
  gpa              numeric(3,2) not null check (gpa >= 0.0 and gpa <= 4.0),
  extracurriculars text        not null default '',
  achievements     text        not null default '',
  essay            text        not null check (char_length(essay) >= 20),
  interview_text   text        not null check (char_length(interview_text) >= 20),
  consent          boolean     not null default false,
  status           text        not null default 'pending'
                     check (status in ('pending', 'scored', 'error')),
  scoring          jsonb,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

create index if not exists candidates_created_at_idx on public.candidates (created_at desc);
create index if not exists candidates_status_idx     on public.candidates (status);

-- ── Auto-update updated_at ───────────────────────────────────
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end;
$$;

create trigger candidates_updated_at
  before update on public.candidates
  for each row execute function public.set_updated_at();

-- ── Immutable audit log ──────────────────────────────────────
create table if not exists public.audit_log (
  id           bigserial   primary key,
  ts           timestamptz not null default now(),
  actor        text        not null,
  action       text        not null,
  candidate_id uuid        references public.candidates(id) on delete set null,
  detail       jsonb
);

create index if not exists audit_log_ts_idx  on public.audit_log (ts desc);
create index if not exists audit_log_cid_idx on public.audit_log (candidate_id);

-- ── Enable RLS (deny-by-default) ────────────────────────────
alter table public.candidates enable row level security;
alter table public.audit_log  enable row level security;

-- ── RLS policies ────────────────────────────────────────────

-- Candidates: anon can only INSERT with consent
create policy "anon_insert_with_consent"
  on public.candidates for insert to anon
  with check (consent = true);

-- Candidates: authenticated (committee) can SELECT
create policy "committee_select"
  on public.candidates for select to authenticated
  using (true);

-- Audit log: committee can read
create policy "committee_read_audit"
  on public.audit_log for select to authenticated
  using (true);

-- ── Privilege hardening ──────────────────────────────────────
revoke create on schema public from public;
revoke all on all tables    in schema public from anon;
revoke all on all sequences in schema public from anon;
grant insert on public.candidates to anon;
grant select on public.candidates to authenticated;
grant select on public.audit_log  to authenticated;

-- ── Verify: run these to check setup ────────────────────────
-- SELECT relname, relrowsecurity FROM pg_class
--   WHERE relname IN ('candidates', 'audit_log');
-- SELECT tablename, policyname, roles, cmd FROM pg_policies
--   WHERE schemaname = 'public';
