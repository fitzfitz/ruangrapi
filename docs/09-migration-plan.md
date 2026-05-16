# First Supabase/PostgreSQL Migration Plan

## 1. Status

Status: approved for SQL planning, not yet implemented.

This document records the owner-approved planning direction for the first Supabase/PostgreSQL migration before any SQL is written.

This document does not create migrations, SQL files, Supabase policies, database functions, source code, auth implementation, or product features.

Migrations remain locked in this task. The first migration file may be created only in a separate owner-approved implementation task.

## 2. Purpose

The purpose of this migration plan is to turn the approved MVP data model, RLS strategy, and owner-approved migration planning decisions into a clear first-migration scope.

This plan should help the owner review:

1. Which tables belong in the first migration.
2. Which relationships and organization boundaries must be represented.
3. Which status values and constrained values should be planned.
4. Which primary keys, foreign keys, timestamps, and preservation fields are expected.
5. Which uniqueness rules and indexes matter for MVP safety and common queries.
6. How receipt number sequencing should be handled conceptually.
7. Which RLS policy groups should be planned conceptually.
8. What is explicitly out of scope for the first migration.
9. What must be approved before implementation begins.

## Owner-Approved Migration Planning Decisions

The owner has approved these migration planning decisions for the first migration:

1. Receipt sequencing should use a database-backed mechanism when SQL is created.
2. Receipt sequencing should be organization-scoped and year-scoped.
3. Receipt number format remains `RR-{YYYY}-{0001}`, for example `RR-2026-0001`.
4. RLS should use standard Supabase RLS policies based on `profiles.organization_id`.
5. Owner/admin should have identical database access for MVP.
6. First organization/profile creation will be handled by a later signup/onboarding implementation flow.
7. The first migration should prepare the required tables, constraints, indexes, `updated_at` trigger/function, receipt sequencing mechanism, and RLS policies.
8. Include essential indexes only in the first migration.
9. Defer optional optimization indexes until real query patterns appear.
10. `updated_at` should be maintained by a database trigger/function in the first migration.
11. Same-organization relationship protection starts with application validation plus normal foreign keys.
12. Database checks/triggers for cross-organization relationship protection are deferred until clearly needed.
13. Invoice total consistency starts with application validation.
14. Database enforcement for invoice total consistency is deferred.

These decisions approve the planning direction only. They do not authorize this task to create SQL or migration files.

## 3. First Migration Scope

The first migration should establish the core MVP database foundation for RuangRapi:

- Identity and organization boundary tables.
- Property, unit, tenant, and lease tables.
- Billing, invoice line item, payment, and receipt tables.
- Utility reading, maintenance ticket, and reminder tables.
- Basic relational constraints needed by the approved data model.
- Organization-scoped fields needed for RLS.
- Database-backed receipt number sequencing, scoped by organization and year.
- Standard Supabase RLS policies for organization isolation based on `profiles.organization_id`.
- A database trigger/function to maintain `updated_at`.

The first migration should prepare the required tables, constraints, essential indexes, `updated_at` trigger/function, receipt sequencing mechanism, and RLS policies.

The first migration should remain intentionally boring and maintainable. It should create the minimum database foundation needed for the approved MVP data model, not advanced workflows.

## 4. Tables Included

The first migration should plan to create these tables from the approved data model:

1. `organizations`
2. `profiles`
3. `properties`
4. `units`
5. `tenants`
6. `leases`
7. `invoices`
8. `invoice_line_items`
9. `payments`
10. `receipts`
11. `utility_readings`
12. `maintenance_tickets`
13. `reminders`

No payment gateway, marketplace, tenant app, enterprise permission, audit-log, correction-workflow, late-fee, or complex accounting tables should be included.

## 5. Conceptual Table Notes

### `organizations`

Purpose:

- Represents the business account and tenant boundary.

Planned fields and rules:

- Primary key: `id`.
- Required business name: `name`.
- Timestamps: `created_at`, `updated_at`.
- Does not include `organization_id` because this table is the organization boundary.

RLS meaning:

- Users should only access the organization referenced by their own profile.

### `profiles`

Purpose:

- Connects Supabase Auth users to one RuangRapi organization for the MVP.

Planned fields and rules:

