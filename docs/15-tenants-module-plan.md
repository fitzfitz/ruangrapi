# Tenants Module Plan

## Status

Status: approved for sliced implementation.

This document plans the Tenants MVP baseline. It does not implement source code, create migrations, alter RLS policies, or introduce lease behavior.

## Purpose

Tenants are renter/contact records owned by an organization. A tenant can exist before a lease is created. Leases will later connect tenants to units; Tenants must not directly assign renters to units.

## Approved Scope

The Tenants MVP baseline includes:

- Top-level Tenants navigation.
- `/dashboard/tenants` read-only list.
- `/dashboard/tenants/new` create flow.
- `/dashboard/tenants/:tenantId/edit` edit flow.
- Tenant type, form schema, repository functions, query hooks, and mutation hooks.
- Manual validation checklist.
- Closeout documentation and wiki updates.

## Existing Schema

The existing `tenants` table has:

- `id`
- `organization_id`
- `full_name`
- `phone`
- `email`
- `identity_notes`
- `emergency_contact_name`
- `emergency_contact_phone`
- `notes`
- `created_at`
- `updated_at`

No migration is expected for this module.

## Validation Rules

- `full_name` is required and cannot be blank after trimming.
- `email` is optional and must be valid when present.
- `phone` is optional.
- `emergency_contact_phone` is optional.
- Optional text fields save as `null` when blank.

Phone normalization to Indonesian `+62` format is deferred. This keeps the first Tenants baseline focused and avoids creating a partial normalization rule without dedicated validation. Revisit phone normalization before Leases relies on tenant contact data for reminders or billing workflows.

## Routes

- `/dashboard/tenants`
- `/dashboard/tenants/new`
- `/dashboard/tenants/:tenantId/edit`

All routes use the existing dashboard `RouteAccessGate`.

## Module Shape

```txt
src/modules/tenants/
  application/
  domain/
  infrastructure/
  presentation/
  index.ts
```

## Query and Mutation Strategy

- List query key: `['tenants']`.
- Detail query key: `['tenants', tenantId]`.
- Create mutation invalidates `['tenants']`.
- Update mutation invalidates `['tenants']` and `['tenants', tenantId]`.
- Supabase RLS remains the organization boundary.

## Deferred Work

The Tenants module does not include:

- Lease assignment.
- Direct tenant-to-unit assignment.
- Occupancy status.
- Delete or archive.
- Billing, payment, receipt, reminder, or maintenance status.
- Tenant portal or tenant authentication.
- Identity number storage.
- Document uploads.
- Schema or RLS migrations.

## Next Module

After Tenants closeout, the next recommended epic is Leases MVP Baseline, starting with Leases module planning and a read-only Leases list.
