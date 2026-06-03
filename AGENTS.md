# Repository Guidelines

## Project Structure & Module Organization

RuangRapi is a React, TypeScript, and Vite app backed by Supabase. Source code lives in `src/`:

- `src/app/`: app composition, providers, layouts, and routing.
- `src/modules/`: domain modules such as `properties`, `units`, and `identity`; keep domain types, schemas, queries, and UI inside the owning module.
- `src/shared/`: reusable utilities and infrastructure helpers that are not domain-specific.
- `public/` and `src/assets/`: static assets.
- `supabase/migrations/`: database migrations; read the data model and RLS docs before changing these.
- `docs/` and `wiki/`: product, architecture, workflow, and planning source-of-truth.

## Build, Test, and Development Commands

- `npm run dev`: start the local Vite development server.
- `npm run build`: run TypeScript project builds, then produce the Vite production build in `dist/`.
- `npm run lint`: run ESLint across the repository.
- `npm run format`: format files with Prettier.
- `npm run format:check`: check formatting without writing changes.
- `npm run preview`: serve the production build locally.

## Coding Style & Naming Conventions

Use TypeScript and React functional components. Follow ESLint and Prettier output; do not hand-format around the tools. Non-Markdown files created under `src/` must use kebab-case names, for example `property-form.tsx`, `query-client-provider.tsx`, or `create-unit-schema.ts`. Avoid `any` unless the reason is documented. Keep business rules in domain modules, app wiring in `src/app/`, and generic helpers in `src/shared/`.

## Testing Guidelines

No automated test runner is configured yet. Until one is added, validate source changes with `npm run build`, `npm run lint`, and focused manual checks in the browser or local Supabase. For Supabase/RLS work, follow the relevant plans in `docs/` and avoid committing local test users, tokens, or scratch evidence.

## Commit & Pull Request Guidelines

Recent history uses short imperative or conventional-style subjects, such as `feat: initialize wiki documentation...` and `Document units module closeout`. Keep commits focused on one logical change. Pull requests should include a concise summary, validation performed, linked issue or planning document when relevant, and screenshots for visible UI changes.

## Superpowers Workflow

Use the Superpowers workflow for implementation-affecting work, including features, bug fixes, behavior changes, docs or process changes, reviews, commits, and pushes. Simple status checks and direct informational questions may stay lightweight.

- Start each implementation-affecting task by using the relevant Superpowers skills.
- Use `brainstorming` before creative, product, process, documentation, or behavior-changing work. Capture the approved design in `docs/superpowers/specs/` and commit it before planning.
- Use `writing-plans` to create a detailed implementation plan in `docs/superpowers/plans/` and commit it before execution.
- Execute approved plans with `subagent-driven-development` or `executing-plans`, depending on whether the work benefits from independent subagents or a single sequential executor.
- Use `systematic-debugging` for bugs, failing validation, or unexpected behavior before proposing fixes.
- Use `verification-before-completion` before claiming work is complete, fixed, or passing.
- Use `finishing-a-development-branch` when deciding whether to merge, push, open a pull request, or clean up a completed branch.

Documentation closeout is part of implementation-affecting work. When a task changes module behavior, module status, roadmap state, or development process, update the relevant docs and wiki pages before completion:

- Module docs and validation checklists under `docs/`.
- Domain pages under `wiki/03-domain/`.
- Built and not-built status under `wiki/09-status/`.
- Backlog, ready-soon, and task index pages under `wiki/06-task-breakdown/`.
- Roadmap and release planning pages under `wiki/04-roadmap/`.

Closeout updates must record the key decisions, implemented logic, deferred scope, manual validation steps, and the next todo for the affected module or process. Keep "what we did" and "what we are not doing now" explicit in docs, wiki pages, specs, and plans.

Before completing implementation-affecting work, run:

- `npm run format:check`
- `npm run build`
- `npm run lint`
- `git diff --check`

Add task-specific manual validation when relevant, and report validation results in the final summary. After a task is completed and verified, use Superpowers brainstorming to identify the next recommended task. Record next-step recommendations in the relevant planning or wiki docs when the work changes module status.

## UI/UX Pro Max Workflow

Always use the installed `ui-ux-pro-max` skill for project work that can affect interface structure, visual design, interaction quality, accessibility, responsive behavior, or frontend user experience. Invoke it before design, implementation, or review work for pages, layouts, components, forms, tables, charts, navigation, visual polish, animation, and UI/UX quality checks.

Backend-only, SQL-only, infrastructure, and direct informational tasks may skip `ui-ux-pro-max` when they do not change how users see, understand, or interact with the product. Continue to use the relevant Superpowers workflow for those tasks.

RuangRapi also has a project-local Codex `UserPromptSubmit` hook under `.codex/` that injects this reminder into Codex sessions. Review and trust the hook with `/hooks` if Codex reports that project hooks need approval.

## Library Documentation Workflow

Use Context7 for external library/API work before implementation when package APIs, installation, configuration, or examples may be version-sensitive. Prefer official library documentation surfaced through Context7 over memory or generic examples.

Use Context7 before adding dependencies, upgrading dependencies, changing package versions, configuring libraries, or implementing against unfamiliar or fast-moving APIs such as React Router, TanStack Query, Supabase JS, Vite, Zod, React Hook Form, charting libraries, and UI component libraries.

Skip Context7 for codebase-local patterns, simple TypeScript or React syntax, and tasks that do not depend on external library behavior.

## Security & Agent-Specific Instructions

Never commit real secrets or modify environment files that may contain them. Keep `.env.local` local and document only placeholders in `.env.example`. Before repository-level or architectural changes, read `README.md`, `HERMES.md`, and the relevant `docs/` files. Ask before adding dependencies, changing scope, or altering database schema/RLS behavior.
