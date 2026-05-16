# Architecture

This document describes the practical architecture baseline for the RuangRapi MVP.

RuangRapi uses a modular monolith architecture with Domain-Driven Design-lite. The goal is to keep the system simple while making domain boundaries clear enough for safe, agent-assisted development.

This is architecture documentation only. It is not an implementation task, migration plan, or routing setup.

## Architecture Style

RuangRapi is a frontend-first SaaS application backed by Supabase.

Approved stack:

- React
- TypeScript
- Vite
- TanStack Query
- React Hook Form
- Zod
- Supabase
- PostgreSQL
- Supabase Auth
- Supabase Row Level Security

Architecture principles:

- Use a modular monolith.
- Use domain-oriented frontend modules.
- Use Supabase and PostgreSQL as the backend/data platform.
- Keep the MVP operational and small.
- Avoid premature abstractions.
- Avoid microservices.
- Avoid adding a custom backend framework unless explicitly approved later.
- Avoid global client state libraries such as Redux or Zustand unless a future need is documented and approved.

## Why Modular Monolith

A modular monolith is preferred because:

- The MVP is still early.
- The product domain is still being validated.
- The team is small.
- Supabase already provides backend capabilities.
- Microservices would add unnecessary operational complexity.
- Clear module boundaries are enough at this stage.

In this project, modular monolith means:

- One frontend application.
- One Supabase project.
- One PostgreSQL database.
- Domain-oriented frontend modules.
- Clear boundaries by convention, folder structure, types, schemas, and query functions.
- No separate deployable services in the MVP.

## High-Level System Shape

```txt
User Browser
  └─ React + TypeScript + Vite application
      ├─ App initialization layer
      │   ├─ providers
      │   ├─ router, when introduced
      │   ├─ Supabase client wrapper, when introduced
      │   └─ TanStack Query client
      ├─ Shared UI and utilities
      └─ Domain modules
          ├─ properties
          ├─ units
          ├─ tenants
          ├─ leases
          ├─ billing
          ├─ payments
          ├─ receipts
          ├─ reminders
          ├─ utilities
          ├─ maintenance
          └─ dashboard

Supabase
  ├─ Supabase Auth
  ├─ PostgreSQL tables
  ├─ Row Level Security policies
  └─ Storage/Edge Functions only if explicitly needed later
```

## Frontend Architecture

The frontend should use domain-oriented modules.

Target structure:

```txt
src/
  app/
    providers/
    router/
  shared/
    components/
    lib/
    types/
    utils/
  modules/
    identity/
    properties/
    units/
    tenants/
    leases/
    billing/
    payments/
    receipts/
    reminders/
    utilities/
    maintenance/
    dashboard/
```

This is a target structure. Do not create every folder before it is needed.

### app/

The `app/` folder is for application initialization and composition.

It should eventually contain:

- Provider setup
- Query client setup
- Supabase client setup/wiring
- Router setup, when routing is introduced
- Application shell composition

It should not contain domain-specific business rules.

Examples of things that belong in `app/`:

- `app/providers/`
- `app/router/`
- root app layout wiring
- global provider composition

### shared/

The `shared/` folder is for reusable code that is not specific to one domain module.

Good candidates for `shared/`:

- Generic UI components, such as buttons, inputs, dialogs, cards, and tables
- Generic formatting helpers, such as currency and date formatting
- Generic validation helpers used by multiple modules
- Supabase client wrapper, if used across modules
- Shared TypeScript utility types
- Shared constants with no domain ownership

Things that should not go in `shared/`:

- Property-specific business rules
- Lease lifecycle logic
- Invoice status rules
- Payment recording rules
- Maintenance ticket status logic
- Module-specific schemas or query functions

Rule of thumb:

- If the code speaks a domain language, keep it in that domain module.
- If the code is generic UI or infrastructure glue, it may belong in `shared/` or `app/`.

### modules/

The `modules/` folder is for domain-specific code.

Each module should eventually own its own:

- Types
- Zod schemas
- API/query functions
- Forms
- UI components
- Domain-specific utilities

Do not create all subfolders immediately. Create structure only when there is actual code to place inside it.

A future module may look like this:

```txt
src/modules/properties/
  types.ts
  schemas.ts
  queries.ts
  components/
  forms/
  utils.ts
```

