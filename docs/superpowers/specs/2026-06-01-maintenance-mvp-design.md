# Maintenance MVP Design

## Context

RuangRapi has built the core rental operations loop: properties, units, tenants, leases, invoices, payments, receipts, and manual reminders. The roadmap now points to Maintenance planning before dashboard metrics.

The initial Supabase schema already includes `maintenance_tickets` with organization, property, optional unit, title, description, status, priority, reported/resolved/cancelled timestamps, and audit timestamps. It does not yet include cost fields.

## Goal

Build the first useful Maintenance module for owners/admins to track property and unit repair issues, including simple estimated and actual cost tracking on each ticket.

This is an operational ticket tracker, not a full work-order, vendor, procurement, or accounting system.

## In Scope

- Add top-level Maintenance navigation.
- Add `/dashboard/maintenance`.
- Add `/dashboard/maintenance/new`.
- List maintenance tickets with property, optional unit, title, priority, status, reported date, resolved/cancelled context, and cost summary.
- Create maintenance tickets for a property and optional unit.
- Let the selected property drive the available unit options.
- Track title, description, priority, reported date, estimated cost, and actual cost.
- Support simple status actions from the list:
  - mark open
  - mark in progress
  - mark resolved
  - mark cancelled
- Store resolved and cancelled timestamps when those statuses are applied.
- Add a focused validation checklist and update wiki/status docs.

## Out of Scope

- Vendor management.
- Work-order assignment.
- Maintenance comments or activity timeline.
- File attachments or photos.
- Recurring maintenance schedules.
- Payment linkage.
- Cost ledger or multiple cost entries per ticket.
- Invoice integration for maintenance costs.
- Dashboard maintenance metrics beyond documentation updates.
- Automatic status updates.

## Data Model

Add one migration for ticket-level costs:

- `estimated_cost bigint check (estimated_cost is null or estimated_cost >= 0)`
- `actual_cost bigint check (actual_cost is null or actual_cost >= 0)`

Both fields are optional. Amounts are stored as integer rupiah values, matching existing money fields.

The existing `maintenance_tickets` table remains the primary table:

- `organization_id`
- `property_id`
- `unit_id`
- `title`
- `description`
- `status`
- `priority`
- `reported_at`
- `resolved_at`
- `cancelled_at`
- `created_at`
- `updated_at`

## Status Rules

Allowed statuses already exist in the schema:

- `open`
- `in_progress`
- `resolved`
- `cancelled`

Status actions should behave as follows:

- Mark open:
  - set `status = 'open'`
  - clear `resolved_at`
  - clear `cancelled_at`
- Mark in progress:
  - set `status = 'in_progress'`
  - clear `resolved_at`
  - clear `cancelled_at`
- Mark resolved:
  - set `status = 'resolved'`
  - set `resolved_at = now`
  - clear `cancelled_at`
- Mark cancelled:
  - set `status = 'cancelled'`
  - set `cancelled_at = now`
  - clear `resolved_at`

The existing database constraints require `resolved_at` when status is `resolved` and `cancelled_at` when status is `cancelled`.

## User Experience

### Maintenance List

The list page should feel like an operational work queue.

Header:

- title: `Maintenance`
- short copy describing property/unit issue tracking
- primary action: `Add ticket`

Ticket cards should show:

- title
- property name
- unit name when present
- priority
- status
- reported date
- resolved date or cancelled date when applicable
- estimated cost
- actual cost
- description excerpt when present

Empty state:

- explain that tickets will appear after the first maintenance issue is recorded
- include an `Add ticket` action

### Create Ticket

The create page should include:

- property select
- unit select filtered to the selected property, with a no-unit option
- title
- description
- priority
- reported date
- estimated cost
- actual cost

Defaults:

- priority: `medium`
- reported date: today
- costs: empty

Validation:

- property is required
- title is required and trimmed
- priority is required
- reported date is required
- estimated and actual costs must be empty or non-negative integer rupiah values
- selected unit must belong to the selected property

After successful creation, navigate back to `/dashboard/maintenance`.

## Architecture

Add `src/modules/maintenance/` following the current module pattern:

- `domain/maintenance.ts`
- `domain/create-maintenance-ticket-schema.ts`
- `infrastructure/maintenance-repository.ts`
- `application/use-maintenance-tickets-query.ts`
- `application/use-maintenance-form-options-query.ts`
- `application/use-create-maintenance-ticket-mutation.ts`
- `application/use-update-maintenance-ticket-status-mutation.ts`
- `presentation/maintenance-page.tsx`
- `presentation/create-maintenance-ticket-page.tsx`
- `index.ts`

Repository responsibilities:

- list maintenance tickets with property/unit names
- load form options from properties and units
- validate selected property/unit before creating
- create ticket records with optional costs
- update status with the timestamp rules above

The UI should stay within the app's existing module style: compact operational pages, restrained cards, responsive layouts, and no decorative landing-page treatment.

## Error Handling

- Loading states should appear while tickets or form options load.
- Query errors should show a concise retry-later message.
- Create errors should stay on the form and not lose input.
- Status update errors should be shown on the affected ticket card.
- If a selected unit does not belong to the selected property, creation should fail before insert with a clear error.

## Validation

Automated checks:

- `npm run format:check`
- `npm run build`
- `npm run lint`
- `git diff --check`

Manual checklist should cover:

- Maintenance appears in top-level navigation.
- `/dashboard/maintenance` loads.
- Empty state has an `Add ticket` action.
- `/dashboard/maintenance/new` loads.
- Property options load.
- Unit options filter by selected property.
- Ticket can be created with property only.
- Ticket can be created with property and unit.
- Negative cost values are rejected.
- Empty cost values are accepted.
- Created ticket appears on the list.
- Status actions set open, in progress, resolved, and cancelled correctly.
- Resolved tickets show resolved date.
- Cancelled tickets show cancelled date.
- No vendor, attachment, recurring, payment, or cost-ledger workflow was introduced.

## Documentation Updates

Update:

- `docs/25-maintenance-validation-checklist.md`
- `wiki/03-domain/maintenance.md`
- `wiki/09-status/built.md`
- `wiki/09-status/not-built.md`
- `wiki/06-task-breakdown/ready-soon.md`
- `wiki/06-task-breakdown/backlog.md`
- `wiki/04-roadmap/release-plan.md`
- `wiki/06-task-breakdown/task-index.md`

Maintenance should move from not started to MVP baseline implementation complete with manual validation pending.

Deferred maintenance work should include:

- vendor management
- work orders
- comments/activity timeline
- attachments/photos
- recurring maintenance
- payment linkage
- cost ledger
- dashboard maintenance metrics

## Risks And Decisions

- Cost fields require a migration. This is acceptable because cost tracking is part of the approved MVP slice.
- The cost model is intentionally simple: one estimate and one actual cost per ticket. Multiple cost entries are deferred.
- The first list can include all statuses. Filtering can be added later if the list becomes noisy.
- Maintenance metrics should wait until tickets exist and are manually validated.
