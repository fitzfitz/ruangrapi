# MVP Scope

## MVP Principle

The MVP should focus on operational clarity for Indonesian rental owners, not advanced automation.

Build the smallest useful version that helps an owner or small admin team manage one month of rental operations for kos, kontrakan, apartments, or a small rental portfolio.

The MVP should help the owner answer:

1. Which units are occupied, vacant, under maintenance, or inactive?
2. Which tenants have active leases?
3. Which invoices need attention this month?
4. Which payments have been recorded?
5. Which receipts have been issued?
6. Which reminders need to be prepared?
7. Which utility readings and maintenance tickets need follow-up?
8. What is expected rent versus collected rent?

## In Scope

### Property and Unit Management

- Create and edit rental properties.
- Create and edit units under a property.
- Track unit status: vacant, occupied, maintenance, or inactive.
- Track basic unit details such as unit name, type, base rent amount, and notes.
- Keep unit names unique within a property.

### Tenant Management

- Create and edit tenant profiles.
- Store tenant contact information.
- Store optional identity notes instead of formal identity-number storage for MVP.
- Normalize Indonesian phone numbers before saving, preferably to `+62` format.
- Keep tenant phone numbers non-unique because shared or family numbers may repeat.

### Lease Management

- Connect one tenant to one unit through a lease.
- Define lease start date and optional end date.
- Store monthly rent amount, billing day, and optional deposit amount.
- Track lease status: active, ended, or cancelled.
- Allow only one active lease per unit.
- Allow only one active lease per tenant for the MVP.
- Preserve ended or cancelled lease history.

### Monthly Billing

- Create monthly invoice records for active leases.
- Start invoices as draft.
- Mark draft invoices as unpaid when issued.
- Track invoice status: draft, unpaid, partially paid, paid, overdue, or cancelled.
- Support simple invoice line items.
- Represent rent as an invoice line item.
- Represent utility charges as invoice line items.
- Store invoice totals and validate them against line items through application rules first.
- Avoid duplicate non-cancelled invoices for the same lease and billing period.

### Payments

- Record payments manually.
- Connect each payment to one invoice.
- Store payment date, amount, method, reference number, and notes when available.
- Allow multiple payments for one invoice.
- Prevent payment amount from exceeding the invoice remaining balance.
- Allow payment edits before receipt generation.
- Avoid direct payment edits after receipt generation; a future correction workflow can be considered later if needed.

### Receipts

- Generate simple receipt records from payments.
- Use organization-scoped receipt numbers.
- Use the receipt number format `RR-{YYYY}-{0001}`, for example `RR-2026-0001`.
- Keep receipt generation as structured data; advanced PDF generation is not required in the earliest version.
- Avoid deleting receipts in normal workflows.

### WhatsApp Reminders

- Prepare reminder message text from invoice and tenant information.
- Support manual sending through copied text or a manual WhatsApp link.
- Track reminder status simply: draft, prepared, sent, or cancelled.
- Do not automate delivery through the WhatsApp Business API in the first MVP.

### Utility Readings

- Record simple electricity, water, or other utility readings for units.
- Associate readings with a billing period.
- Calculate usage and amount with a simple formula where useful.
- Include utility charges in invoices as invoice line items.
- Keep only one active reading per unit, billing period, and utility type.
- Handle utility reading corrections by editing the same reading in the MVP.

### Maintenance Tickets

- Create maintenance tickets for a property and optionally a unit.
- Track title, description, status, priority, reported date, and resolved date when applicable.
- Track status: open, in progress, resolved, or cancelled.
- Preserve resolved or cancelled maintenance history.

### Dashboard

- Show basic operational summary numbers:
  - Total units
  - Occupied units
  - Vacant units
  - Expected rent this month
  - Collected rent this month
  - Unpaid or overdue invoices
  - Open maintenance tickets
- Derive dashboard data from properties, units, leases, invoices, payments, and maintenance tickets.

### Organization and Access Model

- Use one organization as the business data boundary for the MVP.
- Create one organization and one owner profile during initial signup/onboarding.
- Keep owner/admin access simple and identical at the database-access level for MVP.
- Keep profiles and organizations conservative and organization-scoped.
- Do not add enterprise permission workflows.

### Deletion and History Preservation

- Allow physical delete only for setup mistakes before dependent business history exists.
- Preserve records once they affect leases, invoices, payments, receipts, reminders, utility readings, maintenance tickets, or reporting.
- Prefer status-based preservation such as inactive, cancelled, ended, or resolved once history exists.
- Hide preserved inactive, cancelled, ended, or resolved records by default in normal views where appropriate.

## Out of Scope for Initial MVP

Do not add these in the first MVP:

- Marketplace listing or tenant acquisition flows
- Tenant mobile app access
- Owner mobile app app-store release
- Payment gateway integration
- Automated bank reconciliation
- Refund workflows
- Overpayment allocation
- Late fee automation
- Complex accounting or double-entry ledger
- Tax reporting
- Payroll
- Inventory
- Complex deposit ledger
- Vendor management or full work-order management
- Multi-organization membership
- Enterprise role-based permission system
- Audit-log or correction modules
- WhatsApp Business API automation
- AI features or recommendations
- Native mobile app architecture

## MVP Constraint

The MVP should be built as a modular monolith using React, TypeScript, Vite, and Supabase.

Do not introduce microservices, a custom backend framework, payment gateway infrastructure, marketplace workflows, tenant app access, enterprise permissions, complex accounting, late fee automation, audit-log/correction modules, or AI features.

Detailed domain rules, data model decisions, and RLS policy planning live in their dedicated source-of-truth documents. This scope document should stay practical and product-focused, not become a technical design spec.