This is a pattern, not a requirement for every module on day one.

## Domain Module Boundaries

The initial domain modules are:

- `identity`
- `properties`
- `units`
- `tenants`
- `leases`
- `billing`
- `payments`
- `receipts`
- `reminders`
- `utilities`
- `maintenance`
- `dashboard`

### identity

Responsible for user/session and organization context.

Examples:

- Current authenticated user
- Profile
- Organization membership context
- Simple owner/admin role display

Not responsible for:

- Enterprise permissions
- Complex role hierarchies
- Tenant records, because tenant means renter in this domain

### properties

Responsible for rental properties.

Examples:

- Property list
- Property details
- Property forms
- Property-specific validation

Not responsible for:

- Unit lifecycle rules beyond displaying related units
- Tenant assignment
- Invoice generation

### units

Responsible for rentable units inside properties.

Examples:

- Unit list under a property
- Unit status
- Unit type
- Base rent amount

MVP data decisions relevant to this module:

- Unit names should be unique within a property.
- Unit type should use a constrained list: `room`, `house`, `apartment`, `studio`, `other`.

Not responsible for:

- Lease creation workflow, except showing lease-related status when needed
- Invoice generation

### tenants

Responsible for renter profiles.

Examples:

- Tenant list
- Tenant contact details
- Tenant forms
- Phone normalization before saving

MVP data decisions relevant to this module:

- Tenant phone numbers should be normalized, preferably to `+62` format.
- Tenant phone numbers are not unique in the MVP.
- `identity_number` is deferred for MVP.
- Use optional `identity_notes` instead.

Not responsible for:

- Authentication users
- Owner/admin profiles
- Lease lifecycle rules beyond showing related leases

### leases

Responsible for connecting tenants to units.

Examples:

- Active lease records
- Lease start/end dates
- Monthly rent amount
- Billing day
- Deposit amount

MVP data decisions relevant to this module:

- One tenant can only have one active lease at a time.
- One unit can only have one active lease at a time.
- Deposits may be tracked on the lease, but no complex deposit workflow yet.
- Cancelled records should use `status = cancelled` and nullable `cancelled_at` where useful.

Not responsible for:

- Full contract management
- Deposit ledger/accounting
- Invoice payment status calculation

### billing

Responsible for invoices and invoice line items.

Examples:

- Billing periods
- Draft invoices
- Issued invoices
- Invoice line items
- Invoice totals
- Invoice status

MVP data decisions relevant to this module:

- `billing_period` should use the first day of the month as a date, for example `2026-05-01`.
- Invoices start as `draft`.
- Draft invoices may have no `issued_at` value.
- Issued invoices should have `issued_at`.
- Invoice totals should be stored on invoices and calculated from line items, with consistency validation.
- Utility charges should be represented as invoice line items.
- Late fees are out of scope for the initial MVP.
- Cancelled invoices should use `status = cancelled` and nullable `cancelled_at` where useful.

Not responsible for:

- Payment gateway processing
- Automated bank reconciliation
- Full accounting ledger

### payments

Responsible for manually recorded payments.

Examples:

- Payment records
- Payment method
- Payment date
- Payment reference number
- Updating invoice payment status through application rules or database-backed logic later

MVP data decisions relevant to this module:

- Payment amount should not exceed invoice remaining balance.
- Overpayment allocation is out of scope for the initial MVP.
- Payment gateway states are out of scope.

Not responsible for:

- Gateway settlement
- Refund workflows
- Bank reconciliation

### receipts

Responsible for simple receipt records generated from payments.

Examples:

- Receipt number
- Issued date
- Link to payment

MVP data decisions relevant to this module:

- Receipt numbers should be scoped per organization.
- Advanced PDF generation is not required in the earliest version.

Not responsible for:

- Complex document templates
- Tax invoices
- Accounting reports

### reminders

Responsible for prepared tenant reminder messages.

Examples:

- WhatsApp reminder text
- Manual WhatsApp link generation
- Reminder status

Not responsible for:

- WhatsApp Business API integration
- Automated message delivery
- Message webhooks

### utilities

Responsible for utility meter readings.

Examples:

- Electricity readings
- Water readings
- Usage calculation
- Utility charge amount

