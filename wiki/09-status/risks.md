# Risks

## Scope creep

Risk: jumping from Tenants directly into Leases, Billing, Payments, and Dashboard metrics before each module is stable.

Mitigation:

- one small task at a time
- explicit out-of-scope boundaries
- closeout notes before moving modules

## Schema/RLS changes without approval

Risk: agents create migrations or alter RLS too early.

Mitigation:

- migrations require owner approval
- read `docs/07-rls-strategy.md` before RLS work
- validate migration scope explicitly

## Agent executes unapproved work

Risk: Hermes implements from wiki ideas instead of approved task cards.

Mitigation:

- Wiki creates candidates only
- Kanban approval required
- Hermes executes approved cards only

## Duplicated truth

Risk: wiki and repo docs drift.

Mitigation:

- wiki summarizes high-level product direction
- repo docs remain implementation truth
- use relative links to repo docs when useful

## Dashboard too early

Risk: dashboard metrics become decorative without leases, invoices, and payments.

Mitigation:

- build operational records first
- dashboard/reporting later