- Primary key: `id`, corresponding to the Supabase Auth user id.
- Foreign key: `organization_id` references `organizations.id`.
- Required display field: `full_name`.
- Role value: `role`.
- Timestamps: `created_at`, `updated_at`.

Planned constrained values:

- `role`: `owner`, `admin`.

MVP access decision:

- A user belongs to one organization for MVP.
- Owner/admin have identical database access for MVP.
- Users may update only their own `profiles.full_name`.
- Users may not update their own `organization_id` or `role`.

### `properties`

Purpose:

- Stores rental properties owned or managed by an organization.

Planned fields and rules:

- Primary key: `id`.
- Foreign key: `organization_id` references `organizations.id`.
- Required name: `name`.
- Optional descriptive fields such as address and notes.
- Timestamps: `created_at`, `updated_at`.

Preservation rule:

- Physical delete is allowed only for setup mistakes before units or dependent history exist.

### `units`

Purpose:

- Stores rentable spaces inside properties.

Planned fields and rules:

- Primary key: `id`.
- Foreign key: `organization_id` references `organizations.id`.
- Foreign key: `property_id` references `properties.id`.
- Required unit name: `name`.
- Unit type and unit status constrained to approved values.
- Optional base rent and notes.
- Timestamps: `created_at`, `updated_at`.

Planned constrained values:

- `type`: `room`, `house`, `apartment`, `studio`, `other`.
- `status`: `vacant`, `occupied`, `maintenance`, `inactive`.

Preservation rule:

- Use `inactive` when a historical unit should no longer be available for rental.
- Physical delete is allowed only for setup mistakes before leases, invoices, tickets, readings, or other dependent history exist.

### `tenants`

Purpose:

- Stores renter profiles and contact information.

Planned fields and rules:

- Primary key: `id`.
- Foreign key: `organization_id` references `organizations.id`.
- Required tenant name: `full_name`.
- Optional phone, email, identity notes, emergency contact, and notes.
- Timestamps: `created_at`, `updated_at`.

Approved identity and phone decisions:

- Indonesian phone numbers should be normalized before saving, preferably to `+62` format.
- Tenant phone numbers are not unique in the MVP.
- `identity_number` is deferred for MVP; use `identity_notes` instead.

Preservation rule:

- Physical delete is allowed only for setup mistakes before lease or payment history exists.

### `leases`

Purpose:

- Connects one tenant to one unit for a rental period.

Planned fields and rules:

- Primary key: `id`.
- Foreign key: `organization_id` references `organizations.id`.
- Foreign key: `tenant_id` references `tenants.id`.
- Foreign key: `unit_id` references `units.id`.
- Required `start_date`.
- Optional `end_date` for ongoing or month-to-month rental.
- Monthly rent amount, billing day, optional deposit amount.
- Status constrained to approved values.
- Soft-preservation field: `cancelled_at`.
- Timestamps: `created_at`, `updated_at`.

Planned constrained values:

- `status`: `active`, `ended`, `cancelled`.

Approved uniqueness rules:

- One active lease per unit.
- One active lease per tenant for MVP.

Preservation rule:

- Prefer `ended` or `cancelled` instead of deleting once business history exists.

### `invoices`

Purpose:

- Stores monthly billing records for a lease and billing period.

Planned fields and rules:

- Primary key: `id`.
- Foreign key: `organization_id` references `organizations.id`.
- Foreign key: `lease_id` references `leases.id`.
- Foreign key: `tenant_id` references `tenants.id`.
- Foreign key: `unit_id` references `units.id`.
- `billing_period` uses the first day of the month as a date, for example `2026-05-01`.
- Draft invoices may have no `issued_at` value.
- Issued invoices should have `issued_at`.
- Due date, subtotal amount, total amount, status, and notes.
- Soft-preservation field: `cancelled_at`.
- Timestamps: `created_at`, `updated_at`.

Planned constrained values:

- `status`: `draft`, `unpaid`, `partially_paid`, `paid`, `overdue`, `cancelled`.

Approved billing decisions:

- Invoices start as `draft` and become `unpaid` when issued.
- Invoices support simple line items.
- Utility charges are invoice line items.
- Invoice total consistency starts with application validation.
- Database enforcement for invoice total consistency is deferred.

Preservation rule:

- Prefer `cancelled` instead of deleting once business history exists.

### `invoice_line_items`

Purpose:

- Stores simple charge lines that make up invoice totals.