MVP data decisions relevant to this module:

- Utility charges should be included as invoice line items.
- Utility readings may optionally link to invoice line items later, but this is not mandatory for initial implementation.

Not responsible for:

- Complex utility billing engine
- Vendor integrations

### maintenance

Responsible for operational maintenance tickets.

Examples:

- Maintenance ticket list
- Ticket status
- Ticket priority
- Property/unit association

MVP data decisions relevant to this module:

- Cancelled maintenance tickets should use `status = cancelled` and nullable `cancelled_at` where useful.

Not responsible for:

- Vendor management
- Work-order management
- Inventory

### dashboard

Responsible for read-oriented summary views.

Examples:

- Total units
- Occupied units
- Vacant units
- Expected rent this month
- Collected rent this month
- Unpaid invoices
- Open maintenance tickets

The dashboard should derive data from domain modules and database queries. It should not own business rules that belong to billing, payments, leases, units, or maintenance.

## Supabase and PostgreSQL Responsibilities

Supabase is the backend platform for the MVP.

Supabase Auth responsibilities:

- Authenticate users.
- Provide authenticated user identity.
- Support profile lookup through the `profiles` table.

PostgreSQL responsibilities:

- Store domain data.
- Enforce important relational constraints.
- Support planning-level indexes from the data model draft.
- Support Row Level Security policies.
- Maintain `updated_at` by database trigger when migrations are introduced.

Application responsibilities:

- Keep UI workflows simple.
- Normalize Indonesian phone numbers before saving, preferably to `+62` format.
- Validate form input with Zod.
- Use React Hook Form for forms.
- Use TanStack Query for server state.
- Calculate invoice line item totals in application logic and validate consistency with stored invoice totals.

Database responsibility later, when migrations are approved:

- Validate important invariants that should not depend only on the UI.
- Enforce uniqueness such as unit names within a property.
- Enforce one active lease per tenant and unit.
- Enforce receipt number uniqueness per organization.
- Enforce allowed status values.
- Maintain `updated_at` automatically.

Do not create migrations until the data model and RLS plan are approved.

## Row Level Security Planning

RLS is required for multi-tenant safety.

High-level plan:

- Every business table should include `organization_id`, except `organizations` itself.
- `profiles` connects an authenticated Supabase user to an organization.
- Users should only read and write rows for their organization.
- `organizations` should only be accessible by users whose profile belongs to that organization.
- RLS policies should be drafted before SQL migrations are created.

RLS should protect at least:

- properties
- units
- tenants
- leases
- invoices
- invoice_line_items
- payments
- receipts
- utility_readings
- maintenance_tickets
- reminders

MVP role handling:

- Keep owner/admin role separation simple.
- Do not add enterprise permission tables.
- Detailed permission differences can be added later only if the product needs them.

## TanStack Query Usage

TanStack Query should be used for server state.

Use it for:

- Fetching lists from Supabase
- Fetching detail records
- Mutations that create/update/cancel records
- Cache invalidation after mutations
- Loading and error states around server data

Do not use TanStack Query for:

- Pure local form state
- UI-only toggles
- Global app configuration that does not come from the server

Query organization guidelines:

- Domain modules should own their query functions and query keys.
- Query keys should include organization context when data is organization-scoped.
- Mutation success should invalidate the smallest useful set of related queries.
- Avoid broad invalidation when a narrow invalidation is practical.

Example future ownership:

```txt
src/modules/properties/queries.ts
src/modules/tenants/queries.ts
src/modules/billing/queries.ts
```

This is guidance only. Do not create these files until implementation begins.

## React Hook Form and Zod Usage

React Hook Form should manage form state.

Zod should define validation schemas for form input and domain input boundaries.

Use React Hook Form for:

- Property forms
- Unit forms
- Tenant forms
- Lease forms
- Invoice forms
- Payment forms
- Maintenance ticket forms

Use Zod for:

- Required fields
- Status value validation
- Money amount validation
- Date validation
- Phone number validation after normalization rules are defined
- Form-level validation, such as payment amount not exceeding remaining invoice balance

Guidelines:

- Keep schemas close to the module that owns the form.
- Avoid placing domain-specific schemas in `shared/`.
- Shared schemas are acceptable only for truly generic primitives, such as normalized phone input, currency amount, or date helpers used by multiple modules.
- Do not use `any` for form values unless there is a documented reason.

## App Initialization Layers

The app should grow in layers.

Recommended order when implementation begins:

1. App provider composition
2. Supabase client wrapper
3. TanStack Query client/provider
4. Routing decision and router setup
5. Basic layout shell
6. First domain module implementation

### Providers

Providers should live under `src/app/providers/` when introduced.

Possible providers:

- React strict mode at root
- TanStack Query provider
- Auth/session provider if needed later
- Theme provider only if a real theme system is introduced

### Routing

Routing is not implemented yet.

When routing is introduced:

- Keep route definitions centralized enough to understand the app structure.
- Route pages may compose domain module components.
- Avoid putting domain rules inside route files.
- Do not add a routing library until the routing approach is chosen and approved.

### Supabase Client

The Supabase client is not implemented yet.

When introduced:

- Read values from environment variables.
- Use `.env.example` only for placeholder variable names.
- Do not commit real Supabase keys beyond public anon key examples intended for the client.
- Keep the client wrapper small.
- Do not hide domain-specific query logic inside the client wrapper.

### Query Client

The query client should be configured once near the app root.

Domain modules should use TanStack Query through their own query functions/hooks when implementation begins.

## Data Model Decisions That Affect Architecture

The following decisions should guide future implementation:

1. Unit names are unique within a property.
2. Tenant phone numbers are normalized but not unique in the MVP.
3. `billing_period` uses the first day of the month as a date, for example `2026-05-01`.
4. Invoice totals are stored on invoices and calculated from line items, with consistency validation.
5. Utility readings may optionally link to invoice line items later, but this is not mandatory for initial implementation.
6. Draft invoices may have no `issued_at` value. Issued invoices should have `issued_at`.
7. Cancelled records should use both `status = cancelled` and nullable `cancelled_at` where useful.
8. `updated_at` should be maintained by database trigger when migrations are introduced.
9. Unit type uses a constrained list: `room`, `house`, `apartment`, `studio`, `other`.
10. `identity_number` is deferred for MVP. Use optional `identity_notes` instead.

These decisions should be reflected in future data model and implementation tasks before migrations are created.

## Agent-Based Development Guidance

Hermes should work in small, reviewable steps.

Good architecture workflow:

1. Update source-of-truth documentation first.
2. Confirm domain and data model decisions.
3. Implement one small infrastructure layer at a time.
4. Run validation commands after code changes.
5. Avoid hidden broad rewrites.
6. Avoid implementing multiple features in one task.

Recommended implementation sequence after documentation approval:

1. Confirm data model decisions in `docs/04-data-model-draft.md`.
2. Draft RLS strategy documentation.
3. Add app provider structure.
4. Add Supabase client wrapper.
5. Add TanStack Query provider.
6. Decide routing approach.
7. Add basic app shell.
8. Start the first domain module with properties and units.

Do not create database migrations before the data model draft and RLS strategy are approved.

## Explicit Non-Goals

Do not add these to the MVP architecture:

- Microservices
- A custom backend framework
- Redux
- Zustand
- Payment gateway integration
- Marketplace features
- WhatsApp Business API automation
- Enterprise permission system
- Complex accounting ledger
- Vendor/work-order management
- Native mobile architecture

These may be reconsidered later only if there is a clear product need and an approved architecture decision.

## Remaining Architecture Decisions

These decisions can be made later, before implementation reaches the relevant area:

1. Which routing approach/library should be used?
2. What exact app shell layout should be used after the documentation baseline is approved?
3. Should Supabase query functions use direct client calls per module, or a small shared helper for common response handling?
4. How should query keys be standardized across modules?
5. How should form error messages be written for Indonesian users?
6. Where should phone normalization helpers live: `shared/utils`, `shared/lib`, or the tenants module with shared export later?
7. Should dashboard queries be direct read queries, database views, or RPC functions later?
8. What exact RLS policy patterns should be used for organization-scoped tables?
9. Should cancelled-record filtering be handled in every module query, shared query helpers, or database views later?
10. Should invoice total consistency be enforced with application validation only at first, or with database triggers/functions when migrations are introduced?
