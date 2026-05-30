# Payments Read-Only List Design

Date: 2026-05-30

## Summary

The next RuangRapi slice is a read-only Payments list. This slice starts the Payments module without introducing payment recording, receipts, correction workflows, gateways, reconciliation, or dashboard metrics.

## Context

Properties, Units, Tenants, Leases, and Billing / Invoices have MVP baselines. Invoices can now be issued from `draft` to `unpaid`, which gives Payments a payable invoice state to build against.

The existing database schema already includes `payments` with organization-scoped RLS:

- `id`
- `organization_id`
- `invoice_id`
- `amount`
- `payment_date`
- `payment_method`
- `reference_number`
- `notes`
- `created_at`
- `updated_at`

No schema or RLS migration is expected for this slice.

## Goal

Give an authenticated, onboarded owner a top-level Payments screen that shows organization-scoped payment records with enough invoice, tenant, unit, and property context to understand received money.

## Non-Goals

This slice must not include:

- Record Payment flow.
- Payment edit flow.
- Payment delete flow.
- Payment correction workflow.
- Receipt generation.
- Receipt number generation.
- Refunds.
- Overpayment allocation.
- Payment gateway integration.
- Bank reconciliation.
- Failed payment states.
- Invoice detail route.
- Invoice payment history context.
- Dashboard metrics.
- Schema or RLS migrations.

## Architecture

Add `src/modules/payments/` using the existing module shape:

```txt
src/modules/payments/
  application/
  domain/
  infrastructure/
  presentation/
  index.ts
```

The module should mirror existing list-only module patterns:

- `domain/` owns Payment types.
- `infrastructure/` owns Supabase repository functions and query keys.
- `application/` owns TanStack Query hooks.
- `presentation/` owns the list page.
- `index.ts` exports public module entry points.

Add route:

- `/dashboard/payments`

Promote Payments into primary navigation after the route exists.

## Data Flow

The Payments list queries `payments` through a repository function under existing RLS.

The list should show:

- payment date
- amount
- payment method
- reference number when available
- tenant name
- unit name
- property name when available
- invoice billing period
- invoice status

Rows should order by `payment_date` descending, then `created_at` descending.

## User Experience

The Payments page should include:

- Title and concise context copy.
- Loading state.
- Error state.
- Empty state.
- Payment cards with tenant, unit, amount, method, payment date, invoice billing period, invoice status, and reference.

Do not add an `Add payment` action in this slice unless the record-payment route also exists. The next slice will add `/dashboard/payments/new`.

## Risks

- Supabase nested relationship types may need local row mapping types, as with Invoices and Leases.
- Existing payment records may have missing joined invoice, tenant, unit, or property rows. The UI should show fallback labels instead of crashing.

## Validation

Automated:

- `npm run build`
- `npm run lint`
- `git diff --check`

Manual:

- Authenticated and onboarded users can open `/dashboard/payments`.
- Unauthenticated users are redirected through the existing route gate.
- Sidebar Payments link navigates to `/dashboard/payments`.
- Empty, loading, and error states render.
- Existing payments render with invoice and tenant context.
- No create, edit, delete, receipt, gateway, or dashboard behavior is introduced.
