# Agent Workflow

This project uses Hermes Agent for careful, small-step, agent-assisted development.

`AGENTS.md` is the most up-to-date repository workflow guide. This document expands the RuangRapi-specific task flow and should remain aligned with `AGENTS.md`.

Hermes should work like a practical pair programmer for a solo founder: read the source-of-truth docs, change only what the task requires, validate the result, and clearly report what changed.

## Workflow Principle

Hermes should prefer small, reviewable tasks.

The project originally progressed through:

1. Repository setup
2. Source-of-truth documentation
3. Architecture baseline
4. Domain model draft
5. Data model draft
6. RLS strategy
7. Development workflow
8. Tooling validation
9. Only then, small implementation tasks

Those gates are now largely complete. Current work should choose one focused approved MVP gap at a time from the docs/wiki task bucket and avoid reopening broad product scope.

## Standard Task Flow

For every task, Hermes should:

1. Read `AGENTS.md`.
2. Read `README.md`.
3. Read `HERMES.md`.
4. Read relevant docs in `docs/`, `docs/superpowers/`, and `wiki/`.
5. Use the relevant Superpowers workflow for implementation-affecting work when available.
6. Use Context7 for version-sensitive external library/API work before implementation.
7. Use `ui-ux-pro-max` for UI/UX-affecting work when available.
8. Identify the exact allowed file scope for the task.
9. Modify the smallest useful set of files.
10. Avoid unrelated cleanup or hidden rewrites.
11. Run validation commands if applicable.
12. Summarize what changed.
13. List remaining questions.
14. Suggest the next small task.

## Required Reading by Task Type

### Documentation, Product, Domain, or Architecture Tasks

Read at least:

- `AGENTS.md`
- `README.md`
- `HERMES.md`
- `docs/00-product-brief.md`
- `docs/01-mvp-scope.md`
- `docs/02-domain-model.md`
- `docs/03-architecture.md`
- `docs/05-agent-workflow.md`
- `docs/06-development-checklist.md`
- Relevant ADRs in `docs/decisions/`

### Data Model Tasks

Also read:

- `docs/04-data-model-draft.md`
- `docs/07-rls-strategy.md`

### Supabase, RLS, or Migration-Related Tasks

Before any Supabase, RLS, SQL, or migration-related task, Hermes must read:

- `docs/04-data-model-draft.md`
- `docs/07-rls-strategy.md`
- `docs/03-architecture.md`
- `docs/06-development-checklist.md`

Do not rely only on memory for data model or RLS decisions.

## Migration Gate

Supabase migrations must not be created until all of these are true:

1. `docs/04-data-model-draft.md` has been reviewed.
2. `docs/07-rls-strategy.md` has been reviewed.
3. Remaining data model questions needed for migrations have been resolved.
4. Remaining RLS questions needed for migrations have been resolved.
5. Owner approval has been given for the reviewed data model and RLS strategy.

Only after this gate may Hermes create migration files, SQL policies, or database schema changes.

Until the migration gate is passed:

- Do not create Supabase migrations.
- Do not create SQL files.
- Do not write SQL policy examples as implementation.
- Keep database work at the planning-documentation level only.

## Environment Safety

Hermes must protect secrets and local configuration.

Rules:

- Never commit real secrets.
- Never place real Supabase service keys in committed files.
- Keep `.env.local` local only.
- Use `.env.example` for placeholder variable names only.
- Do not modify environment files containing real secrets.
- If environment variables are needed, update `.env.example` with safe placeholders and tell the owner what local values they need to set.

Before changing environment-related files, Hermes should check whether the file is a committed placeholder file or a local secret file.

## Validation Expectations

Validation should match the task type.

### Documentation-only Tasks

For Markdown/documentation tasks, run when appropriate:

```txt
git diff --check
```

Use this to catch trailing whitespace and patch formatting problems.

### Source Code or Tooling Tasks

For TypeScript, React, Vite, or tooling changes, run when applicable:

```txt
npm run format:check
npm run build
npm run lint
```

If a script does not exist, report that instead of inventing a replacement.

### Git Review

Before final response, check the changed file list when useful:

```txt
git status --short
```

Use this to confirm the task stayed within the requested file scope.

For implementation-affecting work, `AGENTS.md` expects this validation set before completion when applicable:

```txt
npm run format:check
npm run build
npm run lint
git diff --check
```

## Task Size Rules

A good Hermes task should take one focused step.

Rules:

- Work on one focused task at a time.
- Prefer changing one file or a few closely related files per task.
- Do not bundle unrelated features together.
- Do not hide large rewrites inside a small request.
- Do not expand MVP scope while editing docs or setup files.
- Do not add new dependencies without explaining why and asking first.
- Use Context7 before adding dependencies, upgrading packages, changing library configuration, or implementing version-sensitive external APIs.
- Use `ui-ux-pro-max` before UI/UX-affecting design, implementation, or review work when the skill is available.
- Do not create folders or modules until there is a clear current need.
- Use kebab-case filenames for any non-Markdown file created inside `src/`.
- Markdown files may keep normal documentation names such as `README.md`.
- Do not build screens before the domain model and data model are clear.

Good examples:

- Create documentation baseline.
- Update one source-of-truth planning document.
- Configure Prettier.
- Validate TypeScript strict mode.
- Add Supabase client placeholder after documentation gates are clear.
- Add app provider shell as one small infrastructure task.

Bad examples:

- Build the whole MVP.
- Create all pages and database tables.
- Implement billing and payments together.
- Add authentication, dashboard, and maintenance in one run.
- Create migrations before data model and RLS approval.
- Add payment gateway, marketplace, tenant app, or enterprise permission workflows during MVP setup.

## Expected Hermes Response Format

After completing a task, Hermes should respond with:

1. Files changed
2. Validation run
3. Summary of changes
4. Remaining questions or gaps
5. Suggested next task

For example:

```txt
Files changed:
- docs/example.md

Validation run:
- git diff --check

Summary:
- Updated the planning notes for...

Remaining questions:
- ...

Suggested next task:
- Review ...
```

If validation was not run, Hermes should explain why.

## Commit Style

Use clear commits:

```txt
docs: add product brief
docs: define domain model draft
docs: add rls strategy
chore: initialize project tooling
chore: configure app providers
feat(properties): add property type schema
```

Do not commit automatically unless the owner asks for it.
