# Release Plan

## Current baseline

Built:

- Foundation
- Properties
- Units
- Tenants
- Leases
- Billing / Invoices
- Payments
- Receipts manual generation baseline
- Reminders manual MVP
- Maintenance baseline
- Reporting / Dashboard metrics first slice
- Warm Admin Ledger design-system foundation

## Recommended next sequence

1. Review the remaining focused MVP gap bucket
2. Choose one approved next task from ready-soon or later candidates
3. Use the design-system foundation for future UI work without reopening product scope

Next recommended task: choose the next focused MVP gap from the task bucket.

## Design-system baseline

The Warm Admin Ledger foundation gives RuangRapi a compact operations UI across current screens:

- warm neutral background and ledger-like card surfaces
- teal primary actions and clear secondary actions
- semantic error, success, warning, info, and chart colors
- Plus Jakarta Sans typography
- responsive branded shell with active navigation
- shared Base UI/shadcn primitives for future component work

Deferred design-system scope:

- replacing every remaining domain-local BEM class with shared React primitives
- dark mode
- visual regression automation
- additional dashboard interaction polish

## Reporting baseline

The first `/dashboard` reporting slice uses existing operational records and preset ranges only:

- This month
- Last month
- Last 3 months
- This year

It summarizes current unit status, selected-period rent collection, invoice attention, reminder status, and current maintenance workload. It uses app-side aggregation over existing Supabase tables and shadcn/Recharts charts.

Deferred reporting scope:

- dashboard/reporting UI/UX polish
- custom date range picker
- CSV/export
- saved reports
- database reporting views or Supabase RPCs
- advanced accounting or tax reports
- automated overdue logic

## Release principle

Do not jump into dashboard metrics until the underlying operational records exist.
