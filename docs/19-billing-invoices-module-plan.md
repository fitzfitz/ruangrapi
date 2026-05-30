# Billing / Invoices Module Plan

## Status

Status: approved for sliced implementation.

This document plans the Billing / Invoices MVP baseline. It does not implement source code, create migrations, alter RLS policies, issue invoices, record payments, generate receipts, send reminders, automate overdue status, create PDFs, or introduce dashboard metrics.

## Purpose

Invoices represent monthly billing records for active leases. The baseline supports viewing invoices and creating draft rent invoices from active leases. Payments, receipts, reminders, utility billing, and reporting come later.

## Approved Scope

The Billing / Invoices MVP baseline includes:

- Top-level Invoices navigation.
- `/dashboard/invoices` read-only list.
- `/dashboard/invoices/new` create draft rent invoice flow.
- Invoice and invoice line item types.
- Create draft rent invoice validation schema.
- Repository functions, query hooks, and mutation hooks.
- Active Lease option loading for the create form.
- Duplicate invoice prevention for lease + billing period.
- Manual validation checklist.
- Closeout documentation and wiki updates.

## Existing Schema

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

No migration is expected for this module.

## Validation Rules

- `lease_id` is required.
- `billing_period` is required.
- `billing_period` must be the first day of a month.
- Selected lease must be active.
- Selected lease must belong to the current organization.
- Selected lease must not already have a non-cancelled invoice for the selected billing period.
- Generated rent line item amount must match the lease monthly rent amount.
- Invoice `subtotal_amount` and `total_amount` must match generated line item totals.
- Draft invoices do not require `issued_at` or `due_date`.
- Blank notes should store as `null`.

## Routes

- `/dashboard/invoices`
- `/dashboard/invoices/new`

All routes use the existing dashboard `RouteAccessGate`.

## Module Shape

```txt
src/modules/invoices/
  application/
  domain/
  infrastructure/
  presentation/
  index.ts
```

## Query and Mutation Strategy

- List query key: `['invoices']`.
- Form options query key: `['invoices', 'form-options']`.
- Create mutation invalidates `['invoices']`.
- Supabase RLS remains the organization boundary.
- Active Lease choices come from organization-scoped queries.
- Create flow inserts the invoice first, then one rent line item.
- If line item insert fails after invoice insert, surface a clear create error and leave cleanup/reconciliation for manual follow-up in this baseline; transactional RPC can be planned later if needed.

## Deferred Work

The Billing / Invoices module does not include:

- Invoice detail route.
- Invoice edit flow.
- Invoice issue/send flow.
- Invoice cancel flow.
- Payments.
- Receipts.
- Reminders or WhatsApp messages.
- Automatic overdue status jobs.
- Payment balance calculations.
- Partial payment handling.
- Receipt number generation.
- Utility reading capture.
- Utility billing automation.
- Invoice PDFs, downloads, email, or WhatsApp delivery.
- Maintenance, reporting, or dashboard metrics.
- Schema or RLS migrations.

## Next Module

After Billing / Invoices closeout, the next recommended epic is Payments MVP Baseline, starting with Payments module planning and a manual record Payment flow.
