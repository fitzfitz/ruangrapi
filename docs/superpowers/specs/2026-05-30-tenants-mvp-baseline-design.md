# Tenants MVP Baseline Design

Date: 2026-05-30

## Summary

The next RuangRapi epic is the Tenants MVP baseline.

This epic moves Tenants from not started to MVP baseline complete. It should follow the same sliced execution pattern used for Properties and Units: plan the module first, implement the read-only baseline, add create and edit flows, validate the module, then close it out with documentation and wiki updates.

The recommended execution approach is a full Tenants epic with sliced delivery. This keeps the full module goal visible while preserving the repository workflow of small approved task cards.

## Context

Foundation, Properties, and Units are already built. The wiki and release plan identify Tenants as the next planned module before Leases.

Tenants are renter/contact records owned by an organization. A tenant can exist before a lease is created. Tenants should later connect to Units through Leases, not through direct assignment in this epic.

The existing database schema already includes `tenants` with these fields:

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

No schema or RLS migration is expected for this epic.

## Goal

Give a rental owner a simple organization-scoped place to view, create, and edit tenant contact records so that the later Leases epic can connect tenants to units through rental agreements.

## Non-Goals

This epic must not include:

- Lease assignment.
- Direct tenant-to-unit assignment.
- Occupancy status workflows.
- Tenant delete or archive.
- Billing, payment, receipt, reminder, or maintenance status.
- Tenant portal or tenant authentication.
- Identity number storage.
- Document or file uploads.
- Schema or RLS migrations unless implementation discovers a blocker and owner approval is given.

## Architecture

Add `src/modules/tenants/` using the existing module shape:

```txt
src/modules/tenants/
  application/
  domain/
  infrastructure/
  presentation/
  index.ts
```

The module should mirror the established Properties and Units patterns:

- `domain/` owns the `Tenant` type and create/update validation schemas.
- `infrastructure/` owns Supabase repository functions and query keys.
- `application/` owns TanStack Query hooks and mutation hooks.
- `presentation/` owns the list, create, and edit pages.
- `index.ts` exports only the public module entry points needed by routing.

Add these routes:

- `/dashboard/tenants`
- `/dashboard/tenants/new`
- `/dashboard/tenants/:tenantId/edit`

Promote Tenants from a sidebar coming-soon item to a real navigation link.

Keep organization scoping through the existing `organization_id`, Supabase RLS policies, and current organization context. Do not introduce custom permission logic in frontend code.

## Data Flow

The read-only list should query `tenants` through a repository function and return organization-scoped rows under existing RLS.

The create flow should:

1. Read the current organization context.
2. Validate form input.
3. Insert a tenant row with `organization_id`.
4. Invalidate the tenants list query.
5. Navigate back to the tenants list or another approved tenant destination.

The edit flow should:

1. Load one tenant by id.
2. Show a not-found state if the tenant is unavailable under current access.
3. Validate form input.
4. Update editable tenant fields.
5. Invalidate the tenant detail and tenants list queries.
6. Navigate back to the tenants list or another approved tenant destination.

## Validation Rules

The first Tenants baseline should validate:

- `full_name` is required and cannot be blank after trimming.
- Optional text fields should save as `null` when blank.
- `email` is optional but must be a valid email when present.
- `phone` and `emergency_contact_phone` are optional.

Phone normalization should be decided inside the Tenants planning slice. The product docs prefer Indonesian `+62` normalization before saving, but implementation should only add it in this epic if the rule can be made clear and tested without expanding scope. If normalization is deferred, the closeout must document it as a required refinement before Leases relies on tenant contact data.

## User Experience

The Tenants list should be a straightforward operational screen, not a marketing or dashboard surface.

It should include:

- Title and short context copy.
- Add Tenant action.
- Loading state.
- Error state.
- Empty state.
- Tenant rows or cards with the fields useful for scanning: full name, phone, email, and notes or emergency contact summary when available.
- Edit action for each tenant.

