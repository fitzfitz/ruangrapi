# Leases Module Plan

## Status

Status: approved for sliced implementation.

This document plans the Leases MVP baseline. It does not implement source code, create migrations, alter RLS policies, synchronize Unit occupancy, or introduce billing behavior.

## Purpose

Leases connect one Tenant to one Unit for a rental period with basic lease terms. Leases are the future source for occupancy, rent terms, and invoice generation, but this baseline only supports viewing and creating lease records.

## Approved Scope

The Leases MVP baseline includes:

- Top-level Leases navigation.
- `/dashboard/leases` read-only list.
- `/dashboard/leases/new` create flow.
- Lease type and create validation schema.
- Repository functions, query hooks, and mutation hooks.
- Tenant and Unit option loading for the create form.
- Manual validation checklist.
- Closeout documentation and wiki updates.

## Existing Schema

The existing `leases` table has:

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

No migration is expected for this module.

## Validation Rules

- `tenant_id` is required.
- `unit_id` is required.
- `start_date` is required.
- `end_date` is optional.
- `end_date` cannot be before `start_date` when present.
- `monthly_rent_amount` is required and must be a whole number greater than or equal to zero.
- `billing_day` is required and must be an integer from 1 through 31.
- `deposit_amount` is optional and must be a whole number greater than or equal to zero when present.

## Routes

- `/dashboard/leases`
- `/dashboard/leases/new`

All routes use the existing dashboard `RouteAccessGate`.

## Module Shape

```txt
src/modules/leases/
  application/
  domain/
  infrastructure/
  presentation/
  index.ts
```

## Query and Mutation Strategy

- List query key: `['leases']`.
- Form options query key: `['leases', 'form-options']`.
- Create mutation invalidates `['leases']`.
- Supabase RLS remains the organization boundary.
- Tenant and Unit choices come from organization-scoped queries.

## Deferred Work

The Leases module does not include:

- Lease edit flow.
- Ending leases.
- Cancelling leases.
- Lease delete/archive.
- Unit occupancy or status synchronization.
- Invoice generation.
- Billing, payment, receipt, reminder, maintenance, or reporting behavior.
- Deposit ledger or accounting workflows.
- Contract files, PDFs, or document uploads.
- Schema or RLS migrations.

## Next Module

After Leases closeout, the next recommended epic is Billing / Invoices MVP Baseline, starting with Billing module planning and a read-only Invoices list.
