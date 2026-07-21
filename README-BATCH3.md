# Admin Fix Pack — Round 3: Customers, Analytics, CSV Export, Bulk Actions, Settings

## ⚠️ Run the SQL migration FIRST

Open Supabase → SQL Editor → paste and run `MIGRATIONS.sql` from this zip
before deploying any of the code below. It adds:
- `profiles.is_banned` column (Customers page ban/unban)
- `site_settings` singleton table (Settings page + dynamic Footer)

It's safe to run even if you're not sure — it uses `IF NOT EXISTS` guards
throughout.

## Then copy every file into your project at the same relative path

New folders: `app/admin/users/`, `app/admin/analytics/`, `app/admin/settings/`

## What's in this batch

### 1. Customers / Users management (`app/admin/users/`)
- List every registered user with order count + total spent per person
- Promote/demote between Student and Admin
- **Ban/unban** — actually enforced, not cosmetic:
  - `app/dashboard/layout.tsx` now checks `is_banned` and signs the user
    out with a redirect to `/login?banned=1` if they're banned
  - `app/login/page.tsx` also checks immediately after sign-in, so a
    banned user gets a clear "Account suspended" message instead of
    briefly getting into the dashboard first
  - The SQL migration includes an optional (commented-out) RLS policy
    to also block order creation at the database level — read the
    comments in `MIGRATIONS.sql` before enabling it, since it needs to
    match your existing insert policy name

Uses the existing `createServiceClient()` (service-role key, already in
your env from the Stripe webhook) to update other users' profile rows,
since normal RLS only lets a user update their own row.

### 2. Analytics (`app/admin/analytics/page.tsx`)
Revenue by month (last 6), orders-by-status breakdown, and top services
by revenue — built with plain CSS bar visualizations, no new npm
dependency required (recharts etc. aren't installed in this project, so
I avoided adding a new package for this).

### 3. CSV Export
Added directly to `app/admin/orders/AdminOrdersTable.tsx` — an "Export
CSV" button that downloads either the currently filtered/searched list,
or just your selection if you've checked specific rows. No server round
trip, pure client-side.

### 4. Bulk actions
Also in `AdminOrdersTable.tsx` — checkboxes per row + "select all",
a bulk status-change action bar that appears once you select anything.
Reuses the exact same transition-validation logic as the single-order
dropdown (`app/admin/orders/status-actions.ts`, now with
`bulkUpdateOrderStatus` added) — orders that can't legally make the
jump are skipped and reported, not silently forced.

### 5. Settings page (`app/admin/settings/`)
Edit contact email, phone, and WhatsApp number from the UI instead of
editing code. **`components/Footer.tsx` now reads these live** from the
database (with safe fallback defaults if the migration hasn't run yet).

**Not yet wired**: `components/Header.tsx` still has the phone number
hardcoded — it's a client component, so wiring it up needs a slightly
different approach (fetch settings in a parent server component and
pass down, or a small client-side fetch). Say the word if you want that
done too; I kept this batch to the Footer as the demonstration to avoid
this getting even bigger.

## Also touched (small, related fixes)
- `lib/types.ts` — added `is_banned?: boolean` to the `Profile` type
- `app/admin/AdminSidebar.tsx` — added nav links for Customers,
  Analytics, and Settings

## After copying files in

```powershell
git add .
git commit -m "feat: customers management, analytics, CSV export, bulk actions, settings"
git push origin main
```

Then test in this order once deployed:
1. Visit `/admin/settings`, change something, confirm it shows on the
   public site footer within a minute
2. Visit `/admin/users`, try promoting/demoting a test account, then
   try banning a test account and confirm it can't log back in
3. Visit `/admin/orders`, select a few rows, try the bulk status change
   and the CSV export button
4. Visit `/admin/analytics` and confirm the numbers look right against
   what you already know about your test orders
