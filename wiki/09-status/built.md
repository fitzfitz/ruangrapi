# Built

## Foundation

Status: complete.

Built:

- React/Vite/TypeScript app foundation
- Supabase/PostgreSQL setup
- RLS foundation
- onboarding RPC
- auth/session provider
- profile and organization query
- route gating
- sign-in, signup, onboarding UI
- dashboard shell

## Properties

Status: MVP baseline complete.

Routes:

- `/dashboard/properties`
- `/dashboard/properties/new`
- `/dashboard/properties/:propertyId`
- `/dashboard/properties/:propertyId/edit`

Built:

- list properties
- create property
- property detail page
- edit property

Fields:

- name
- address
- notes

## Units

Status: MVP baseline complete.

Routes:

- Units section on `/dashboard/properties/:propertyId`
- `/dashboard/properties/:propertyId/units/new`
- `/dashboard/properties/:propertyId/units/:unitId/edit`

Built:

- read-only property-scoped Units section
- create Unit
- edit Unit

Fields:

- name
- type
- notes

## Tenants

Status: MVP baseline complete.

Routes:

- `/dashboard/tenants`
- `/dashboard/tenants/new`
- `/dashboard/tenants/:tenantId/edit`

Built:

- read-only Tenants list
- create Tenant
- edit Tenant

Fields:

- full name
- phone
- email
- identity notes
- emergency contact name
- emergency contact phone
- notes

Deferred:

- lease assignment
- direct tenant-to-unit assignment
- delete/archive
- tenant portal
- document upload
- phone normalization refinement

## Leases

Status: MVP baseline complete.

Routes:

- `/dashboard/leases`
- `/dashboard/leases/new`

Built:

- plan Leases module
- read-only Leases list
- create Lease flow
- validation checklist
- Leases module closeout

Fields:

- tenant
- unit
- start date
- end date
- monthly rent amount
- billing day
- deposit amount

Deferred:

- lease edit
- end lease
- cancel lease
- occupancy/status synchronization
- invoice generation
- deposit ledger
- contract files and document uploads

## Billing / Invoices

Status: MVP baseline complete.

Routes:

- `/dashboard/invoices`
- `/dashboard/invoices/new`

Built:

- plan Billing / Invoices module
- read-only Invoices list
- create draft rent Invoice flow
- minimal Invoice issue action
- validation checklist
- Billing / Invoices module closeout

Fields:

- lease
- tenant
- unit
- billing period
- subtotal amount
- total amount
- status
- notes

Deferred:

- invoice detail
- invoice edit
- invoice send/delivery
- invoice cancel
- receipts
- reminders and WhatsApp messages
- automatic overdue status jobs
- utility reading capture and utility billing
- invoice PDFs, downloads, email, and WhatsApp delivery
- dashboard metrics

## Payments

Status: MVP baseline implementation complete; manual validation pending.

Routes:

- `/dashboard/payments`
- `/dashboard/payments/new`

Built:

- read-only Payments list
- top-level Payments navigation
- organization-scoped payment query
- record Payment flow
- payable invoice option loading
- invoice balance summary
- application-level overpayment prevention
- invoice status update after payment recording
- validation checklist
- Payments implementation closeout

Fields:

- invoice
- tenant
- unit
- payment date
- amount
- payment method
- reference number
- notes

Deferred:

- payment edit
- payment delete
- payment correction workflow
- receipts
- refunds
- overpayment allocation
- payment gateway integration
- bank reconciliation
- dashboard collection metrics
