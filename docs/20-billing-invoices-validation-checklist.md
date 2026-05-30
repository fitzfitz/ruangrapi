# Billing / Invoices Validation Checklist

## Status

Status: ready for manual validation after the Billing / Invoices implementation slices are complete.

## Automated Checks

- [ ] `npm run lint` passes.
- [ ] `npm run build` passes without chunk-size warning regression.
- [ ] `git diff --check` passes.

## Read-Only Invoices List

- [ ] Authenticated and onboarded users can open `/dashboard/invoices`.
- [ ] Unauthenticated users cannot access `/dashboard/invoices` and are redirected through the existing auth gate.
- [ ] The sidebar Invoices link navigates to `/dashboard/invoices`.
- [ ] The sidebar Dashboard, Properties, Tenants, and Leases links still work.
- [ ] The Invoices page shows a loading state while the invoices query is pending.
- [ ] The Invoices page shows an empty state when the current organization has no invoices.
- [ ] The Invoices page shows an error state when the invoices query fails.
- [ ] The Invoices page shows a populated list when the current organization has invoices.
- [ ] Existing invoices listed on the page belong to the current organization.
- [ ] Invoice rows show tenant name.
- [ ] Invoice rows show unit name.
- [ ] Invoice rows show property name when available.
- [ ] Invoice rows show billing period.
- [ ] Invoice rows show status.
- [ ] Invoice rows show due date when available.
- [ ] Invoice rows handle missing due date gracefully.
- [ ] Invoice rows show total amount.
- [ ] Invoice rows show lease period context.
- [ ] Refreshing `/dashboard/invoices` keeps the user on the protected Invoices route after account state checks finish.

## Create Draft Rent Invoice Flow

- [ ] Authenticated and onboarded users can open `/dashboard/invoices/new`.
- [ ] Unauthenticated users cannot access `/dashboard/invoices/new` and are redirected through the existing auth gate.
- [ ] The Invoices page Add invoice link navigates to `/dashboard/invoices/new`.
- [ ] The Back to invoices link returns to `/dashboard/invoices`.
- [ ] The Cancel link returns to `/dashboard/invoices`.
- [ ] Active lease options load from current organization lease records.
- [ ] Inactive, ended, or cancelled leases are not offered.
- [ ] Lease options include tenant, unit, and property names when available.
- [ ] Selecting a lease shows the lease source context and monthly rent.
- [ ] Submitting without a lease shows the lease validation error.
- [ ] Submitting without a billing period shows the billing-period validation error.
- [ ] Invalid billing periods show the billing-period validation error.
- [ ] Submitting a duplicate non-cancelled invoice for the same lease and billing period fails gracefully.
- [ ] Submitting a valid draft rent invoice creates one invoice.
- [ ] Submitting a valid draft rent invoice creates one rent line item.
- [ ] The created invoice has status `draft`.
- [ ] The created invoice has no `issued_at`.
- [ ] The created invoice has no `due_date`.
- [ ] The created invoice has the correct `organization_id` for the current onboarded user.
- [ ] The created invoice uses the selected lease's tenant and unit.
- [ ] The created invoice subtotal matches the rent line item total.
- [ ] The created invoice total matches the rent line item total.
- [ ] Blank notes are stored as `null`.
- [ ] After successful creation, the user is redirected to `/dashboard/invoices`.
- [ ] The newly created invoice appears in the Invoices list after redirect.

## Regression Checks

- [ ] Browser console has no errors during Invoices list navigation, create-page load, active lease option loading, validation failures, successful create, redirects, list refresh, duplicate invoice failure, or auth redirect checks.

## Boundaries

- [ ] No invoice detail route was introduced.
- [ ] No invoice edit flow was introduced.
- [ ] No invoice issue/send workflow was introduced.
- [ ] No invoice cancel workflow was introduced.
- [ ] No payment workflow was introduced.
- [ ] No receipt workflow was introduced.
- [ ] No reminder or WhatsApp message workflow was introduced.
- [ ] No automatic overdue status job was introduced.
- [ ] No payment balance or partial payment handling was introduced.
- [ ] No receipt number generation was introduced.
- [ ] No utility reading capture was introduced.
- [ ] No utility billing automation was introduced.
- [ ] No invoice PDF, download, email, or WhatsApp delivery workflow was introduced.
- [ ] No maintenance workflow was introduced.
- [ ] No dashboard metrics were introduced.
- [ ] No schema or RLS migration was introduced.

## Deferred Work

Invoice detail, edit, issue/send, cancel, payments, receipts, reminders, overdue automation, utility readings, utility billing, PDFs, downloads, delivery workflows, and dashboard metrics remain deferred. Payments planning is the next recommended module after Billing / Invoices closeout.
