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
- [x] No invoice issue/send workflow was introduced during the Billing / Invoices baseline. Minimal invoice issue was implemented later as a Payments prerequisite.
- [ ] No invoice cancel workflow was introduced.
- [x] No payment workflow was introduced during the Billing / Invoices baseline. Payments were implemented later as their own module.
- [x] No receipt workflow was introduced during the Billing / Invoices baseline. Receipts manual generation was implemented later as its own module.
- [ ] No reminder or WhatsApp message workflow was introduced.
- [ ] No automatic overdue status job was introduced.
- [x] No payment balance or partial payment handling was introduced during the Billing / Invoices baseline. Payment balance handling was implemented later in the Payments module.
- [x] No receipt number generation was introduced during the Billing / Invoices baseline. Receipt numbering was activated later through the Receipts module using existing database-backed sequencing.
- [ ] No utility reading capture was introduced.
- [ ] No utility billing automation was introduced.
- [ ] No invoice PDF, download, email, or WhatsApp delivery workflow was introduced.
- [ ] No maintenance workflow was introduced.
- [ ] No dashboard metrics were introduced.
- [ ] No schema or RLS migration was introduced.

## Deferred Work

Invoice detail, edit, send/delivery, cancel, reminders, overdue automation, utility readings, utility billing, PDFs, downloads, delivery workflows, and dashboard metrics remain deferred. Payments and Receipts have since moved into their MVP baseline implementations; Reminders planning is the next recommended module after manual Payments and Receipts validation.

## Closeout

Billing / Invoices MVP baseline is complete when:

- [ ] Read-only list is validated.
- [ ] Create draft rent invoice flow is validated.
- [ ] Automated checks pass.
- [ ] Deferred work is documented.
- [x] Wiki status pages identified Payments planning as the next step at Billing / Invoices closeout. Payments and Receipts have since been implemented, and current wiki status pages identify Reminders planning as the next step.

Deferred Billing / Invoices work:

- Invoice detail remains out of scope.
- Invoice edit remains out of scope.
- Invoice send/delivery remains out of scope. Minimal invoice issue was implemented later as a Payments prerequisite.
- Invoice cancel remains out of scope.
- Payments were out of scope for the original Billing / Invoices baseline and were implemented later as their own module.
- Receipts were out of scope for the original Billing / Invoices baseline and were implemented later as their own module.
- Reminders and WhatsApp messages remain out of scope.
- Automatic overdue status jobs remain out of scope.
- Utility reading capture and utility billing remain out of scope.
- Invoice PDFs, downloads, email, and WhatsApp delivery remain out of scope.
- Dashboard metrics remain out of scope.
