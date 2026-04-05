begin;

create extension if not exists pgcrypto;

revoke create on schema public from public;
grant usage on schema public to anon, authenticated, service_role;

create table if not exists public.candidates (
  id               uuid primary key default gen_random_uuid(),
  full_name        text not null
                     check (char_length(trim(full_name)) between 2 and 200),
  email            text not null
                     check (email ~* '^[^@]+@[^@]+\.[^@]+$'),
  gpa              numeric(3,2) not null
                     check (gpa >= 0.00 and gpa <= 4.00),
  extracurriculars text not null default '',
  achievements     text not null default '',
  essay            text not null
                     check (char_length(trim(essay)) >= 20),
  interview_text   text not null
                     check (char_length(trim(interview_text)) >= 20),
  consent          boolean not null default false,
  status           text not null default 'pending'
                     check (status in ('pending', 'scored', 'error')),
  scoring          jsonb,
  submitted_at     timestamptz not null default now(),
  scored_at        timestamptz,
  ip_hash          text,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now(),
  constraint candidates_status_consistency check (
    (status = 'pending' and scoring is null and scored_at is null)
    or
    (status = 'scored' and scoring is not null and scored_at is not null)
    or
    (status = 'error' and scoring is null and scored_at is null)
  ),
  constraint candidates_scoring_object check (
    scoring is null or jsonb_typeof(scoring) = 'object'
  )
);

create index if not exists candidates_created_at_idx
  on public.candidates (created_at desc);
create index if not exists candidates_status_idx
  on public.candidates (status);
create index if not exists candidates_email_lower_idx
  on public.candidates ((lower(email)));
create index if not exists candidates_ip_hash_created_idx
  on public.candidates (ip_hash, created_at desc);

create table if not exists public.audit_log (
  id           bigserial primary key,
  ts           timestamptz not null default now(),
  actor        text not null
                 check (actor in ('system', 'committee', 'candidate')),
  action       text not null
                 check (
                   action in (
                     'submit','score','score_error','view','list',
                     'delete','login_ok','login_fail','logout','rate_limited'
                   )
                 ),
  candidate_id uuid references public.candidates(id) on delete set null,
  detail       jsonb,
  ip_hash      text
);

create index if not exists audit_log_ts_idx on public.audit_log (ts desc);
create index if not exists audit_log_candidate_id_idx on public.audit_log (candidate_id);
create index if not exists audit_log_action_idx on public.audit_log (action);
create index if not exists audit_log_actor_idx on public.audit_log (actor);

create table if not exists public.committee_sessions (
  id           uuid primary key default gen_random_uuid(),
  created_at   timestamptz not null default now(),
  expires_at   timestamptz not null default (now() + interval '8 hours'),
  ip_hash      text,
  user_agent   text,
  revoked      boolean not null default false
);

create index if not exists committee_sessions_expires_idx
  on public.committee_sessions (expires_at);
create index if not exists committee_sessions_revoked_expires_idx
  on public.committee_sessions (revoked, expires_at);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

revoke execute on function public.set_updated_at() from public, anon, authenticated;

drop trigger if exists candidates_updated_at on public.candidates;
create trigger candidates_updated_at
before update on public.candidates
for each row
execute function public.set_updated_at();

create or replace function public.prevent_audit_log_mutation()
returns trigger
language plpgsql
as $$
begin
  raise exception 'audit_log is append-only';
end;
$$;

revoke execute on function public.prevent_audit_log_mutation() from public, anon, authenticated;

drop trigger if exists audit_log_block_update on public.audit_log;
create trigger audit_log_block_update
before update on public.audit_log
for each row
execute function public.prevent_audit_log_mutation();

drop trigger if exists audit_log_block_delete on public.audit_log;
create trigger audit_log_block_delete
before delete on public.audit_log
for each row
execute function public.prevent_audit_log_mutation();

alter table public.candidates enable row level security;
alter table public.audit_log enable row level security;
alter table public.committee_sessions enable row level security;

drop policy if exists "anon_insert_with_consent" on public.candidates;
drop policy if exists "authenticated_select_all" on public.candidates;
drop policy if exists "authenticated_read_audit" on public.audit_log;
drop policy if exists "authenticated_read_sessions" on public.committee_sessions;

revoke all on all tables in schema public from anon, authenticated;
revoke all on all sequences in schema public from anon, authenticated;
revoke all on all routines in schema public from anon, authenticated;

