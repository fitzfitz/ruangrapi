# Billing / Invoices MVP Baseline Design

Date: 2026-05-30

## Summary

The next RuangRapi epic is the Billing / Invoices MVP baseline.

This epic moves Billing / Invoices from not started to an invoice-focused MVP baseline. It should follow the same sliced execution pattern used for Properties, Units, Tenants, and Leases: plan the module first, implement a read-only baseline, add a create/generate invoice flow, validate the module, then close it out with documentation and wiki updates.

The selected first route is `/dashboard/invoices`. This keeps the first Billing slice concrete and invoice-focused instead of introducing a broad Billing landing page too early.

## Context

Foundation, Properties, Units, Tenants, and Leases are built. The wiki and release plan identify Billing / Invoices as the next recommended module before Payments, Receipts, Reminders, Maintenance, and dashboard/reporting metrics.

Invoices are monthly billing records tied to an existing Lease. The existing database schema already includes `invoices` and `invoice_line_items`.

The existing `invoices` table has:

- `id`
- `organization_id`
- `lease_id`
- `tenant_id`
- `unit_id`
- `billing_period`
- `issued_at`
- `due_date`
- `subtotal_amount`
- `total_amount`
- `status`
- `cancelled_at`
- `notes`
- `created_at`
- `updated_at`

The existing `invoice_line_items` table has:

- `id`
- `organization_id`
- `invoice_id`
- `description`
- `line_type`
- `quantity`
- `unit_amount`
- `total_amount`
- `sort_order`
- `created_at`
- `updated_at`

The schema also already includes:

- invoice status constraint: `draft`, `unpaid`, `partially_paid`, `paid`, `overdue`, `cancelled`
- `billing_period` must be the first day of a month
- issued invoices must have `issued_at` and `due_date`
- cancelled invoices must have `cancelled_at`
- non-negative invoice totals
- non-negative line item amounts
- partial unique index for one non-cancelled invoice per organization, lease, and billing period
- organization-scoped RLS policies for invoices and invoice line items

No schema or RLS migration is expected for this epic.

## Goal

Give a rental owner a simple organization-scoped place to view invoices and create draft rent invoices from active leases.

## Non-Goals

This epic must not include:

- Payments.
- Receipts.
- Reminder generation or WhatsApp messages.
- Automatic overdue status jobs.
- Invoice issue/send workflow beyond optional draft creation.
- Payment balance calculations.
- Partial payment handling.
- Receipt number generation.
- Utility reading capture.
- Utility billing automation.
- Dashboard metrics.
- Invoice PDF generation.
- Invoice email, WhatsApp, or download workflows.
- Schema or RLS migrations unless implementation discovers a blocker and owner approval is given.

## Architecture

Add `src/modules/invoices/` using the existing module shape:

```txt
src/modules/invoices/
  application/
  domain/
  infrastructure/
  presentation/
  index.ts
```

Use `invoices` for the module name because the first route and first UI are invoice-focused. Billing can remain the product-area name in docs and roadmap.

The module should mirror established module patterns:

- `domain/` owns `Invoice`, `InvoiceLineItem`, and create/generate validation schemas.
- `infrastructure/` owns Supabase repository functions and query keys.
- `application/` owns TanStack Query hooks and mutation hooks.
- `presentation/` owns list and create/generate pages.
- `index.ts` exports only public module entry points needed by routing.

Add these routes:

- `/dashboard/invoices`
- `/dashboard/invoices/new`

Promote Invoices into primary navigation after the read-only list route exists. Keep Payments, Receipts, Reminders, Maintenance, and Reporting deferred.

Keep organization scoping through existing `organization_id`, Supabase RLS policies, and current organization context. Same-organization relationship validation should start in application code by using organization-scoped lease option queries and repository checks before inserts.

## Data Flow

The read-only list should query `invoices` through a repository function and return organization-scoped rows under existing RLS.

The list should show enough relationship context to be useful:

- invoice status
- billing period
- due date when present
- total amount
- tenant name
- unit name
- property name when available through the unit relationship
- lease period or lease start date when useful
- created/issued context if useful

The create/generate flow should:

1. Read the current organization context.
2. Load active leases that can receive an invoice.
3. Let the owner select one active lease.
4. Let the owner select a billing period using a month input or an equivalent first-of-month date input.
5. Validate the billing period as the first day of the selected month.
6. Derive tenant, unit, and rent amount from the selected lease.
7. Create a draft invoice with:
   - `organization_id`
   - `lease_id`
   - `tenant_id`
   - `unit_id`
   - `billing_period`
   - `subtotal_amount`
   - `total_amount`
   - `status = draft`
   - optional `notes`
8. Create one `rent` invoice line item with:
   - `organization_id`
   - `invoice_id`
   - description such as `Monthly rent`
   - `line_type = rent`
   - `quantity = 1`
   - `unit_amount = lease.monthly_rent_amount`
   - `total_amount = lease.monthly_rent_amount`
   - `sort_order = 0`
9. Prevent duplicate non-cancelled invoices for the same lease and billing period through application checks and existing database uniqueness.
10. Invalidate invoice list queries.
11. Navigate back to `/dashboard/invoices` after success.

