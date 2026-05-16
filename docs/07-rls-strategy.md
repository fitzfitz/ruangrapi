# RLS Strategy

This document describes the high-level Supabase Row Level Security strategy for the RuangRapi MVP.

It is planning documentation only. It does not define SQL policies, database migrations, or implementation code.

Do not create Supabase migrations until this strategy and `docs/04-data-model-draft.md` are reviewed and approved.

## Purpose

RuangRapi stores rental operations data for Indonesian property owners and small property admin teams.

The MVP needs simple and reliable data isolation:

- A user should only access data for their own organization.
- Business records should be scoped by `organization_id`.
- Supabase Auth should identify the signed-in user.
- The `profiles` table should connect the signed-in user to one organization.
- RLS policies should enforce the organization boundary in the database.

The goal is practical multi-tenant safety for a solo founder building an MVP, not a complex enterprise permission system.

## MVP Access Model

The MVP uses a simple organization-based model.

```txt
auth.users
  └─ profiles
      └─ organizations
          ├─ properties
          ├─ units
          ├─ tenants
          ├─ leases
          ├─ invoices
          ├─ invoice_line_items
          ├─ payments
          ├─ receipts
          ├─ utility_readings
          ├─ maintenance_tickets
          └─ reminders
```

Access rule in plain language:

A signed-in user can access an organization-scoped row only when the row's `organization_id` matches the user's `profiles.organization_id`.

For MVP:

- Each user belongs to one organization through `profiles.organization_id`.
- Multi-organization membership is out of scope for the MVP.
- Enterprise role and permission tables are out of scope for the MVP.
- Owner/admin role differences should stay simple and can initially behave the same unless a later owner-approved decision says otherwise.

## Role of Core Identity Tables

### auth.users

`auth.users` is managed by Supabase Auth.

Responsibilities:

- Store the authenticated user identity.
- Provide the current user id during authenticated requests.
- Act as the source identity for `profiles.id`.

Planning rules:

- Application code should not treat renter/tenant records as auth users in the MVP.
- Tenant mobile app access is out of scope for the MVP.

### profiles

`profiles` represents an application user profile connected to Supabase Auth.

Responsibilities:

- Use `id` corresponding to the Supabase Auth user id.
- Store `organization_id` for the user's organization.
- Store simple user display fields such as `full_name`.
- Store simple MVP role information such as `owner` or `admin`.

Planning rules:

- `profiles.organization_id` is the key lookup used by organization-scoped RLS policies.
- A user should not be able to read or write rows for another organization.
- Role differences should not become an enterprise permission system in the MVP.

### organizations

`organizations` represents the business account that owns the data.

Examples:

- An individual kos owner.
- A family rental business.
- A small property admin team.

Responsibilities:

- Act as the tenant boundary for business data.
- Own properties, units, tenants, leases, invoices, payments, receipts, reminders, utility readings, maintenance tickets, and dashboard data.

Planning rules:

- `organizations` does not need its own `organization_id` because it is the boundary.
- A user should only access the organization referenced by their profile.

### organization_id

`organization_id` is the shared business boundary field.

Responsibilities:

- Scope business records to one organization.
- Support RLS checks.
- Support organization-specific listing, filtering, reporting, and indexes.

Planning rules:

- Most business tables should include `organization_id`.
- Foreign-key relationships should stay within the same organization.
- Application queries should still filter by organization where useful, but RLS is the required safety boundary.

## Organization-Scoped Tables

These tables should be organization-scoped in the MVP:

- `profiles`
- `properties`
- `units`
- `tenants`
- `leases`
- `invoices`
- `invoice_line_items`
- `payments`
- `receipts`
- `utility_readings`
- `maintenance_tickets`
- `reminders`

The `organizations` table is the organization boundary itself and should be accessible only to users whose profile belongs to that organization.

## Planning-Level Policy Pattern

This section intentionally does not write SQL.

At a planning level, organization-scoped table policies should follow this pattern:

