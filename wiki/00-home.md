# RuangRapi Wiki

RuangRapi is a property rental operations SaaS for Indonesian rental owners and small property managers. It is designed for owners of kos, kontrakan, apartment units, small portfolios, and ruko-style rentals who need a practical operating system for properties, units, tenants, leases, billing, payments, reminders, maintenance, and reporting.

## Current project status

- Foundation: built
- Properties module: MVP baseline complete
- Units module: MVP baseline complete
- Tenants module: MVP baseline complete
- Next recommended module: Leases planning

## How this wiki should be used

This wiki is the product operating brain.

It owns:

- business goals
- product strategy
- roadmap
- epics
- user stories
- task candidates
- built / not-built / deferred status
- decision summaries

The repo docs remain the implementation truth.

Repo docs own:

- implementation constraints
- schema and RLS details
- validation checklists
- exact file and route decisions
- Hermes agent rules
- codebase-specific architecture details

## Operating workflow

[[development-workflow]]

```txt
Wiki creates task candidates
Kanban turns candidates into approved task cards
Hermes executes only approved task cards
Repo docs define implementation constraints
```

## Key sections

- [[vision]]
- [[mission]]
- [[product-overview]]
- [[mvp-scope]]
- [[domain-map]]
- [[mvp-epics]]
- [[task-index]]
- [[development-workflow]]
- [[decision-log]]
- [[built]]
- [[not-built]]
- [[deferred]]
- [[risks]]

## Next recommended step

Plan the [[leases]] module before implementation.
