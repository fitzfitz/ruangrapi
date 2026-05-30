# Product Decisions

## Properties

- Properties MVP baseline includes list, create, detail, edit.
- Hard delete is not part of MVP.
- Future archive/inactive flow is preferred.

## Units

- Units are managed under Property detail context.
- Current Units UI supports name, type, notes.
- Unit detail page is deferred.
- Unit status/occupancy workflow is deferred.
- Unit base rent/rent-pricing workflow is deferred.
- No top-level Units navigation yet.

## Tenants

- Tenants should be built before Leases.
- Tenants are reusable renter/contact records.
- Tenant-to-Unit relationship should be introduced through Leases later.

## Leases

- Leases should connect Tenants to Properties/Units and agreement terms.
- Leases should not start until Tenants are stable.
