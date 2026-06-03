# RuangRapi Wiki

RuangRapi is a property rental operations SaaS for Indonesian rental owners and small property managers. It is designed for owners of kos, kontrakan, apartment units, small portfolios, and ruko-style rentals who need a practical operating system for properties, units, tenants, leases, billing, payments, reminders, maintenance, and reporting.

## Current project status

- Foundation: built
- Properties module: MVP baseline complete
- Units module: MVP baseline complete
- Tenants module: MVP baseline complete
- Leases module: MVP baseline complete
- Billing / Invoices module: MVP baseline complete
- Payments module: MVP baseline implementation and manual validation complete.
- Receipts module: browsing baseline and manual validation complete.
- Reminders module: manual MVP and manual validation complete.
- Maintenance module: MVP baseline and manual validation complete.
- Reporting / Dashboard metrics: first slice built and functionally validated.

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

Choose the next focused MVP gap from the task bucket. Dashboard/reporting UI/UX polish is known but deferred outside the functional validation closeout.
