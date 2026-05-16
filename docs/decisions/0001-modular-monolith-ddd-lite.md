# ADR 0001: Use Modular Monolith with DDD-lite

## Status

Accepted

## Context

RuangRapi is an early-stage SaaS MVP for Indonesian rental property operations.

The product needs to move quickly while preserving clear domain boundaries.

The main domains include:

- Properties
- Units
- Tenants
- Leases
- Billing
- Payments
- Receipts
- Reminders
- Utilities
- Maintenance
- Dashboard reporting

## Decision

Use a modular monolith architecture with Domain-Driven Design-lite.

The frontend will be organized around domain modules.

The backend will initially rely on Supabase and PostgreSQL.

## Why Not Microservices

Microservices are not appropriate for the MVP because:

- The team is small
- The domain is still evolving
- Operational complexity would increase
- Supabase already provides backend infrastructure
- Clear module boundaries are enough at this stage

## Consequences

Positive:

- Faster development
- Lower operational complexity
- Clear domain boundaries
- Easier agent-assisted development
- Easier refactoring later

Negative:

- Requires discipline to avoid module coupling
- Some boundaries are convention-based
- Future extraction may require refactoring

## Rule

Do not split into services until there is a proven scaling, ownership, deployment, or performance need.
