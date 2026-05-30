# Leases Validation Checklist

## Status

Status: ready for manual validation after the Leases implementation slices are complete.

## Automated Checks

- [ ] `npm run lint` passes.
- [ ] `npm run build` passes.
- [ ] `git diff --check` passes.

## Read-Only Leases List

- [ ] Authenticated and onboarded users can open `/dashboard/leases`.
- [ ] Unauthenticated users cannot access `/dashboard/leases` and are redirected through the existing auth gate.
- [ ] The sidebar Leases link navigates to `/dashboard/leases`.
- [ ] The sidebar Dashboard, Properties, and Tenants links still work.
- [ ] The Leases page shows a loading state while the leases query is pending.
- [ ] The Leases page shows an empty state when the current organization has no leases.
- [ ] The Leases page shows an error state when the leases query fails.
- [ ] The Leases page shows a populated list when the current organization has leases.
- [ ] Existing leases listed on the page belong to the current organization.
- [ ] Lease rows show tenant name.
- [ ] Lease rows show unit name.
- [ ] Lease rows show property name when available.
- [ ] Lease rows show start date.
- [ ] Lease rows handle missing end date gracefully.
- [ ] Lease rows show monthly rent amount.
- [ ] Lease rows show billing day.
- [ ] Lease rows handle missing deposit gracefully.
- [ ] Lease rows show status.
- [ ] Refreshing `/dashboard/leases` keeps the user on the protected Leases route after account state checks finish.

## Create Lease Flow

- [ ] Authenticated and onboarded users can open `/dashboard/leases/new`.
- [ ] Unauthenticated users cannot access `/dashboard/leases/new` and are redirected through the existing auth gate.
- [ ] The Leases page Add lease link navigates to `/dashboard/leases/new`.
- [ ] The Back to leases link returns to `/dashboard/leases`.
- [ ] The Cancel link returns to `/dashboard/leases`.
- [ ] Tenant options load from current organization tenant records.
- [ ] Unit options load from current organization unit records.
- [ ] Unit options include property names when available.
- [ ] Tenant and Unit options exclude records that already have active leases.
- [ ] Submitting without a tenant shows the tenant validation error.
- [ ] Submitting without a unit shows the unit validation error.
- [ ] Submitting without a start date shows the start-date validation error.
- [ ] Start date must be a valid `YYYY-MM-DD` date.
- [ ] End date can be left blank.
- [ ] End date must be a valid `YYYY-MM-DD` date when present.
- [ ] Submitting with an end date before the start date shows the end-date validation error.
- [ ] Submitting without monthly rent shows the monthly-rent validation error.
- [ ] Monthly rent must be a whole number greater than or equal to 0.
- [ ] Billing day is required.
- [ ] Billing day must be a whole number from 1 to 31.
- [ ] Deposit can be left blank.
- [ ] Deposit must be a whole number greater than or equal to 0 when present.
- [ ] Blank deposit is stored as `null`.
- [ ] Submitting a valid lease creates one active lease.
- [ ] The created lease has the correct `organization_id` for the current onboarded user.
- [ ] After successful creation, the user is redirected to `/dashboard/leases`.
- [ ] The newly created lease appears in the Leases list after redirect.
- [ ] Creating a duplicate active lease for the same tenant or unit fails gracefully.

## Regression Checks

- [ ] Browser console has no errors during Leases list navigation, create-page load, option loading, validation failures, successful create, redirects, list refresh, duplicate active lease failure, or auth redirect checks.

## Boundaries

- [ ] No lease edit flow was introduced.
- [ ] No end lease workflow was introduced.
- [ ] No cancel lease workflow was introduced.
- [ ] No lease delete/archive workflow was introduced.
- [ ] No Unit occupancy or status synchronization was introduced.
- [ ] No invoice generation was introduced.
- [ ] No billing, payment, receipt, reminder, maintenance, or dashboard metrics were introduced.
- [ ] No deposit ledger or accounting workflow was introduced.
- [ ] No contract file, PDF, or document upload workflow was introduced.
- [ ] No tenant portal or tenant authentication was introduced.
- [ ] No schema or RLS migration was introduced.

## Deferred Work

Lease edit, end, cancel, occupancy synchronization, invoice generation, deposit ledger, and document upload workflows remain deferred. Billing / Invoices planning is the next recommended module after Leases closeout.

## Closeout

Leases MVP baseline is complete when:

- [ ] Read-only list is validated.
- [ ] Create lease flow is validated.
- [ ] Automated checks pass.
- [ ] Deferred work is documented.
- [ ] Wiki status pages identify Billing / Invoices planning as the next step.

Deferred Leases work:

- Lease edit remains out of scope.
- End lease remains out of scope.
- Cancel lease remains out of scope.
- Unit occupancy/status synchronization remains out of scope.
- Invoice generation belongs to Billing / Invoices.
- Deposit ledger remains out of scope.
- Contract files, PDFs, and document uploads remain out of scope.
