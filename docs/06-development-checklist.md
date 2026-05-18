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

Recommended first module:

- [ ] Properties and units

Keep first domain work small:

- [ ] Start with types, schemas, and simple queries only after the data model and RLS strategy are approved
- [ ] Do not build unrelated product features in the same task
