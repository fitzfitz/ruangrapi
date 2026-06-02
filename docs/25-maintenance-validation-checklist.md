# Maintenance Validation Checklist

Status: manual validation complete.

Validation note: Maintenance list, create ticket, cost fields, property/unit scoping, and status actions were validated in browser/local Supabase with disposable local data. A local schema drift issue was resolved by applying the existing `20260601000000_add_maintenance_ticket_costs.sql` migration.

Scope: baseline property and unit issue tracking only. Do not validate vendor management, work orders, comments or activity, attachments or photos, recurring maintenance, payment linkage, cost ledger, or dashboard maintenance metrics as part of this baseline.

## Automated Checks

- [x] `npm run format:check`
- [x] `npm run build`
- [x] `npm run lint`
- [x] `git diff --check`

## Manual Setup

Use disposable local records created through the app. Do not commit local users, tokens, screenshots with private data, or seed data.

Required records:

- one organization
- one property
- one unit under that property

## Page And Navigation

- [x] Sidebar shows `Maintenance`.
- [x] `/dashboard/maintenance` loads for authenticated and onboarded users.
- [x] `/dashboard/maintenance/new` loads for authenticated and onboarded users.
- [x] Unauthenticated users cannot access Maintenance routes and are redirected through the existing auth gate.
- [x] Maintenance list shows loading, empty, and populated states without blocking navigation.
- [x] Maintenance cards show title, property, optional unit, priority, status, reported date, and cost context.
- [x] Add maintenance ticket navigation opens the create flow.
- [x] Back or cancel navigation returns to `/dashboard/maintenance`.

## Create Ticket

- [x] Submitting without a property shows the property validation error.
- [x] Submitting without a title shows the title validation error.
- [x] Submitting without a reported date shows the reported-date validation error.
- [x] A property-only ticket can be created without selecting a unit.
- [x] A property and unit ticket can be created when the unit belongs to the selected property.
- [x] The created ticket has the current organization id.
- [x] The created ticket stores the selected property id.
- [x] The created ticket stores `unit_id` as `null` for property-only tickets.
- [x] The created ticket stores the selected unit id for property and unit tickets.
- [x] Empty estimated cost is accepted and stored as empty or `null`.
- [x] Empty actual cost is accepted and stored as empty or `null`.
- [x] Negative estimated cost is rejected.
- [x] Negative actual cost is rejected.
- [x] Valid estimated cost is shown on the created ticket.
- [x] Valid actual cost is shown on the created ticket.
- [x] Blank description is accepted.
- [x] Blank costs do not block successful ticket creation.
- [x] After successful creation, the user is redirected to `/dashboard/maintenance`.
- [x] The newly created ticket appears in the Maintenance list.

## Status Actions

- [x] An open ticket can be marked `in_progress`.
- [x] An open or in-progress ticket can be marked `resolved`.
- [x] Resolving a ticket sets a resolved timestamp.
- [x] An open or in-progress ticket can be marked `cancelled`.
- [x] Cancelling a ticket sets a cancelled timestamp.
- [x] A resolved or cancelled ticket can be marked `open`.
- [x] Marking a ticket `open` clears resolved and cancelled timestamps.
- [x] Resolved tickets keep their resolved timestamp visible.
- [x] Cancelled tickets keep their cancelled timestamp visible.
- [x] Status action errors are shown inline without losing the current list state.

## Scope Checks

- [x] No vendor management workflow was introduced.
- [x] No work order workflow was introduced.
- [x] No comments or activity timeline workflow was introduced.
- [x] No attachment or photo workflow was introduced.
- [x] No recurring maintenance workflow was introduced.
- [x] No payment linkage workflow was introduced.
- [x] No cost ledger workflow was introduced.
- [x] No dashboard maintenance metrics were introduced.
