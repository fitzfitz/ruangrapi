# Development Checklist

## Phase 1: Repository and Documentation

- [ ] Initialize Git repository
- [ ] Initialize Vite React TypeScript app
- [ ] Install approved dependencies
- [ ] Create `.env.example`
- [ ] Create `README.md`
- [ ] Create `HERMES.md`
- [ ] Create `docs/` structure
- [ ] Create product brief: `docs/00-product-brief.md`
- [ ] Create MVP scope: `docs/01-mvp-scope.md`
- [ ] Create domain model draft: `docs/02-domain-model.md`
- [ ] Create architecture document: `docs/03-architecture.md`
- [ ] Create data model draft: `docs/04-data-model-draft.md`
- [ ] Create agent workflow document: `docs/05-agent-workflow.md`
- [ ] Create development checklist: `docs/06-development-checklist.md`
- [ ] Create RLS strategy: `docs/07-rls-strategy.md`
- [ ] Create first architecture decision record: `docs/decisions/0001-modular-monolith-ddd-lite.md`

## Phase 2: Tooling Baseline

- [ ] Configure formatting
- [ ] Configure linting
- [ ] Confirm TypeScript strict mode
- [ ] Confirm project builds
- [ ] Confirm dev server runs

## Phase 3: Supabase Planning

- [ ] Create Supabase project manually
- [ ] Add Supabase env variables locally
- [ ] Review `docs/04-data-model-draft.md`
- [ ] Review `docs/07-rls-strategy.md`
- [ ] Resolve remaining data model questions needed before migrations
- [ ] Resolve remaining RLS questions needed before migrations
- [ ] Get owner approval for the reviewed data model and RLS strategy
- [ ] Only after owner approval, plan the first Supabase migrations

Migration gate:

- [ ] Do not create migrations until `docs/04-data-model-draft.md` is reviewed
- [ ] Do not create migrations until `docs/07-rls-strategy.md` is reviewed
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
