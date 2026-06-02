# Payments Validation Checklist

## Status

Status: manual validation complete.

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

- [x] Authenticated and onboarded users can open `/dashboard/payments`.
- [x] Unauthenticated users cannot access `/dashboard/payments` and are redirected through the existing auth gate.
- [x] The sidebar Payments link navigates to `/dashboard/payments`.
- [x] The Payments page shows a loading state while the payments query is pending.
- [x] The Payments page shows an empty state when the current organization has no payments.
- [x] The Payments page shows an error state when the payments query fails.
- [x] The Payments page shows a populated list when the current organization has payments.
- [x] Existing payments listed on the page belong to the current organization.
- [x] Payment rows show tenant name.
- [x] Payment rows show unit name.
- [x] Payment rows show property name when available.
- [x] Payment rows show payment date.
- [x] Payment rows show amount.
- [x] Payment rows show payment method.
- [x] Payment rows show invoice billing period.
- [x] Payment rows show invoice status.
- [x] Payment rows show reference number when available.
- [x] Payment rows handle missing reference gracefully.
- [x] Refreshing `/dashboard/payments` keeps the user on the protected Payments route after account state checks finish.

## Record Payment Flow

- [x] Authenticated and onboarded users can open `/dashboard/payments/new`.
- [x] Unauthenticated users cannot access `/dashboard/payments/new` and are redirected through the existing auth gate.
- [x] The Payments page Add payment link navigates to `/dashboard/payments/new`.
- [x] The Back to payments link returns to `/dashboard/payments`.
- [x] The Cancel link returns to `/dashboard/payments`.
- [x] Payable invoice options load from current organization invoice records.
- [x] Invoices with status `unpaid`, `partially_paid`, and `overdue` are offered when they have remaining balance.
- [x] Invoices with status `draft`, `paid`, or `cancelled` are not offered.
- [x] Invoice options include tenant, unit, property, and billing period context when available.
- [x] Selecting an invoice shows total, paid, and remaining balance.
- [x] Submitting without an invoice shows the invoice validation error.
- [x] Submitting without an amount shows the amount validation error.
- [x] Submitting a non-whole amount shows the amount validation error.
- [x] Submitting zero or a negative amount shows the amount validation error.
- [x] Submitting an amount greater than the invoice remaining balance is blocked.
- [x] Submitting without a payment date shows the payment-date validation error.
- [x] Submitting without a payment method shows the payment-method validation error.
- [x] Submitting a valid partial payment creates one payment record.
- [x] Submitting a valid full remaining-balance payment creates one payment record.
- [x] The created payment has the correct `organization_id` for the current onboarded user.
- [x] The created payment references the selected invoice.
- [x] Blank reference number is stored as `null`.
- [x] Blank notes are stored as `null`.
- [x] A partial payment updates invoice status to `partially_paid`.
- [x] A full payment updates invoice status to `paid`.
- [x] After successful creation, the user is redirected to `/dashboard/payments`.
- [x] The newly created payment appears in the Payments list after redirect.

## Regression Checks

- [x] Browser console has no errors during Payments list navigation, create-page load, payable invoice option loading, validation failures, successful create, redirects, list refresh, or auth redirect checks.

## Boundaries

- [x] No payment edit flow was introduced.
- [x] No payment delete flow was introduced.
- [x] No payment correction workflow was introduced.
- [x] No receipt workflow was introduced during the Payments baseline. Receipts manual generation was implemented later as its own module.
- [x] No receipt number generation was introduced during the Payments baseline. Receipt numbering was activated later through the Receipts module using existing database-backed sequencing.
- [x] No refund workflow was introduced.
- [x] No overpayment allocation was introduced.
- [x] No payment gateway integration was introduced.
- [x] No bank reconciliation workflow was introduced.
- [x] No failed payment state workflow was introduced.
- [x] No invoice detail route was introduced.
- [x] No invoice payment history context was introduced.
- [x] No dashboard collection metrics were introduced.
- [x] No schema or RLS migration was introduced.

## Deferred Work

Payment edit, payment delete, correction workflows, refunds, overpayment allocation, payment gateway integration, bank reconciliation, invoice payment history, Supabase RPC-based atomic payment recording, and dashboard collection metrics remain deferred. Receipts were deferred at Payments closeout and were implemented later as their own manual generation module.

## Closeout

Payments MVP baseline is complete:

- [x] Read-only Payments list is manually validated.
- [x] Record Payment flow is manually validated.
- [x] Automated checks pass.
- [x] Deferred work is documented.
- [x] Wiki status pages identify Reporting / Dashboard metrics planning as the next step after operational record validation.

Closeout note:

- Payments implementation and automated validation are complete.
- Manual browser/Supabase validation is complete using disposable local data.
- Receipts planning was the recommended module at Payments closeout. Receipts manual generation, Reminders manual MVP, and Maintenance baseline have since been implemented and validated. Reporting / Dashboard metrics planning is now the next recommended task.
