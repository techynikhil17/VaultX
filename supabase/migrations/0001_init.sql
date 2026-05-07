-- VaultX schema
-- Run in Supabase SQL editor or via supabase db push

create extension if not exists "pgcrypto";

create table if not exists public.vault_entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  site_name text not null,
  username_encrypted text not null,
  password_encrypted text not null,
  notes_encrypted text,
  url text,
  category text default 'Other',
  iv text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  last_used_at timestamptz
);

create index if not exists vault_entries_user_idx on public.vault_entries(user_id);
create index if not exists vault_entries_category_idx on public.vault_entries(user_id, category);

create table if not exists public.activity_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  action text not null,
  metadata jsonb default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists activity_logs_user_idx on public.activity_logs(user_id, created_at desc);

-- updated_at trigger
create or replace function public.set_updated_at() returns trigger as $$
begin new.updated_at = now(); return new; end; $$ language plpgsql;

drop trigger if exists vault_entries_updated_at on public.vault_entries;
create trigger vault_entries_updated_at
  before update on public.vault_entries
  for each row execute procedure public.set_updated_at();

-- Row Level Security
alter table public.vault_entries enable row level security;
alter table public.activity_logs enable row level security;

drop policy if exists "vault_select_own" on public.vault_entries;
drop policy if exists "vault_insert_own" on public.vault_entries;
drop policy if exists "vault_update_own" on public.vault_entries;
drop policy if exists "vault_delete_own" on public.vault_entries;

create policy "vault_select_own" on public.vault_entries
  for select using (auth.uid() = user_id);
create policy "vault_insert_own" on public.vault_entries
  for insert with check (auth.uid() = user_id);
create policy "vault_update_own" on public.vault_entries
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "vault_delete_own" on public.vault_entries
  for delete using (auth.uid() = user_id);

drop policy if exists "logs_select_own" on public.activity_logs;
drop policy if exists "logs_insert_own" on public.activity_logs;

create policy "logs_select_own" on public.activity_logs
  for select using (auth.uid() = user_id);
create policy "logs_insert_own" on public.activity_logs
  for insert with check (auth.uid() = user_id);