The create and edit pages should follow existing Properties and Units form conventions. They should keep copy focused on renter/contact records and avoid implying lease, billing, payment, or unit assignment behavior.

## Execution Slices

### Slice 1: Plan Tenants Module

Create a Tenants module plan that confirms:

- Scope.
- Existing schema fields.
- Route paths.
- Module folder shape.
- Query and mutation strategy.
- Validation rules.
- Explicitly deferred work.

This slice should not implement UI behavior.

### Slice 2: Read-Only Tenants List

Add:

- Tenant domain type.
- Tenant repository list function.
- Tenants list query hook.
- `/dashboard/tenants` route.
- Sidebar Tenants navigation.
- List, empty, loading, and error states.

Do not add create or edit behavior in this slice.

### Slice 3: Create Tenant Flow

Add:

- Create tenant schema.
- Create tenant repository function.
- Create mutation hook.
- `/dashboard/tenants/new` route.
- Create form page.
- Query invalidation and navigation after success.

Do not add edit, delete, lease assignment, or unit assignment in this slice.

### Slice 4: Edit Tenant Flow

Add:

- Tenant detail query.
- Update tenant schema.
- Update repository function.
- Update mutation hook.
- `/dashboard/tenants/:tenantId/edit` route.
- Edit form page.
- Not-found, loading, error, success, and validation states.

Do not add delete/archive behavior in this slice.

### Slice 5: Validation Checklist

Document the manual validation checklist for the Tenants baseline. It should cover:

- Organization-scoped list loading.
- Empty list state.
- List with tenant data.
- Create success.
- Create validation failures.
- Edit success.
- Edit validation failures.
- Not-found or inaccessible tenant state.
- Route gating.
- Query invalidation after create and edit.
- Confirmation that no lease, unit assignment, billing, payment, receipt, reminder, maintenance, or tenant portal behavior was introduced.

### Slice 6: Closeout and Next-Step Handoff

Close out the Tenants module by updating docs and wiki pages so the project state stays coherent.

Expected closeout updates:

- Add Tenants completion notes to the repo documentation used for development tracking.
- Add or update the Tenants validation checklist.
- Update `wiki/04-roadmap/mvp-epics.md` so Tenants is built after closeout.
- Update `wiki/09-status/built.md` with the Tenants baseline.
- Update `wiki/09-status/not-built.md` to remove or revise Tenants entries.
- Update `wiki/06-task-breakdown/task-index.md`, `wiki/06-task-breakdown/ready-soon.md`, and `wiki/06-task-breakdown/backlog.md` to mark Tenants slices done and promote Leases planning.
- Update `wiki/04-roadmap/release-plan.md` so the next recommended step is Plan Leases module.
- Record deferred Tenants items clearly, including lease assignment, delete/archive, tenant portal, document uploads, and any deferred phone normalization refinement.

The next recommended epic after this closeout is Leases MVP Baseline, starting with Leases module planning and a read-only Leases list.

## Testing and Verification

For implementation slices, run the repository's applicable frontend checks:

- `npm run lint`
- `npm run build`

Documentation-only slices should at minimum run:

- `git diff --check`

Manual validation should be recorded in the relevant checklist or closeout note for each slice.

## Risks

Scope creep is the main risk. Tenants naturally leads to Leases, occupancy, billing, and reminders, but this epic should stop at tenant contact record management.

Documentation drift is the second risk. Because the wiki currently tracks roadmap and status, the closeout slice must update both repo docs and wiki pages before Tenants is considered complete.

Phone normalization is the main product rule that may need clarification. The preferred direction is Indonesian `+62` normalization, but the planning slice should either define an explicit implementation rule or defer it intentionally before create/edit work begins.

## Approval Status

Approved direction:

- Use Approach 2: full Tenants epic with sliced execution.
- Include docs, wiki, and next-step handoff as required closeout work.

This design is ready to become the source for a detailed implementation plan after user review.
