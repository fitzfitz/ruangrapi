# Agent Workflow

This project uses Hermes Agent for agent-assisted development.

## Workflow Principle

Hermes should work like a careful pair programmer.

Small steps are preferred.

## Standard Task Flow

For every task, Hermes should:

1. Read `README.md`
2. Read `HERMES.md`
3. Read relevant docs in `docs/`
4. Explain intended changes
5. Modify the smallest useful set of files
6. Run validation commands if applicable
7. Summarize what changed
8. Suggest the next small step

## Task Size

A good Hermes task should take one focused step.

Good examples:

- Create documentation baseline
- Configure Prettier
- Configure Supabase client placeholder
- Add app provider shell
- Draft property module structure
- Add property type definitions

Bad examples:

- Build the whole MVP
- Create all pages and database tables
- Implement billing and payments together
- Add authentication, dashboard, and maintenance in one run

## Commit Style

Use clear commits:

```txt
docs: add product brief
docs: define domain model draft
chore: initialize project tooling
chore: configure app providers
feat(properties): add property type schema