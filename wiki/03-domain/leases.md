# Leases

Leases connect Tenants to rental agreements for Properties or Units.

## Current status

Not started.

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

## Out of scope until Tenants are stable

- lease creation
- lease lifecycle
- rent terms
- deposits
- occupancy logic
- billing generation

## Related pages

- [[tenants]]
- [[units]]
- [[billing]]
