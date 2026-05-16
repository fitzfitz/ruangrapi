# Data Model Draft

This file is a planning draft for the RuangRapi MVP data model.

Do not create Supabase migrations from this document until the draft is reviewed and approved. This document describes intended tables, fields, relationships, constraints, and indexes at a planning level only. It is not SQL.

## Modeling Principles

- Keep the MVP operational and small.
- Use Supabase Auth for authentication.
- Use PostgreSQL tables for domain data.
- Use `organization_id` on business tables for multi-tenant safety.
- Preserve historical records that affect leases, invoices, payments, receipts, reminders, utility readings, maintenance tickets, and reporting.
- Preserve cancelled records, but hide them by default in normal application views.
- Prefer simple status values over complex workflow tables.
- Do not add payment gateway, marketplace, enterprise permission, or complex accounting tables in the initial MVP.

## Owner Decisions Reflected in This Draft

1. One tenant should have only one active lease at a time.
2. One unit can only have one active lease at a time.
3. Invoices should support simple invoice line items.
4. Utility charges should be included as invoice line items.
5. Deposits may be tracked on the lease, but no complex deposit workflow yet.
6. Late fees are out of scope for the initial MVP.
7. Owner/admin role separation should stay simple.
8. Invoice lifecycle starts as `draft`, then moves to `unpaid` when issued.
9. Receipt numbers should be scoped per organization.
10. Overpayment allocation is out of scope. Payment amount should not exceed invoice remaining balance.
11. Cancelled records should be preserved but hidden by default in normal views.
12. Indonesian phone numbers should be normalized before saving, preferably to `+62` format.

## Common Field Conventions

Most tables should use:

- `id` — primary key
- `organization_id` — tenant/business boundary where applicable
- `created_at`
- `updated_at`

Planning notes:

- Monetary amounts should use integer values in Indonesian Rupiah cents are not needed for IDR. Example: `1500000` for Rp1.500.000.
- Dates should use date fields when time of day is not important.
- Timestamps should use timezone-aware values where appropriate.
- Phone numbers should be stored normalized, preferably in `+62` format.
- Status fields should be constrained to the allowed values listed in this document.

## Draft Tables

### organizations

Represents the business account that owns the data.

Fields:

- `id`
- `name`
- `created_at`
- `updated_at`

Organization rule:

- This table does not need `organization_id` because it is the organization boundary.

Planning constraints:

- `name` should be required.

Planning indexes:

- Primary key on `id`.

### profiles

Represents a user profile connected to Supabase Auth.

Fields:

- `id`
- `organization_id`
- `full_name`
- `role`
- `created_at`
- `updated_at`

Allowed MVP roles:

- `owner`
- `admin`

MVP role rule:

- Keep role separation simple.
- Both roles may initially behave similarly in the app until more detailed authorization is approved.
- Do not add enterprise permission tables yet.

Planning constraints:

- `id` should correspond to the Supabase Auth user id.
- `organization_id` should reference `organizations.id`.
- `full_name` should be required.
- `role` should be one of the allowed MVP roles.

Planning indexes:

- Primary key on `id`.
- Index on `organization_id`.

### properties

Rental properties owned or managed by an organization.

Fields:

- `id`
- `organization_id`
- `name`
- `address`
- `notes`
- `created_at`
- `updated_at`

Organization rule:

- Must include `organization_id`.

Planning constraints:

- `organization_id` should reference `organizations.id`.
- `name` should be required.

Planning indexes:

- Primary key on `id`.
- Index on `organization_id`.
- Optional index on `(organization_id, name)` for searching/listing.

### units

Rentable units inside properties.

Fields:

- `id`
- `organization_id`
- `property_id`
- `name`
- `type`
- `status`
- `base_rent_amount`
- `notes`
- `created_at`
- `updated_at`

Allowed status values:

- `vacant`
- `occupied`
- `maintenance`
- `inactive`

Organization rule:

- Must include `organization_id`.

Planning constraints:

- `organization_id` should reference `organizations.id`.
- `property_id` should reference `properties.id`.
- `name` should be required.
- `status` should be one of the allowed status values.
- `base_rent_amount` should be greater than or equal to zero when present.
- A unit should only belong to a property in the same organization.

Planning indexes:

- Primary key on `id`.
- Index on `organization_id`.
- Index on `property_id`.
- Index on `(organization_id, status)` for dashboard counts.
- Optional unique constraint on `(organization_id, property_id, name)` if unit names should be unique within a property.

