# Development Checklist

## Phase 1: Repository and Documentation

- [x] Initialize Git repository
- [x] Initialize Vite React TypeScript app
- [x] Install approved dependencies
- [x] Create `.env.example`
- [x] Confirm `.env.example` contains placeholders only
- [x] Confirm `.env.local` is ignored and never committed
- [x] Create `README.md`
- [x] Create `HERMES.md`
- [x] Create `docs/` structure
- [x] Create product brief: `docs/00-product-brief.md`
- [x] Create MVP scope: `docs/01-mvp-scope.md`
- [x] Create domain model draft: `docs/02-domain-model.md`
- [x] Create architecture document: `docs/03-architecture.md`
- [x] Create data model draft: `docs/04-data-model-draft.md`
- [x] Create agent workflow document: `docs/05-agent-workflow.md`
- [x] Create development checklist: `docs/06-development-checklist.md`
- [x] Create RLS strategy: `docs/07-rls-strategy.md`
- [x] Create first architecture decision record: `docs/decisions/0001-modular-monolith-ddd-lite.md`

## Phase 2: Tooling Baseline

Phase 2 tooling baseline is complete. Do not start migrations yet.

- [x] Configure formatting
- [x] Configure linting
- [x] Confirm TypeScript strict mode
- [x] Confirm project builds
- [x] Confirm project lints
- [x] Confirm dev server runs

Validation commands for setup/tooling tasks:

```txt
npm run build
npm run lint
git diff --check
git status --short
```

## Phase 3: Supabase Planning

Do not create migrations in this phase. Keep work at planning and review level until the migration gate is complete.

- [ ] Create Supabase project manually
- [ ] Add Supabase env variables locally in `.env.local` only
- [x] Review `docs/04-data-model-draft.md` at documentation-planning level
- [x] Review `docs/07-rls-strategy.md` at documentation-planning level
- [x] Resolve remaining data model questions needed before migration planning
- [x] Resolve remaining RLS questions needed before migration planning
- [x] Record owner-approved MVP Supabase planning decisions in `docs/08-supabase-planning-decisions.md`
- [x] Reconcile approved planning decisions into data model and RLS documentation
- [x] Separately plan exact SQL, migration files, constraints, triggers/functions, and RLS policies
- [x] Get owner approval for the exact migration plan
- [x] Only after separate owner-approved migration planning, create the first Supabase migration
- [x] Locally validate `supabase/migrations/20260516165311_initial_schema.sql` with Supabase CLI
- [x] Create owner-approved onboarding RPC migration: `supabase/migrations/20260516231814_complete_onboarding_rpc.sql`
- [x] Locally validate onboarding RPC migration with Supabase CLI (`supabase db reset`)
- [x] Run focused onboarding RPC behavior tests for anonymous failure, authenticated success, duplicate failure, and post-onboarding RLS

Approved data model planning decisions:

1. Same-organization relationship protection starts with application validation plus normal foreign keys.
2. Database checks or triggers for cross-organization relationship protection are deferred until clearly needed.
3. Receipt number sequencing should be database-backed conceptually to reduce duplicate receipt number risk.

Approved RLS planning decisions:

1. Initial signup/onboarding creates one organization and one owner profile.
2. Users may update their own `profiles.full_name` only.
3. Users may not update their own `organization_id` or `role`.
4. Owner/admin have identical database access for MVP.
5. Profiles and organizations access remains conservative and organization-scoped.
6. Exact SQL, migration, and RLS policy implementation will be designed later during approved migration planning.

Remaining planning questions:

No data model or RLS planning questions remain open from `docs/08-supabase-planning-decisions.md`.

Migration gate:

- [x] Do not create migrations until `docs/04-data-model-draft.md` is reviewed at documentation-planning level
- [x] Do not create migrations until `docs/07-rls-strategy.md` is reviewed at documentation-planning level
- [x] Do not create migrations until remaining data model planning questions are resolved
- [x] Do not create migrations until remaining RLS planning questions are resolved
- [x] Do not create migrations until owner approval is given for MVP Supabase planning decisions
- [x] Do not create migrations until exact SQL, constraints, triggers/functions, RLS policy implementation, and migration scope are planned separately
- [x] Do not create migrations until owner approval is given for that exact migration plan
- [x] Initial migration has been locally validated with Supabase CLI