1. Find the current authenticated user.
2. Find that user's profile.
3. Compare `profiles.organization_id` with the row's `organization_id`.
4. Allow access only when the values match.

Plain-language rule:

- If `row.organization_id = current_user_profile.organization_id`, access may be allowed.
- If the values do not match, access must be denied.

This pattern should apply consistently across organization-scoped tables before migrations are created.

## Expected Access Rules by Operation

### SELECT

Users should be able to read rows for their own organization only.

Examples:

- A user can list properties where `properties.organization_id` matches their profile organization.
- A user can view invoices, payments, receipts, and reminders for their organization.
- A user cannot view another organization's tenants, units, invoices, payments, or reports.

Normal application views should hide cancelled records by default where appropriate, but RLS should focus on organization isolation rather than view filtering.

### INSERT

Users should be able to create rows only for their own organization.

Planning expectations:

- Inserted rows must use the user's profile organization.
- A user should not be able to insert a row into another organization by manually changing `organization_id`.
- Related rows should belong to the same organization.

Examples:

- A unit must belong to a property in the same organization.
- A lease must reference a tenant and unit in the same organization.
- An invoice must reference a lease, tenant, and unit in the same organization.
- A payment must reference an invoice in the same organization.
- A receipt must reference a payment in the same organization.

### UPDATE

Users should be able to update rows for their own organization only.

Planning expectations:

- Updates must not move a business row into another organization.
- Related row changes must stay within the same organization.
- Application validation should enforce MVP workflow rules before save.

MVP workflow notes:

- Invoice total consistency should start with application validation.
- Database enforcement for invoice total consistency can be planned later.
- Payments should be editable before receipt generation.
- After receipt generation, direct payment edits should be avoided.
- A separate correction workflow can be added later if the product needs it.

### DELETE

DELETE policies should be conservative in the MVP.

Planning expectations:

- Physical delete is allowed only for setup mistakes before dependent business history exists.
- Any allowed delete must still be limited to the user's own organization.
- Historical records that affect invoices, payments, receipts, reminders, leases, utility readings, maintenance tickets, or reporting should be preserved.
- Once dependent business history exists, application workflows should prefer status-based preservation such as `inactive`, `cancelled`, `ended`, or `resolved`.

Practical MVP guidance:

- Property: delete only if no units or history exist.
- Unit: delete only if no leases, invoices, tickets, or readings exist.
- Tenant: delete only if no lease or payment history exists.
- Lease: prefer `ended` or `cancelled`.
- Invoice: prefer `cancelled`.
- Payment: avoid delete after receipt generation.
- Receipt: do not delete in normal flow.
- Maintenance ticket: prefer `cancelled` or `resolved`.
- Reminder: can cancel or archive.

MVP cancellation note:

`cancelled_at` should exist only where useful for the MVP:

- `leases`
- `invoices`
- `maintenance_tickets`
- `reminders`

Other tables should not automatically receive `cancelled_at` unless a later owner-approved data model update says so.

## MVP Data Decisions Affecting RLS and Policy Planning

These owner-approved decisions should guide later migration and policy work:

1. Receipt numbers should be organization-scoped using the format `RR-{YYYY}-{0001}`, for example `RR-2026-0001`.
2. Utility readings should allow only one active reading per unit, billing period, and utility type for MVP. Corrections edit the same reading.
3. `cancelled_at` should exist only where useful for MVP: `leases`, `invoices`, `maintenance_tickets`, and `reminders`.
4. Physical delete is allowed only for setup mistakes before dependent business history exists; historical records should use status preservation where supported.
5. Invoice total consistency should start with application validation. Database enforcement can be planned later.
6. RLS should use organization-scoped policies through `profiles.organization_id`.
7. Users can access organization-scoped rows only when `row.organization_id` matches their `profiles.organization_id`.
8. Payments should be editable before receipt generation. After receipt generation, direct payment edits should be avoided. A correction workflow can be added later.

## Table-Specific Notes

### profiles

A user should be able to access their own profile.