### tenants

Tenant profiles.

Fields:

- `id`
- `organization_id`
- `full_name`
- `phone`
- `email`
- `identity_number`
- `emergency_contact_name`
- `emergency_contact_phone`
- `notes`
- `created_at`
- `updated_at`

Organization rule:

- Must include `organization_id`.

Phone rule:

- `phone` and `emergency_contact_phone` should be normalized before saving, preferably to `+62` format.

Planning constraints:

- `organization_id` should reference `organizations.id`.
- `full_name` should be required.
- `phone` should be optional but recommended.
- If present, `phone` should use the normalized format.
- If present, `emergency_contact_phone` should use the normalized format.

Planning indexes:

- Primary key on `id`.
- Index on `organization_id`.
- Optional index on `(organization_id, full_name)` for searching/listing.
- Optional index on `(organization_id, phone)` for lookup by phone number.

### leases

Connects one tenant to one unit for a rental period.

Fields:

- `id`
- `organization_id`
- `tenant_id`
- `unit_id`
- `start_date`
- `end_date`
- `monthly_rent_amount`
- `billing_day`
- `deposit_amount`
- `status`
- `created_at`
- `updated_at`

Allowed status values:

- `active`
- `ended`
- `cancelled`

Organization rule:

- Must include `organization_id`.

MVP lease rules:

- A tenant can only have one active lease at a time.
- A unit can only have one active lease at a time.
- `deposit_amount` may be stored, but there is no complex deposit workflow yet.
- Cancelled leases should be preserved but hidden by default in normal views.

Planning constraints:

- `organization_id` should reference `organizations.id`.
- `tenant_id` should reference `tenants.id`.
- `unit_id` should reference `units.id`.
- `start_date` should be required.
- `end_date` should be optional for ongoing/month-to-month rental.
- `monthly_rent_amount` should be greater than or equal to zero.
- `billing_day` should be a valid day number, likely 1 through 31.
- `deposit_amount` should be greater than or equal to zero when present.
- `status` should be one of the allowed status values.
- Tenant and unit should belong to the same organization as the lease.

Planning indexes and uniqueness:

- Primary key on `id`.
- Index on `organization_id`.
- Index on `tenant_id`.
- Index on `unit_id`.
- Index on `(organization_id, status)`.
- Partial unique constraint to allow only one active lease per tenant.
- Partial unique constraint to allow only one active lease per unit.

### invoices

Monthly billing records for a lease and billing period.

Fields:

- `id`
- `organization_id`
- `lease_id`
- `tenant_id`
- `unit_id`
- `billing_period`
- `issue_date`
- `due_date`
- `subtotal_amount`
- `total_amount`
- `status`
- `notes`
- `created_at`
- `updated_at`

Allowed status values:

- `draft`
- `unpaid`
- `partially_paid`
- `paid`
- `overdue`
- `cancelled`

Organization rule:

- Must include `organization_id`.

MVP invoice rules:

- Invoice lifecycle starts as `draft`.
- A draft invoice becomes `unpaid` when issued.
- Utility charges should be included through invoice line items.
- Late fees are out of scope for the initial MVP.
- Cancelled invoices should be preserved but hidden by default in normal views.
- Cancelled invoices should not be counted as collectible rent.
- One lease should not have more than one non-cancelled invoice for the same billing period.

Planning constraints:

- `organization_id` should reference `organizations.id`.
- `lease_id` should reference `leases.id`.
- `tenant_id` should reference `tenants.id`.
- `unit_id` should reference `units.id`.
- `billing_period` should be required.
- `due_date` should be required when an invoice is issued.
- `issue_date` should be set when status moves from `draft` to `unpaid`.
- `subtotal_amount` should be greater than or equal to zero.
- `total_amount` should be greater than or equal to zero.
- `status` should be one of the allowed status values.
- Lease, tenant, and unit should belong to the same organization as the invoice.

Planning indexes and uniqueness:

- Primary key on `id`.
- Index on `organization_id`.
- Index on `lease_id`.
- Index on `tenant_id`.
- Index on `unit_id`.
- Index on `(organization_id, billing_period)`.
- Index on `(organization_id, status)` for dashboard and collection views.
- Index on `(organization_id, due_date)` for overdue and reminder workflows.
- Partial unique constraint on `(organization_id, lease_id, billing_period)` for non-cancelled invoices.

### invoice_line_items

Simple line items that make up an invoice total.

