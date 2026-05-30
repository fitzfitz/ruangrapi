# Decision Log

## Current decisions

- Use modular monolith with DDD-lite.
- Use Supabase RLS as data access safety boundary.
- Use Hermes only for approved small task cards.
- Do not allow Hermes to auto-commit.
- Do not create risky migrations without owner approval.
- Properties hard delete is deferred; prefer archive/inactive later.
- Units are child records under Properties.
- Unit detail page is deferred.
- Unit status/occupancy workflow is deferred.
- Unit base_rent_amount/rent pricing workflow is deferred.
- Tenants were built before Leases.
- Leases MVP baseline is complete.
- Lease edit, end, cancel, occupancy/status synchronization, invoice generation, deposit ledger, and contract files remain deferred.
- Billing / Invoices planning is the next recommended module.

## Related pages

- [[product-decisions]]
- [[technical-decisions]]
