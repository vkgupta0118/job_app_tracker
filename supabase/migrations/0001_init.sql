-- 0001_init.sql
-- Initial schema: applications table + status enum and updated_at trigger.
begin;

-- Lifecycle of an application.
create type application_status as enum (
  'saved',      -- found it, not applied yet
  'applied',
  'screen',     -- recruiter / phone screen
  'interview',
  'offer',
  'rejected',
  'archived'
);

create table applications (
  id          uuid primary key default gen_random_uuid(),
  company     text not null,
  role        text not null,
  status      application_status not null default 'saved',
  url         text,
  location    text,
  salary_note text,
  notes       text,
  applied_at  date,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create index applications_status_idx on applications (status);
create index applications_created_at_idx on applications (created_at desc);

-- Keep updated_at fresh on every update.
create or replace function set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger applications_set_updated_at
  before update on applications
  for each row
  execute function set_updated_at();

commit;