Fields:

- `id`
- `organization_id`
- `invoice_id`
- `description`
- `line_type`
- `quantity`
- `unit_amount`
- `total_amount`
- `sort_order`
- `created_at`
- `updated_at`

Allowed line type values:

- `rent`
- `utility`
- `other`

Organization rule:

- Must include `organization_id`.

MVP line item rules:

- Rent should be represented as a `rent` line item.
- Utility charges should be represented as `utility` line items.
- `other` should be used sparingly for simple owner-approved charges.
- Late fees are not included in the initial MVP.
- Line items should remain simple and should not become a full accounting ledger.

Planning constraints:

- `organization_id` should reference `organizations.id`.
- `invoice_id` should reference `invoices.id`.
- `description` should be required.
- `line_type` should be one of the allowed line type values.
- `quantity` should be greater than zero.
- `unit_amount` should be greater than or equal to zero.
- `total_amount` should be greater than or equal to zero.
- `total_amount` should match `quantity * unit_amount` at the application or database rule level.
- Invoice line items should belong to the same organization as the invoice.

Planning indexes:

- Primary key on `id`.
- Index on `organization_id`.
- Index on `invoice_id`.
- Optional index on `(invoice_id, sort_order)` for display order.

### payments

Manual payment records entered by the owner/admin.

Fields:

- `id`
- `organization_id`
- `invoice_id`
- `amount`
- `payment_date`
- `payment_method`
- `reference_number`
- `notes`
- `created_at`
- `updated_at`

Allowed payment method values:

- `cash`
- `bank_transfer`
- `e_wallet`
- `other`

Organization rule:

- Must include `organization_id`.

MVP payment rules:

- A payment belongs to one invoice.
- One invoice can have many payments.
- Payment amount must be greater than zero.
- Payment amount should not exceed the invoice remaining balance.
- Overpayment allocation is out of scope for the initial MVP.
- Payment gateway settlement, failed payment states, refunds, and automated reconciliation are out of scope.

Planning constraints:

- `organization_id` should reference `organizations.id`.
- `invoice_id` should reference `invoices.id`.
- `amount` should be greater than zero.
- `payment_date` should be required.
- `payment_method` should be one of the allowed payment method values.
- Payment should belong to the same organization as the invoice.
- Application logic, database logic, or both should prevent total payments from exceeding invoice total amount.

Planning indexes:

- Primary key on `id`.
- Index on `organization_id`.
- Index on `invoice_id`.
- Index on `(organization_id, payment_date)` for reporting.
- Optional index on `(organization_id, payment_method)` for filtering.

### receipts

Simple receipt records generated from recorded payments.

Fields:

- `id`
- `organization_id`
- `payment_id`
- `receipt_number`
- `issued_at`
- `created_at`
- `updated_at`

Organization rule:

- Must include `organization_id`.

MVP receipt rules:

- A receipt belongs to one payment.
- A payment should have at most one receipt.
- Receipt numbers are scoped per organization.
- Receipt generation is simple structured data; advanced PDF generation is not required in the earliest version.

Planning constraints:

- `organization_id` should reference `organizations.id`.
- `payment_id` should reference `payments.id`.
- `receipt_number` should be required.
- `issued_at` should be required.
- Receipt should belong to the same organization as the payment.

Planning indexes and uniqueness:

- Primary key on `id`.
- Index on `organization_id`.
- Unique constraint on `payment_id`.
- Unique constraint on `(organization_id, receipt_number)`.

### utility_readings

Utility meter readings for units.

Fields:

- `id`
- `organization_id`
- `unit_id`
- `billing_period`
- `utility_type`
- `previous_reading`
- `current_reading`
- `usage_amount`
- `rate`
- `total_amount`
- `notes`
- `created_at`
- `updated_at`

Allowed utility type values:

- `electricity`
- `water`
- `other`

Organization rule:

- Must include `organization_id`.

MVP utility rules:

- Utility readings are simple operational records.
- Utility charges should be included in invoices as `utility` invoice line items.
- A utility reading may be used to calculate a utility invoice line item.
- This table should not become a complex utility billing engine in the initial MVP.

Planning constraints:

- `organization_id` should reference `organizations.id`.
- `unit_id` should reference `units.id`.
- `billing_period` should be required.
- `utility_type` should be one of the allowed utility type values.
- `current_reading` should be greater than or equal to `previous_reading` when both are present.
- `usage_amount` should be greater than or equal to zero.
- `rate` should be greater than or equal to zero.
- `total_amount` should be greater than or equal to zero.
- Utility reading should belong to the same organization as the unit.

