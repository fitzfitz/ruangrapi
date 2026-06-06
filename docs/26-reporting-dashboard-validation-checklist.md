# Reporting / Dashboard Metrics Validation Checklist

Status: functional manual validation complete.

Validation note: Reporting / Dashboard metrics were validated on `/dashboard` across the implemented preset range and chart behaviors. Detailed dashboard/reporting UI/UX polish was completed separately as an in-place polish pass.

## Scope

- [x] `/dashboard` loads for authenticated and onboarded users.
- [x] Unauthenticated users cannot access `/dashboard` and are redirected through the existing route gate.
- [x] The dashboard shows preset range controls for This month, Last month, Last 3 months, and This year.
- [x] The default range is This month.
- [x] Switching preset ranges refreshes period-limited metrics.
- [x] Unit metrics show current total, occupied, and vacant unit counts.
- [x] Expected rent uses non-cancelled invoices in the selected billing period range.
- [x] Collected rent uses payments attached to non-cancelled invoices in the selected billing period range.
- [x] Outstanding rent is expected minus collected and never below zero.
- [x] Invoice attention count includes unpaid, partially paid, and overdue invoices in the selected billing period range.
- [x] Open maintenance count includes open and in-progress tickets.
- [x] Reminder counts use reminders attached to selected-period invoices.
- [x] Cancelled invoices do not contribute to expected rent, collected rent, outstanding rent, or invoice attention metrics.
- [x] Cancelled reminders do not appear as active reminder attention items.
- [x] Collection chart renders expected versus collected data when invoices or payments exist.
- [x] Invoice status chart renders when selected-period invoices exist.
- [x] Maintenance status chart renders when maintenance tickets exist.
- [x] Reminder status chart renders when reminder records exist for selected-period invoices.
- [x] Empty chart states render cleanly when no chart data exists.
- [x] Loading state appears while dashboard metrics are being fetched.
- [x] Error state appears if dashboard metrics fail to load.
- [x] Detailed dashboard/reporting UI/UX polish was completed separately as an in-place polish pass.
- [x] Browser console shows no errors during dashboard load or range switching.

## Boundaries

- [x] No custom date range picker is introduced.
- [x] No CSV/export is introduced.
- [x] No Supabase migrations are introduced.
- [x] No Supabase RPCs or database views are introduced.
- [x] No invoice, payment, reminder, or maintenance workflow behavior is changed.
- [x] The rest of the app is not migrated to shadcn/ui.

## Closeout

Functional dashboard/reporting validation and in-place UI/UX polish are complete. The first slice remains intentionally limited to preset ranges, app-side aggregation, and simple chart summaries over existing records.

Deferred scope:

- custom date range picker
- CSV/export
- saved reports
- database reporting views or Supabase RPCs
- advanced accounting or tax reports
- automated overdue logic
- workflow changes in billing, payments, reminders, or maintenance

## Validation Commands

- [x] `npm run format:check`
- [x] `npm run build`
- [x] `npm run lint`
- [x] `git diff --check`
