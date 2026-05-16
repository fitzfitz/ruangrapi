# Domain Model Draft

This document defines the practical domain language for RuangRapi.

RuangRapi uses Domain-Driven Design-lite. The goal is not to create heavy enterprise patterns. The goal is to make the rental operations language clear enough that the product, data model, and frontend modules use the same words consistently.

## Domain Context

RuangRapi is an operations system for Indonesian rental property owners who manage kos, kontrakan, apartments, or small rental portfolios.

The MVP focuses on monthly rental administration:

- Knowing which units are occupied or vacant
- Knowing which tenant rents which unit
- Tracking active lease periods
- Preparing monthly invoices
- Recording payments
- Issuing simple receipts
- Preparing manual WhatsApp reminder text
- Recording utility readings
- Tracking maintenance tickets
- Showing basic operational dashboard numbers

RuangRapi is not a marketplace, payment gateway, WhatsApp automation platform, accounting system, or enterprise property management system.

## Core Domain Language

### Organization

The business account that owns the data.

An organization may represent:

- Individual rental owner
- Family rental business
- Small property management team
- Admin team managing rent collection for an owner

MVP meaning:

- Most business data belongs to one organization.
- Users should only see data for their organization.
- Owner/admin role separation should stay simple in the MVP.
- Detailed role and permission rules are out of scope unless approved later.

### Owner

The person or business responsible for the rental portfolio.

MVP meaning:

- The owner may be the same person as the main user account.
- The owner is responsible for properties, units, tenant records, invoices, payments, and maintenance tracking.
- RuangRapi does not model complex owner hierarchies in the MVP.

### Property

A physical rental property.

Examples:

- Kos Melati
- Kontrakan Cempaka
- Apartment Tower A
- Rumah Petak Griya Indah

A property contains one or more units.

MVP meaning:

- Property is used to group units.
- Maintenance tickets can be attached to a property.
- Utility readings usually belong to a unit, not directly to a property.

### Unit

A rentable space inside a property.

Examples:

- Room A01
- Kamar 12
- Unit 2B
- Rumah 03
- Kontrakan Blok C

A unit is the thing being rented.

Allowed MVP statuses:

- `vacant` — available and not currently rented
- `occupied` — currently rented through an active lease
- `maintenance` — not ready to rent because it needs repair or inspection
- `inactive` — not available for rental, but kept in historical records

Unit lifecycle rules:

1. A new unit normally starts as `vacant` unless it is intentionally created as `inactive` or `maintenance`.
2. A unit becomes `occupied` when it has an active lease.
3. A unit should not have more than one active lease at the same time.
4. A unit should return to `vacant` when its active lease ends and the unit is ready to rent again.
5. A unit may move to `maintenance` when repairs are needed.
6. A unit in `maintenance` should not receive a new active lease until it is marked `vacant` again.
7. A unit marked `inactive` should not be used for new leases.

### Tenant

A person renting a unit.

A tenant may have:

- Full name
- Phone number
- Email
- Identity notes
- Emergency contact
- Notes

MVP meaning:

- Tenant records are kept so the owner knows who is renting and how to contact them.
- A tenant is connected to a unit through a lease, not directly.
- Phone number is important because reminders may prepare WhatsApp message text or links.
- Indonesian phone numbers should be normalized before saving, preferably to `+62` format.
- Identity number storage is deferred for MVP; use optional identity notes instead.

### Lease

The agreement connecting one tenant to one unit for a rental period.

A lease defines:

- Tenant
- Unit
- Start date
- End date, when applicable
- Monthly rent amount
- Billing day
- Deposit amount, if tracked
- Status

Allowed MVP statuses:

- `active` — tenant is currently renting the unit
- `ended` — lease finished normally
- `cancelled` — lease was created but should no longer be used

Lease lifecycle rules:

1. A lease connects exactly one tenant to exactly one unit.
2. A tenant should have only one active lease at a time in the MVP.
3. A unit should have only one active lease at a time.
4. A lease can only be `active` if the tenant and unit do not already have active leases.
5. A unit with an active lease should be treated as `occupied`.
6. A lease may have no end date for month-to-month rental.
7. Deposits may be tracked on the lease, but no complex deposit workflow is included in the MVP.
8. Ending a lease should stop future invoice generation for that lease.
9. Historical invoices and payments should remain connected to the lease even after it ends.
10. Cancelling a lease should preserve history and hide the cancelled lease by default in normal views.

### Billing Period

The month or period being charged.

Examples:

- January 2026
- February 2026
- 2026-01
- 2026-02

MVP meaning:

- The default billing period is monthly.
- Each recurring rent invoice belongs to one billing period.
- Utility readings may also belong to a billing period.

### Invoice

A bill issued to a tenant for a billing period.

An invoice has:

- Tenant
- Lease
- Unit
- Billing period
- Due date
- Invoice line items
- Subtotal amount
- Total amount
- Status
- Notes, if needed

Allowed MVP statuses:

- `draft` — prepared but not yet considered payable
- `unpaid` — payable and no payment has been recorded
- `partially_paid` — payment has been recorded, but total paid is less than invoice amount
- `paid` — total paid is equal to or greater than invoice amount
- `overdue` — unpaid or partially paid after the due date
- `cancelled` — invoice should no longer be collected

Invoice lifecycle rules:

1. An invoice is normally created from an active lease for a billing period.
2. One lease should not have duplicate active invoices for the same billing period.
3. An invoice starts as `draft`.
4. A draft invoice becomes `unpaid` when issued.
5. Simple invoice line items make up the invoice total.
6. Rent should be represented as a rent line item.
7. Utility charges should be included as utility invoice line items.
8. Late fees are out of scope for the initial MVP.
9. Recording a payment should update the invoice payment status.
10. An invoice becomes `partially_paid` when some payment has been recorded but the invoice is not fully paid.
11. An invoice becomes `paid` when recorded payments cover the invoice amount.
12. An invoice may become `overdue` when the due date has passed and it is not fully paid.
13. A cancelled invoice should not be counted as collectible rent.
14. Cancelled invoices should be preserved but hidden by default in normal views.
15. Invoice history should be preserved for reporting and receipts.


### Invoice Line Item

A simple charge line that makes up an invoice total.

Examples:

- Monthly rent
- Electricity charge
- Water charge
- Other simple owner-approved charge

Allowed MVP line types:

- `rent`
- `utility`
- `other`

MVP meaning:

- Invoice line items keep invoice totals understandable without turning billing into complex accounting.
- Rent should be represented as a `rent` line item.
- Utility charges should be represented as `utility` line items.
- `other` should be used sparingly for simple owner-approved charges.
- Late fees are out of scope for the initial MVP.
- Line items should remain simple and should not become a full accounting ledger.

### Payment

A payment made by a tenant toward an invoice.

A payment has:

- Invoice
- Amount
- Payment date
- Payment method
- Reference number, if any
- Notes, if needed

Allowed MVP payment methods:

- `cash`
- `bank_transfer`
- `e_wallet`
- `other`

Payment lifecycle/status rules:

The MVP does not need a complex payment status model. A payment record means the owner has recorded that payment as received.

Rules:

1. A payment belongs to one invoice in the MVP.
2. One invoice can have many payments.
3. A payment amount must be greater than zero.
4. Total payments for an invoice determine whether the invoice is unpaid, partially paid, or paid.
5. Payment amount should not exceed the invoice remaining balance.
6. Overpayment allocation is out of scope for the initial MVP.
7. Payments should be editable before receipt generation.
8. After receipt generation, direct payment edits should be avoided.
9. A proper payment correction workflow can be added later.
10. Payment gateway settlement, failed payments, refunds, and automated reconciliation are out of scope for the MVP.
11. Payment records should not be deleted casually because they support receipts and monthly reporting.

### Receipt