Planning indexes and uniqueness:

- Primary key on `id`.
- Index on `organization_id`.
- Index on `unit_id`.
- Index on `(organization_id, billing_period)`.
- Optional unique constraint on `(organization_id, unit_id, billing_period, utility_type)` if each utility type should only be recorded once per unit per billing period.

### maintenance_tickets

Maintenance issues related to a property and optionally a unit.

Fields:

- `id`
- `organization_id`
- `property_id`
- `unit_id`
- `title`
- `description`
- `status`
- `priority`
- `reported_at`
- `resolved_at`
- `created_at`
- `updated_at`

Allowed status values:

- `open`
- `in_progress`
- `resolved`
- `cancelled`

Allowed priority values:

- `low`
- `medium`
- `high`
- `urgent`

Organization rule:

- Must include `organization_id`.

MVP maintenance rules:

- A ticket belongs to one property.
- A ticket may optionally belong to one unit.
- Maintenance tickets are operational tracking records, not full vendor/work-order management.
- Cancelled tickets should be preserved but hidden by default in normal views.

Planning constraints:

- `organization_id` should reference `organizations.id`.
- `property_id` should reference `properties.id`.
- `unit_id` should reference `units.id` when present.
- `title` should be required.
- `status` should be one of the allowed status values.
- `priority` should be one of the allowed priority values.
- `reported_at` should be required.
- `resolved_at` should be set when status becomes `resolved`.
- Property and unit should belong to the same organization as the ticket.
- If `unit_id` is present, the unit should belong to the selected property.

Planning indexes:

- Primary key on `id`.
- Index on `organization_id`.
- Index on `property_id`.
- Index on `unit_id`.
- Index on `(organization_id, status)` for dashboard open-ticket counts.
- Index on `(organization_id, priority)` for filtering.

### reminders

Prepared reminder messages for tenant communication.

Fields:

- `id`
- `organization_id`
- `invoice_id`
- `tenant_id`
- `channel`
- `message`
- `status`
- `created_at`
- `updated_at`

Allowed channel values:

- `whatsapp`
- `manual`

Allowed status values:

- `draft`
- `prepared`
- `sent`
- `cancelled`

Organization rule:

- Must include `organization_id`.

MVP reminder rules:

- Reminders are prepared from invoice and tenant data.
- WhatsApp reminders are manually sent by the owner/admin.
- WhatsApp Business API automation is out of scope for the initial MVP.
- Cancelled reminders should be preserved but hidden by default in normal views.

Planning constraints:

- `organization_id` should reference `organizations.id`.
- `invoice_id` should reference `invoices.id`.
- `tenant_id` should reference `tenants.id`.
- `channel` should be one of the allowed channel values.
- `message` should be required.
- `status` should be one of the allowed status values.
- Reminder, invoice, and tenant should belong to the same organization.

Planning indexes:

- Primary key on `id`.
- Index on `organization_id`.
- Index on `invoice_id`.
- Index on `tenant_id`.
- Index on `(organization_id, status)`.
- Optional index on `(organization_id, channel)`.

## Tables Requiring organization_id

These tables should include `organization_id`:

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

These tables should not include `organization_id`:

- `organizations`

Reason:

- `organizations` is the tenant boundary itself.
- All business records should be scoped to an organization for Row Level Security and data isolation.

## Important Cross-Table Rules

1. A property belongs to one organization.
2. A unit belongs to one property and one organization.
3. A tenant belongs to one organization.
4. A lease belongs to one organization, one tenant, and one unit.
5. One tenant can have only one active lease at a time.
6. One unit can have only one active lease at a time.
7. An invoice belongs to one organization, one lease, one tenant, one unit, and one billing period.
8. One lease should not have more than one non-cancelled invoice for the same billing period.
9. An invoice total should equal the sum of its invoice line items.
10. Utility charges should appear as invoice line items.
11. A payment belongs to one invoice.
12. Total payments for an invoice should not exceed the invoice total.
13. A receipt belongs to one payment.
14. A receipt number is unique within an organization.
15. A utility reading belongs to one unit and billing period.
16. A maintenance ticket belongs to one property and may belong to one unit.
17. A reminder belongs to one invoice and one tenant.
18. Records with `cancelled` status should be preserved but hidden by default in normal views.

