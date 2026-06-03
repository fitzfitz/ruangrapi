# Reporting / Dashboard Metrics Design

## Context

RuangRapi now has manually validated operational records for properties, units, tenants, leases, invoices, payments, receipts, reminders, and maintenance tickets. The current `/dashboard` route is only a placeholder shell, while the wiki identifies Reporting / Dashboard metrics as the next recommended planning task.

The first reporting slice should turn existing operational records into a useful overview without adding advanced workflows, database reporting infrastructure, or workflow changes in the underlying modules.

## Goal

Build the first dashboard metrics slice over existing operational records so a rental owner can quickly see current operational state, selected-period rent collection, invoice attention items, reminder activity, and maintenance workload.

## Approved Approach

Use an app-side aggregate query in the existing `dashboard` module.

The dashboard module should query only the fields it needs from existing tables, then compute summary metrics and chart data in TypeScript. This avoids Supabase migrations, database views, RPCs, and reporting-specific schema changes for the first slice.

## UI and Charting Direction

The first slice should set up Tailwind CSS and shadcn/ui because the dashboard will use shadcn chart primitives.

Scope of setup:

- Add Tailwind CSS v4 through the Vite plugin.
- Initialize shadcn/ui for this React, Vite, and TypeScript app.
- Add the shadcn chart component.
- Add Recharts because shadcn charts are Recharts-based.
- Add only the UI primitives needed by this dashboard slice.
- Do not migrate the rest of the app to shadcn/ui during this task.

Context7 documentation findings:

- Tailwind CSS v4 with Vite uses `tailwindcss`, `@tailwindcss/vite`, and `@import "tailwindcss"` in CSS.
- shadcn/ui for Vite can be initialized with the shadcn CLI, and the chart component can be added with `npx shadcn@latest add chart`.
- shadcn charts use Recharts composition rather than wrapping Recharts in a separate charting abstraction.
- Recharts v3 supports chart accessibility by default and works with responsive containers.

## Preset Ranges

The dashboard should support preset ranges only:

- `This month`
- `Last month`
- `Last 3 months`
- `This year`

There is no custom date range picker in this slice.

Range calculations should use calendar months. For invoice-backed metrics, use `billing_period`, which stores the first day of the billing month. For example, June 2026 is represented as `2026-06-01`.

## Metrics

Summary cards should show:

- Total units.
- Occupied units.
- Vacant units.
- Expected rent for the selected period.
- Collected rent for the selected period.
- Outstanding rent for the selected period, floored at zero.
- Unpaid or overdue invoices for the selected period.
- Open maintenance tickets.
- Reminder counts by status for selected-period invoices.

Metric rules:

- Unit counts are current operational state, not period-limited, because unit statuses are current-state fields.
- Expected rent is the sum of non-cancelled invoice `total_amount` values whose `billing_period` falls inside the selected range.
- Collected rent is the sum of payments attached to non-cancelled invoices whose `billing_period` falls inside the selected range.
- Outstanding rent is `max(expected rent - collected rent, 0)`.
- Unpaid or overdue invoices count invoices in selected billing periods with status `unpaid`, `partially_paid`, or `overdue`.
- Open maintenance tickets count current tickets with status `open` or `in_progress`, not period-limited, because they represent a live work queue.
- Reminder counts should group existing reminder records by status for reminders attached to invoices in selected billing periods.
- Cancelled invoices and cancelled reminders should not be treated as active attention items.

## Charts

The first slice should include simple shadcn/Recharts visual summaries:

- Billing collection comparison: expected vs collected by month for the selected range.
- Invoice status breakdown for selected-period invoices.
- Maintenance status breakdown for current maintenance tickets.
- Reminder status breakdown for reminders attached to selected-period invoices when reminder records exist.

Charts should remain compact and operational. They should support scanning and comparison rather than becoming advanced analytics.

## Data Flow

The dashboard page should:

1. Hold the selected preset range in local component state.
2. Use a TanStack Query hook from the dashboard module to load dashboard metrics for that range.
3. Query existing Supabase tables through the shared Supabase client:
   - `units`
   - `invoices`
   - `payments`
   - `reminders`
   - `maintenance_tickets`
4. Compute all metrics and chart-ready data in dashboard module code.
5. Render loading, error, populated, and empty/zero-data states on `/dashboard`.

The query should rely on existing RLS policies for organization isolation. It may also keep normal organization-safe filters where the existing module patterns already do so, but it must not introduce new RLS behavior.

## Error and Empty States

The dashboard should show:

- A loading state while metrics are being fetched.
- A concise error state when any required aggregate query fails.
- Zero-value cards and empty chart states when no records exist for the selected period.
- Clear labels for period-limited metrics versus current-state metrics.

## Validation

The implementation plan should include:

- `npm run format:check`
- `npm run build`
- `npm run lint`
- `git diff --check`
- Browser checks for `/dashboard` with each preset range.
- Manual checks that chart containers render non-empty when data exists and show empty states when data does not exist.

## Non-Goals

This slice does not add:

- custom date range picker
- CSV/export
- database views
- Supabase RPCs
- migrations
- automated overdue calculation
- invoice workflow changes
- payment workflow changes
- reminder workflow changes
- maintenance workflow changes
- WhatsApp automation
- maintenance cost reporting
- complex accounting or tax reports
- full app-wide shadcn/ui migration

## Next Planning Step

After this spec is approved, create an implementation plan under `docs/superpowers/plans/` that breaks the work into setup, dashboard data aggregation, dashboard UI, charts, documentation closeout, and validation tasks.