Proof that a payment was received.

For MVP, a receipt can be simple structured data. It does not need advanced PDF generation in the earliest version.

A receipt may include:

- Receipt number
- Payment
- Tenant
- Unit
- Invoice
- Amount paid
- Issued date

MVP meaning:

- A receipt is generated from a recorded payment.
- A payment may have one receipt.
- Receipt numbers are scoped per organization.
- Receipt numbers use the format `RR-{YYYY}-{0001}`, for example `RR-2026-0001`.

### Reminder

A prepared message for tenant communication.

For MVP, reminders may produce WhatsApp message text and a manual WhatsApp link.

A reminder may include:

- Invoice
- Tenant
- Channel
- Message text
- Status

Allowed MVP channels:

- `whatsapp`
- `manual`

Allowed MVP statuses:

- `draft`
- `prepared`
- `sent`
- `cancelled`

MVP meaning:

- RuangRapi prepares reminder text.
- The owner/admin manually sends the message.
- WhatsApp Business API automation is out of scope for the first MVP.

### Utility Reading

Meter reading for electricity, water, or other utilities.

A utility reading may include:

- Unit
- Billing period
- Utility type
- Previous reading
- Current reading
- Usage amount
- Rate
- Total amount

Allowed MVP utility types:

- `electricity`
- `water`
- `other`

MVP meaning:

- Utility readings are tracked simply.
- Utility charges may be calculated with a simple formula.
- Utility charges should be included as invoice line items.
- Only one active utility reading should exist per unit, billing period, and utility type in the MVP.
- Utility reading corrections should edit the same reading instead of creating separate correction records.

### Maintenance Ticket

A reported issue related to a property or unit.

Examples:

- Leaking sink
- Broken lamp
- AC issue
- Water pump issue
- Door lock problem

A maintenance ticket may include:

- Property
- Unit, optional
- Title
- Description
- Status
- Priority
- Reported date
- Resolved date

Allowed MVP statuses:

- `open` — issue has been reported but work has not started
- `in_progress` — issue is being handled
- `resolved` — issue has been fixed or closed successfully
- `cancelled` — issue no longer needs action

Allowed MVP priorities:

- `low`
- `medium`
- `high`
- `urgent`

Maintenance ticket lifecycle rules:

1. A ticket belongs to a property.
2. A ticket may optionally belong to a unit.
3. A new ticket normally starts as `open`.
4. A ticket moves to `in_progress` when the owner/admin starts handling it.
5. A ticket moves to `resolved` when the issue is fixed.
6. A ticket moves to `cancelled` when no action is needed.
7. A unit may be marked `maintenance` if the issue makes it unavailable for rent.
8. Resolving a ticket does not automatically make the unit `vacant`; the owner/admin should decide whether the unit is ready.

## Relationships Between Core Concepts

Primary relationships:

1. An organization owns many properties.
2. An organization owns many tenants.
3. A property contains many units.
4. A unit belongs to one property.
5. A tenant rents a unit through a lease.
6. A lease connects one tenant and one unit.
7. A lease generates invoices.
8. An invoice belongs to one lease, one tenant, one unit, and one billing period.
9. An invoice contains simple invoice line items.
10. Utility charges are represented as invoice line items.
11. An invoice can have many payments.
12. A payment belongs to one invoice in the MVP.
13. A payment can generate one receipt.
14. A reminder is prepared from invoice and tenant information.
15. A utility reading belongs to one unit and one billing period.
16. A maintenance ticket belongs to one property and may belong to one unit.

Text model:

```txt
Organization
  ├─ Property
  │   └─ Unit
  │       ├─ Lease
  │       │   ├─ Invoice
  │       │   │   ├─ Invoice Line Item
  │       │   │   ├─ Payment
  │       │   │   │   └─ Receipt
  │       │   │   └─ Reminder
  │       │   └─ Tenant
  │       ├─ Utility Reading
  │       └─ Maintenance Ticket
  └─ Tenant
```

