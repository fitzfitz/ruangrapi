# Technical Decisions

## Architecture

Use a modular monolith with DDD-lite organization.

## Frontend stack

- React
- TypeScript
- Vite
- TanStack Query
- React Hook Form
- Zod

## Backend/data

- Supabase
- PostgreSQL
- Supabase RLS

## Agent workflow

- Hermes executes approved task cards only.
- No auto-commit.
- Validate each slice.
- Owner manually reviews and commits.

## Source of truth

Wiki owns high-level product/business/development planning.

Repo docs own implementation-specific truth:

- schema/RLS rules
- exact validation checklists
- architecture constraints
- agent instructions
- codebase behavior
