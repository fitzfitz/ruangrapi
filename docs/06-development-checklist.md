# Development Checklist

## Phase 1: Repository and Documentation

- [ ] Initialize Git repository
- [ ] Initialize Vite React TypeScript app
- [ ] Install approved dependencies
- [ ] Create `.env.example`
- [ ] Create `README.md`
- [ ] Create `HERMES.md`
- [ ] Create `docs/` structure
- [ ] Create product brief
- [ ] Create MVP scope
- [ ] Create domain model draft
- [ ] Create architecture document
- [ ] Create data model draft
- [ ] Create agent workflow document
- [ ] Create first architecture decision record

## Phase 2: Tooling Baseline

- [ ] Configure formatting
- [ ] Configure linting
- [ ] Confirm TypeScript strict mode
- [ ] Confirm project builds
- [ ] Confirm dev server runs

## Phase 3: Supabase Planning

- [ ] Create Supabase project manually
- [ ] Add Supabase env variables locally
- [ ] Draft RLS strategy
- [ ] Review data model
- [ ] Only then create migrations

## Phase 4: App Shell

- [ ] Create app provider structure
- [ ] Add TanStack Query provider
- [ ] Add Supabase client wrapper
- [ ] Decide routing approach
- [ ] Create basic layout shell

## Phase 5: First Domain Module

Recommended first module:

- Properties and units

Do not begin until phases 1 to 4 are complete.