# MVP Scope

The MVP should prove the core rental operations loop.

## MVP module order

1. Properties
2. Units
3. Tenants
4. Leases
5. Billing / invoices
6. Payments
7. Receipts
8. Reminders
9. Maintenance
10. Basic reporting / dashboard

## Built

### Foundation

- authentication/session flow
- onboarding
- organization/profile context
- dashboard shell
- route gating
- Supabase/RLS foundation

### Properties

- list properties
- create property
- view property detail
- edit property

### Units

- view units under a property
- create unit under a property
- edit unit under a property

### Tenants

- list tenants
- create tenant
- edit tenant

### Leases

- list leases
- create lease

### Billing / Invoices

- list invoices
- create draft rent invoice
- issue draft invoice

### Payments

- list payments
- record manual payment
- update invoice status after payment recording

### Receipts

- manually generate receipt from a payment
- browse receipts
- view and print receipt detail

### Reminders

- prepare manual WhatsApp-style reminders
- copy reminder text
- open manual WhatsApp link
- update reminder status

### Maintenance

- list maintenance tickets
- create maintenance ticket
- update ticket status

### Reporting / Dashboard

- first dashboard metrics slice
- preset date ranges
- operational charts and summary cards

## Remaining MVP gaps / deferred refinements

- advanced dashboard/reporting interaction refinements after real usage feedback
- custom reporting date ranges, export, saved reports, and drilldowns
- payment edit/correction, refunds, gateways, and bank reconciliation
- receipt PDF/download and delivery workflows
- reminder automation, templates, bulk reminders, and delivery tracking
- maintenance vendors, work orders, comments, attachments, recurring maintenance, and cost ledger
- lease edit/end/cancel workflows and occupancy synchronization
- utility reading capture and utility billing
- archive/status workflows where historical records must be preserved

## MVP success definition

A rental owner can use RuangRapi to understand:

- what properties they manage
- what units exist under each property
- who their tenants are
- which tenant rents which unit
- what rent is due
- what has been paid
- who needs follow-up
