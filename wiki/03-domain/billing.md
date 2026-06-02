# Billing

Billing / Invoices tracks draft invoice records for lease billing periods.

## Current status

Billing / Invoices status: MVP baseline complete.

## Future purpose

Billing tracks what money is due for a lease or rental period.

Potential concepts:

- invoice
- invoice line items
- billing period
- rent line item
- utility or other line item
- invoice lifecycle

## Known lifecycle direction

Invoices may follow statuses such as:

- draft
- unpaid
- partially_paid
- paid
- overdue
- cancelled

## Dependencies

Billing should come after:

- Properties
- Units
- Tenants
- Leases

## Built

- plan Billing / Invoices module
- read-only Invoices list
- create draft rent Invoice flow
- minimal Invoice issue action
- validation checklist
- Billing / Invoices module closeout

## Deferred

- invoice detail
- invoice edit
- invoice send/delivery
- invoice cancel
- reminders and WhatsApp messages
- automatic overdue status jobs
- utility reading capture and utility billing
- invoice PDFs, downloads, email, and WhatsApp delivery
- dashboard metrics

## Next recommended module

Reporting / Dashboard metrics planning, after operational record validation.

## Related pages

- [[leases]]
- [[payments]]
