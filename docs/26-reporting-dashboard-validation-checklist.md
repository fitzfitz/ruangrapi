# Reporting / Dashboard Metrics Validation Checklist

Validate the first Reporting / Dashboard metrics slice manually after implementation. This checklist covers `/dashboard` only.

## Scope

- [ ] `/dashboard` loads for authenticated and onboarded users.
- [ ] Unauthenticated users cannot access `/dashboard` and are redirected through the existing route gate.
- [ ] The dashboard shows preset range controls for This month, Last month, Last 3 months, and This year.
- [ ] The default range is This month.
- [ ] Switching preset ranges refreshes period-limited metrics.
- [ ] Unit metrics show current total, occupied, and vacant unit counts.
- [ ] Expected rent uses non-cancelled invoices in the selected billing period range.
- [ ] Collected rent uses payments attached to non-cancelled invoices in the selected billing period range.
- [ ] Outstanding rent is expected minus collected and never below zero.
- [ ] Invoice attention count includes unpaid, partially paid, and overdue invoices in the selected billing period range.
- [ ] Open maintenance count includes open and in-progress tickets.
- [ ] Reminder counts use reminders attached to selected-period invoices.
- [ ] Cancelled invoices do not contribute to expected rent, collected rent, outstanding rent, or invoice attention metrics.
- [ ] Cancelled reminders do not appear as active reminder attention items.
- [ ] Collection chart renders expected versus collected data when invoices or payments exist.
- [ ] Invoice status chart renders when selected-period invoices exist.
- [ ] Maintenance status chart renders when maintenance tickets exist.
- [ ] Reminder status chart renders when reminder records exist for selected-period invoices.
- [ ] Empty chart states render cleanly when no chart data exists.
- [ ] Loading state appears while dashboard metrics are being fetched.
- [ ] Error state appears if dashboard metrics fail to load.
- [ ] Dashboard layout is readable on desktop.
- [ ] Dashboard layout is readable on mobile.
- [ ] Browser console shows no errors during dashboard load or range switching.

## Boundaries

- [ ] No custom date range picker is introduced.
- [ ] No CSV/export is introduced.
- [ ] No Supabase migrations are introduced.
- [ ] No Supabase RPCs or database views are introduced.
- [ ] No invoice, payment, reminder, or maintenance workflow behavior is changed.
- [ ] The rest of the app is not migrated to shadcn/ui.

## Validation Commands

- [ ] `npm run format:check`
- [ ] `npm run build`
- [ ] `npm run lint`
- [ ] `git diff --check`
