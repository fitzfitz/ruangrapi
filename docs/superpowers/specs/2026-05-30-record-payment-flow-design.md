# Record Payment Flow Design

Date: 2026-05-30

## Summary

This slice adds manual payment recording against payable invoices. It completes the first useful Payments baseline by letting an owner choose an unpaid, partially paid, or overdue invoice, record a received amount, and update the invoice collection status.

## Context

The Payments module already has a top-level read-only list at `/dashboard/payments`. The Invoices module can issue draft invoices to `unpaid`, so payments no longer need to target draft invoices.

The existing `payments` table and invoice status fields are sufficient. No migration is expected.

## Goal

Allow an authenticated, onboarded owner to record one manual payment against one payable invoice while preventing payment amounts above the invoice remaining balance.

## Non-Goals

This slice must not include:

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

## Data Flow

The create form should:

1. Load payable invoices from the current organization through existing RLS.
2. Include only invoice statuses `unpaid`, `partially_paid`, and `overdue`.
3. Exclude `draft`, `paid`, and `cancelled`.
4. Include invoice total, already paid amount, remaining balance, billing period, tenant, unit, and property context.
5. Let the owner enter payment date, amount, method, optional reference number, and optional notes.
6. Validate amount as a positive whole-rupiah integer.
7. Reject amount greater than remaining balance.
8. Insert one payment record.
9. Update the invoice status:
   - `paid` when total recorded payments are equal to invoice total.
   - `partially_paid` when total recorded payments are less than invoice total.
10. Invalidate Payments and Invoices queries.
11. Navigate back to `/dashboard/payments` after success.

## Overdue Decision

If an overdue invoice receives a partial payment, this slice moves it to `partially_paid`. Automatic overdue recalculation remains deferred, so a future overdue job may mark partially paid invoices overdue again based on due date.

## Known Tradeoff

Payment insert and invoice status update are application-level operations in this slice. They are not atomic. If the invoice status update fails after payment insert, the UI should report an error and leave reconciliation for manual follow-up. A Supabase RPC should be considered before multi-admin production use.

## User Experience

Add route:

- `/dashboard/payments/new`

The Payments page should show an `Add payment` action after this route exists.

The create page should show:

- Invoice selector.
- Selected invoice context.
- Total, paid, and remaining amounts.
- Payment date input.
- Amount input.
- Payment method selector.
- Optional reference number.
- Optional notes.
- Submit, cancel, loading, error, and empty states.

## Validation

Automated:

- `npm run build`
- `npm run lint`
- `git diff --check`

Manual:

- Authenticated and onboarded users can open `/dashboard/payments/new`.
- Unauthenticated users are redirected through the existing route gate.
- Payments page Add payment link navigates to `/dashboard/payments/new`.
- Only payable invoices are selectable.
- Draft, paid, and cancelled invoices are not selectable.
- Selected invoice context shows total, paid, and remaining amounts.
- Amount above remaining balance is blocked.
- Successful payment appears in `/dashboard/payments`.
- Partial payment updates invoice status to `partially_paid`.
- Full payment updates invoice status to `paid`.
- No receipt, edit, delete, gateway, refund, or dashboard behavior is introduced.
