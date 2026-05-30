# Leases MVP Baseline Design

Date: 2026-05-30

## Summary

The next RuangRapi epic is the Leases MVP baseline.

This epic moves Leases from not started to MVP baseline complete. It should follow the same sliced execution pattern used for Properties, Units, and Tenants: plan the module first, implement the read-only baseline, add the create flow, validate the module, then close it out with documentation and wiki updates.

The recommended execution approach is a full Leases epic with sliced delivery. This keeps the complete module goal visible while preserving small, reviewable task cards.

## Context

Foundation, Properties, Units, and Tenants are built. The wiki and release plan identify Leases as the next planned module before Billing / Invoices.

Leases connect an existing Tenant to an existing Unit for a rental period. A Lease is the future source of occupancy understanding, rent terms, and invoice generation, but this epic should stop at creating and viewing basic lease records.

The existing database schema already includes `leases` with these fields:

- `id`
- `organization_id`
- `tenant_id`
- `unit_id`
- `start_date`
- `end_date`
- `monthly_rent_amount`
- `billing_day`
- `deposit_amount`
- `status`
- `cancelled_at`
- `created_at`
- `updated_at`

The schema also already includes partial unique indexes for one active lease per tenant and one active lease per unit.

No schema or RLS migration is expected for this epic.

## Goal

Give a rental owner a simple organization-scoped place to view and create lease records that connect one Tenant to one Unit with basic lease terms.

## Non-Goals

This epic must not include:

- Lease edit flow.
- Ending or cancelling leases.
- Unit occupancy or status synchronization.
- Automatic invoice generation.
- Billing, payments, receipts, reminders, or maintenance behavior.
- Deposit ledger or accounting workflows.
- Contract files, PDFs, or document uploads.
- Tenant portal or tenant authentication.
- Schema or RLS migrations unless implementation discovers a blocker and owner approval is given.

## Architecture

Add `src/modules/leases/` using the existing module shape:

```txt
src/modules/leases/
  application/
  domain/
  infrastructure/
  presentation/
  index.ts
```

The module should mirror the established Tenants and Properties patterns:

- `domain/` owns the `Lease` type and create validation schema.
- `infrastructure/` owns Supabase repository functions and query keys.
- `application/` owns TanStack Query hooks and mutation hooks.
- `presentation/` owns the list and create pages.
- `index.ts` exports only the public module entry points needed by routing.

Add these routes:

- `/dashboard/leases`
- `/dashboard/leases/new`

Promote Leases from a sidebar coming-soon item to a real navigation link after the read-only list route exists.

Keep organization scoping through the existing `organization_id`, Supabase RLS policies, and current organization context. Do not introduce custom permission logic in frontend code.

## Data Flow

The read-only list should query `leases` through a repository function and return organization-scoped rows under existing RLS.

The list should show enough relationship context to be useful:

- tenant name
- unit name
- property name when available through the unit relationship
- start date
- optional end date
- monthly rent amount
- billing day
- optional deposit amount
- status

The create flow should:

1. Read the current organization context.
2. Load selectable Tenants.
3. Load selectable Units with their parent Property names if practical.
4. Validate form input.
5. Insert a lease row with `organization_id`, `tenant_id`, `unit_id`, and lease terms.
6. Leave `status` as the database default `active`.
7. Invalidate the leases list query.
8. Navigate back to the leases list after success.

If Supabase returns a uniqueness or constraint error, the UI should show a generic create failure message in the first baseline. Friendly duplicate-active-lease messages can be a later refinement unless they are straightforward inside the slice.

## Validation Rules

The first Leases baseline should validate:

- `tenant_id` is required.
- `unit_id` is required.
- `start_date` is required.
- `end_date` is optional.
- `end_date` cannot be before `start_date` when present.
- `monthly_rent_amount` is required and must be greater than or equal to zero.
- `billing_day` is required and must be between 1 and 31.
- `deposit_amount` is optional and must be greater than or equal to zero when present.

Application validation should also prevent obviously invalid same-organization selections by relying on organization-scoped tenant and unit queries. Database constraints and RLS remain the final boundary.

## User Experience

The Leases list should be an operational screen for scanning current rental agreements.