If Supabase returns a uniqueness or constraint error, the UI should show a clear create failure message. Friendly duplicate-invoice messaging is preferred if straightforward in the slice.

## Validation Rules

The first Billing / Invoices baseline should validate:

- `lease_id` is required.
- `billing_period` is required.
- `billing_period` must resolve to the first day of a month.
- selected lease must be active.
- selected lease must belong to the current organization.
- selected lease must not already have a non-cancelled invoice for the selected billing period.
- generated rent line item amount must match the lease monthly rent amount.
- invoice `subtotal_amount` and `total_amount` must match generated line item totals.
- draft invoices do not require `issued_at` or `due_date`.
- blank notes should store as `null`.

Application validation should also prevent invalid relationship selections by relying on organization-scoped active lease queries and pre-insert repository checks. Database constraints and RLS remain the final boundary.

## User Experience

The Invoices list should be an operational screen for scanning monthly billing records.

It should include:

- Title and short context copy.
- Add/generate invoice action after the create route exists.
- Loading state.
- Error state.
- Empty state.
- Invoice rows or cards with tenant, unit, billing period, status, due date, and total amount.

The create/generate page should follow existing form conventions. It should make the lease source explicit and avoid implying payment, receipt, reminder, overdue automation, or PDF behavior.

## Execution Slices

### Slice 1: Plan Billing / Invoices Module

Create a Billing / Invoices module plan that confirms:

- Scope.
- Existing schema fields.
- Route paths.
- Module folder shape.
- Query and mutation strategy.
- Active Lease selection strategy.
- Invoice and line item creation strategy.
- Validation rules.
- Explicitly deferred work.

This slice should not implement UI behavior.

### Slice 2: Read-Only Invoices List

Add:

- Invoice domain types.
- Invoice repository list function.
- Invoices list query hook.
- `/dashboard/invoices` route.
- Sidebar Invoices navigation.
- List, empty, loading, and error states.

Do not add create, issue, cancel, payment, receipt, reminder, PDF, or dashboard behavior in this slice.

### Slice 3: Create/Generate Draft Rent Invoice Flow

Add:

- Create invoice schema.
- Active lease options query.
- Duplicate invoice check.
- Create draft invoice repository function.
- Create rent line item repository function or transactional insert approach if available within the existing Supabase client constraints.
- Create mutation hook.
- `/dashboard/invoices/new` route.
- Create/generate form page.
- Query invalidation and navigation after success.

Do not add issuing, sending, payment, receipt, reminder, overdue automation, utility reading capture, or PDF behavior in this slice.

### Slice 4: Validation Checklist

Document the manual validation checklist for the Billing / Invoices baseline. It should cover:

- Organization-scoped invoice list loading.
- Empty list state.
- List with invoice data.
- Tenant, unit, property, lease, period, status, and total display.
- Create draft rent invoice success.
- Create validation failures.
- Duplicate invoice failure handling.
- Invalid or inaccessible Lease selection.
- Route gating.
- Query invalidation after create.
- Confirmation that no payment, receipt, reminder, overdue automation, utility reading, PDF, maintenance, or dashboard metric behavior was introduced.

### Slice 5: Closeout and Next-Step Handoff

Close out the Billing / Invoices module by updating docs and wiki pages so the project state stays coherent.

Expected closeout updates:

- Add Billing / Invoices completion notes to repo development tracking.
- Add or update the Invoices validation checklist.
- Update `wiki/04-roadmap/mvp-epics.md` so Billing / Invoices is built after closeout.
- Update `wiki/09-status/built.md` with the Billing / Invoices baseline.
- Update `wiki/09-status/not-built.md` to remove or revise Billing / Invoices entries.
- Update `wiki/06-task-breakdown/task-index.md`, `wiki/06-task-breakdown/ready-soon.md`, and `wiki/06-task-breakdown/backlog.md` to mark Billing / Invoices slices done and promote Payments planning.
- Update `wiki/04-roadmap/release-plan.md` so the next recommended step is Plan Payments module.
- Record deferred Billing items clearly, including issuing, payments, receipts, reminders, overdue automation, utility readings, PDFs, and dashboard metrics.

The next recommended epic after this closeout is Payments MVP Baseline, starting with Payments module planning and a record Payment flow.

## Testing and Verification

For implementation slices, run the repository's applicable frontend checks:

- `npm run lint`
- `npm run build`

Documentation-only slices should at minimum run:

- `git diff --check`

Manual validation should be recorded in the relevant checklist or closeout note for each slice.

## Risks

Scope creep is the main risk. Billing naturally leads to issuing invoices, payments, receipts, reminders, overdue automation, utility readings, PDFs, and dashboard metrics. This epic should stop at invoice visibility and draft rent invoice creation.

The second risk is data consistency between invoice totals and line items. The first baseline should keep generation narrow: one draft rent invoice from one active lease, with one rent line item, so totals can be derived and checked in application code.

The third risk is duplicate billing. The database already enforces one non-cancelled invoice per lease and billing period. The create flow should check for duplicates before insert and still handle database uniqueness failures gracefully.
