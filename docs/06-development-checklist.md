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
- [ ] Review `docs/04-data-model-draft.md`
- [ ] Review `docs/07-rls-strategy.md`
- [ ] Resolve remaining data model questions needed before migrations
- [ ] Resolve remaining RLS questions needed before migrations
- [ ] Get owner approval for the reviewed data model and RLS strategy
- [ ] Only after owner approval, plan the first Supabase migrations

Remaining data model questions:

1. Should same-organization relationship protection rely on application validation plus normal foreign keys for initial migrations, or should database checks/triggers be planned for critical relationships later?
2. Should receipt number sequencing be generated in application logic first, or through a database-backed sequence/function when migrations are introduced?

Remaining RLS questions:

1. How should the first organization and first owner profile be created during signup?
2. Should users be allowed to update their own `profiles.full_name`, or should profile edits be handled through an owner/admin screen later?
3. Should `owner` and `admin` have identical database access in the first MVP, or should any minimal difference exist?
4. What exact policy pattern should be used for `profiles` so users can read their own profile without exposing other organizations?
5. What exact policy pattern should be used for `organizations` so users can read only their own organization?
6. Should receipt number sequencing be generated in application logic first, or through a database-backed sequence/function when migrations are introduced?
7. Should cross-organization relationship protection rely first on application validation plus foreign keys, or should database checks/triggers be planned for critical relationships later?

Migration gate:

- [ ] Do not create migrations until `docs/04-data-model-draft.md` is reviewed
- [ ] Do not create migrations until `docs/07-rls-strategy.md` is reviewed
- [ ] Do not create migrations until remaining data model questions are resolved
- [ ] Do not create migrations until remaining RLS questions are resolved
- [ ] Do not create migrations until owner approval is given

## Phase 4: App Shell

Do not begin until repository setup, documentation, architecture, and tooling are ready.

- [ ] Create app provider structure
- [ ] Add TanStack Query provider
- [ ] Add Supabase client wrapper
- [ ] Decide routing approach
- [ ] Create basic layout shell

## Phase 5: First Domain Module

Do not begin until phases 1 to 4 are complete.

Recommended first module:

- [ ] Properties and units

Keep first domain work small:

- [ ] Start with types, schemas, and simple queries only after the data model and RLS strategy are approved
- [ ] Do not build unrelated product features in the same task