It should include:

- Title and short context copy.
- Add Lease action after the create route exists.
- Loading state.
- Error state.
- Empty state.
- Lease rows or cards with tenant, unit, dates, rent, billing day, deposit, and status.

The create page should follow existing Properties, Units, and Tenants form conventions. It should make the Tenant and Unit relationship explicit, while avoiding occupancy, billing, or lifecycle promises that are outside this epic.

## Execution Slices

### Slice 1: Plan Leases Module

Create a Leases module plan that confirms:

- Scope.
- Existing schema fields.
- Route paths.
- Module folder shape.
- Query and mutation strategy.
- Tenant and Unit selection strategy.
- Validation rules.
- Explicitly deferred work.

This slice should not implement UI behavior.

### Slice 2: Read-Only Leases List

Add:

- Lease domain type.
- Lease repository list function.
- Leases list query hook.
- `/dashboard/leases` route.
- Sidebar Leases navigation.
- List, empty, loading, and error states.

Do not add create, edit, end, cancel, occupancy, or billing behavior in this slice.

### Slice 3: Create Lease Flow

Add:

- Create lease schema.
- Tenant options query, using the existing Tenants module where appropriate.
- Unit options query, using the existing Units/Properties data shape where appropriate.
- Create lease repository function.
- Create mutation hook.
- `/dashboard/leases/new` route.
- Create form page.
- Query invalidation and navigation after success.

Do not add edit, end, cancel, occupancy sync, invoice generation, billing, payments, receipts, reminders, or maintenance behavior in this slice.

### Slice 4: Validation Checklist

Document the manual validation checklist for the Leases baseline. It should cover:

- Organization-scoped list loading.
- Empty list state.
- List with lease data.
- Tenant, unit, and property relationship display.
- Create success.
- Create validation failures.
- Duplicate active tenant/unit failure handling.
- Invalid or inaccessible Tenant/Unit selections.
- Route gating.
- Query invalidation after create.
- Confirmation that no edit, end, cancel, occupancy sync, billing, payment, receipt, reminder, maintenance, or document behavior was introduced.

### Slice 5: Closeout and Next-Step Handoff

Close out the Leases module by updating docs and wiki pages so the project state stays coherent.

Expected closeout updates:

- Add Leases completion notes to the repo documentation used for development tracking.
- Add or update the Leases validation checklist.
- Update `wiki/04-roadmap/mvp-epics.md` so Leases is built after closeout.
- Update `wiki/09-status/built.md` with the Leases baseline.
- Update `wiki/09-status/not-built.md` to remove or revise Leases entries.
- Update `wiki/06-task-breakdown/task-index.md`, `wiki/06-task-breakdown/ready-soon.md`, and `wiki/06-task-breakdown/backlog.md` to mark Leases slices done and promote Billing / Invoices planning.
- Update `wiki/04-roadmap/release-plan.md` so the next recommended step is Plan Billing module.
- Record deferred Leases items clearly, including edit, end, cancel, occupancy sync, billing generation, deposit ledger, and document uploads.

The next recommended epic after this closeout is Billing / Invoices MVP Baseline, starting with Billing module planning and a read-only Invoices list.

## Testing and Verification

For implementation slices, run the repository's applicable frontend checks:

- `npm run lint`
- `npm run build`

Documentation-only slices should at minimum run:

- `git diff --check`

Manual validation should be recorded in the relevant checklist or closeout note for each slice.

## Risks

Scope creep is the main risk. Leases naturally leads to unit occupancy, rent pricing, invoices, payments, reminders, and dashboard metrics, but this epic should stop at basic lease record management.

Relationship display is the second risk. The first list should show useful tenant and unit context, but query shape should stay simple and follow Supabase patterns already used in the app.

Duplicate active leases are the third risk. The database already enforces one active lease per tenant and one active lease per unit. The create flow should respect those constraints, but friendly conflict-specific error handling can be deferred if it would complicate the baseline.

## Approval Status

Approved direction:

- Use Approach 2: full Leases epic with sliced execution.
- Include docs, wiki, and next-step handoff as required closeout work.

This design is ready to become the source for a detailed implementation plan after user review.