## Phase 4: App Shell

Do not begin until repository setup, documentation, architecture, and tooling are ready. Focused onboarding RPC behavior tests passed locally; minimal signup/auth/onboarding browser flow has been manually validated locally.

- [x] Create app provider structure
- [x] Add TanStack Query provider
- [x] Add Supabase client wrapper
- [x] Decide routing approach
- [x] Create basic layout shell
- [x] Manually validate local minimal signup/auth/onboarding browser flow: `/auth` sign-in, `/signup` navigation and form validation, valid signup success message, confirmed-user sign-in, no-profile redirect to `/onboarding`, successful onboarding, and landing on `/dashboard`

Post-validation boundaries:

- [ ] Keep product features gated until separately approved

## Phase 5: First Domain Module

Do not begin until phases 1 to 4 are complete and product feature work is separately approved.

Module status:

- [x] Properties MVP baseline documented and implemented as the first domain slice
- [x] Units module planning documented separately after owner approval to move beyond Properties

Keep first domain work small:

- [x] Start with types, schemas, and simple queries only after the data model and RLS strategy are approved
- [ ] Do not build unrelated product features in the same task

### Manual validation: read-only Properties module

Validate the first Properties slice manually before the owner commits it. This checklist is for the read-only `/dashboard/properties` page only.

- [ ] `/dashboard/properties` is inaccessible to unauthenticated users and redirects through the existing auth gate.
- [ ] Authenticated and onboarded users can access `/dashboard/properties`.
- [ ] The sidebar Properties link navigates to `/dashboard/properties`.
- [ ] The sidebar Dashboard link still navigates to `/dashboard`.
- [ ] The Properties page shows a loading state while the properties query is pending.
- [ ] The Properties page shows an empty state when the current organization has no properties.
- [ ] The Properties page shows an error state when the properties query fails.
- [ ] The Properties page shows a populated list when the current organization has existing properties.
- [ ] Existing properties listed on the page belong to the current organization.
- [ ] The disabled Add Property button is clearly unavailable and does not start a create flow.
- [ ] Refreshing `/dashboard/properties` keeps the user on the protected Properties route after account state checks finish.
- [ ] No browser console errors appear during navigation, refresh, or properties loading.
- [ ] Existing route gating still works for `/auth`, `/signup`, `/onboarding`, and `/dashboard`.

Manual validation boundaries:

- [ ] No create, edit, or delete property flows are introduced during this validation.
- [ ] No Units, Tenants, Leases, Billing, Payments, Maintenance, receipts, dashboard metrics, migrations, or unrelated modules are introduced during this validation.

### Manual validation: create Property flow

Validate the committed create Property slice manually before the owner commits the validation documentation. This checklist is for `/dashboard/properties/new` and the post-create return to `/dashboard/properties` only.

- [ ] Authenticated and onboarded users can open `/dashboard/properties/new`.
- [ ] Unauthenticated users cannot access `/dashboard/properties/new` and are redirected through the existing auth gate.
- [ ] The Back to properties link returns to `/dashboard/properties`.
- [ ] The Cancel link returns to `/dashboard/properties`.
- [ ] Submitting with an empty name shows the property-name validation error.
- [ ] Submitting with a valid name creates one property.
- [ ] Address can be left blank.
- [ ] Notes can be left blank.
- [ ] Blank address is stored as `null`.
- [ ] Blank notes are stored as `null`.
- [ ] After successful creation, the user is redirected to `/dashboard/properties`.
- [ ] The newly created property appears in the Properties list after redirect.
- [ ] The created property has the correct `organization_id` for the current onboarded user.
- [ ] Existing `/dashboard/properties` page still works after the create flow.
- [ ] Existing `/dashboard` page still works after the create flow.
- [ ] Browser console has no errors during create-page load, validation failure, successful creation, redirect, or list refresh.

Manual validation boundaries:

- [ ] No edit flow is part of this slice.
- [ ] No delete flow is part of this slice.
- [ ] No property detail page is part of this slice.
- [ ] No Units, tenants, leases, billing, payments, maintenance, receipts, reporting, or dashboard metrics are part of this slice.
- [ ] No migrations are introduced for this validation task.

### Manual validation: read-only Property detail page

Validate the committed read-only Property detail slice manually before the owner commits the validation documentation. This checklist is for `/dashboard/properties/:propertyId` and its existing route neighbors only.

- [ ] Authenticated and onboarded users can open `/dashboard/properties`.
- [ ] An existing property name or card links to `/dashboard/properties/:propertyId`.
- [ ] `/dashboard/properties/:propertyId` displays the correct property for the selected property record.
- [ ] The detail page shows the property name.
- [ ] The detail page shows the address when the property has an address.
- [ ] The detail page handles a missing address gracefully.
- [ ] The detail page shows notes when the property has notes.
- [ ] The detail page handles missing notes gracefully.
- [ ] The detail page shows created and updated timestamps.
- [ ] The Back to properties link returns to `/dashboard/properties`.
- [ ] Refreshing `/dashboard/properties/:propertyId` keeps the user on the protected Property detail route after account state checks finish.
- [ ] An invalid or inaccessible property ID shows the not-found or inaccessible state.
- [ ] Unauthenticated users cannot access `/dashboard/properties/:propertyId` and are redirected through the existing auth gate.
- [ ] Existing `/dashboard/properties/new` create route still works.
- [ ] Existing `/dashboard/properties` list route still works.
- [ ] Browser console has no errors during list navigation, detail-page load, refresh, not-found/inaccessible state, or auth redirect checks.

Manual validation boundaries:

- [ ] No edit flow is part of this slice.
- [ ] No delete or archive flow is part of this slice.
- [ ] No Units, tenants, leases, billing, payments, maintenance, receipts, reporting, or dashboard metrics are part of this slice.
- [ ] No migrations are introduced for this validation task.

### Manual validation: edit Property flow

Validate the committed edit Property slice manually before the owner commits the validation documentation. This checklist is for `/dashboard/properties/:propertyId/edit`, the post-update return to `/dashboard/properties/:propertyId`, and the existing route neighbors only.

- [ ] Authenticated and onboarded users can open `/dashboard/properties`.
- [ ] User can open an existing property detail page at `/dashboard/properties/:propertyId`.
- [ ] The detail page shows an Edit property link.
- [ ] The Edit property link navigates to `/dashboard/properties/:propertyId/edit`.
- [ ] The edit page pre-fills name, address, and notes for the selected property.
- [ ] Submitting with an empty name shows the property-name validation error.
- [ ] Updating the property name succeeds.
- [ ] Updating the property address succeeds.
- [ ] Updating the property notes succeeds.
- [ ] Clearing address stores it as `null` and the detail page displays it consistently as missing text.
- [ ] Clearing notes stores them as `null` and the detail page displays them consistently as missing text.
- [ ] After a successful update, the user is redirected back to `/dashboard/properties/:propertyId`.
- [ ] The detail page shows the updated values after redirect.
- [ ] Returning to `/dashboard/properties` shows the updated values after query invalidation and refetch.
- [ ] The Cancel link returns to `/dashboard/properties/:propertyId`.
- [ ] The Back to property link returns to `/dashboard/properties/:propertyId`.
- [ ] An invalid or inaccessible property ID on the edit page shows the not-found or inaccessible state.
- [ ] Unauthenticated users cannot access `/dashboard/properties/:propertyId/edit` and are redirected through the existing auth gate.
- [ ] Existing `/dashboard/properties/new` create route still works.
- [ ] Existing `/dashboard/properties/:propertyId` detail route still works.
- [ ] Existing `/dashboard/properties` list route still works.
- [ ] Browser console has no errors during list navigation, detail-page load, edit-page load, validation failure, successful update, redirect, list refetch, not-found/inaccessible state, or auth redirect checks.

Manual validation boundaries:

- [ ] No delete or archive flow is part of this slice.
- [ ] No Units, tenants, leases, billing, payments, maintenance, receipts, reporting, or dashboard metrics are part of this slice.
- [ ] No migrations are introduced for this validation task.

### Future decision: Property archive/delete behavior

Do not implement hard delete for properties in the MVP. Prefer a future archive or inactive approach instead.

Reason:

- A property will later become the parent of units, leases, payments, maintenance, and operational history.
- Hard deletion can break historical data, reporting, auditability, and support workflows.
- Archive or inactive behavior keeps historical records intact while hiding inactive properties from default operational views.

Current action:

- No archive or delete implementation yet.
- No status or archive migration yet.
- Revisit when the product needs property lifecycle management.

Future implementation may require:

- A status or archive column on properties.
- Active properties filtered by default in operational views.
- Clear UI copy for archived or inactive properties.
- Archive rules that prevent archiving when active leases or unresolved maintenance exist, if relevant later.

### Properties module MVP baseline closeout

Current completed Properties baseline:

- `/dashboard/properties` lists organization-scoped properties.
- `/dashboard/properties/new` creates a property.
- `/dashboard/properties/:propertyId` shows read-only property details.
- `/dashboard/properties/:propertyId/edit` edits basic property fields.
- Supported property fields are `name`, `address`, and `notes`.
- Organization scoping relies on existing Supabase RLS and the existing app organization/profile flow.
- Manual validation checklists exist for list, create, detail, and edit flows.

Intentionally deferred from the Properties MVP baseline:

- No Units yet.
- No tenants.
- No leases.
- No billing or payments.
- No maintenance.
- No receipts.
- No reporting or dashboard metrics.
- No delete, archive, or status flow in the MVP.
- No property images or files.
- No search, filter, or pagination.
- No advanced address or location fields.
- No import or export.

Recommended next module:

- Units should be the next domain module only after the owner approves moving beyond Properties.
- Units planning now lives in the Units module planning section below.
- Do not add Units implementation inside this Properties closeout task.

### Units module planning

Purpose:

- Units represent rentable spaces under a Property.
- Examples include a kost room, apartment unit, house unit, shop or ruko unit, and a floor or space inside a property.
- Units belong to a property and should be planned as a child module of Properties.
- Units are not tenants, leases, payments, maintenance, billing, receipts, or reporting.

Existing schema note:

- The existing initial migration appears to include a `public.units` table.
- Supported fields in the existing migration include `organization_id`, `property_id`, `name`, `type`, `status`, `base_rent_amount`, `notes`, `created_at`, and `updated_at`.
- There is no separate `unit_number` column in the inspected migration; use `name` for the MVP unless a later approved migration changes the schema.
- Because `status` and `base_rent_amount` already exist in the migration but touch occupancy and rent-pricing concerns, do not make them part of the first Units implementation slice unless the owner explicitly approves that scope.
- No Units schema or migration changes are planned in this documentation task.

Suggested MVP fields for the first read-only planning slice:

- `property_id` to keep every Unit scoped to a selected Property.
- `name` as the display label for the Unit.
- `type` only as a simple existing-schema descriptor if the UI needs it.
- `notes` if useful for read-only context.
- `created_at` and `updated_at` if timestamps are displayed consistently with the Properties detail pattern.

Explicitly out of scope for the first Units slice:

- Tenants.
- Leases.
- Rent pricing.
- Deposits.
- Payment status.
- Occupancy status, unless intentionally approved later.
- Maintenance requests.
- Meter readings.
- Images or files.
- Reporting or dashboard metrics.
- Delete, archive, or status-management flow.

First recommended implementation slice:

- Build a read-only Units list scoped to a selected property.
- Prefer starting from property context, either as a Units section on `/dashboard/properties/:propertyId` or as a narrow child route such as `/dashboard/properties/:propertyId/units`.
- Do not add Units to the top-level dashboard navigation yet unless product navigation requires it later.
- Do not add create, edit, delete, archive, or status actions in the first Units slice.
- Do not start tenants, leases, billing, payments, maintenance, receipts, or dashboard metrics during the first Units slice.

