# Payments Read-Only List Implementation Plan

> **For agentic workers:** Use Superpowers-style sliced execution. Keep this plan focused on the read-only Payments list; do not implement payment recording in this slice.

**Goal:** Build the first Payments module slice so an authenticated, onboarded rental owner can view organization-scoped payment records.

**Architecture:** Add `src/modules/payments/` with the established domain/application/infrastructure/presentation module shape. Register `/dashboard/payments` behind the existing dashboard route gate and promote Payments into primary navigation.

**Tech Stack:** React, TypeScript, Vite, React Router, TanStack Query, Supabase.

---

## Source Documents

Read these before implementation:

- `docs/superpowers/specs/2026-05-30-payments-read-only-list-design.md`
- `docs/21-payments-module-plan.md`
- `docs/01-mvp-scope.md`
- `docs/02-domain-model.md`
- `docs/04-data-model-draft.md`
- `docs/07-rls-strategy.md`
- `wiki/03-domain/payments.md`
- `wiki/06-task-breakdown/task-index.md`

## File Map

Create during implementation:

- `src/modules/payments/domain/payment.ts`
- `src/modules/payments/infrastructure/payments-repository.ts`
- `src/modules/payments/application/use-payments-query.ts`
- `src/modules/payments/presentation/payments-page.tsx`
- `src/modules/payments/index.ts`

Modify during implementation:

- `src/app/layouts/app-layout.tsx`
- `src/app/router/route-paths.ts`
- `src/app/router/app-router.tsx`
- `src/App.css`
- `wiki/03-domain/payments.md`
- `wiki/06-task-breakdown/task-index.md`
- `wiki/06-task-breakdown/ready-soon.md`
- `wiki/09-status/built.md`
- `wiki/09-status/not-built.md`

## Global Decisions

- Use the existing `payments` table. Do not create a migration.
- The first route is `/dashboard/payments`.
- Do not add `/dashboard/payments/new` yet.
- Do not add an Add Payment button yet.
- Do not implement payment recording, editing, deletion, receipts, refunds, gateway behavior, reconciliation, or dashboard metrics.
- Query key: `['payments']`.
- Supabase RLS remains the organization boundary.
- Use fallback labels for missing joined relationship data.

---

## Task 1: Add Payments Domain and Repository

- [ ] Create `payment.ts` with `PaymentMethod`, `Payment`, and `PaymentListItem`.
- [ ] Create `payments-repository.ts` with `paymentsQueryKey`.
- [ ] Add `listPayments()` using Supabase nested selects for invoices, tenants, units, and properties.
- [ ] Map rows into resilient `PaymentListItem` values.

## Task 2: Add Query Hook

- [ ] Create `use-payments-query.ts`.
- [ ] Use `paymentsQueryKey` and `listPayments`.

## Task 3: Add Payments Page

- [ ] Create `payments-page.tsx`.
- [ ] Add loading, error, empty, and populated states.
- [ ] Show payment date, amount, method, reference, tenant, unit/property, billing period, and invoice status.
- [ ] Do not add mutation controls.

## Task 4: Register Route and Navigation

- [ ] Add `dashboardPayments` route path.
- [ ] Lazy-load `PaymentsPage`.
- [ ] Register `/dashboard/payments` behind `RouteAccessGate`.
- [ ] Promote Payments from future sidebar item to primary sidebar link.

## Task 5: Update Documentation

- [ ] Mark read-only Payments list as built in wiki status.
- [ ] Move `Add read-only Payments list` from ready soon to completed task candidates.
- [ ] Keep Record Payment flow as next ready slice.
- [ ] Keep deferred payment work listed.

## Task 6: Validate

- [ ] Run `npm run build`.
- [ ] Run `npm run lint`.
- [ ] Run `git diff --check`.
- [ ] Review `git status --short`.
