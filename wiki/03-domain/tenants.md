# Tenants

Tenants are renter/contact records.

A Tenant can exist before a Lease is created. Tenants should later connect to Units through Leases, not through direct assignment in the first slice.

## Current status

Not started. Recommended next module.

## Purpose

Tenants represent people or organizations that rent or may rent a unit.

## Suggested MVP fields

These should be confirmed against the existing schema before implementation:

- name
- phone
- email, if supported
- notes, if supported
- created_at / updated_at, if supported

## First recommended slice

Read-only Tenants list, organization-scoped.

Suggested route:

- `/dashboard/tenants`

## Out of scope for first slice

- create tenant
- edit tenant
- delete/archive tenant
- lease assignment
- unit assignment
- billing/payment status
- maintenance
- tenant portal
- identity documents/files

## Decision

Tenants should be built before Leases because Leases need Tenant records to attach to.

## Related pages

- [[leases]]
- [[not-built]]
- [[task-index]]
