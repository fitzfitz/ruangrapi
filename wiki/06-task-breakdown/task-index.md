# Task Index

This page tracks task candidates. Candidates are not approved for Hermes execution until they become approved Kanban task cards.

## Ready soon candidates

- Plan Receipts module

## Completed candidates

- Plan Tenants module
- Add read-only Tenants list
- Create Tenant flow
- Edit Tenant flow
- Document Tenants validation checklist
- Tenants module closeout
- Plan Leases module
- Add read-only Leases list
- Create Lease flow
- Document Leases validation checklist
- Leases module closeout
- Plan Billing / Invoices module
- Add read-only Invoices list
- Create draft rent Invoice flow
- Add minimal Invoice issue action
- Document Billing / Invoices validation checklist
- Billing / Invoices module closeout
- Plan Payments module
- Add read-only Payments list
- Record Payment flow
- Document Payments validation checklist
- Payments module closeout

## Later candidates

- Generate Receipt after Payment
- Add Payment edit before receipt generation
- Add Invoice payment history context
- Move payment recording into Supabase RPC

## Deferred candidates

- Tenant delete/archive flow
- Tenant phone normalization refinement
- Property archive flow
- Unit status/occupancy workflow
- Unit base rent pricing
- Standalone Unit detail page
- Top-level Units navigation
- Payment delete flow
- Payment correction workflow
- Refund workflow
- Payment gateway integration
- Bank reconciliation

## Approval rule

```txt
Wiki candidate
→ Kanban card
→ owner approval
→ Hermes prompt
→ implementation
```

Hermes should not execute wiki candidates directly.
