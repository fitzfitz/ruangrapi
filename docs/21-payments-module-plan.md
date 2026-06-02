# Payments Module Plan

## Status

Status: MVP baseline implementation and manual validation complete.

This document plans the Payments MVP baseline. It does not implement source code, create migrations, alter RLS policies, generate receipts, edit payments, delete payments, introduce payment gateways, automate reconciliation, or add dashboard metrics.

## Purpose

Payments record money received from tenants against issued invoices. The baseline should make received money visible, prevent obvious overpayment, and update invoice collection status without adding accounting, gateway, receipt, or correction workflows.

## Recommended Sequence

The Payments MVP baseline should be sliced in this order:

1. Add a minimal Invoice issue action. Completed before Payments implementation.
2. Add a read-only Payments list. Completed.
3. Add a Record Payment flow. Completed.
4. Document the Payments validation checklist. Completed.
5. Close out the Payments module and update wiki status pages. Completed.

## Completed Prerequisite: Invoice Issue Action

Current invoice creation produces draft invoices. Payments should not be recorded against draft invoices because draft means the invoice is not yet payable.

Before recording payments, the Invoices module added a minimal issue action for invoices:

- Allow `draft` invoices to move to `unpaid`.
- Set `issued_at`.
- Require or preserve `due_date`.
- Keep invoice sending, email, WhatsApp, PDF generation, and invoice delivery out of scope.

This action may live in the Invoices module because it changes invoice lifecycle state, not payment state.

## Approved Payments Scope

The Payments MVP baseline includes:

- Top-level Payments navigation.
- `/dashboard/payments` read-only list.
- `/dashboard/payments/new` record payment flow.
- Payment type and create validation schema.
- Repository functions, query hooks, and mutation hooks.
- Payment form invoice option loading.
- Invoice payment summary calculation for selected invoices.
- Application-level overpayment prevention.
- Invoice status update after successful payment insert.
- Manual validation checklist.
- Closeout documentation and wiki updates.

## Existing Schema

The existing `payments` table has:

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

Allowed payment methods:

- `cash`
- `bank_transfer`
- `e_wallet`
- `other`

No migration is expected for the Payments MVP baseline.

## Validation Rules

- `invoice_id` is required.
- Selected invoice must belong to the current organization.
- Selected invoice must be payable.
- Payable invoice statuses are `unpaid`, `partially_paid`, and `overdue`.
- Draft, paid, and cancelled invoices must not be selectable.
- `amount` is required.
- `amount` must be a whole number greater than zero.
- `amount` must not exceed the selected invoice remaining balance.
- `payment_date` is required.
- `payment_method` is required and must be one of the allowed values.
- Blank `reference_number` should store as `null`.
- Blank `notes` should store as `null`.

## Invoice Status Rules

After a successful payment insert:

- If total recorded payments are less than invoice total, set invoice status to `partially_paid`.
- If total recorded payments are equal to invoice total, set invoice status to `paid`.
- Do not update cancelled invoices.
- Do not record payments against draft invoices.

Overdue recalculation remains deferred. If an overdue invoice receives a partial payment, it may remain `overdue` or move to `partially_paid`; the implementation slice should choose one behavior explicitly and document it before coding.

## Routes

- `/dashboard/payments`
- `/dashboard/payments/new`

All routes use the existing dashboard `RouteAccessGate`.

## Module Shape

```txt
src/modules/payments/
  application/
  domain/
  infrastructure/
  presentation/
  index.ts
```

## Query and Mutation Strategy

- List query key: `['payments']`.
- Form options query key: `['payments', 'form-options']`.
- Create mutation invalidates `['payments']` and `['invoices']`.
- Supabase RLS remains the organization boundary.
- Invoice choices come from organization-scoped queries.
- Payment creation inserts one payment record, then updates the related invoice status.
- Application logic calculates paid amount and remaining balance.
- If invoice status update fails after payment insert, surface a clear error and leave cleanup/reconciliation for manual follow-up in this baseline; transactional RPC can be planned later if needed.

## Known Tradeoff

The first implementation may use application-level validation instead of a database transaction or RPC. This keeps the baseline small, but it is not perfectly atomic. Two concurrent sessions could theoretically record payments against the same remaining balance.

This is acceptable for the MVP baseline if documented. A Supabase RPC or database transaction should be considered before multi-admin production use.

## Deferred Work

The Payments module does not include:

- Payment edit flow.
- Payment delete flow.
- Payment correction workflow.
- Receipt generation.
- Receipt number generation.
- Blocking edits after receipt generation.
- Refunds.
- Overpayment allocation.
- Payment gateway integration.
- Bank reconciliation.
- Failed payment states.
- Invoice detail route, unless approved separately.
- Invoice PDFs, downloads, email, or WhatsApp delivery.
- Automatic overdue status jobs.
- Dashboard collection metrics.
- Complex accounting or double-entry ledger.
- Schema or RLS migrations.

## Later Work To Track

The following work should be tracked after the Payments baseline:

- Payment edit before receipt generation.
- Receipt generation from a payment.
- Receipt detail or receipt list.
- Payment correction workflow after receipts exist.
- Invoice payment history inside an invoice detail page.
- Atomic payment recording through a Supabase RPC.
- Dashboard metrics for expected rent versus collected rent.

## Next Module

After Payments closeout, the next recommended epic is Receipts MVP Baseline, starting with receipt planning and simple receipt generation from recorded payments.
