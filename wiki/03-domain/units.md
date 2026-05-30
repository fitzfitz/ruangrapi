# Units

Units are rentable spaces under a Property.

Examples:

- kos room
- apartment unit
- house unit
- ruko/shop unit
- space or floor inside a property

## Current status

MVP baseline complete.

## Current routes

- Units section inside `/dashboard/properties/:propertyId`
- `/dashboard/properties/:propertyId/units/new`
- `/dashboard/properties/:propertyId/units/:unitId/edit`

## Supported fields

- name
- type
- notes

## Allowed type values

- room
- house
- apartment
- studio
- other

## Current capabilities

- view units under a property
- create unit under a property
- edit unit under a property

## Deferred

- standalone Unit detail page
- status/occupancy workflow
- base_rent_amount/rent-pricing workflow
- delete/archive/status-management
- top-level Units navigation
- tenants, leases, billing, payments, maintenance, reporting

## Decision summary

Unit detail page is deferred because current Unit fields are minimal. Unit status and rent pricing are also deferred because they connect to occupancy, leases, and billing.

## Related pages

- [[properties]]
- [[leases]]
- [[deferred]]
