-- ============================================================
-- NoveltyScholars production RLS and private-file hardening
-- Run in Supabase -> SQL Editor after MIGRATIONS.sql and
-- PAYSTACK_MIGRATION.sql. Safe to run more than once.
-- ============================================================

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'ADMIN' and coalesce(is_banned, false) = false
  );
$$;

revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to authenticated, service_role;

-- Profiles: prevent public email/name enumeration and privilege escalation.
alter table public.profiles enable row level security;
drop policy if exists "Allow all read profiles" on public.profiles;
drop policy if exists "Allow insert own profile" on public.profiles;
drop policy if exists "Users read own profile" on public.profiles;
drop policy if exists "Admins read profiles" on public.profiles;
create policy "Users read own profile"
  on public.profiles for select to authenticated
  using (id = auth.uid());
create policy "Admins read profiles"
  on public.profiles for select to authenticated
  using (public.is_admin());
create policy "Users create student profile"
  on public.profiles for insert to authenticated
  with check (
    id = auth.uid()
    and role = 'STUDENT'
    and coalesce(is_banned, false) = false
    and email = (auth.jwt() ->> 'email')
  );

-- Services are public to read; all writes are performed by authenticated
-- admin server actions using the service role.
alter table public.services enable row level security;
drop policy if exists "Allow all read services" on public.services;
drop policy if exists "Public read services" on public.services;
create policy "Public read services"
  on public.services for select to anon, authenticated
  using (true);

-- Orders are created by a server action so the browser cannot choose prices.
alter table public.orders enable row level security;
drop policy if exists "Allow users to read own orders" on public.orders;
drop policy if exists "Allow admin read all orders" on public.orders;
drop policy if exists "Allow insert own orders" on public.orders;
drop policy if exists "authenticated users can insert their own orders" on public.orders;
drop policy if exists "Allow users to update own orders" on public.orders;
drop policy if exists "Allow admin update orders" on public.orders;
drop policy if exists "Users read own orders" on public.orders;
drop policy if exists "Admins read all orders" on public.orders;
create policy "Users read own orders"
  on public.orders for select to authenticated
  using (user_id = auth.uid());
create policy "Admins read all orders"
  on public.orders for select to authenticated
  using (public.is_admin());

-- Order messages are visible only to the customer who owns the order and admins.
alter table public.messages enable row level security;
drop policy if exists "Allow read messages for own orders" on public.messages;
drop policy if exists "Allow insert messages" on public.messages;
drop policy if exists "Order participants read messages" on public.messages;
drop policy if exists "Order participants send messages" on public.messages;
create policy "Order participants read messages"
  on public.messages for select to authenticated
  using (
    exists (
      select 1 from public.orders
      where orders.id = messages.order_id and orders.user_id = auth.uid()
    )
    or public.is_admin()
  );
create policy "Order participants send messages"
  on public.messages for insert to authenticated
  with check (
    user_id = auth.uid()
    and (
      exists (
        select 1 from public.orders
        where orders.id = messages.order_id and orders.user_id = auth.uid()
      )
      or public.is_admin()
    )
  );

-- File metadata follows the same ownership rules. The permissive WITH CHECK
-- (true) policy from the original MVP is explicitly removed.
alter table public.order_files enable row level security;
drop policy if exists "Allow read order files" on public.order_files;
drop policy if exists "Allow insert order files" on public.order_files;
drop policy if exists "Order participants read file metadata" on public.order_files;
drop policy if exists "Order participants add file metadata" on public.order_files;
create policy "Order participants read file metadata"
  on public.order_files for select to authenticated
  using (
    exists (
      select 1 from public.orders
      where orders.id = order_files.order_id and orders.user_id = auth.uid()
    )
    or public.is_admin()
  );
create policy "Order participants add file metadata"
  on public.order_files for insert to authenticated
  with check (
    uploaded_by = auth.uid()
    and (
      exists (
        select 1 from public.orders
        where orders.id = order_files.order_id and orders.user_id = auth.uid()
      )
      or public.is_admin()
    )
  );

-- Promo codes are validated by a server action and managed by admin server
-- actions. No browser role needs direct table access.
alter table public.promo_codes enable row level security;
drop policy if exists "Public read promo codes" on public.promo_codes;
drop policy if exists "Admins manage promo codes" on public.promo_codes;
drop policy if exists "Admins read promo codes" on public.promo_codes;
create policy "Admins read promo codes"
  on public.promo_codes for select to authenticated
  using (public.is_admin());

-- Keep uploaded coursework private and authorize access by the order id in
-- the object path: orders/<order-id>/<uploader-id>/<filename>.
update storage.buckets set public = false where id = 'order-files';
drop policy if exists "Allow authenticated uploads" on storage.objects;
drop policy if exists "Allow public read" on storage.objects;
drop policy if exists "Order participants upload files" on storage.objects;
drop policy if exists "Order participants read files" on storage.objects;
drop policy if exists "Uploaders remove failed files" on storage.objects;
create policy "Order participants upload files"
  on storage.objects for insert to authenticated
  with check (
    bucket_id = 'order-files'
    and (storage.foldername(name))[1] = 'orders'
    and (storage.foldername(name))[3] = auth.uid()::text
    and (
      exists (
        select 1 from public.orders
        where orders.id::text = (storage.foldername(name))[2]
          and orders.user_id = auth.uid()
      )
      or public.is_admin()
    )
  );
create policy "Order participants read files"
  on storage.objects for select to authenticated
  using (
    bucket_id = 'order-files'
    and (storage.foldername(name))[1] = 'orders'
    and (
      exists (
        select 1 from public.orders
        where orders.id::text = (storage.foldername(name))[2]
          and orders.user_id = auth.uid()
      )
      or public.is_admin()
    )
  );
create policy "Uploaders remove failed files"
  on storage.objects for delete to authenticated
  using (
    bucket_id = 'order-files'
    and (storage.foldername(name))[3] = auth.uid()::text
  );