## Lifecycle Summary

### Unit

Allowed statuses:

- `vacant`
- `occupied`
- `maintenance`
- `inactive`

Notes:

- `occupied` should reflect an active lease.
- `maintenance` means not ready to rent.
- `inactive` means preserved but not available for new rental activity.

### Lease

Allowed statuses:

- `active`
- `ended`
- `cancelled`

Notes:

- Only one active lease per tenant.
- Only one active lease per unit.
- Ended and cancelled leases remain in history.

### Invoice

Allowed statuses:

- `draft`
- `unpaid`
- `partially_paid`
- `paid`
- `overdue`
- `cancelled`

Notes:

- Starts as `draft`.
- Moves to `unpaid` when issued.
- Moves to `partially_paid` or `paid` based on payments.
- May become `overdue` after due date if not fully paid.
- Cancelled invoices remain in history but are hidden by default.

### Payment

No complex payment lifecycle in the MVP.

Notes:

- A payment record means the owner/admin recorded a received payment.
- Payment amount must be greater than zero.
- Payment amount must not exceed invoice remaining balance.

### Maintenance Ticket

Allowed statuses:

- `open`
- `in_progress`
- `resolved`
- `cancelled`

Notes:

- New tickets normally start as `open`.
- Resolved tickets should have `resolved_at`.
- Cancelled tickets remain in history but are hidden by default.

## Planning-Level Index Summary

Likely important indexes:

- `profiles.organization_id`
- `properties.organization_id`
- `units.organization_id`
- `units.property_id`
- `units (organization_id, status)`
- `tenants.organization_id`
- `leases.organization_id`
- `leases.tenant_id`
- `leases.unit_id`
- `leases (organization_id, status)`
- `invoices.organization_id`
- `invoices.lease_id`
- `invoices.tenant_id`
- `invoices.unit_id`
- `invoices (organization_id, billing_period)`
- `invoices (organization_id, status)`
- `invoices (organization_id, due_date)`
- `invoice_line_items.invoice_id`
- `payments.invoice_id`
- `payments (organization_id, payment_date)`
- `receipts.payment_id`
- `receipts (organization_id, receipt_number)`
- `utility_readings.unit_id`
- `utility_readings (organization_id, billing_period)`
- `maintenance_tickets.property_id`
- `maintenance_tickets.unit_id`
- `maintenance_tickets (organization_id, status)`
- `reminders.invoice_id`
- `reminders.tenant_id`
- `reminders (organization_id, status)`

Likely important partial unique constraints:

- One active lease per tenant.
- One active lease per unit.
- One non-cancelled invoice per lease and billing period.

Likely important unique constraints:

- One receipt per payment.
- One receipt number per organization.

## Row Level Security Planning Notes

RLS should be planned before migrations are created.

At a high level:

- Users should only access rows for their organization.
- `profiles` connects an authenticated user to an organization.
- Most business table policies can use `organization_id` to restrict access.
- `organizations` access should be limited to users whose profile belongs to that organization.

This section is only a planning note. Exact RLS policies should be drafted separately before SQL migrations are created.

## Out of Scope for Initial MVP Data Model

Do not add these in the initial MVP data model:

- Marketplace listings
- Tenant acquisition flows
- Payment gateway transactions
- Bank reconciliation
- Refund workflows
- Overpayment allocation
- Late fee automation
- Complex deposit ledger
- Double-entry accounting
- Vendor management
- Work-order management
- Enterprise permission tables
- WhatsApp Business API message logs
- Native mobile app device tables

## Remaining Data Model Questions

These decisions still need confirmation before migrations are written:

1. Should unit names be unique within a property?
2. Should tenant phone numbers be unique within an organization, or can family/shared numbers repeat?
3. What exact format should `billing_period` use: date for first day of month, `YYYY-MM` text, or another representation?
4. Should invoice totals be stored directly, calculated from line items, or both stored and validated?
5. Should utility readings link directly to invoice line items, or is matching by unit and billing period enough for MVP?
6. Should `issue_date` be required only after an invoice leaves `draft`?
7. Should cancelled records use only `status = cancelled`, or also include a `cancelled_at` timestamp later?
8. Should `updated_at` be maintained by database trigger or application code?
9. Should `type` on units be constrained to a fixed list such as `room`, `house`, `apartment`, `other`, or stay free text for MVP?
10. Should `identity_number` be stored as plain text, encrypted, or deferred until privacy requirements are clearer?
