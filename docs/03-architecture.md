# Architecture

## Architecture Style

RuangRapi uses a modular monolith architecture with Domain-Driven Design-lite.

The goal is to keep the system simple while making domain boundaries clear.

## Why Modular Monolith

A modular monolith is preferred because:

- The MVP is still early
- The product domain is not fully validated
- The team is small
- Supabase already provides backend capabilities
- Microservices would add unnecessary operational complexity

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