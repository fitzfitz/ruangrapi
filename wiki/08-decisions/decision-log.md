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
- Tenants should be planned before Leases.

## Related pages

- [[product-decisions]]
- [[technical-decisions]]
