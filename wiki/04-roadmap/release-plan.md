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
- Joyful Premium Ops UI uplift
- Dashboard/reporting UI/UX polish
- Lagoon Command Center shell/dashboard uplift

## Recommended next sequence

1. Review the remaining focused MVP gap bucket
2. Choose one approved next task from ready-soon or later candidates
3. Use the design-system foundation for future UI work without reopening product scope

Next recommended task: choose the next focused MVP gap from the task bucket.

## Design-system baseline

Lagoon Command Center is the active shell and dashboard visual direction. It supersedes the Joyful Premium Ops sidebar shell while preserving Warm Admin Ledger's compact operational-density principles and the Joyful Premium Ops emphasis on expressive operational surfaces.

- floating rounded bottom navigation
- blue, sky, cyan, and teal lagoon accents with orange attention states
- expressive dashboard cards, chart surfaces, and priority states
- restrained list, form, detail, and receipt print surfaces
- semantic error, success, warning, info, and chart colors
- Plus Jakarta Sans typography
- responsive branded shell with active navigation
- shared Base UI/shadcn primitives for future component work

Deferred design-system scope:

- replacing every remaining domain-local BEM class with shared React primitives
- dark mode
- visual regression automation

## Reporting baseline

The first `/dashboard` reporting slice uses existing operational records and preset ranges only:

- This month
- Last month
- Last 3 months
- This year

It summarizes current unit status, selected-period rent collection, invoice attention, reminder status, and current maintenance workload. It uses app-side aggregation over existing Supabase tables and shadcn/Recharts charts. Recharts remains the active charting library for this pass; ApexCharts evaluation is deferred until advanced reporting needs justify richer chart interactions.

Deferred reporting scope:

- ApexCharts evaluation or migration
- custom date range picker
- CSV/export
- saved reports
- database reporting views or Supabase RPCs
- advanced accounting or tax reports
- automated overdue logic

## Release principle

The first dashboard metrics slice was built after the underlying operational records existed. Future release work should still protect the same sequencing principle: build or refine one focused MVP gap at a time, and avoid adding advanced analytics, automation, exports, gateways, or workflow expansions before the owning module has a stable baseline and approved scope.
