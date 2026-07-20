# Design/UI/Structure Fix Pack

Copy every file in this zip into your project at the same relative path,
overwriting the existing files. New files (marked NEW below) just get added.

## ⚠️ Manual step required first

Delete this duplicate/dead file from your repo — it's an orphaned copy from
an earlier fix and nothing imports it:

    app/services/ServicesManager.tsx

(The real one used by the app is `app/admin/services/ServicesManager.tsx` —
leave that one alone.)

## What's in this pack

### Components (theme-token sweep + mobile responsiveness)
- components/PricingCalculator.tsx
- components/ServicesGrid.tsx
- components/ChatBox.tsx
- components/FileUpload.tsx
- components/StatusTimeline.tsx
- components/PromoCodeInput.tsx

### Admin shell — rebuilt with sticky sidebar, active-link highlighting, mobile top-nav
- app/admin/layout.tsx
- app/admin/AdminSidebar.tsx (NEW)
- app/admin/actions.ts (NEW)
- app/admin/page.tsx
- app/admin/orders/AdminOrdersTable.tsx

### Dashboard shell — same treatment
- app/dashboard/layout.tsx
- app/dashboard/DashboardSidebar.tsx (NEW)
- app/dashboard/actions.ts (NEW)
- app/dashboard/page.tsx

### Services pages — theme sweep + a real bug fix
`take-my-online-class` and `take-my-online-exam` had swapped/duplicated
content (one showed the generic services list, the other showed
"Take My Online Class" copy on the exam route). Both now have correct,
distinct content.
- app/services/page.tsx
- app/services/[slug]/page.tsx
- app/services/take-my-online-class/page.tsx
- app/services/take-my-online-exam/page.tsx
- app/pricing/page.tsx
- app/privacy-policy/page.tsx
- app/terms/page.tsx

### Order flow — targeted patches only (785-line file, edited surgically not rewritten)
- app/order/page.tsx
  - step-indicator "future" circle now theme-aware
  - connector spacing tightened on mobile (w-8 sm:w-12)
  - review-summary box now theme-aware

### New: missing App Router states
- app/loading.tsx
- app/not-found.tsx
- app/error.tsx

### New: metadata, favicon, OG image
- app/layout.tsx — adds metadataBase, openGraph, twitter card, viewport,
  and icon references
- public/favicon.ico
- public/favicon-32.png
- public/apple-icon.png
- public/icon-192.png
- public/icon-512.png
- public/opengraph-image.png

The icon/OG images are a placeholder "N" wordmark on your primary sky-blue
(#0ea5e9) so the site has *something* branded instead of nothing. Swap
these out for a real logo whenever you have one — same filenames, same
folder, no code changes needed.

## After copying files in

```powershell
git add .
git commit -m "fix: theme-token sweep, mobile responsiveness, missing app states, favicon/OG"
git push origin main
```

Then check locally in both light and dark mode (toggle in the header) —
every page and component should now respond to the theme instead of
staying stuck in light mode.