Planned fields and rules:

- Primary key: `id`.
- Foreign key: `organization_id` references `organizations.id`.
- Foreign key: `invoice_id` references `invoices.id`.
- Required description.
- Line type constrained to approved values.
- Quantity, unit amount, total amount, and optional sort order.
- Timestamps: `created_at`, `updated_at`.

Planned constrained values:

- `line_type`: `rent`, `utility`, `other`.

Approved line-item decisions:

- Rent should be represented as a `rent` line item.
- Utility charges should be represented as `utility` line items.
- `other` should remain simple and owner-approved.
- Line items should not become a complex accounting ledger.

### `payments`

Purpose:

- Stores manually recorded payments toward invoices.

Planned fields and rules:

- Primary key: `id`.
- Foreign key: `organization_id` references `organizations.id`.
- Foreign key: `invoice_id` references `invoices.id`.
- Payment amount, payment date, payment method, optional reference number, and notes.
- Timestamps: `created_at`, `updated_at`.

Planned constrained values:

- `payment_method`: `cash`, `bank_transfer`, `e_wallet`, `other`.

Approved payment decisions:

- A payment belongs to one invoice.
- One invoice can have many payments.
- Payment amount should not exceed the invoice remaining balance.
- Payments are editable before receipt generation.
- Direct payment edits should be avoided after receipt generation.

Preservation rule:

- Avoid deleting payments after receipt generation.

### `receipts`

Purpose:

- Stores simple receipt records generated from payments.

Planned fields and rules:

- Primary key: `id`.
- Foreign key: `organization_id` references `organizations.id`.
- Foreign key: `payment_id` references `payments.id`.
- Required `receipt_number`.
- Required `issued_at`.
- Timestamps: `created_at`, `updated_at`.

Approved receipt decisions:

- A payment should have at most one receipt.
- Receipt numbers are organization-scoped.
- Receipt numbers use `RR-{YYYY}-{0001}`, for example `RR-2026-0001`.
- Receipt number sequencing should use a database-backed mechanism.
- Receipt sequencing should be scoped by organization and year.

Preservation rule:

- Receipts should not be deleted in normal workflows.

### `utility_readings`

Purpose:

- Stores simple utility readings for units and billing periods.

Planned fields and rules:

- Primary key: `id`.
- Foreign key: `organization_id` references `organizations.id`.
- Foreign key: `unit_id` references `units.id`.
- Required billing period using first day of month.
- Utility type constrained to approved values.
- Previous reading, current reading, usage amount, rate, total amount, and notes.
- Timestamps: `created_at`, `updated_at`.

Planned constrained values:

- `utility_type`: `electricity`, `water`, `other`.

Approved utility decisions:

- One active reading per unit, billing period, and utility type.
- Utility reading corrections edit the same reading for MVP.
- Utility charges are invoice line items.
- Optional linking to invoice line items can be considered later, but is not mandatory for the first migration.

### `maintenance_tickets`

Purpose:

- Stores operational maintenance issues for a property and optionally a unit.

Planned fields and rules:

- Primary key: `id`.
- Foreign key: `organization_id` references `organizations.id`.
- Foreign key: `property_id` references `properties.id`.
- Optional foreign key: `unit_id` references `units.id`.
- Required title.
- Description, status, priority, reported date, resolved date.
- Soft-preservation field: `cancelled_at`.
- Timestamps: `created_at`, `updated_at`.

Planned constrained values:

- `status`: `open`, `in_progress`, `resolved`, `cancelled`.
- `priority`: `low`, `medium`, `high`, `urgent`.

Preservation rule:

- Prefer `resolved` or `cancelled` instead of deleting once business history exists.

### `reminders`

Purpose:

- Stores prepared tenant reminder messages for manual sending.

Planned fields and rules:

- Primary key: `id`.
- Foreign key: `organization_id` references `organizations.id`.
- Foreign key: `invoice_id` references `invoices.id`.
- Foreign key: `tenant_id` references `tenants.id`.
- Channel, message, and status.
- Soft-preservation field: `cancelled_at`.
- Timestamps: `created_at`, `updated_at`.

Planned constrained values:

- `channel`: `whatsapp`, `manual`.
- `status`: `draft`, `prepared`, `sent`, `cancelled`.

Approved reminder decisions:

