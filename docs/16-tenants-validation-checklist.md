# Tenants Validation Checklist

## Status

Status: ready for manual validation after the Tenants implementation slices are complete.

## Automated Checks

- [ ] `npm run lint` passes.
- [ ] `npm run build` passes.
- [ ] `git diff --check` passes.

## Read-Only Tenants List

- [ ] Authenticated and onboarded users can open `/dashboard/tenants`.
- [ ] Unauthenticated users cannot access `/dashboard/tenants` and are redirected through the existing auth gate.
- [ ] The sidebar Tenants link navigates to `/dashboard/tenants`.
- [ ] The sidebar Dashboard link still navigates to `/dashboard`.
- [ ] The sidebar Properties link still navigates to `/dashboard/properties`.
- [ ] The Tenants page shows a loading state while the tenants query is pending.
- [ ] The Tenants page shows an empty state when the current organization has no tenants.
- [ ] The Tenants page shows an error state when the tenants query fails.
- [ ] The Tenants page shows a populated list when the current organization has existing tenants.
- [ ] Existing tenants listed on the page belong to the current organization.
- [ ] Tenant rows show full name.
- [ ] Tenant rows handle missing phone gracefully.
- [ ] Tenant rows handle missing email gracefully.
- [ ] Tenant rows handle missing emergency contact gracefully.
- [ ] Tenant rows handle missing notes gracefully.
- [ ] Refreshing `/dashboard/tenants` keeps the user on the protected Tenants route after account state checks finish.

## Create Tenant Flow

- [ ] Authenticated and onboarded users can open `/dashboard/tenants/new`.
- [ ] Unauthenticated users cannot access `/dashboard/tenants/new` and are redirected through the existing auth gate.
- [ ] The Back to tenants link returns to `/dashboard/tenants`.
- [ ] The Cancel link returns to `/dashboard/tenants`.
- [ ] Submitting with an empty full name shows the full-name validation error.
- [ ] Submitting with an invalid email shows the email validation error.
- [ ] Phone can be left blank.
- [ ] Email can be left blank.
- [ ] Identity notes can be left blank.
- [ ] Emergency contact name can be left blank.
- [ ] Emergency contact phone can be left blank.
- [ ] Notes can be left blank.
- [ ] Blank optional fields are stored as `null`.
- [ ] Submitting a valid tenant creates one tenant.
- [ ] The created tenant has the correct `organization_id` for the current onboarded user.
- [ ] After successful creation, the user is redirected to `/dashboard/tenants`.
- [ ] The newly created tenant appears in the Tenants list after redirect.

## Edit Tenant Flow

- [ ] Authenticated and onboarded users can open `/dashboard/tenants`.
- [ ] Existing tenant rows expose an Edit action.
- [ ] The Edit action navigates to `/dashboard/tenants/:tenantId/edit`.
- [ ] The edit page pre-fills all saved tenant fields.
- [ ] Submitting with an empty full name shows the full-name validation error.
- [ ] Submitting with an invalid email shows the email validation error.
- [ ] Updating full name succeeds.
- [ ] Updating phone succeeds.
- [ ] Updating email succeeds.
- [ ] Updating identity notes succeeds.
- [ ] Updating emergency contact name succeeds.
- [ ] Updating emergency contact phone succeeds.
- [ ] Updating notes succeeds.
- [ ] Clearing optional fields stores them as `null`.
- [ ] After successful update, the user is redirected to `/dashboard/tenants`.
- [ ] The Tenants list shows updated values after redirect.
- [ ] Invalid or inaccessible tenant IDs show the not-found or inaccessible state.
- [ ] Refreshing `/dashboard/tenants/:tenantId/edit` keeps the user on the protected edit route after account state checks finish.

## Boundaries

- [ ] No lease assignment was introduced.
- [ ] No direct tenant-to-unit assignment was introduced.
- [ ] No occupancy workflow was introduced.
- [ ] No tenant delete/archive workflow was introduced.
- [ ] No billing, payment, receipt, reminder, maintenance, or dashboard metrics were introduced.
- [ ] No tenant portal or tenant authentication was introduced.
- [ ] No identity number storage was introduced.
- [ ] No document upload was introduced.
- [ ] No schema or RLS migration was introduced.

## Deferred Work

Phone normalization to Indonesian `+62` format remains deferred and should be revisited before Leases relies on tenant contact data for billing or reminder workflows.