For MVP planning, profile access should stay simple:

- Users can read their own profile.
- Users should not read profiles from other organizations unless an owner-approved admin workflow requires it later.
- Profile creation/update workflows need careful planning because profiles connect auth users to organizations.

### organizations

Users should only access the organization connected to their profile.

The MVP does not need organization hierarchy, multi-organization switching, or enterprise account management.

### properties, units, and tenants

These are core operational records.

Access should be limited by `organization_id` for select, insert, update, and any allowed delete.

Cross-organization references must not be allowed:

- A unit cannot reference a property from another organization.
- A tenant record belongs to exactly one organization in the MVP.

### leases

Leases connect tenants and units.

RLS should limit leases to the user's organization, and later database constraints should ensure referenced tenant and unit records belong to the same organization.

Cancelled leases should be preserved and should use `cancelled_at`.

### invoices and invoice_line_items

Invoices and line items are organization-scoped billing records.

RLS should limit access by `organization_id`.

Application validation should initially ensure:

- Invoice line item totals are correct.
- Stored invoice totals match line items.
- Non-cancelled duplicate invoices are avoided for the same lease and billing period.

Database enforcement can be planned later after the strategy and data model are reviewed.

### payments and receipts

Payments and receipts are organization-scoped financial records.

RLS should limit access by `organization_id`.

MVP workflow expectations:

- Payment records are manually entered.
- A receipt belongs to one payment.
- Receipt numbers are unique within an organization using `RR-{YYYY}-{0001}`.
- Payments can be edited before receipt generation.
- After receipt generation, direct payment edits should be avoided.
- A correction workflow is future scope.

### utility_readings

Utility readings are organization-scoped operational records.

MVP rule:

- Only one active reading should exist per unit, billing period, and utility type.
- Corrections should edit the same reading rather than creating separate correction records.

RLS should limit access by `organization_id`, and later constraints should ensure the referenced unit belongs to the same organization.

### maintenance_tickets

Maintenance tickets are organization-scoped operational records.

RLS should limit access by `organization_id`.

Cancelled maintenance tickets should be preserved and should use `cancelled_at`.

### reminders

Reminders are organization-scoped prepared communication records.

RLS should limit access by `organization_id`.

The MVP only prepares reminder text and manual WhatsApp links. WhatsApp Business API automation and message webhooks are out of scope.

Cancelled reminders should be preserved and should use `cancelled_at`.

## What RLS Should Not Try to Solve in the MVP

RLS should not become a complex permission engine for the MVP.

Do not add these patterns yet:

- Multi-organization membership.
- Enterprise roles and permission tables.
- Tenant app access.
- Marketplace access patterns.
- Payment gateway access patterns.
- Vendor or work-order access patterns.
- Field-level permission systems.
- Complex owner/admin approval workflows.

If any of these become necessary later, they should be introduced through a reviewed architecture decision and data model update.

## Migration Readiness Gate

Before Supabase migrations are created, the project should review and approve:

1. `docs/04-data-model-draft.md`
2. This RLS strategy document
3. The exact organization-scoped policy pattern
4. The exact profile creation/onboarding flow
5. The table constraints that protect same-organization relationships

No real SQL policies are being written in this document.

No migrations should be created until the data model and RLS strategy are reviewed.

## Remaining RLS Questions

These questions should be answered before writing migrations or SQL policies:

1. How should the first organization and first owner profile be created during signup?
2. Should users be allowed to update their own `profiles.full_name`, or should profile edits be handled through an owner/admin screen later?
3. Should `owner` and `admin` have identical database access in the first MVP, or should any minimal difference exist?
4. What exact policy pattern should be used for `profiles` so users can read their own profile without exposing other organizations?
5. What exact policy pattern should be used for `organizations` so users can read only their own organization?
6. Should receipt number sequencing be generated in application logic first, or through a database-backed sequence/function when migrations are introduced?
7. Should cross-organization relationship protection rely first on application validation plus foreign keys, or should database checks/triggers be planned for critical relationships later?