- The MVP prepares reminder text and manual WhatsApp links.
- WhatsApp Business API automation is out of scope.
- Cancelled reminders should be preserved.

## 6. Planned Constraints

### Primary keys

Each planned table should have a primary key named `id`.

The `profiles.id` value should correspond to the Supabase Auth user id.

### Foreign keys

The first migration should plan normal foreign keys for record existence:

- `profiles.organization_id` to `organizations.id`.
- `properties.organization_id` to `organizations.id`.
- `units.organization_id` to `organizations.id`.
- `units.property_id` to `properties.id`.
- `tenants.organization_id` to `organizations.id`.
- `leases.organization_id` to `organizations.id`.
- `leases.tenant_id` to `tenants.id`.
- `leases.unit_id` to `units.id`.
- `invoices.organization_id` to `organizations.id`.
- `invoices.lease_id` to `leases.id`.
- `invoices.tenant_id` to `tenants.id`.
- `invoices.unit_id` to `units.id`.
- `invoice_line_items.organization_id` to `organizations.id`.
- `invoice_line_items.invoice_id` to `invoices.id`.
- `payments.organization_id` to `organizations.id`.
- `payments.invoice_id` to `invoices.id`.
- `receipts.organization_id` to `organizations.id`.
- `receipts.payment_id` to `payments.id`.
- `utility_readings.organization_id` to `organizations.id`.
- `utility_readings.unit_id` to `units.id`.
- `maintenance_tickets.organization_id` to `organizations.id`.
- `maintenance_tickets.property_id` to `properties.id`.
- `maintenance_tickets.unit_id` to `units.id`, when present.
- `reminders.organization_id` to `organizations.id`.
- `reminders.invoice_id` to `invoices.id`.
- `reminders.tenant_id` to `tenants.id`.

Same-organization relationship protection should start with application validation plus normal foreign keys. Database checks or triggers for cross-organization relationship protection are deferred until clearly needed.

### Organization boundary

The following tables should include `organization_id`:

- `profiles`
- `properties`
- `units`
- `tenants`
- `leases`
- `invoices`
- `invoice_line_items`
- `payments`
- `receipts`
- `utility_readings`
- `maintenance_tickets`
- `reminders`

The `organizations` table should not include `organization_id`.

### Timestamps

All first-migration tables should plan:

- `created_at`
- `updated_at`

The first migration should maintain `updated_at` with a database trigger/function. The SQL implementation belongs in the separate migration-file task.

### Soft-preservation fields

The first migration should only plan `cancelled_at` where useful for the MVP:

- `leases`
- `invoices`
- `maintenance_tickets`
- `reminders`

Other tables should not receive `cancelled_at` unless a later owner-approved data model update adds it.

Physical delete remains allowed only for setup mistakes before dependent business history exists. Once business history exists, use statuses such as `inactive`, `cancelled`, `ended`, or `resolved` where supported.

### Planned unique constraints

The first migration should conceptually include these uniqueness rules:

- Unit names are unique within a property.
- One active lease per unit.
- One active lease per tenant for MVP.
- One non-cancelled invoice per lease and billing period.
- One receipt per payment.
- One receipt number per organization.
- One active utility reading per unit, billing period, and utility type.

### Planned required and value constraints

The first migration should conceptually constrain:

- Required names and core relationship fields.
- Allowed status, type, channel, role, priority, utility type, line type, and payment method values.
- Monetary amounts to sensible non-negative or positive values depending on the field.
- `billing_period` as a date representing the first day of the month.
- Payment amount and invoice remaining-balance rules through application validation first.
- Invoice total and line-item total consistency through application validation first.

## 7. Planned Indexes

The first migration should include essential indexes only. Optional optimization indexes should be deferred until real query patterns appear.

Essential first-migration indexes and uniqueness support:

