# Domain Model Draft

## Core Domain Language

### Organization

The business account that owns the data.

An organization may represent:

- Individual owner
- Family rental business
- Small property management team

### Property

A physical rental property.

Examples:

- Kos Melati
- Kontrakan Cempaka
- Apartment Tower A

A property contains units.

### Unit

A rentable space inside a property.

Examples:

- Room A01
- Unit 2B
- House 03

A unit can be vacant, occupied, inactive, or under maintenance.

### Tenant

A person renting a unit.

A tenant may have:

- Name
- Phone number
- Email
- Identity notes
- Emergency contact

### Lease

The agreement connecting tenant and unit.

A lease defines:

- Tenant
- Unit
- Start date
- End date
- Monthly rent
- Billing day
- Deposit amount if any
- Status

### Billing Period

The month or period being charged.

Example:

- January 2026
- February 2026

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

### Payment

A payment made by tenant.

A payment may fully or partially pay an invoice.

### Receipt

Proof that a payment was received.

For MVP, receipt can be simple structured data.

### Reminder

A prepared message for tenant communication.

For MVP, reminders may produce WhatsApp message text and link.

### Utility Reading

Meter reading for electricity, water, or other utilities.

### Maintenance Ticket

A reported issue related to a property or unit.

Examples:

- Leaking sink
- Broken lamp
- AC issue

## Important Business Rules

1. A property has many units.
2. A unit can only have one active lease at a time.
3. A tenant can have an active lease.
4. A lease generates invoices.
5. An invoice can have many payments.
6. An invoice can be unpaid, partially paid, paid, or overdue.
7. A payment can generate a receipt.
8. A maintenance ticket can belong to a property and optionally a unit.
9. Utility readings usually belong to a unit and billing period.
10. Reminder messages are derived from invoice and tenant data.

## Open Questions

- Should one tenant be allowed to rent multiple units?
- Should one invoice support multiple line items?
- Should utility charges be included in rent invoice or separate invoice?
- Should deposits be tracked in MVP?
- Should late fees be included in MVP?
- Should owner/admin roles be separated in first MVP?