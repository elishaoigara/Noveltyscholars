-- ============================================================
-- Run this entire file in Supabase → SQL Editor BEFORE deploying
-- the code in this batch. Safe to run once; uses IF NOT EXISTS /
-- ON CONFLICT guards so re-running it won't error.
-- ============================================================

-- 1. Ban support on profiles (used by Customers management)
alter table public.profiles
  add column if not exists is_banned boolean not null default false;

-- 2. Site settings singleton table (used by the Settings page + Footer)
create table if not exists public.site_settings (
  id integer primary key default 1,
  contact_email text not null default 'noveltyscholars@gmail.com',
  contact_phone text not null default '+1 (209) 560-0466',
  whatsapp_number text not null default '12095600466',
  updated_at timestamptz not null default now(),
  constraint site_settings_singleton check (id = 1)
);

insert into public.site_settings (id)
values (1)
on conflict (id) do nothing;

alter table public.site_settings enable row level security;

-- Public (including anonymous visitors) can read settings — the Footer
-- needs this. Writes go through the service-role key in the admin
-- server action, which bypasses RLS entirely, so no write policy is
-- added here — that keeps anon/authenticated clients read-only.
drop policy if exists "Anyone can read site settings" on public.site_settings;
create policy "Anyone can read site settings"
  on public.site_settings for select
  using (true);

-- 3. Optional but recommended: block banned users from placing new
-- orders at the database level (defense in depth — the app already
-- signs banned users out and blocks the dashboard, but this closes
-- the door even if someone reuses an old session/token).
-- Skip this step if you're not sure which policy currently allows
-- order inserts and don't want to risk breaking it — the app-level
-- checks (dashboard redirect + login block) already cover the
-- normal user flow.
--
-- Uncomment and adjust "authenticated users can insert their own
-- orders" to match your existing policy name if you want this layer:
--
-- drop policy if exists "authenticated users can insert their own orders" on public.orders;
-- create policy "authenticated users can insert their own orders"
--   on public.orders for insert
--   with check (
--     auth.uid() = user_id
--     and exists (
--       select 1 from public.profiles
--       where profiles.id = auth.uid() and profiles.is_banned = false
--     )
--   );
