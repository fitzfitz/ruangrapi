# Payments

Payments record money received from tenants against invoices.

## Current status

Payments MVP baseline implementation is complete. Manual browser validation remains pending.
Receipts module: manual generation baseline complete; manual validation pending.

## Purpose

Payments record money received from tenants.

Potential fields:

- invoice reference
- payment date
- amount
- payment method
- reference/notes

## Dependencies

Payments should come after billing/invoices, because payments need something to settle against.

## Built

- read-only Payments list
- top-level Payments navigation
- record Payment flow
- application-level overpayment prevention
- invoice status update after payment recording

## Deferred

- payment edit before receipt generation
- payment delete
- payment correction workflow
- payment edit blocking after receipt generation
- refunds
- overpayment allocation
- payment gateway integration
- bank reconciliation
- dashboard collection metrics

## Related pages

- [[billing]]
- [[receipts]]
