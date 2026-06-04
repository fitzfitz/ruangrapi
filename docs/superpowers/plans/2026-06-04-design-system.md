# RuangRapi Design System Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Install the Warm Admin Ledger design-system foundation and migrate the existing app UI onto it without changing domain behavior.

**Architecture:** Centralize design tokens in `src/index.css`, add shadcn/Base UI primitives under `src/components/ui/`, refresh `AppLayout`, and remap existing screen classes in `src/App.css` to shared page, card, form, action, status, and print patterns.

**Tech Stack:** React 19, TypeScript, Vite, Tailwind CSS 4, shadcn-style components, Base UI, Plus Jakarta Sans.

---

## File Structure

- Modify `package.json` and `package-lock.json`: add `@base-ui/react`, `@fontsource/plus-jakarta-sans`, and `class-variance-authority`.
- Modify `components.json`: set `style` to `base-rhea`.
- Modify `src/index.css`: define design tokens, Tailwind 4 theme variables, base typography, focus rings, form defaults, status colors, chart colors, and print-safe color behavior.
- Modify `src/App.css`: replace duplicated visual rules with reusable app shell, page, card, form, empty, loading, alert, badge, action, receipt, and responsive patterns.
- Modify `src/app/layouts/app-layout.tsx`: implement branded product shell, active nav states, and mobile navigation.
- Add `src/components/ui/button.tsx`, `input.tsx`, `textarea.tsx`, `select.tsx`, `label.tsx`, `form.tsx`, `badge.tsx`, `alert.tsx`, and `separator.tsx`; adapt existing `card.tsx`.
- Update docs/wiki closeout pages with the design-system foundation, migrated surfaces, validation, deferred work, and next UI task.

## Tasks

### Task 1: Dependencies and Configuration

- [x] Install Base UI, Plus Jakarta Sans, and CVA.
- [x] Configure shadcn style as `base-rhea`.
- [x] Preserve existing routes, aliases, and build scripts.

### Task 2: Design Tokens and Primitives

- [x] Add Warm Admin Ledger tokens and Tailwind theme variables.
- [x] Add shared UI primitives with className support and accessible defaults.
- [x] Keep components small and app-wide only.

### Task 3: Shell and Screen Migration

- [x] Refresh `AppLayout` as a responsive product shell.
- [x] Migrate current BEM screen styles to shared visual patterns.
- [x] Preserve receipt print layout and current module wording.

### Task 4: Documentation Closeout

- [x] Record design-system foundation in docs/wiki.
- [x] Record deferred scope and next recommended UI task.

### Task 5: Verification

- [x] Run `npm run format:check`.
- [x] Run `npm run build`.
- [x] Run `npm run lint`.
- [x] Run `git diff --check`.
- [x] Perform focused route smoke checks where practical.

Verification results:

- `npm run format:check`: passed.
- `npm run build`: passed.
- `npm run lint`: passed.
- `git diff --check`: passed.
- Local dev server route smoke checks returned HTTP 200 for `/dashboard`, `/dashboard/properties`, `/dashboard/properties/new`, `/dashboard/reminders`, and `/auth`.

Screenshot note: browser screenshot capture was not completed because this worktree does not have Playwright or Chromium installed. Do not treat screenshot evidence as captured for this pass.
