# Properties

Properties are the top-level rental assets managed by an organization.

Examples:

- kos building
- kontrakan
- apartment rental
- ruko
- small rental portfolio property

## Current status

MVP baseline complete.

## Current routes

- `/dashboard/properties`
- `/dashboard/properties/new`
- `/dashboard/properties/:propertyId`
- `/dashboard/properties/:propertyId/edit`

## Supported fields

- name
- address
- notes

## Current capabilities

- list properties
- create property
- view property detail
- edit property

## Deferred

- hard delete
- archive/inactive flow
- images/files
- search/filter/pagination
- advanced address/location fields
- import/export

## Decision summary

Hard delete should not be implemented for the MVP. A future archive/inactive approach is preferred to preserve operational history.

## Related pages

- [[units]]
- [[built]]
- [[deferred]]
