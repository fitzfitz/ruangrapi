# Task Index

This page tracks task candidates. Candidates are not approved for Hermes execution until they become approved Kanban task cards.

## Ready soon candidates

- Next focused MVP gap review

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
- Plan Receipts module
- Generate Receipt after Payment
- Document Receipts validation checklist
- Plan Reminders module
- Build Reminders manual MVP
- Document Reminders validation checklist
- Maintenance planning
- Maintenance MVP build
- Maintenance validation checklist
- Reporting / Dashboard metrics planning
- Reporting / Dashboard metrics implementation
- Reporting / Dashboard metrics validation
- Warm Admin Ledger design-system foundation
- Joyful Premium UI uplift
- Dashboard/reporting UI/UX polish based on the Joyful Premium Ops foundation
- Lagoon Command Center UI uplift
- Command list page UI/UX uplift for Properties, Tenants, Leases, Invoices, Payments, and Receipts
- Maintenance and Reminders workflow UI uplift
- Create/edit/detail guided layout uplift

## Later candidates

- ApexCharts evaluation or migration
- Replace remaining domain-local BEM markup with shared UI primitives
- Reporting custom date range picker
- Reporting CSV/export
- Reporting chart drilldowns
- Reporting saved reports
- Add Payment edit before receipt generation
- Add Invoice payment history context
- Move payment recording into Supabase RPC
- Receipt detail page
- Receipt list page
- Receipt edit or delete workflow
- Print/download receipt
- PDF generation
- Email or WhatsApp delivery
- Automatic receipt generation after payment recording
- Payment edit blocking after receipt generation

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
- Vendor management
- Work orders
- Maintenance comments and activity
- Maintenance attachments and photos
- Recurring maintenance
- Maintenance payment linkage
- Maintenance cost ledger

## Approval rule

```txt
Wiki candidate
→ Kanban card
→ owner approval
→ Hermes prompt
→ implementation
```

Hermes should not execute wiki candidates directly.