Note: Tenant is shown both under Organization and Lease because tenant records belong to the organization, while actual occupancy is represented by leases.

## Explicit MVP Business Rules

1. The MVP is monthly-rental focused.
2. A property must exist before units are created under it.
3. A unit can only have one active lease at a time.
4. A tenant should have only one active lease at a time in the MVP.
5. A lease may track a deposit amount, but complex deposit workflows are out of scope for the MVP.
6. A lease is the source for recurring monthly invoice creation.
7. An invoice belongs to one billing period.
8. Duplicate invoices for the same lease and billing period should be avoided.
9. An invoice starts as `draft`, then becomes `unpaid` when issued.
10. An invoice supports simple invoice line items.
11. Utility charges should be included as invoice line items.
12. Late fee workflows are out of scope for the initial MVP.
13. An invoice can be draft, unpaid, partially paid, paid, overdue, or cancelled.
14. A payment is recorded manually by the owner/admin.
15. A payment belongs to one invoice in the MVP.
16. An invoice can have multiple payments.
17. Payment amount should not exceed invoice remaining balance.
18. Overpayment allocation is out of scope for the initial MVP.
19. Payments should be editable before receipt generation.
20. After receipt generation, direct payment edits should be avoided.
21. A proper payment correction workflow can be added later.
22. A receipt is generated from a recorded payment.
23. Receipt numbers are organization-scoped using the format `RR-{YYYY}-{0001}`, for example `RR-2026-0001`.
24. Reminder messages are derived from invoice and tenant data.
25. WhatsApp reminders are manually sent by the owner/admin in the MVP.
26. Utility readings are simple records and should not become a complex billing engine in the MVP.
27. Only one active utility reading should exist per unit, billing period, and utility type.
28. Utility reading corrections should edit the same reading in the MVP.
29. Maintenance tickets are operational tracking records, not vendor/work-order management.
30. Dashboard numbers should be derived from properties, units, leases, invoices, payments, and maintenance tickets.
31. Historical records should be preserved where they affect invoices, payments, receipts, reminders, leases, utility readings, maintenance tickets, and reporting.
32. Cancelled records should be preserved but hidden by default in normal views.
33. Physical delete is allowed only for setup mistakes before dependent business history exists.
34. Once dependent business history exists, prefer status-based preservation such as `inactive`, `cancelled`, `ended`, or `resolved`.
35. Indonesian phone numbers should be normalized before saving, preferably to `+62` format.
36. Owner/admin role separation should stay simple in the MVP.
37. Marketplace listing, tenant acquisition, payment gateway integration, automated WhatsApp API integration, late fee workflows, and complex accounting are out of scope.
38. Most business records should belong to an organization for future multi-tenant safety.

## Destructive Action Rules

For MVP, physical delete is only for setup mistakes before dependent history exists.

Practical guidance:

- Property: delete only if no units or history exist.
- Unit: delete only if no leases, invoices, tickets, or readings exist.
- Tenant: delete only if no lease or payment history exists.
- Lease: prefer `ended` or `cancelled`.
- Invoice: prefer `cancelled`.
- Payment: avoid delete after receipt generation.
- Receipt: do not delete in normal flow.
- Maintenance ticket: prefer `cancelled` or `resolved`.
- Reminder: can cancel or archive.

## Practical DDD-lite Guidance

Use domain words consistently in code, UI labels, and documentation.

Preferred terms:

- Organization
- Owner
- Property
- Unit
- Tenant
- Lease
- Billing Period
- Invoice
- Invoice Line Item
- Payment
- Receipt
- Reminder
- Utility Reading
- Maintenance Ticket

Avoid vague terms when a domain word is available:

- Item
- Data
- Record
- Thing
- Object
- Manager

Keep modules practical:

- Do not create folders until needed.
- Do not add abstractions before there is a clear use case.
- Prefer simple types, schemas, query functions, forms, and UI components grouped by domain.
- Let documentation guide the first implementation steps.