create or replace function public.log_audit(
  p_actor        text,
  p_action       text,
  p_candidate_id uuid  default null,
  p_detail       jsonb default null,
  p_ip_hash      text  default null
)
returns void
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
begin
  insert into public.audit_log (actor, action, candidate_id, detail, ip_hash)
  values (p_actor, p_action, p_candidate_id, p_detail, p_ip_hash);
end;
$$;

revoke execute on function public.log_audit(text, text, uuid, jsonb, text)
  from public, anon, authenticated;
grant execute on function public.log_audit(text, text, uuid, jsonb, text)
  to service_role;

drop function if exists public.submit_candidate(
  text, text, numeric, text, text, text, text, boolean, text
);
drop function if exists public.submit_candidate(
  text, text, numeric, text, text, boolean, text, text, text
);

create or replace function public.submit_candidate(
  p_full_name        text,
  p_email            text,
  p_gpa              numeric,
  p_essay            text,
  p_interview_text   text,
  p_consent          boolean,
  p_extracurriculars text default '',
  p_achievements     text default '',
  p_ip_hash          text default null
)
returns uuid
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
declare
  v_candidate_id uuid;
  v_recent_count integer := 0;
begin
  if coalesce(p_consent, false) is not true then
    raise exception 'consent_required';
  end if;

  if p_ip_hash is not null then
    select count(*)
      into v_recent_count
      from public.candidates
     where ip_hash = p_ip_hash
       and created_at > now() - interval '1 hour';

    if v_recent_count >= 3 then
      insert into public.audit_log (actor, action, detail, ip_hash)
      values (
        'candidate',
        'rate_limited',
        jsonb_build_object('count', v_recent_count, 'limit', 3),
        p_ip_hash
      );
      raise exception 'rate_limit_exceeded';
    end if;
  end if;

  insert into public.candidates (
    full_name, email, gpa, extracurriculars, achievements,
    essay, interview_text, consent, ip_hash, status, scoring, scored_at
  )
  values (
    trim(p_full_name), lower(trim(p_email)), p_gpa,
    coalesce(p_extracurriculars, ''), coalesce(p_achievements, ''),
    trim(p_essay), trim(p_interview_text), true,
    p_ip_hash, 'pending', null, null
  )
  returning id into v_candidate_id;

  insert into public.audit_log (actor, action, candidate_id, detail, ip_hash)
  values (
    'candidate', 'submit', v_candidate_id,
    jsonb_build_object('email', lower(trim(p_email))),
    p_ip_hash
  );

  return v_candidate_id;
end;
$$;

revoke execute on function public.submit_candidate(
  text, text, numeric, text, text, boolean, text, text, text
) from public, authenticated;
grant execute on function public.submit_candidate(
  text, text, numeric, text, text, boolean, text, text, text
) to anon, service_role;

create or replace function public.save_scoring(
  p_candidate_id uuid,
  p_scoring      jsonb
)
returns void
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
begin
  if p_scoring is null or jsonb_typeof(p_scoring) <> 'object' then
    raise exception 'invalid_scoring_payload';
  end if;

  update public.candidates
     set scoring   = p_scoring,
         status    = 'scored',
         scored_at = now()
   where id = p_candidate_id;

  if not found then
    raise exception 'candidate_not_found';
  end if;

  insert into public.audit_log (actor, action, candidate_id, detail)
  values (
    'system', 'score', p_candidate_id,
    jsonb_build_object(
      'overall', p_scoring->>'overall',
      'version', p_scoring->>'scoring_version',
      'confidence', p_scoring->>'confidence'
    )
  );
end;
$$;

revoke execute on function public.save_scoring(uuid, jsonb)
  from public, anon, authenticated;
grant execute on function public.save_scoring(uuid, jsonb)
  to service_role;

create or replace function public.mark_score_error(
  p_candidate_id uuid,
  p_error_msg    text default 'pipeline failure'
)
returns void
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
begin
  update public.candidates
     set status    = 'error',
         scoring   = null,
         scored_at = null
   where id = p_candidate_id;

  if not found then
    raise exception 'candidate_not_found';
  end if;

  insert into public.audit_log (actor, action, candidate_id, detail)
  values (
    'system', 'score_error', p_candidate_id,
    jsonb_build_object('error', p_error_msg)
  );
end;
$$;

