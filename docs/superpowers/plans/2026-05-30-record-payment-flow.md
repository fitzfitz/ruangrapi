# Record Payment Flow Implementation Plan

> **For agentic workers:** Use Superpowers-style sliced execution. Keep this plan focused on recording one manual payment; do not implement payment edits, receipts, gateways, or reporting in this slice.

**Goal:** Add `/dashboard/payments/new` so an authenticated, onboarded owner can record one manual payment against one payable invoice.

**Architecture:** Extend `src/modules/payments/` with create-payment schema, form options query, create mutation, repository functions, and create page. Reuse existing app route gates and module patterns.

**Tech Stack:** React, TypeScript, Vite, React Router, TanStack Query, React Hook Form, Zod, Supabase.

---

## Source Documents

Read these before implementation:

- `docs/superpowers/specs/2026-05-30-record-payment-flow-design.md`
- `docs/21-payments-module-plan.md`
- `docs/01-mvp-scope.md`
- `docs/02-domain-model.md`
- `docs/04-data-model-draft.md`
- `docs/07-rls-strategy.md`
- `wiki/03-domain/payments.md`
- `wiki/06-task-breakdown/task-index.md`

## File Map

Create during implementation:

- `src/modules/payments/domain/create-payment-schema.ts`
- `src/modules/payments/application/use-payment-form-options-query.ts`
- `src/modules/payments/application/use-create-payment-mutation.ts`
- `src/modules/payments/presentation/create-payment-page.tsx`

Modify during implementation:

- `src/modules/payments/domain/payment.ts`
- `src/modules/payments/infrastructure/payments-repository.ts`
- `src/modules/payments/presentation/payments-page.tsx`
- `src/modules/payments/index.ts`
- `src/app/router/route-paths.ts`
- `src/app/router/app-router.tsx`
- `src/App.css`
- `docs/21-payments-module-plan.md`
- `wiki/03-domain/payments.md`
- `wiki/06-task-breakdown/task-index.md`
- `wiki/06-task-breakdown/ready-soon.md`
- `wiki/09-status/built.md`
- `wiki/09-status/not-built.md`

## Global Decisions

- Use the existing `payments` and `invoices` tables. Do not create a migration.
- Route: `/dashboard/payments/new`.
- Payable invoice statuses: `unpaid`, `partially_paid`, `overdue`.
- Excluded invoice statuses: `draft`, `paid`, `cancelled`.
- Partial payment status result: `partially_paid`, including payments against overdue invoices.
- Full payment status result: `paid`.
- Query keys:
  - `['payments']`
  - `['payments', 'form-options']`
  - invalidate `['invoices']` after create.
- Keep application-level validation and document the non-atomic tradeoff.

---

## Task 1: Add Schema and Types

- [ ] Add `create-payment-schema.ts`.
- [ ] Add payment form option types to the repository.
- [ ] Export new schema and types.

## Task 2: Add Repository Behavior

- [ ] Add payable invoice option loading.
- [ ] Calculate paid and remaining amounts from existing payments.
- [ ] Add `createPayment()`.
- [ ] Recheck invoice status, organization, and remaining balance before insert.
- [ ] Insert payment.
- [ ] Update invoice status to `partially_paid` or `paid`.

## Task 3: Add Hooks

- [ ] Add `usePaymentFormOptionsQuery`.
- [ ] Add `useCreatePaymentMutation`.
- [ ] Invalidate payments, payment form options, and invoices after successful create.

## Task 4: Add Create Page

- [ ] Add invoice selector.
- [ ] Show selected invoice context.
- [ ] Add date, amount, method, reference, and notes fields.
- [ ] Block overpayment before mutation.
- [ ] Navigate back to `/dashboard/payments` after success.

## Task 5: Register Route and Entry Point

- [ ] Add `dashboardPaymentsNew`.
- [ ] Lazy-load and register `CreatePaymentPage`.
- [ ] Add `Add payment` link on Payments page.

## Task 6: Update Documentation

- [ ] Mark Record Payment flow built in wiki status.
- [ ] Move Record Payment from ready soon to completed task candidates.
- [ ] Keep edit, delete, receipts, refunds, gateway, reconciliation, RPC, and dashboard metrics deferred.

## Task 7: Validate

- [ ] Run `npm run build`.
- [ ] Run `npm run lint`.
- [ ] Run `git diff --check`.
- [ ] Review `git status --short`.
