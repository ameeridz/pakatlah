begin;

create extension if not exists pgcrypto;

create table public.decisions (
  id uuid primary key default gen_random_uuid(),
  public_token text not null unique default encode(gen_random_bytes(12), 'hex'),
  manage_token text not null unique default encode(gen_random_bytes(24), 'hex'),
  question text not null,
  organizer_name text not null,
  status text not null default 'open',
  closes_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint decisions_question_length check (char_length(btrim(question)) between 1 and 120),
  constraint decisions_organizer_name_length check (char_length(btrim(organizer_name)) between 1 and 40),
  constraint decisions_status_values check (status in ('open', 'closed', 'finalized'))
);

create table public.decision_options (
  id uuid primary key default gen_random_uuid(),
  decision_id uuid not null references public.decisions(id) on delete cascade,
  name text not null,
  position smallint not null,
  created_at timestamptz not null default now(),
  constraint decision_options_name_length check (char_length(btrim(name)) between 1 and 60),
  constraint decision_options_position_range check (position between 1 and 6),
  constraint decision_options_unique_position unique (decision_id, position)
);

create index decision_options_decision_id_idx on public.decision_options(decision_id);
create index decisions_public_token_idx on public.decisions(public_token);
create index decisions_manage_token_idx on public.decisions(manage_token);

create function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger decisions_set_updated_at
before update on public.decisions
for each row execute function public.set_updated_at();

alter table public.decisions enable row level security;
alter table public.decision_options enable row level security;
revoke all on table public.decisions from anon, authenticated;
revoke all on table public.decision_options from anon, authenticated;

commit;
