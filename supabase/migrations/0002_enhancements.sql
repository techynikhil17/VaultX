alter table public.vault_entries
  add column if not exists is_favorite boolean not null default false,
  add column if not exists expires_at date;

create index if not exists vault_entries_favorite_idx on public.vault_entries(user_id, is_favorite);
