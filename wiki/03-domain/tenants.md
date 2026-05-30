# Tenants

Tenants are renter/contact records.

A Tenant can exist before a Lease is created. Tenants should later connect to Units through Leases, not through direct assignment in the first slice.

## Current status

MVP baseline complete.

## Purpose

Tenants represent people or organizations that rent or may rent a unit.

## MVP fields

- full name
- phone
- email
- identity notes
- emergency contact name
- emergency contact phone
- notes
- created_at / updated_at

## Built baseline

Routes:

- `/dashboard/tenants`
- `/dashboard/tenants/new`
- `/dashboard/tenants/:tenantId/edit`

Built:

- read-only Tenants list
- create Tenant flow
- edit Tenant flow

## Deferred

- delete/archive tenant
- lease assignment
- unit assignment
- billing/payment status
- maintenance
- tenant portal
- identity documents/files

## Decision

Tenants were built before Leases because Leases need Tenant records to attach to.
The next recommended module is Leases planning.

## Related pages

- [[leases]]
- [[not-built]]
- [[task-index]]
