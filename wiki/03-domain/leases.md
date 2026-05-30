# Leases

Leases connect Tenants to rental agreements for Properties or Units.

## Current status

Leases status: MVP baseline complete.

## Future purpose

A Lease should represent an agreement such as:

```txt
Tenant rents Unit X
from start_date to end_date
with agreed rent terms
under an active/cancelled/ended lifecycle
```

## Expected future relationships

- tenant
- property
- unit, if applicable
- rent terms
- lease dates
- status

## Built

- plan Leases module
- read-only Leases list
- create Lease flow
- validation checklist
- Leases module closeout

## Deferred

- lease edit
- end lease
- cancel lease
- occupancy/status synchronization
- invoice generation
- deposit ledger
- contract files and document uploads

## Next recommended module

Billing / Invoices planning.

## Related pages

- [[tenants]]
- [[units]]
- [[billing]]
