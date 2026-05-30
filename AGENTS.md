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

## Security & Agent-Specific Instructions

Never commit real secrets or modify environment files that may contain them. Keep `.env.local` local and document only placeholders in `.env.example`. Before repository-level or architectural changes, read `README.md`, `HERMES.md`, and the relevant `docs/` files. Ask before adding dependencies, changing scope, or altering database schema/RLS behavior.
