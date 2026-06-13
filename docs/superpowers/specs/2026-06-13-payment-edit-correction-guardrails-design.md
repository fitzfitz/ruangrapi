# Payment Edit and Correction Guardrails Design

## Context

Payments are already recorded manually against payable invoices, and generated receipts are linked one-to-one with payment records. The current baseline intentionally deferred payment edit, delete, correction workflow, receipt edit/delete, and payment edit blocking after receipt generation.

This design defines the first guardrails slice: let operators correct unreceipted payment mistakes while protecting receipt-backed records from direct mutation.

## Approved Direction

Use a strict receipt lock:

- payments without a receipt can be edited in place
- payments with an issued receipt cannot be edited directly
- receipted payments show a locked guardrail state that explains a future correction workflow is required

This avoids receipt invalidation, receipt regeneration, refund handling, and ledger-style correction semantics in this MVP pass.

## User Experience

### Payments List

Each payment card gains a correction affordance:

- unreceipted payments show an `Edit payment` action
- receipted payments show a locked state, not an edit action
- the locked state says the receipt has been issued and direct edits are blocked
- existing `Generate receipt` and `View receipt` actions remain unchanged

The list should keep the Lagoon Command Center operational tone: concise labels, visible state, and no modal-heavy workflow.

### Edit Payment Page

Add `/dashboard/payments/:paymentId/edit`.

The edit page uses the existing guided payment form language and edits only:

- amount
- payment date
- payment method
- reference number
- notes

The invoice is fixed and shown as read-only context. The page should show tenant, unit, property, billing period, invoice total, currently paid amount, and editable remaining allowance.

If a user opens the edit route for a receipted payment, the page shows a locked state with a back link to Payments and does not render editable fields.

After a successful update, redirect to `/dashboard/payments`.

## Business Rules

### Editable Scope

Allowed:

- edit amount, date, method, reference number, and notes for unreceipted payments
- recalculate invoice status after saving

Blocked:

- editing payment invoice assignment
- editing receipted payments
- deleting payments
- voiding receipts
- regenerating receipts
- automatic correction records
- refunds and negative payments

### Amount Guardrail

When editing an unreceipted payment, the maximum allowed amount is:

```txt
invoice total amount - sum(other payments for the same invoice)
```

The current payment amount must be excluded from the paid total during validation, otherwise reducing and increasing an existing payment would be calculated incorrectly.

If the edited amount exceeds that allowance, block the update with a clear validation error.

### Invoice Status Recalculation

After update, recalculate the invoice status from the invoice total and all payments:

- `paid` when total paid is greater than or equal to invoice total
- `partially_paid` when total paid is greater than zero and below invoice total
- `unpaid` when total paid is zero

This slice does not introduce `overdue` automation changes. If an invoice was previously `overdue`, the payment edit flow may move it to `paid`, `partially_paid`, or `unpaid` based on actual payment totals, matching the current non-automated status model.

## Architecture

### Routes

Add:

- `dashboardPaymentEdit: '/dashboard/payments/:paymentId/edit'`

Wire it through `AppRouter` using the existing lazy route pattern and `RouteAccessGate route="dashboard"`.

### Domain

Reuse the current payment method union.

Add an edit schema that validates:

- positive whole-number amount
- required payment date
- supported payment method
- optional reference number
- optional notes

This can mirror the create schema while keeping a separate exported edit input type for repository clarity.

### Repository

Add repository support for:

- loading one payment for edit with invoice context and receipt state
- updating one unreceipted payment

The update flow should:

1. load the payment by `paymentId`
2. verify it belongs to the current organization
3. verify it has no receipt
4. load its invoice with all payment amounts
5. compute the editable amount allowance excluding the current payment
6. update the allowed payment fields
7. recalculate invoice status from the new paid total

This should follow the current app-side Supabase style used by `createPayment`. Supabase RPC-based atomic payment recording remains deferred.

### Query Hooks

Add:

- `usePaymentEditQuery(paymentId)`
- `useUpdatePaymentMutation()`

The mutation should invalidate:

- payments list
- payment edit query
- payment form options
- invoice/dashboard-related queries where available and locally exported

If a query key is not exported today, do not add a broad cross-module refactor just for invalidation. Prefer the locally available payment query keys and existing patterns.

## UI and Accessibility

- Use the existing command form card and guided form section patterns.
- Keep the invoice context read-only and visually separate from editable payment details.
- Use normal links/buttons, not custom click-only containers.
- Ensure blocked states use text plus visual treatment, not color alone.
- Keep focus states visible through existing form input focus rules.
- Keep mobile actions stacked or wrapping without horizontal scroll.

## Validation

Automated checks:

- `npm run format:check`
- `npm run build`
- `npm run lint`
- `git diff --check`

Manual checklist additions:

- unreceipted payment shows `Edit payment`
- receipted payment does not expose direct edit
- opening edit route for unreceipted payment loads invoice context and editable fields
- saving allowed field changes updates the Payments list
- increasing amount above invoice allowance is blocked
- lowering a payment can move an invoice back to `partially_paid` or `unpaid`
- increasing a payment to the full allowance can move an invoice to `paid`
- opening edit route for receipted payment shows locked state
- auth/onboarding route gates still protect the edit route

## Documentation Closeout

When implemented, update:

- `docs/22-payments-validation-checklist.md`
- `wiki/09-status/built.md`
- `wiki/09-status/not-built.md`
- `wiki/06-task-breakdown/ready-soon.md`
- `wiki/06-task-breakdown/task-index.md`
- `wiki/04-roadmap/release-plan.md`

Record what was implemented, what remains deferred, manual validation expectations, and the next recommended task.

## Out of Scope

- payment delete
- receipt delete, void, invalidation, or regeneration
- formal correction ledger entries
- refunds
- overpayment allocation
- payment gateway integration
- bank reconciliation
- Supabase RPC migration for payment updates
- schema or RLS changes

## Next Step

After this spec is reviewed and committed, create an implementation plan in `docs/superpowers/plans/` before touching code.