revoke execute on function public.mark_score_error(uuid, text)
  from public, anon, authenticated;
grant execute on function public.mark_score_error(uuid, text)
  to service_role;

create or replace function public.delete_candidate(
  p_candidate_id uuid,
  p_ip_hash      text default null
)
returns void
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
declare
  v_name  text;
  v_email text;
begin
  select full_name, email
    into v_name, v_email
    from public.candidates
   where id = p_candidate_id;

  if not found then
    raise exception 'candidate_not_found';
  end if;

  insert into public.audit_log (actor, action, candidate_id, detail, ip_hash)
  values (
    'committee', 'delete', p_candidate_id,
    jsonb_build_object('full_name', v_name, 'email', v_email),
    p_ip_hash
  );

  delete from public.candidates where id = p_candidate_id;
end;
$$;

revoke execute on function public.delete_candidate(uuid, text)
  from public, anon, authenticated;
grant execute on function public.delete_candidate(uuid, text)
  to service_role;

create or replace function public.log_candidate_view(
  p_candidate_id uuid,
  p_ip_hash      text default null
)
returns void
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
begin
  insert into public.audit_log (actor, action, candidate_id, ip_hash)
  values ('committee', 'view', p_candidate_id, p_ip_hash);
end;
$$;

revoke execute on function public.log_candidate_view(uuid, text)
  from public, anon, authenticated;
grant execute on function public.log_candidate_view(uuid, text)
  to service_role;

create or replace function public.log_candidate_list_view(
  p_ip_hash text default null
)
returns void
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
begin
  insert into public.audit_log (actor, action, ip_hash)
  values ('committee', 'list', p_ip_hash);
end;
$$;

revoke execute on function public.log_candidate_list_view(text)
  from public, anon, authenticated;
grant execute on function public.log_candidate_list_view(text)
  to service_role;

create or replace function public.create_committee_session(
  p_ip_hash    text default null,
  p_user_agent text default null
)
returns uuid
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
declare
  v_id uuid;
begin
  insert into public.committee_sessions (ip_hash, user_agent)
  values (p_ip_hash, p_user_agent)
  returning id into v_id;

  insert into public.audit_log (actor, action, ip_hash, detail)
  values (
    'committee', 'login_ok', p_ip_hash,
    jsonb_build_object('session_id', v_id)
  );

  return v_id;
end;
$$;

revoke execute on function public.create_committee_session(text, text)
  from public, anon, authenticated;
grant execute on function public.create_committee_session(text, text)
  to service_role;

create or replace function public.is_committee_session_valid(
  p_session_id uuid
)
returns boolean
language sql
security definer
set search_path = pg_catalog, public
as $$
  select exists (
    select 1 from public.committee_sessions
    where id = p_session_id and revoked = false and expires_at > now()
  );
$$;

revoke execute on function public.is_committee_session_valid(uuid)
  from public, anon, authenticated;
grant execute on function public.is_committee_session_valid(uuid)
  to service_role;

create or replace function public.revoke_committee_session(
  p_session_id uuid,
  p_ip_hash    text default null
)
returns void
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
begin
  update public.committee_sessions
     set revoked = true
   where id = p_session_id
     and revoked = false;

  if found then
    insert into public.audit_log (actor, action, ip_hash, detail)
    values (
      'committee', 'logout', p_ip_hash,
      jsonb_build_object('session_id', p_session_id)
    );
  end if;
end;
$$;

revoke execute on function public.revoke_committee_session(uuid, text)
  from public, anon, authenticated;
grant execute on function public.revoke_committee_session(uuid, text)
  to service_role;

create or replace function public.log_login_fail(
  p_ip_hash text default null
)
returns void
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
begin
  insert into public.audit_log (actor, action, ip_hash)
  values ('committee', 'login_fail', p_ip_hash);
end;
$$;

revoke execute on function public.log_login_fail(text)
  from public, anon, authenticated;
grant execute on function public.log_login_fail(text)
  to service_role;

create or replace function public.purge_expired_committee_sessions()
returns integer
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
declare
  v_count integer;
begin
  delete from public.committee_sessions
   where revoked = true or expires_at <= now();

  get diagnostics v_count = row_count;
  return v_count;
end;
$$;

revoke execute on function public.purge_expired_committee_sessions()
  from public, anon, authenticated;
grant execute on function public.purge_expired_committee_sessions()
  to service_role;

commit;