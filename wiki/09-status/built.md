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
- Warm Admin Ledger design-system foundation
- Joyful Premium Ops active visual direction
- Base UI-backed shadcn component configuration with `base-rhea`
- self-hosted Plus Jakarta Sans typography
- premium dark responsive product shell with active sidebar navigation and mobile menu
- teal, indigo, and orange signature accent system
- shared page, card, form, alert, badge, action, loading, empty, and print-safe visual patterns

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
- reminders and WhatsApp messages
- automatic overdue status jobs
- utility reading capture and utility billing
- invoice PDFs, downloads, email, and WhatsApp delivery
- dashboard metrics

## Payments

Status: MVP baseline implementation and manual validation complete.

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
- manual receipt generation from payment cards
- issued receipt state on payment cards
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
- receipt edit or delete workflow
- PDF/download receipt
- PDF generation
- email or WhatsApp delivery
- automatic receipt generation after payment recording
- payment edit blocking after receipt generation
- refunds
- overpayment allocation
- payment gateway integration
- bank reconciliation
- dashboard collection metrics

## Receipts

Status: browsing baseline and manual validation complete.

Built:

- plan Receipts module
- manual Generate receipt action from the Payments list
- generated receipt number using the `RR-{YYYY}-{0001}` direction
- issued receipt state on payment cards
- receipt list page
- receipt detail page
- browser print action for receipt detail
- Receipts validation checklist

Deferred:

- receipt edit or delete workflow
- PDF/download receipt
- PDF generation
- email or WhatsApp delivery
- automatic receipt generation after payment recording
- payment edit blocking after receipt generation
- payment correction workflow

## Maintenance

Status: MVP baseline implementation and manual validation complete.

Routes:

- `/dashboard/maintenance`
- `/dashboard/maintenance/new`

Built:

- read-only Maintenance list
- create Maintenance ticket flow
- property-only tickets
- property and unit tickets
- priority tracking
- status tracking for open, in progress, resolved, and cancelled tickets
- status actions for open, in progress, resolved, and cancelled tickets
- validation checklist

Fields:

- property
- unit, if applicable
- title
- description
- priority
- status
- reported at
- resolved at
- cancelled at
- estimated cost
- actual cost

Deferred:

- vendor management
- work orders
- comments/activity timeline
- attachments/photos
- recurring maintenance
- payment linkage
- cost ledger/multiple cost entries
- dashboard maintenance metrics

## Reminders

Status: manual MVP baseline and manual validation complete.

Routes:

- `/dashboard/reminders`

Built:

- Reminders page
- top-level Reminders navigation
- payable invoice reminder preparation
- generated WhatsApp-style message text
- manual WhatsApp link
- copy message action
- prepared, sent, and cancelled status updates
- validation checklist

Deferred:

- WhatsApp Business API integration
- scheduled reminders
- bulk reminders
- message templates
- reminder detail/history page
- delivery/status tracking
- better phone normalization

## Reporting / Dashboard Metrics

Status: first dashboard slice implemented, functionally validated, and polished in place using the Joyful Premium Ops design system.

Routes:

- `/dashboard`

Built:

- preset range selector for This month, Last month, Last 3 months, and This year
- current total, occupied, and vacant unit metrics
- selected-period expected rent metric
- selected-period collected rent metric
- selected-period outstanding rent metric
- selected-period invoice attention count
- current open maintenance count
- selected-period prepared reminder count
- expected versus collected collection chart
- invoice status chart
- maintenance status chart
- reminder status chart
- shadcn chart setup with Tailwind CSS and Recharts
- Joyful Premium Ops dashboard card, chart, range selector, focus, and responsive styling
- in-place dashboard/reporting UI/UX polish based on Joyful Premium Ops
- Reporting / Dashboard validation checklist

Deferred:

- custom date range picker
- CSV/export
- saved reports
- database reporting views or Supabase RPCs
- advanced accounting or tax reports
- automated overdue logic
- workflow changes in billing, payments, reminders, or maintenance
- cross-module workflow links from dashboard cards

## Design System

Status: Joyful Premium Ops foundation implemented.

Built:

- Joyful Premium Ops active visual direction
- Warm Admin Ledger operational-density principles preserved
- Warm Admin Ledger token layer in `src/index.css`
- Joyful Premium Ops token layer in `src/index.css`
- Tailwind 4 theme variables for colors, radius, typography, focus rings, chart colors, and sidebar colors
- Base UI dependency and `base-rhea` shadcn configuration
- self-hosted Plus Jakarta Sans font loading
- shared UI primitives for button, input, textarea, select, label, form, badge, alert, card, and separator
- premium dark navigation shell
- teal, indigo, and orange signature accent system
- expressive dashboard cards, chart surfaces, and priority states
- restrained list, form, detail, and receipt print surfaces
- refreshed app shell with branded header, compact sidebar, active navigation states, and mobile menu
- broad current-screen migration across dashboard, properties, units, tenants, leases, invoices, payments, receipts, reminders, maintenance, auth, signup, and onboarding
- receipt print styling preserved with print-safe overrides

Deferred:

- full markup replacement of every domain-local BEM class with shared React primitives
- dark mode
- data-table density controls
- advanced dashboard interactions
- screenshot-backed visual regression tooling