- `profiles.organization_id`.
- `properties.organization_id`.
- `units.organization_id`.
- `units.property_id`.
- `units (organization_id, status)` for dashboard counts.
- `units (organization_id, property_id, name)` for unit-name uniqueness within a property.
- `tenants.organization_id`.
- `leases.organization_id`.
- `leases.tenant_id`.
- `leases.unit_id`.
- Active-lease uniqueness support for tenant and unit.
- `invoices.organization_id`.
- `invoices.lease_id`.
- `invoices.tenant_id`.
- `invoices.unit_id`.
- `invoices (organization_id, billing_period)`.
- `invoices (organization_id, status)`.
- `invoices (organization_id, due_date)` for overdue and reminder workflows.
- Non-cancelled invoice uniqueness support for lease and billing period.
- `invoice_line_items.organization_id`.
- `invoice_line_items.invoice_id`.
- `payments.organization_id`.
- `payments.invoice_id`.
- `payments (organization_id, payment_date)` for reporting.
- `receipts.organization_id`.
- `receipts.payment_id`.
- `receipts (organization_id, receipt_number)` for organization-scoped receipt uniqueness.
- Receipt sequencing support scoped by organization and year.
- `utility_readings.organization_id`.
- `utility_readings.unit_id`.
- `utility_readings (organization_id, billing_period)`.
- `utility_readings (organization_id, unit_id, billing_period, utility_type)` for one active reading per unit, billing period, and utility type.
- `maintenance_tickets.organization_id`.
- `maintenance_tickets.property_id`.
- `maintenance_tickets.unit_id`.
- `maintenance_tickets (organization_id, status)` for open-ticket dashboard counts.
- `reminders.organization_id`.
- `reminders.invoice_id`.
- `reminders.tenant_id`.
- `reminders (organization_id, status)`.

Deferred optional optimization indexes:

- `properties (organization_id, name)` for search if basic listing becomes insufficient.
- `tenants (organization_id, full_name)` for search if needed.
- `tenants (organization_id, phone)` for phone lookup if needed.
- `leases (organization_id, status)` if lease status filtering needs extra support.
- `invoice_line_items (invoice_id, sort_order)` if display ordering needs extra support.
- `payments (organization_id, payment_method)` if filtering by method becomes common.
- `maintenance_tickets (organization_id, priority)` if priority filtering becomes common.
- `reminders (organization_id, channel)` if channel filtering becomes common.

## 8. Receipt Number Sequencing Plan

Receipt numbers should remain organization-scoped and use this format:

```txt
RR-{YYYY}-{0001}
```

Example:

```txt
RR-2026-0001
```

Approved conceptual plan:

1. Receipt number allocation should be database-backed to reduce duplicate receipt number risk.
2. Receipt sequencing should be scoped by organization and year.
3. The app should not rely only on client-side counting to allocate receipt numbers.
4. The first migration should prepare the receipt sequencing mechanism.
5. Receipt creation should remain simple structured data, not a complex accounting or tax-invoice workflow.

The SQL implementation belongs in the separate migration-file task. This planning document intentionally does not define SQL, database function bodies, trigger bodies, or policy statements.

## 9. RLS Policy Planning

RLS should enforce the organization boundary in the database using standard Supabase RLS policies based on `profiles.organization_id`.

Conceptual policy source:

- Supabase Auth identifies the current user.
- `profiles.id` corresponds to the authenticated user id.
- `profiles.organization_id` identifies the user's organization.

### Organization-scoped table policy group

Applies to:

- `profiles`
- `properties`
- `units`
- `tenants`
- `leases`
- `invoices`
- `invoice_line_items`
- `payments`
- `receipts`
- `utility_readings`
- `maintenance_tickets`
- `reminders`

Conceptual rule:

- A user may access organization-scoped rows only when the row's `organization_id` matches the user's `profiles.organization_id`.

Operations to plan:

- SELECT only within the user's organization.
- INSERT only for the user's organization.
- UPDATE only within the user's organization and without moving rows to another organization.
- DELETE only when allowed by conservative setup-mistake rules and only within the user's organization.

### `profiles` policy group

Conceptual rule:

- Users can read their own profile.
- Users may update only their own `full_name`.
- Users may not update their own `organization_id` or `role`.
- Organization-wide profile access is deferred unless a future owner-approved admin workflow needs it.

### `organizations` policy group

Conceptual rule:

- Users can read only the organization referenced by their profile.
- Organization updates should be conservative and planned later with an owner-approved account settings workflow.
- First organization/profile creation will be handled by a later signup/onboarding implementation flow, not by this migration-planning document.

### Owner/admin access

For MVP:

- `owner` and `admin` have identical database access.
- No enterprise permission tables should be created.
- Role-specific database permissions are deferred.

### What RLS should not solve in the first migration

RLS should not attempt to implement:

- Multi-organization membership.
- Enterprise role and permission systems.
- Tenant app access.
- Marketplace access rules.
- Payment gateway access rules.
- Vendor or work-order permissions.
- Field-level permission systems beyond the planned profile update limitation.
- Complex approval workflows.

## 10. Explicitly Out of Scope

This planning task and document must not include:

- Supabase migration files.
- SQL files.
- SQL policy definitions.
- Database function or trigger SQL.
- Source code.
- Supabase client implementation.
- Auth implementation.
- Package changes.
- New dependencies.

The first migration itself must not include:

- Payment gateway tables.
- Marketplace tables.
- Tenant mobile app access patterns.
- Enterprise permission tables.
- Multi-organization membership.
- Complex accounting or double-entry ledger tables.
- Late fee automation.
- Refund or overpayment allocation workflows.
- Audit-log tables.
- Correction workflow tables.
- WhatsApp Business API automation tables.
- Vendor management or full work-order management tables.
- Database enforcement for invoice total consistency.
- Database checks or triggers for cross-organization relationship protection.

## 11. Migration Readiness Checklist

Approved at planning level:

- [x] Owner has reviewed this migration plan.
- [x] Owner has approved the first migration scope at planning level.
- [x] Owner has approved the final table list.
- [x] Owner has approved the planned constrained values.
- [x] Owner has approved the primary key and foreign key direction.
- [x] Owner has approved `organization_id` usage.
- [x] Owner has approved `updated_at` maintenance by database trigger/function in the first migration.
- [x] Owner has approved `cancelled_at` usage only on `leases`, `invoices`, `maintenance_tickets`, and `reminders`.
- [x] Owner has approved planned unique constraints.
- [x] Owner has approved essential indexes only in the first migration.
- [x] Owner has approved deferring optional optimization indexes until real query patterns appear.
- [x] Owner has approved database-backed receipt sequencing.
- [x] Owner has approved receipt sequencing scoped by organization and year.
- [x] Owner has approved receipt number format `RR-{YYYY}-{0001}`.
- [x] Owner has approved standard Supabase RLS policies based on `profiles.organization_id`.
- [x] Owner has approved identical database access for owner/admin in the MVP.
- [x] Owner has approved that first organization/profile creation will be handled by a later signup/onboarding implementation flow.
- [x] Owner has confirmed that same-organization relationship protection starts with application validation plus normal foreign keys.
- [x] Owner has confirmed that database checks/triggers for cross-organization relationship protection are deferred.
- [x] Owner has confirmed invoice total consistency starts with application validation.
- [x] Owner has confirmed database enforcement for invoice total consistency is deferred.
- [x] Owner has confirmed no out-of-scope product tables are being added.

Next gate before implementation:

- [ ] Create the first migration file only in a separate owner-approved task.
- [ ] In that separate task, write SQL for tables, constraints, essential indexes, `updated_at` trigger/function, receipt sequencing, and RLS policies.
- [ ] In that separate task, validate generated migrations according to the project workflow.

## 12. Remaining Migration Planning Questions

No migration planning questions remain open from the owner-approved decisions recorded in this document.

Implementation details still belong in the separate migration-file task, but the planning direction is approved:

- Use database-backed, organization-scoped, year-scoped receipt sequencing.
- Use receipt number format `RR-{YYYY}-{0001}`.
- Use standard Supabase RLS policies based on `profiles.organization_id`.
- Keep owner/admin database access identical for MVP.
- Handle first organization/profile creation in a later signup/onboarding implementation flow.
- Include essential indexes only.
- Defer optional optimization indexes until real query patterns appear.
- Maintain `updated_at` with a database trigger/function.
- Start same-organization relationship protection with application validation plus normal foreign keys.
- Defer database checks/triggers for cross-organization relationship protection.
- Start invoice total consistency with application validation.
- Defer database enforcement for invoice total consistency.

## 13. Separate Task Required Before SQL

This document is approved for SQL planning, but it is not an implementation task.

Migrations remain locked in this task. A separate owner-approved task is required before creating:

- Supabase migrations.
- SQL files.
- Table definitions.
- Constraints.
- Indexes.
- RLS policies.
- Database functions.
- Database triggers.
- Receipt sequencing implementation.
- Supabase client code.
- Auth or onboarding implementation.

The next gate is explicit: create the first migration file only in a separate owner-approved task.