Validation strategy for the first Units slice:

- Route protection for the Units route or Units section.
- Authenticated and onboarded access only.
- Property scoping: Units must be loaded for the selected property only.
- Organization and RLS scoping: Units must remain limited to the current user's organization.
- Empty state for a property with no units.
- Populated state for a property with existing units.
- Invalid or inaccessible property handling.
- Regression checks for existing Properties routes: `/dashboard/properties`, `/dashboard/properties/new`, `/dashboard/properties/:propertyId`, and `/dashboard/properties/:propertyId/edit`.

Decision notes:

- Units should remain a child module of Properties for the MVP workflow.
- Start from property context first to avoid orphaned Units UX.
- Keep Units out of the top-level dashboard navigation until a product navigation need is approved.
- Do not start tenants or leases until the read-only, property-scoped Units baseline is stable.
- Future Units create/edit/status work should be planned as separate, owner-approved slices.

### Future decision: Units create flow

Future Units creation should remain property-scoped. Prefer the route:

```txt
/dashboard/properties/:propertyId/units/new
```

Product and navigation boundaries:

- Do not add top-level Units navigation yet.
- Do not implement Units create, edit, delete, archive, or status-management behavior in this documentation task.
- Do not introduce tenants, leases, billing, payments, maintenance, receipts, reporting, dashboard metrics, or unrelated modules as part of the first Units create flow.

First create-flow field scope:

- Include `name` as the required Unit display label.
- Include `type` only if useful as simple metadata and supported by the existing schema.
- Include `notes` as optional free text.
- Do not expose `status` in the first create flow because it can imply occupancy or lifecycle workflow and should be handled in a separate owner-approved slice.
- Do not expose `base_rent_amount` in the first create flow because rent pricing touches lease, billing, and payment concerns and should be handled in a separate owner-approved slice.

Implementation notes for a later approved task:

- The existing schema requires both `organization_id` and `property_id`.
- Set `organization_id` from the trusted existing profile/organization flow.
- Set `property_id` from the current property route/context.
- No implementation is approved yet.
- No migration is planned for this decision note.
- Revisit pricing and status only after basic Units CRUD is stable.

### Manual validation: read-only Units section

Validate the committed read-only Units section manually before the owner commits the validation documentation. This checklist is for the Units section inside `/dashboard/properties/:propertyId` and the existing Properties route neighbors only.

- [ ] Authenticated and onboarded users can open `/dashboard/properties`.
- [ ] User can open an existing property detail page at `/dashboard/properties/:propertyId`.
- [ ] The property detail page shows a Units section below the main property details.
- [ ] The Units section shows a loading state while units for the selected property are loading.
- [ ] A property with no units shows the Units empty state.
- [ ] A property with units shows the Units populated state.
- [ ] Each listed Unit displays the unit name.
- [ ] Unit type is displayed only as simple read-only metadata when present.
- [ ] Unit notes are displayed when present.
- [ ] Missing unit notes are handled gracefully.
- [ ] Unit status is not treated as an occupancy workflow in this slice.
- [ ] Unit base rent amount is not treated as a pricing or billing workflow in this slice.
- [ ] An invalid or inaccessible property detail page does not render the Units section.
- [ ] Unauthenticated users cannot access `/dashboard/properties/:propertyId` or the Units section and are redirected through the existing auth gate.
- [ ] Existing `/dashboard/properties` list route still works.
- [ ] Existing `/dashboard/properties/new` create route still works.
- [ ] Existing `/dashboard/properties/:propertyId/edit` edit route still works.
- [ ] Browser console has no errors during list navigation, detail-page load, Units loading, empty state, populated state, invalid/inaccessible property handling, or auth redirect checks.

Manual validation boundaries:

- [ ] No Units create flow is part of this slice.
- [ ] No Units edit flow is part of this slice.
- [ ] No Units delete, archive, or status-management flow is part of this slice.
- [ ] No tenants, leases, billing, payments, maintenance, receipts, reporting, or dashboard metrics are part of this slice.
- [ ] No top-level Units navigation is part of this slice.
- [ ] No migrations are introduced for this validation task.
