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
- Detailed role separation is not part of the first MVP unless approved later.

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
- Identity notes or identity number
- Emergency contact
- Notes

MVP meaning:

- Tenant records are kept so the owner knows who is renting and how to contact them.
- A tenant is connected to a unit through a lease, not directly.
- Phone number is important because reminders may prepare WhatsApp message text or links.

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
2. A lease can only be `active` if the unit does not already have another active lease.
3. A unit with an active lease should be treated as `occupied`.
4. A lease may have no end date for month-to-month rental.
5. Ending a lease should stop future invoice generation for that lease.
6. Historical invoices and payments should remain connected to the lease even after it ends.
7. Cancelling a lease should be used carefully and should not delete historical payment records.

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
- Amount
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
2. One lease should not have duplicate active invoices for the same billing period unless explicitly approved later.
3. An invoice starts as `draft` or `unpaid`, depending on the workflow chosen later.
4. Recording a payment should update the invoice payment status.
5. An invoice becomes `partially_paid` when some payment has been recorded but the invoice is not fully paid.
6. An invoice becomes `paid` when recorded payments cover the invoice amount.
7. An invoice may become `overdue` when the due date has passed and it is not fully paid.
8. A cancelled invoice should not be counted as collectible rent.
9. Invoice history should be preserved for reporting and receipts.

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
5. Overpayment handling is not a first-class MVP workflow unless approved later.
6. Payment gateway settlement, failed payments, refunds, and automated reconciliation are out of scope for the MVP.
7. Payment records should not be deleted casually because they support receipts and monthly reporting.

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
- Receipt numbering rules still need owner approval.

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
- Whether utility charges are included in rent invoices or handled separately remains an open question.

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
9. An invoice can have many payments.
10. A payment belongs to one invoice in the MVP.
11. A payment can generate one receipt.
12. A reminder is prepared from invoice and tenant information.
13. A utility reading usually belongs to one unit and one billing period.
14. A maintenance ticket belongs to one property and may belong to one unit.

Text model:

```txt
Organization
  ├─ Property
  │   └─ Unit
  │       ├─ Lease
  │       │   ├─ Invoice
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
4. A tenant can have an active lease, but whether one tenant may rent multiple units is still an open question.
5. A lease is the source for recurring monthly invoice creation.
6. An invoice belongs to one billing period.
7. Duplicate invoices for the same lease and billing period should be avoided.
8. An invoice can be unpaid, partially paid, paid, overdue, draft, or cancelled.
9. A payment is recorded manually by the owner/admin.
10. A payment belongs to one invoice in the MVP.
11. An invoice can have multiple payments.
12. A receipt is generated from a recorded payment.
13. Reminder messages are derived from invoice and tenant data.
14. WhatsApp reminders are manually sent by the owner/admin in the MVP.
15. Utility readings are simple records and should not become a complex billing engine in the MVP.
16. Maintenance tickets are operational tracking records, not vendor/work-order management.
17. Dashboard numbers should be derived from properties, units, leases, invoices, payments, and maintenance tickets.
18. Historical records should be preserved where they affect invoices, payments, receipts, and reporting.
19. Marketplace listing, tenant acquisition, payment gateway integration, automated WhatsApp API integration, and complex accounting are out of scope.
20. Most business records should belong to an organization for future multi-tenant safety.

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

## Open Questions

These decisions are not final and need owner approval before implementation details depend on them:

1. Should one tenant be allowed to rent multiple units at the same time?
2. Should one invoice support multiple line items?
3. Should utility charges be included in rent invoices or handled as separate invoices?
4. Should deposits be tracked in the MVP?
5. Should late fees be included in the MVP?
6. Should owner/admin roles be separated in the first MVP?
7. Should invoice creation start as `draft` first or immediately as `unpaid`?
8. Should receipt numbers be globally unique or scoped per organization?
9. How should overpayments be handled?
10. Should cancelled leases or invoices be hidden by default but preserved for audit/history?
11. Should phone numbers be normalized to Indonesian format before saving?
