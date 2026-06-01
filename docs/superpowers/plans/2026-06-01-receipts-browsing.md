# Receipts Browsing Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build receipt list, receipt detail, and browser-print support so generated receipts are usable beyond the payment card.

**Architecture:** Extend the existing `receipts` module with read queries and presentation pages. Keep receipts read-only, use Supabase nested selects for receipt/payment/invoice/tenant/unit/property data, and keep print as browser print rather than PDF generation.

**Tech Stack:** React, TypeScript, Vite, TanStack Query, Supabase.

---

### Task 1: Receipt Data Queries

**Files:**

- Modify: `src/modules/receipts/domain/receipt.ts`
- Modify: `src/modules/receipts/infrastructure/receipts-repository.ts`
- Create: `src/modules/receipts/application/use-receipts-query.ts`
- Create: `src/modules/receipts/application/use-receipt-query.ts`
- Modify: `src/modules/receipts/index.ts`

- [ ] Add receipt list/detail domain types with payment, invoice, tenant, unit, and property summary fields.
- [ ] Add `receiptsQueryKey`, `receiptQueryKey(receiptId)`, `listReceipts()`, and `getReceipt(receiptId)`.
- [ ] Add React Query hooks for list and detail.
- [ ] Export the new hooks and query helpers.

### Task 2: Receipt List Route

**Files:**

- Create: `src/modules/receipts/presentation/receipts-page.tsx`
- Modify: `src/app/router/route-paths.ts`
- Modify: `src/app/router/app-router.tsx`
- Modify: `src/app/layouts/app-layout.tsx`
- Modify: `src/App.css`

- [ ] Add `/dashboard/receipts`.
- [ ] Add Receipts to dashboard navigation.
- [ ] Render loading, error, empty, and list states.
- [ ] Each receipt card links to `/dashboard/receipts/:receiptId`.

### Task 3: Real Receipt Detail and Print

**Files:**

- Modify: `src/modules/receipts/presentation/receipt-detail-page.tsx`
- Modify: `src/App.css`

- [ ] Replace placeholder with real data loading.
- [ ] Render receipt number, issued date, payment amount/date/method/reference, tenant, unit, property, billing period, and invoice status.
- [ ] Add `Print` button that calls `window.print()`.
- [ ] Add print CSS that hides app chrome and actions while presenting the receipt content cleanly.

### Task 4: Payments Link Polish and Verification

**Files:**

- Modify: `src/modules/payments/presentation/payments-page.tsx`
- Modify: `docs/23-receipts-validation-checklist.md`
- Modify: `wiki/03-domain/receipts.md`
- Modify: `wiki/09-status/built.md`

- [ ] Keep payment card `View receipt` links pointing to real detail pages.
- [ ] Update validation checklist and wiki status for receipt list/detail/print.
- [ ] Run `npm run format:check`.
- [ ] Run `npm run build`.
- [ ] Run `npm run lint`.
