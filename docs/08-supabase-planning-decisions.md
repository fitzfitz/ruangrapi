# Supabase Planning Decisions

This document records owner-approved answers to the remaining data model and RLS planning questions before Supabase migrations are allowed.

Status: approved for MVP documentation planning.

This is planning documentation only. It does not contain SQL, migration instructions, source code, product features, or implementation steps.

## Decision Summary

| Area       | Question                                      | Approved MVP decision                                                                                                                       | Status   |
| ---------- | --------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------- | -------- |
| Data model | Same-organization relationship protection     | Use application validation plus normal foreign keys first. Add database checks or triggers later only for critical proven needs.            | Approved |
| Data model | Receipt number sequencing                     | Use database-backed receipt sequencing when migrations are introduced, while keeping receipt generation simple in the app.                  | Approved |
| RLS        | First organization and owner profile creation | Create one organization and one owner profile during the initial signup/onboarding flow. Keep one organization per user for MVP.            | Approved |
| RLS        | User profile updates                          | Allow users to update their own `profiles.full_name` only. Do not allow users to change their own `organization_id` or `role`.              | Approved |
| RLS        | Owner/admin access                            | Treat `owner` and `admin` as identical for database access in the MVP. Keep role differences as future product scope.                       | Approved |
| RLS        | `profiles` policy pattern                     | Users can read their own profile. Organization-wide profile access should be deferred unless an owner-approved admin screen needs it later. | Approved |
| RLS        | `organizations` policy pattern                | Users can read only the organization referenced by their own profile.                                                                       | Approved |
| RLS        | Receipt number sequencing                     | Use the same database-backed receipt sequencing decision as the data model decision.                                                        | Approved |
| RLS        | Cross-organization relationship protection    | Use application validation plus foreign keys first. Add database checks or triggers later only for critical proven needs.                   | Approved |

## Approved Decisions

### 1. Same-organization relationship protection

Status: approved.

Use application validation plus normal foreign keys for the initial MVP migrations.

Practical meaning:

- Application workflows should only create or update rows using the current user's organization.
- Normal foreign keys should protect basic record existence.
- RLS should prevent access outside the user's organization.
- Database checks or triggers for same-organization relationships can be added later if critical risks appear.

Reasoning:

- This keeps the first migrations simpler.
- The MVP already scopes business rows by `organization_id`.
- The app can validate that selected related records belong to the same organization before saving.
- More advanced database enforcement can be introduced later without expanding MVP scope now.

### 2. Receipt number sequencing

Status: approved.

Use database-backed receipt sequencing when migrations are introduced.

Practical meaning:

- Receipt numbers remain scoped per organization.
- Receipt numbers keep the format `RR-{YYYY}-{0001}`.
- The app can request receipt creation, but number allocation should be protected by the database to avoid duplicates.
- The exact mechanism should be designed during migration planning, not in this document.

Reasoning:

- Receipt numbers are financial-facing identifiers.
- Duplicate receipt numbers would be confusing and risky.
- Database-backed sequencing is safer than relying only on client-side or application-side counting.
- This does not require complex accounting or a payment gateway.

### 3. First organization and owner profile creation

Status: approved.

Create one organization and one owner profile during the initial signup/onboarding flow.

Practical meaning:

- A new MVP user belongs to exactly one organization.
- The first profile for the organization has role `owner`.
- Multi-organization membership is out of scope.
- Enterprise invitation and permission flows are out of scope.

Reasoning:

- RuangRapi's MVP is designed around a simple organization boundary.
- Single-organization membership keeps RLS easier to reason about.
- The product can support individual owners, family businesses, or small admin teams without enterprise account complexity.

### 4. User profile updates

Status: approved.

Allow users to update their own `profiles.full_name` only.

Practical meaning:

- A user may edit their display name.
- A user must not directly edit their own `organization_id`.
- A user must not directly edit their own `role`.
- Admin profile management can be deferred until the product needs it.

Reasoning:

- Display-name edits are low risk and useful.
- Organization and role fields define access boundaries and should be protected.
- Deferring profile-management screens keeps MVP scope small.

### 5. Owner/admin database access

Status: approved.

Treat `owner` and `admin` as identical for database access in the first MVP.

Practical meaning:

- Both roles can access rows for their organization under the same organization-scoped RLS pattern.
- No enterprise permission tables should be added.
- Any UI-level role differences should be deferred unless explicitly approved later.

Reasoning:

- Existing docs say owner/admin separation should stay simple.
- The main safety boundary is organization isolation, not role hierarchy.
- Adding role-specific database permissions now would increase complexity before there is a proven product need.

### 6. `profiles` access pattern

Status: approved.

Users can read their own profile.

Practical meaning:

- A signed-in user can read the profile whose `id` matches their authenticated user id.
- Users should not read profiles from other organizations by default.
- Organization-wide profile listing can be added later only if an owner-approved admin workflow needs it.
- Profile writes should be limited to safe fields, starting with `full_name`.

Reasoning:

- The profile row is the bridge from Supabase Auth to the organization boundary.
- Keeping profile access narrow reduces accidental exposure.
- This supports the single-organization-per-user MVP without enterprise permissions.

### 7. `organizations` access pattern

Status: approved.

Users can read only the organization referenced by their own profile.

Practical meaning:

- A signed-in user can read their own organization record.
- A user cannot read other organizations.
- Organization updates should be conservative and can be planned later with an owner-approved account settings workflow.

Reasoning:

- `organizations` is the tenant boundary.
- Users need organization details for app context.
- Reading only the user's own organization preserves multi-tenant isolation.

### 8. Cross-organization relationship protection

Status: approved.

Use application validation plus foreign keys first, and plan database checks or triggers later only for critical proven needs.

Practical meaning:

- A unit should reference a property in the same organization.
- A lease should reference a tenant and unit in the same organization.
- An invoice should reference lease, tenant, and unit records in the same organization.
- A payment should reference an invoice in the same organization.
- A receipt should reference a payment in the same organization.
- A maintenance ticket should reference property and optional unit records in the same organization.
- RLS still prevents users from accessing rows outside their organization.

Reasoning:

- Same-organization consistency is important, but the first implementation should stay simple.
- Application validation and RLS cover the normal MVP workflows.
- Database-level relationship hardening can be added after the core flows prove which relationships need stronger protection.

## Migration Gate Impact

The owner approved these decisions for MVP documentation planning. The resolved planning blockers have been reconciled into:

- `docs/04-data-model-draft.md`
- `docs/07-rls-strategy.md`
- `docs/06-development-checklist.md`

Migrations remain locked until a separate owner-approved migration planning task reviews exact SQL, migration files, constraints, and RLS policy implementation.

## Out of Scope

This proposal does not add:

- SQL policies
- Migration files
- Source code
- Product features
- Payment gateway support
- Marketplace features
- Tenant app access
- Enterprise permissions
- Complex accounting workflows
