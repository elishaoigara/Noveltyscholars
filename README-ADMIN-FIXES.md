# Admin Dashboard Fix Pack — Round 2

Copy every file below into your project at the same relative path,
overwriting existing files. `app/admin/promo-codes/` is entirely new —
create the folder.

## What's fixed

### 1. Redundant auth checks (perf bug)
`lib/admin-auth.ts` is new — a `requireAdmin()` helper wrapped in React's
`cache()`, so calling it from a layout AND its child page costs one DB
round trip per request instead of two. Applied to:
- app/admin/layout.tsx
- app/admin/page.tsx
- app/admin/orders/page.tsx
- app/admin/orders/[id]/page.tsx
- app/admin/services/page.tsx

### 2. Duplicated, unguarded status-change logic
`app/admin/orders/status-actions.ts` is new — one server action
(`updateOrderStatus`) now used by both the table dropdown and the detail
page dropdown. It:
- rejects illegal transitions (e.g. can't skip PENDING_PAYMENT straight
  to COMPLETED, can't go backwards from COMPLETED to PENDING_PAYMENT)
- posts an automatic note in the order's chat when status changes, so
  there's an audit trail (who/what/when) and the customer sees it next
  time they open their dashboard
- revalidates the relevant admin pages so the UI updates without a
  manual refresh

Applied to:
- app/admin/orders/AdminOrdersTable.tsx
- app/admin/orders/[id]/AdminStatusDropdown.tsx

### 3. Hard page reload after file upload
`app/admin/orders/[id]/AdminFileUpload.tsx` now calls `router.refresh()`
instead of `window.location.reload()` — no full reload, no lost scroll
position, far less data re-fetched (matters on slow/metered connections).
It also actually uses the uploaded file's name in the confirmation toast
instead of ignoring it.

### 4. Filters not shareable/bookmarkable
`AdminOrdersTable.tsx`'s status filter now lives in the URL
(`/admin/orders?status=PAID`) instead of local component state.

### 5. Dead-end dashboard stat cards
`app/admin/page.tsx` — "Total Orders" and "Pending Payment" cards are now
links straight into the correspondingly-filtered orders list. Revenue
now shows **this month** alongside the lifetime total instead of just
one undifferentiated number.

### 6. Missing feature: Promo Codes admin UI
Brand new: `app/admin/promo-codes/page.tsx` +
`app/admin/promo-codes/PromoCodesManager.tsx`. Before this, customers
could type a promo code at checkout but there was no way for you to
actually create one anywhere in the app. Full CRUD: code, percentage or
fixed discount, max uses, minimum order amount, optional expiry date,
active/inactive toggle, and status badges (Active / Inactive / Expired /
Exhausted). Also added to the sidebar nav (`app/admin/AdminSidebar.tsx`,
included in this pack with the new nav entry).

## Not included in this pack (bigger lifts, said "next" in the audit)
- Customers/users management page
- Analytics/charts, CSV export
- Recent-activity feed
- Bulk order actions
- Settings page for contact info
- Writer/staff assignment

## After copying files in

```powershell
git add .
git commit -m "fix: admin auth caching, guarded status transitions, promo codes admin UI"
git push origin main
```
