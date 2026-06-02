# Maintenance Validation Checklist

Status: ready for manual validation after the Maintenance MVP implementation.

Scope: baseline property and unit issue tracking only. Do not validate vendor management, work orders, comments or activity, attachments or photos, recurring maintenance, payment linkage, cost ledger, or dashboard maintenance metrics as part of this baseline.

## Automated Checks

- [ ] `npm run format:check`
- [ ] `npm run build`
- [ ] `npm run lint`
- [ ] `git diff --check`

## Manual Setup

Use disposable local records created through the app. Do not commit local users, tokens, screenshots with private data, or seed data.

Required records:

- one organization
- one property
- one unit under that property

## Page And Navigation

- [ ] Sidebar shows `Maintenance`.
- [ ] `/dashboard/maintenance` loads for authenticated and onboarded users.
- [ ] `/dashboard/maintenance/new` loads for authenticated and onboarded users.
- [ ] Unauthenticated users cannot access Maintenance routes and are redirected through the existing auth gate.
- [ ] Maintenance list shows loading, empty, and populated states without blocking navigation.
- [ ] Maintenance cards show title, property, optional unit, priority, status, reported date, and cost context.
- [ ] Add maintenance ticket navigation opens the create flow.
- [ ] Back or cancel navigation returns to `/dashboard/maintenance`.

## Create Ticket

- [ ] Submitting without a property shows the property validation error.
- [ ] Submitting without a title shows the title validation error.
- [ ] Submitting without a reported date shows the reported-date validation error.
- [ ] A property-only ticket can be created without selecting a unit.
- [ ] A property and unit ticket can be created when the unit belongs to the selected property.
- [ ] The created ticket has the current organization id.
- [ ] The created ticket stores the selected property id.
- [ ] The created ticket stores `unit_id` as `null` for property-only tickets.
- [ ] The created ticket stores the selected unit id for property and unit tickets.
- [ ] Empty estimated cost is accepted and stored as empty or `null`.
- [ ] Empty actual cost is accepted and stored as empty or `null`.
- [ ] Negative estimated cost is rejected.
- [ ] Negative actual cost is rejected.
- [ ] Valid estimated cost is shown on the created ticket.
- [ ] Valid actual cost is shown on the created ticket.
- [ ] Blank description is accepted.
- [ ] Blank costs do not block successful ticket creation.
- [ ] After successful creation, the user is redirected to `/dashboard/maintenance`.
- [ ] The newly created ticket appears in the Maintenance list.

## Status Actions

- [ ] An open ticket can be marked `in_progress`.
- [ ] An open or in-progress ticket can be marked `resolved`.
- [ ] Resolving a ticket sets a resolved timestamp.
- [ ] An open or in-progress ticket can be marked `cancelled`.
- [ ] Cancelling a ticket sets a cancelled timestamp.
- [ ] A resolved or cancelled ticket can be marked `open`.
- [ ] Marking a ticket `open` clears resolved and cancelled timestamps.
- [ ] Resolved tickets keep their resolved timestamp visible.
- [ ] Cancelled tickets keep their cancelled timestamp visible.
- [ ] Status action errors are shown inline without losing the current list state.

## Scope Checks

- [ ] No vendor management workflow was introduced.
- [ ] No work order workflow was introduced.
- [ ] No comments or activity timeline workflow was introduced.
- [ ] No attachment or photo workflow was introduced.
- [ ] No recurring maintenance workflow was introduced.
- [ ] No payment linkage workflow was introduced.
- [ ] No cost ledger workflow was introduced.
- [ ] No dashboard maintenance metrics were introduced.
