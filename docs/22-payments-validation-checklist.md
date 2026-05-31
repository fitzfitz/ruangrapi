# Payments Validation Checklist

## Status

Status: ready for manual validation after the Payments implementation slices are complete.

## Disposable Local Data Setup

Use disposable local records created through the app. Do not commit local test users, tokens, organization records, or seed output.

Before running the manual Payments checklist:

1. Sign up and complete onboarding with a disposable local user.
2. Create one property.
3. Create one unit under that property.
4. Create one tenant.
5. Create one lease connecting the tenant to the unit.
6. Create one draft rent invoice from the lease.
7. Issue the invoice with a due date.
8. Record one partial payment.
9. Record one remaining-balance payment.
10. Confirm the Payments list shows both records.
11. Confirm the invoice status is `partially_paid` after the partial payment and `paid` after the final payment.

Do not add `supabase/seed.sql` for this validation pass. Do not create a migration for this validation pass.

## Automated Checks

- [x] `npm run lint` passes.
- [x] `npm run build` passes without chunk-size warning regression.
- [x] `git diff --check` passes.

## Read-Only Payments List

- [ ] Authenticated and onboarded users can open `/dashboard/payments`.
- [ ] Unauthenticated users cannot access `/dashboard/payments` and are redirected through the existing auth gate.
- [ ] The sidebar Payments link navigates to `/dashboard/payments`.
- [ ] The Payments page shows a loading state while the payments query is pending.
- [ ] The Payments page shows an empty state when the current organization has no payments.
- [ ] The Payments page shows an error state when the payments query fails.
- [ ] The Payments page shows a populated list when the current organization has payments.
- [ ] Existing payments listed on the page belong to the current organization.
- [ ] Payment rows show tenant name.
- [ ] Payment rows show unit name.
- [ ] Payment rows show property name when available.
- [ ] Payment rows show payment date.
- [ ] Payment rows show amount.
- [ ] Payment rows show payment method.
- [ ] Payment rows show invoice billing period.
- [ ] Payment rows show invoice status.
- [ ] Payment rows show reference number when available.
- [ ] Payment rows handle missing reference gracefully.
- [ ] Refreshing `/dashboard/payments` keeps the user on the protected Payments route after account state checks finish.

## Record Payment Flow

- [ ] Authenticated and onboarded users can open `/dashboard/payments/new`.
- [ ] Unauthenticated users cannot access `/dashboard/payments/new` and are redirected through the existing auth gate.
- [ ] The Payments page Add payment link navigates to `/dashboard/payments/new`.
- [ ] The Back to payments link returns to `/dashboard/payments`.
- [ ] The Cancel link returns to `/dashboard/payments`.
- [ ] Payable invoice options load from current organization invoice records.
- [ ] Invoices with status `unpaid`, `partially_paid`, and `overdue` are offered when they have remaining balance.
- [ ] Invoices with status `draft`, `paid`, or `cancelled` are not offered.
- [ ] Invoice options include tenant, unit, property, and billing period context when available.
- [ ] Selecting an invoice shows total, paid, and remaining balance.
- [ ] Submitting without an invoice shows the invoice validation error.
- [ ] Submitting without an amount shows the amount validation error.
- [ ] Submitting a non-whole amount shows the amount validation error.
- [ ] Submitting zero or a negative amount shows the amount validation error.
- [ ] Submitting an amount greater than the invoice remaining balance is blocked.
- [ ] Submitting without a payment date shows the payment-date validation error.
- [ ] Submitting without a payment method shows the payment-method validation error.
- [ ] Submitting a valid partial payment creates one payment record.
- [ ] Submitting a valid full remaining-balance payment creates one payment record.
- [ ] The created payment has the correct `organization_id` for the current onboarded user.
- [ ] The created payment references the selected invoice.
- [ ] Blank reference number is stored as `null`.
- [ ] Blank notes are stored as `null`.
- [ ] A partial payment updates invoice status to `partially_paid`.
- [ ] A full payment updates invoice status to `paid`.
- [ ] After successful creation, the user is redirected to `/dashboard/payments`.
- [ ] The newly created payment appears in the Payments list after redirect.

## Regression Checks

- [ ] Browser console has no errors during Payments list navigation, create-page load, payable invoice option loading, validation failures, successful create, redirects, list refresh, or auth redirect checks.

## Boundaries

- [ ] No payment edit flow was introduced.
- [ ] No payment delete flow was introduced.
- [ ] No payment correction workflow was introduced.
- [x] No receipt workflow was introduced during the Payments baseline. Receipts manual generation was implemented later as its own module.
- [x] No receipt number generation was introduced during the Payments baseline. Receipt numbering was activated later through the Receipts module using existing database-backed sequencing.
- [ ] No refund workflow was introduced.
- [ ] No overpayment allocation was introduced.
- [ ] No payment gateway integration was introduced.
- [ ] No bank reconciliation workflow was introduced.
- [ ] No failed payment state workflow was introduced.
- [ ] No invoice detail route was introduced.
- [ ] No invoice payment history context was introduced.
- [ ] No dashboard collection metrics were introduced.
- [ ] No schema or RLS migration was introduced.

## Deferred Work

Payment edit, payment delete, correction workflows, refunds, overpayment allocation, payment gateway integration, bank reconciliation, invoice payment history, Supabase RPC-based atomic payment recording, and dashboard collection metrics remain deferred. Receipts were deferred at Payments closeout and were implemented later as their own manual generation module.

## Closeout

Payments MVP baseline is complete when:

- [ ] Read-only Payments list is manually validated.
- [ ] Record Payment flow is manually validated.
- [x] Automated checks pass.
- [x] Deferred work is documented.
- [x] Wiki status pages identified Receipts planning as the next step at Payments closeout. Receipts manual generation has since been implemented, and current wiki status pages identify Reminders planning as the next step.

Closeout note:

- Payments implementation and automated validation are complete.
- Manual browser/Supabase validation remains pending because it requires an authenticated local session and test data.
- Receipts planning was the recommended module at Payments closeout. Receipts manual generation has since been implemented; Reminders planning is now recommended after manual Payments and Receipts validation.
