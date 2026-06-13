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
- Joyful Premium Ops visual foundation
- Lagoon Command Center shell/dashboard visual direction
- floating rounded bottom navigation replacing the persistent sidebar
- guided create/edit/detail layout uplift across Properties, Units, Tenants, Leases, Billing / Invoices, Payments, Receipts, and Maintenance
- Base UI-backed shadcn component configuration with `base-rhea`
- self-hosted Plus Jakarta Sans typography
- blue responsive product shell with active bottom navigation and secondary More menu
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

Status: MVP implementation, Kanban workflow board, and manual validation complete.

Routes:

- `/dashboard/maintenance`
- `/dashboard/maintenance/new`

Built:

- 3-column Kanban-style board layout (Open, In Progress, Completed/Closed)
- top 3-card metrics summary strip (Open, In Progress, Resolved)
- contextual transition actions directly on ticket cards
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

Status: MVP implementation, split-column workspace, and manual validation complete.

Routes:

- `/dashboard/reminders`

Built:

- 2-column split-column workspace (Prepare Panel on left, Follow-up Queue on right)
- top 3-card metrics summary strip (Prepared, Sent, Cancelled)
- contextual actions in follow-up queue (Copy Message, Open WhatsApp, status transitions)
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

Status: first dashboard slice implemented, functionally validated, and polished in place using the Lagoon Command Center shell/dashboard direction.

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
- Recharts retained for dashboard charts
- Joyful Premium Ops dashboard card, chart, range selector, focus, and responsive styling
- in-place dashboard/reporting UI/UX polish based on Joyful Premium Ops
- Lagoon Command Center dashboard highlight cards, command-grid collection chart, compact attention queue, and compact breakdown chart layout
- Reporting / Dashboard validation checklist

Deferred:

- custom date range picker
- CSV/export
- saved reports
- ApexCharts evaluation or migration
- database reporting views or Supabase RPCs
- advanced accounting or tax reports
- automated overdue logic
- workflow changes in billing, payments, reminders, or maintenance
- cross-module workflow links from dashboard cards

## Design System

Status: Lagoon Command Center shell/dashboard direction implemented on top of the Joyful Premium Ops foundation.

Built:

- Lagoon Command Center active shell/dashboard visual direction
- floating rounded bottom navigation with secondary More menu
- Joyful Premium Ops visual foundation
- Warm Admin Ledger operational-density principles preserved
- Warm Admin Ledger token layer in `src/index.css`
- Joyful Premium Ops token layer in `src/index.css`
- Lagoon blue token layer in `src/index.css`
- Tailwind 4 theme variables for colors, radius, typography, focus rings, chart colors, and sidebar colors
- Base UI dependency and `base-rhea` shadcn configuration
- self-hosted Plus Jakarta Sans font loading
- shared UI primitives for button, input, textarea, select, label, form, badge, alert, card, and separator
- blue lagoon navigation shell
- blue, sky, cyan, teal, indigo, and orange signature accent system
- expressive dashboard cards, chart surfaces, and priority states
- restrained list, form, detail, and receipt print surfaces
- refreshed app shell with branded header, active bottom navigation states, and More menu
- broad current-screen migration across dashboard, properties, units, tenants, leases, invoices, payments, receipts, reminders, maintenance, auth, signup, and onboarding
- centered command form containers, guided form sections, property detail split layout, and printable voucher-style receipt detail surface
- receipt print styling preserved with print-safe overrides

Deferred:

- full markup replacement of every domain-local BEM class with shared React primitives
- dark mode
- data-table density controls
- advanced dashboard interactions
- screenshot-backed visual regression tooling
