# RuangRapi

RuangRapi is a property rental operations SaaS for Indonesian rental property owners who manage kos, kontrakan, apartments, or small rental portfolios.

The MVP focuses on helping owners manage:

- Properties and units
- Tenants
- Lease periods
- Monthly billing
- Payment tracking
- Receipts
- WhatsApp reminder preparation
- Utility readings
- Maintenance tickets
- Basic dashboard reporting

## Product Positioning

RuangRapi is not a marketplace.

It is an operations system for rental owners who already have tenants and need a simple way to manage recurring rental administration.

## Target Users

Primary users:

- Kos owners
- Kontrakan owners
- Small apartment rental operators
- Small family-owned rental portfolios
- Property admins handling monthly rent collection

## MVP Goal

The first MVP should help a property owner answer:

1. Which units are occupied or vacant?
2. Who is renting each unit?
3. Which tenants need to pay this month?
4. Which invoices are unpaid, partially paid, or paid?
5. Can I generate a simple payment receipt?
6. Can I prepare WhatsApp reminders?
7. Are there open maintenance issues?
8. What is my expected vs collected monthly rent?

## Tech Stack

Frontend:

- React
- TypeScript
- Vite
- TanStack Query
- React Hook Form
- Zod

Backend / Data:

- Supabase
- PostgreSQL
- Supabase Auth
- Supabase Row Level Security

Architecture:

- Modular monolith
- Domain-Driven Design-lite
- Feature/domain-oriented frontend modules
- Source-of-truth documentation before implementation

## Development Principle

Do not build features before the domain language, boundaries, and data model drafts are clear.

RuangRapi should be developed in small, reviewable steps using agent-assisted development with Hermes Agent.

## Current Status

Project initialization phase.

No production features should be implemented until the documentation baseline is approved.

## Repository Rules

See `HERMES.md` for agent rules and development workflow.

See `docs/` for product, architecture, domain, and implementation notes.