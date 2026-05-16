# HERMES.md

This file defines how Hermes Agent should work inside the RuangRapi repository.

Hermes must treat this file as the highest-priority project instruction, after direct user instructions.

## Project Name

RuangRapi

## Product Summary

RuangRapi is a SaaS for Indonesian rental property owners managing kos, kontrakan, apartments, and small rental portfolios.

The MVP helps owners manage properties, units, tenants, leases, monthly billing, payments, receipts, WhatsApp reminders, utility readings, maintenance tickets, and dashboard reporting.

## Current Development Phase

The project is in initialization phase.

Hermes must not jump directly into feature implementation.

The first priority is:

1. Repository setup
2. Source-of-truth documentation
3. Architecture baseline
4. Domain model draft
5. Data model draft
6. RLS strategy
7. Development workflow
8. Only then, small implementation tasks

## Required Documentation Reading

For repository-level work, Hermes must read the relevant source-of-truth documentation before changing files:

1. `README.md`
2. `HERMES.md`
3. `docs/00-product-brief.md`
4. `docs/01-mvp-scope.md`
5. `docs/02-domain-model.md`
6. `docs/03-architecture.md`
7. `docs/04-data-model-draft.md`
8. `docs/05-agent-workflow.md`
9. `docs/06-development-checklist.md`
10. `docs/07-rls-strategy.md`
11. Relevant ADRs in `docs/decisions/`

Hermes must also follow `docs/05-agent-workflow.md` for task flow and validation expectations.

## Tech Stack

Use only the approved stack unless the user explicitly approves changes.

Frontend:

- React
- TypeScript
- Vite
- TanStack Query
- React Hook Form
- Zod

Backend / Database:

- Supabase
- PostgreSQL
- Supabase Auth
- Supabase Row Level Security

Architecture:

- Modular monolith
- Domain-Driven Design-lite
- Domain-oriented modules
- Clear boundaries between modules
- No premature microservices

## Agent Behavior Rules

Hermes must:

- Work in small steps
- Explain the purpose of each change
- Prefer simple, boring, maintainable solutions
- Ask before adding new dependencies
- Keep files organized by domain/module
- Update documentation when architectural decisions change
- Avoid large hidden rewrites
- Avoid implementing multiple features in one task
- Avoid speculative abstractions
- Avoid building screens before the domain model is clear

Hermes must not:

- Implement the whole MVP in one run
- Create database migrations before the data model draft and RLS strategy are approved
- Add backend frameworks outside Supabase without approval
- Add state management libraries unless justified
- Use `any` in TypeScript unless there is a documented reason
- Ignore TypeScript errors
- Ignore lint errors
- Store secrets in committed files
- Modify environment files containing real secrets
- Change the product scope without updating docs

## Supabase, RLS, SQL, Schema, and Migration Rules

Before any Supabase, RLS, SQL, schema, or migration-related task, Hermes must read:

- `docs/04-data-model-draft.md`
- `docs/07-rls-strategy.md`
- `docs/03-architecture.md`
- `docs/06-development-checklist.md`

Migration gate:

1. `docs/04-data-model-draft.md` reviewed
2. `docs/07-rls-strategy.md` reviewed
3. Remaining data model questions resolved
4. Remaining RLS questions resolved
5. Owner approval received

Only after this gate may Hermes create migrations, SQL files, SQL policies, or schema changes.

Until then, database work must remain planning documentation only.

## Environment Safety Rules

- Never commit real secrets.
- Keep `.env.local` local only.
- Keep `.env.example` limited to placeholder variable names and safe example values.
- Do not modify environment files that may contain real secrets.
- If environment variables are needed, document placeholders in `.env.example` and tell the owner what local values to set.

## Validation Expectations

- Documentation tasks should run `git diff --check` when appropriate.
- Source, TypeScript, React, Vite, or tooling tasks should run `npm run build` and `npm run lint` when applicable.
- If a validation script does not exist, report that instead of inventing a replacement.
- Before final response, check changed files when useful to confirm the task stayed in scope.

## Domain-Driven Design-lite Rules

Use DDD-lite pragmatically.

This project should use domain language clearly, but avoid over-engineering.

Preferred terms:

- Property
- Unit
- Tenant
- Lease
- Billing Period
- Invoice
- Payment
- Receipt
- Utility Reading
- Maintenance Ticket
- Reminder
- Owner
- Organization

Avoid vague terms:

- Item
- Data
- Record
- Thing
- Object
- Manager

Each domain module should eventually contain:

- Types
- Schemas
- API/query functions
- UI components
- Forms
- Domain-specific utilities

Do not create these folders until needed.

## Planned Domain Modules

Initial domain modules:

1. identity
2. properties
3. units
4. tenants
5. leases
6. billing
7. payments
8. receipts
9. reminders
10. utilities
11. maintenance
12. dashboard

## Suggested Future Source Structure

This is the target structure, not necessarily the initial structure:

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
