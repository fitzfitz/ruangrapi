# Billing / Invoices MVP Baseline Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the Billing / Invoices MVP baseline so an authenticated, onboarded rental owner can view organization-scoped invoices and create draft rent invoices from active leases.

**Architecture:** Add a `src/modules/invoices/` domain module that follows the existing Properties, Units, Tenants, and Leases module patterns. Keep this epic limited to invoice visibility and draft rent invoice creation. Payments, receipts, reminders, overdue automation, utility billing, PDF/download workflows, and dashboard metrics remain deferred.

**Tech Stack:** React, TypeScript, Vite, React Router, TanStack Query, React Hook Form, Zod, Supabase.

---

## Source Documents

Read these before executing Task 1:

- `docs/superpowers/specs/2026-05-30-billing-invoices-mvp-baseline-design.md`
- `README.md`
- `AGENTS.md`
- `HERMES.md`
- `docs/01-mvp-scope.md`
- `docs/03-architecture.md`
- `docs/04-data-model-draft.md`
- `docs/06-development-checklist.md`
- `docs/07-rls-strategy.md`
- `wiki/03-domain/billing.md`
- `wiki/04-roadmap/mvp-epics.md`
- `wiki/04-roadmap/release-plan.md`
- `wiki/06-task-breakdown/task-index.md`

## File Map

Create during implementation:

- `docs/19-billing-invoices-module-plan.md`: planning record for the Billing / Invoices module.
- `docs/20-billing-invoices-validation-checklist.md`: manual validation checklist and closeout notes for Billing / Invoices.
- `src/modules/invoices/domain/invoice.ts`: Invoice and Invoice Line Item types plus list row types.
- `src/modules/invoices/domain/create-invoice-schema.ts`: create draft rent invoice form schema and inferred types.
- `src/modules/invoices/infrastructure/invoices-repository.ts`: Supabase reads and writes for invoices, invoice line items, active lease options, and duplicate checks.
- `src/modules/invoices/application/use-invoices-query.ts`: invoices list query hook.
- `src/modules/invoices/application/use-invoice-form-options-query.ts`: create form active Lease option query hook.
- `src/modules/invoices/application/use-create-invoice-mutation.ts`: create draft rent invoice mutation hook.
- `src/modules/invoices/presentation/invoices-page.tsx`: read-only invoices list with loading/error/empty states.
- `src/modules/invoices/presentation/create-invoice-page.tsx`: create draft rent invoice page.
- `src/modules/invoices/index.ts`: public exports for routing and future module consumers.

Modify during implementation:

- `src/app/layouts/app-layout.tsx`: promote Invoices into primary navigation.
- `src/app/router/route-paths.ts`: add Invoice route constants in the slices that use them.
- `src/app/router/app-router.tsx`: register lazy-loaded Invoice routes behind the existing dashboard gate.
- `src/App.css`: add Invoice page/form classes using existing conventions.
- `docs/06-development-checklist.md`: add Billing / Invoices module status and validation references.
- `wiki/03-domain/billing.md`: mark Billing / Invoices baseline built at closeout and record deferred Billing work.
- `wiki/04-roadmap/mvp-epics.md`: mark Billing / Invoices built at closeout.
- `wiki/04-roadmap/release-plan.md`: promote Payments planning as the next step.
- `wiki/06-task-breakdown/task-index.md`: mark Billing / Invoices complete and promote Payments planning.
- `wiki/06-task-breakdown/ready-soon.md`: replace Billing / Invoices ready-soon candidates with Payments planning.
- `wiki/06-task-breakdown/backlog.md`: remove completed Billing / Invoices baseline items and keep deferred Billing work.
- `wiki/09-status/built.md`: add Billing / Invoices baseline.
- `wiki/09-status/not-built.md`: remove or revise Billing / Invoices entries after closeout.
- `wiki/00-home.md` and `wiki/08-decisions/decision-log.md` if needed to avoid stale wiki status.

## Global Decisions

- Use the existing `invoices` and `invoice_line_items` tables. Do not create a migration.
- The first route is `/dashboard/invoices`.
- The module folder is `src/modules/invoices/`.
- Do not add a broad `/dashboard/billing` landing page in this epic.
- Do not add invoice detail, edit, issue, send, cancel, payment, receipt, reminder, overdue automation, utility reading, utility billing, PDF/download, email, WhatsApp, maintenance, reporting, or dashboard metric behavior.
- Add `dashboardInvoices` route path in the read-only list slice.
- Add `dashboardInvoicesNew` route path only in the create flow slice.
- After create success, navigate to `/dashboard/invoices`.
- Create only draft rent invoices in the baseline.
- Draft invoices should not set `issued_at` or `due_date`.
- Create one rent line item per generated draft invoice.
- Store money fields as whole-rupiah integer amounts.
- Use application checks plus database uniqueness to prevent duplicate non-cancelled invoices for the same lease and billing period.
- Run `npm run lint`, `npm run build`, and `git diff --check` before each source implementation commit.

---

### Task 1: Document Billing / Invoices Module Plan

**Files:**

- Create: `docs/19-billing-invoices-module-plan.md`

- [ ] **Step 1: Create the planning document**

Create `docs/19-billing-invoices-module-plan.md`:

````markdown
# Billing / Invoices Module Plan

## Status

Status: approved for sliced implementation.

This document plans the Billing / Invoices MVP baseline. It does not implement source code, create migrations, alter RLS policies, issue invoices, record payments, generate receipts, send reminders, automate overdue status, create PDFs, or introduce dashboard metrics.

## Purpose

Invoices represent monthly billing records for active leases. The baseline supports viewing invoices and creating draft rent invoices from active leases. Payments, receipts, reminders, utility billing, and reporting come later.

## Approved Scope

The Billing / Invoices MVP baseline includes:

- Top-level Invoices navigation.
- `/dashboard/invoices` read-only list.
- `/dashboard/invoices/new` create draft rent invoice flow.
- Invoice and invoice line item types.
- Create draft rent invoice validation schema.
- Repository functions, query hooks, and mutation hooks.
- Active Lease option loading for the create form.
- Duplicate invoice prevention for lease + billing period.
- Manual validation checklist.
- Closeout documentation and wiki updates.

## Existing Schema

The existing `invoices` table has:

- `id`
- `organization_id`
- `lease_id`
- `tenant_id`
- `unit_id`
- `billing_period`
- `issued_at`
- `due_date`
- `subtotal_amount`
- `total_amount`
- `status`
- `cancelled_at`
- `notes`
- `created_at`
- `updated_at`

The existing `invoice_line_items` table has:

- `id`
- `organization_id`
- `invoice_id`
- `description`
- `line_type`
- `quantity`
- `unit_amount`
- `total_amount`
- `sort_order`
- `created_at`
- `updated_at`

No migration is expected for this module.

## Validation Rules

- `lease_id` is required.
- `billing_period` is required.
- `billing_period` must be the first day of a month.
- Selected lease must be active.
- Selected lease must belong to the current organization.
- Selected lease must not already have a non-cancelled invoice for the selected billing period.
- Generated rent line item amount must match the lease monthly rent amount.
- Invoice `subtotal_amount` and `total_amount` must match generated line item totals.
- Draft invoices do not require `issued_at` or `due_date`.
- Blank notes should store as `null`.

## Routes

- `/dashboard/invoices`
- `/dashboard/invoices/new`

All routes use the existing dashboard `RouteAccessGate`.

## Module Shape

```txt
src/modules/invoices/
  application/
  domain/
  infrastructure/
  presentation/
  index.ts
```
````

## Query and Mutation Strategy

- List query key: `['invoices']`.
- Form options query key: `['invoices', 'form-options']`.
- Create mutation invalidates `['invoices']`.
- Supabase RLS remains the organization boundary.
- Active Lease choices come from organization-scoped queries.
- Create flow inserts the invoice first, then one rent line item.
- If line item insert fails after invoice insert, surface a clear create error and leave cleanup/reconciliation for manual follow-up in this baseline; transactional RPC can be planned later if needed.

## Deferred Work

The Billing / Invoices module does not include:

- Invoice detail route.
- Invoice edit flow.
- Invoice issue/send flow.
- Invoice cancel flow.
- Payments.
- Receipts.
- Reminders or WhatsApp messages.
- Automatic overdue status jobs.
- Payment balance calculations.
- Partial payment handling.
- Receipt number generation.
- Utility reading capture.
- Utility billing automation.
- Invoice PDFs, downloads, email, or WhatsApp delivery.
- Maintenance, reporting, or dashboard metrics.
- Schema or RLS migrations.

## Next Module

After Billing / Invoices closeout, the next recommended epic is Payments MVP Baseline, starting with Payments module planning and a manual record Payment flow.

````

- [ ] **Step 2: Validate the documentation change**

Run:

```bash
git diff --check
````

Expected: no output and exit code `0`.

- [ ] **Step 3: Commit Task 1**

Run:

```bash
git add docs/19-billing-invoices-module-plan.md
git commit -m "Document Billing Invoices module plan"
```

Expected: one commit containing only `docs/19-billing-invoices-module-plan.md`.

---

### Task 2: Add Read-Only Invoices List

**Files:**

- Create: `src/modules/invoices/domain/invoice.ts`
- Create: `src/modules/invoices/infrastructure/invoices-repository.ts`
- Create: `src/modules/invoices/application/use-invoices-query.ts`
- Create: `src/modules/invoices/presentation/invoices-page.tsx`
- Create: `src/modules/invoices/index.ts`
- Modify: `src/app/router/route-paths.ts`
- Modify: `src/app/router/app-router.tsx`
- Modify: `src/app/layouts/app-layout.tsx`
- Modify: `src/App.css`

- [ ] **Step 1: Add Invoice domain types**

Create `src/modules/invoices/domain/invoice.ts` with:

- `InvoiceStatus = 'draft' | 'unpaid' | 'partially_paid' | 'paid' | 'overdue' | 'cancelled'`
- `InvoiceLineItemType = 'rent' | 'utility' | 'other'`
- `Invoice`
- `InvoiceLineItem`
- `InvoiceListItem = Invoice & { tenant_name; unit_name; property_name; lease_start_date; lease_end_date }`

Use exact database column names and nullable types:

- `issued_at: string | null`
- `due_date: string | null`
- `cancelled_at: string | null`
- `notes: string | null`
- amount fields as `number`

- [ ] **Step 2: Add Invoices repository list query**

Create `src/modules/invoices/infrastructure/invoices-repository.ts`.

Add:

- `export const invoicesQueryKey = ['invoices'] as const`
- `invoiceListSelectColumns` selecting invoice columns plus:
  - `tenants ( full_name )`
  - `units ( name, properties ( name ) )`
  - `leases ( start_date, end_date )`
- `type InvoiceListRow`
- `mapInvoiceListRow(row): InvoiceListItem`
- `listInvoices(): Promise<InvoiceListItem[]>`

List ordering:

- newest created first initially: `.order('created_at', { ascending: false })`

Do not filter cancelled invoices yet unless the spec is updated; the baseline should reflect actual data and defer collection views.

- [ ] **Step 3: Add Invoices query hook**

Create `src/modules/invoices/application/use-invoices-query.ts`:

- use `useQuery`
- query key `invoicesQueryKey`
- query function `listInvoices`

- [ ] **Step 4: Add Invoices page**

Create `src/modules/invoices/presentation/invoices-page.tsx`.

It should:

- render inside `AppLayout`
- use `useInvoicesQuery`
- show title `Invoices`
- explain this screen tracks invoice records and keeps payments/receipts/reminders separate
- show loading, error, empty, and populated states
- format money as IDR with no decimals
- format date-only values without timezone shifting
- format billing period as month/year
- show status, billing period, due date or `No due date`, total amount, tenant, unit, property, and lease period
- not show create link until Task 3

- [ ] **Step 5: Add module exports**

Create `src/modules/invoices/index.ts` exporting:

- types from domain
- `invoicesQueryKey`
- `listInvoices`
- `useInvoicesQuery`
- `InvoicesPage`

- [ ] **Step 6: Add route path**

Modify `src/app/router/route-paths.ts`:

```ts
dashboardInvoices: '/dashboard/invoices',
```

Add only `dashboardInvoices` in Task 2. Do not add `dashboardInvoicesNew` until Task 3.

- [ ] **Step 7: Register lazy route**

Modify `src/app/router/app-router.tsx`:

- Add lazy import for `InvoicesPage` from `../../modules/invoices/presentation/invoices-page`
- Register `routePaths.dashboardInvoices` behind `RouteAccessGate route="dashboard"`

- [ ] **Step 8: Promote Invoices navigation**

Modify `src/app/layouts/app-layout.tsx`:

- Add Invoices to active navigation after Leases.
- Keep Payments, Receipts, Reminders, Maintenance, and Reporting deferred or omitted according to existing navigation style.

- [ ] **Step 9: Add list CSS**

Modify `src/App.css`:

- Add `.invoices-page`
- Add `.invoices-page__header`
- Add `.invoices-page__status`
- Add `.invoices-page__error`
- Add `.invoices-page__empty`
- Add `.invoices-page__list`
- Add `.invoice-card`
- Add `.invoice-card__header`
- Add `.invoice-card__status`
- Add `.invoice-card__details`

Follow existing card/list responsive conventions. Ensure long tenant/unit/property names wrap.

- [ ] **Step 10: Validate source**

Run:

```bash
npm run lint
npm run build
git diff --check
```

Expected:

- all commands exit `0`
- build has no chunk-size warning regression

- [ ] **Step 11: Commit Task 2**

Run:

```bash
git add src/modules/invoices src/app/router/route-paths.ts src/app/router/app-router.tsx src/app/layouts/app-layout.tsx src/App.css
git commit -m "Add read-only Invoices list"
```

Expected: one commit containing only the read-only Invoices list slice.

---

### Task 3: Add Create Draft Rent Invoice Flow

**Files:**

- Create: `src/modules/invoices/domain/create-invoice-schema.ts`
- Create: `src/modules/invoices/application/use-invoice-form-options-query.ts`
- Create: `src/modules/invoices/application/use-create-invoice-mutation.ts`
- Create: `src/modules/invoices/presentation/create-invoice-page.tsx`
- Modify: `src/modules/invoices/infrastructure/invoices-repository.ts`
- Modify: `src/modules/invoices/index.ts`
- Modify: `src/modules/invoices/presentation/invoices-page.tsx`
- Modify: `src/app/router/route-paths.ts`
- Modify: `src/app/router/app-router.tsx`
- Modify: `src/App.css`

- [ ] **Step 1: Add create invoice schema**

Create `src/modules/invoices/domain/create-invoice-schema.ts`.

Validation requirements:

- `lease_id` required
- `billing_period` required
- accept month input as `YYYY-MM`
- transform `YYYY-MM` to `YYYY-MM-01`
- reject invalid months
- optional `notes`, trimmed, blank to `null`

Export:

- `createInvoiceSchema`
- `CreateInvoiceInput`
- `CreateInvoiceFormValues`

- [ ] **Step 2: Extend repository for form options and create**

Modify `src/modules/invoices/infrastructure/invoices-repository.ts`.

Add:

- `export const invoiceFormOptionsQueryKey = [...invoicesQueryKey, 'form-options'] as const`
- `InvoiceLeaseOption`
- `InvoiceFormOptions`
- `CreateInvoiceRecord`
- `listInvoiceFormOptions(): Promise<InvoiceFormOptions>`
- `createDraftRentInvoice(record: CreateInvoiceRecord): Promise<Invoice>`

Active lease option query should select active leases with:

- lease id
- organization id
- tenant id
- unit id
- start date
- end date
- monthly rent amount
- billing day
- tenant name
- unit name
- property name

Only offer `status = active` leases.

Create logic should:

1. Validate selected lease belongs to `organization_id` and is active.
2. Check no non-cancelled invoice exists for the same `organization_id`, `lease_id`, and `billing_period`.
3. Insert invoice with:
   - organization id from current profile context
   - lease id from selected lease
   - tenant id from selected lease
   - unit id from selected lease
   - billing period from schema transform
   - subtotal and total equal to lease monthly rent amount
   - status `draft`
   - notes from form
   - no issued_at
   - no due_date
4. Insert one line item:
   - same organization id
   - created invoice id
   - description `Monthly rent`
   - line_type `rent`
   - quantity `1`
   - unit_amount monthly rent
   - total_amount monthly rent
   - sort_order `0`
5. Return the created invoice.

Important: this baseline does not add an RPC. If the line item insert fails after invoice insert, throw a clear error and leave transactional cleanup as a deferred follow-up unless the owner approves a database RPC.

- [ ] **Step 3: Add form options query hook**

Create `src/modules/invoices/application/use-invoice-form-options-query.ts`:

- use `useQuery`
- query key `invoiceFormOptionsQueryKey`
- query function `listInvoiceFormOptions`

- [ ] **Step 4: Add create mutation hook**

Create `src/modules/invoices/application/use-create-invoice-mutation.ts`:

- accept `{ organizationId, input }`
- call `createDraftRentInvoice({ organization_id: organizationId, ...input })`
- invalidate `invoicesQueryKey` on success

- [ ] **Step 5: Add create route path**

Modify `src/app/router/route-paths.ts`:

```ts
dashboardInvoicesNew: '/dashboard/invoices/new',
```

- [ ] **Step 6: Add Create Invoice page**

Create `src/modules/invoices/presentation/create-invoice-page.tsx`.

It should:

- render inside `AppLayout`
- use current profile organization id
- use `useInvoiceFormOptionsQuery`
- use `useCreateInvoiceMutation`
- use React Hook Form and Zod resolver
- show select for active lease
- show selected lease context if straightforward: tenant, unit, property, monthly rent
- show month input for billing period
- show optional notes
- show validation errors
- show loading, error, and empty-option states
- include Back to invoices and Cancel links
- submit creates draft rent invoice and navigates to `/dashboard/invoices`
- avoid payment, receipt, reminder, issue/send, overdue, or PDF promises

- [ ] **Step 7: Register lazy create route**

Modify `src/app/router/app-router.tsx`:

- Add lazy import for `CreateInvoicePage`
- Register `routePaths.dashboardInvoicesNew` behind `RouteAccessGate route="dashboard"`

- [ ] **Step 8: Export create pieces**

Modify `src/modules/invoices/index.ts` to export:

- create schema and types
- form option types and query key
- create repository function
- `useInvoiceFormOptionsQuery`
- `useCreateInvoiceMutation`
- `CreateInvoicePage`

- [ ] **Step 9: Add create action to list page**

Modify `src/modules/invoices/presentation/invoices-page.tsx`:

- import `Link` and `routePaths`
- add link text `Add invoice` to `routePaths.dashboardInvoicesNew`

- [ ] **Step 10: Add create form CSS**

Modify `src/App.css`:

- Add `.create-invoice-page`
- Add `.create-invoice-page__header`
- Add `.create-invoice-page__status`
- Add `.create-invoice-page__error`
- Add `.create-invoice-page__empty`
- Add `.invoice-form`
- Add `.invoice-form__field`
- Add `.invoice-form__context`
- Add `.invoice-form__error`
- Add `.invoice-form__actions`

Follow existing form conventions and responsive constraints.

- [ ] **Step 11: Validate source**

Run:

```bash
npm run lint
npm run build
git diff --check
```

Expected:

- all commands exit `0`
- build has no chunk-size warning regression

- [ ] **Step 12: Commit Task 3**

Run:

```bash
git add src/modules/invoices src/app/router/route-paths.ts src/app/router/app-router.tsx src/App.css
git commit -m "Add create draft Invoice flow"
```

Expected: one commit containing only the create draft rent invoice slice.

---

### Task 4: Document Billing / Invoices Validation Checklist

**Files:**

- Create: `docs/20-billing-invoices-validation-checklist.md`
- Modify: `docs/06-development-checklist.md`

- [ ] **Step 1: Create validation checklist**

Create `docs/20-billing-invoices-validation-checklist.md` with sections:

- Status
- Automated Checks
- Read-Only Invoices List
- Create Draft Rent Invoice Flow
- Regression Checks
- Boundaries
- Deferred Work

Checklist must include:

- `npm run lint` passes
- `npm run build` passes without chunk-size warning regression
- `git diff --check` passes
- authenticated/onboarded users can open `/dashboard/invoices`
- unauthenticated users cannot access `/dashboard/invoices`
- sidebar Invoices link works
- list loading/empty/error/populated states
- invoices listed belong to current organization
- list shows tenant, unit, property, billing period, status, due date, and total
- authenticated/onboarded users can open `/dashboard/invoices/new`
- active lease options load from current organization
- inactive/cancelled/ended leases are not offered
- missing lease shows validation error
- missing billing period shows validation error
- invalid billing period shows validation error
- duplicate non-cancelled invoice for same lease and billing period fails gracefully
- valid submit creates one draft invoice and one rent line item
- created invoice totals match line item total
- blank notes store as null
- redirect back to `/dashboard/invoices`
- created invoice appears after redirect
- no payment, receipt, reminder, overdue automation, utility billing, PDF, maintenance, or dashboard behavior introduced

- [ ] **Step 2: Add Billing references to development checklist**

Append this section to `docs/06-development-checklist.md`:

```markdown
### Manual validation: Billing / Invoices MVP baseline

Validate the committed Billing / Invoices baseline manually before the owner closes out the module.

- [ ] Follow `docs/20-billing-invoices-validation-checklist.md`.
- [ ] Confirm the Billing / Invoices module remains limited to invoice visibility and draft rent invoice creation.
- [ ] Confirm payments are still deferred.
- [ ] Confirm receipts are still deferred.
- [ ] Confirm reminders and overdue automation are still deferred.
- [ ] Confirm the next recommended module is Payments.
```

- [ ] **Step 3: Verify documentation**

Run:

```bash
git diff --check
```

Expected exit code `0`.

- [ ] **Step 4: Commit Task 4**

Run:

```bash
git add docs/06-development-checklist.md docs/20-billing-invoices-validation-checklist.md
git commit -m "Document Billing Invoices validation checklist"
```

Expected: one commit containing the validation checklist and development checklist reference.

---

### Task 5: Close Out Billing / Invoices and Promote Payments

**Files:**

- Modify: `docs/06-development-checklist.md`
- Modify: `docs/20-billing-invoices-validation-checklist.md`
- Modify: `wiki/00-home.md`
- Modify: `wiki/03-domain/billing.md`
- Modify: `wiki/04-roadmap/mvp-epics.md`
- Modify: `wiki/04-roadmap/release-plan.md`
- Modify: `wiki/06-task-breakdown/task-index.md`
- Modify: `wiki/06-task-breakdown/ready-soon.md`
- Modify: `wiki/06-task-breakdown/backlog.md`
- Modify: `wiki/08-decisions/decision-log.md`
- Modify: `wiki/09-status/built.md`
- Modify: `wiki/09-status/not-built.md`

- [ ] **Step 1: Update development checklist module status**

Modify the Phase 5 module status in `docs/06-development-checklist.md` so it includes:

```markdown
- [x] Billing / Invoices MVP baseline documented and implemented as the draft rent invoice module
```

- [ ] **Step 2: Add Billing / Invoices closeout note**

Append closeout notes to `docs/20-billing-invoices-validation-checklist.md`:

```markdown
## Closeout

Billing / Invoices MVP baseline is complete when:

- [ ] Read-only list is validated.
- [ ] Create draft rent invoice flow is validated.
- [ ] Automated checks pass.
- [ ] Deferred work is documented.
- [ ] Wiki status pages identify Payments planning as the next step.

Deferred Billing / Invoices work:

- Invoice detail remains out of scope.
- Invoice edit remains out of scope.
- Invoice issue/send remains out of scope.
- Invoice cancel remains out of scope.
- Payments remain out of scope.
- Receipts remain out of scope.
- Reminders and WhatsApp messages remain out of scope.
- Automatic overdue status jobs remain out of scope.
- Utility reading capture and utility billing remain out of scope.
- Invoice PDFs, downloads, email, and WhatsApp delivery remain out of scope.
- Dashboard metrics remain out of scope.
```

- [ ] **Step 3: Update wiki status and roadmap**

Update these wiki pages so they consistently say Billing / Invoices is built and Payments planning is next:

- `wiki/00-home.md`
- `wiki/03-domain/billing.md`
- `wiki/04-roadmap/mvp-epics.md`
- `wiki/04-roadmap/release-plan.md`
- `wiki/06-task-breakdown/task-index.md`
- `wiki/06-task-breakdown/ready-soon.md`
- `wiki/06-task-breakdown/backlog.md`
- `wiki/08-decisions/decision-log.md`
- `wiki/09-status/built.md`
- `wiki/09-status/not-built.md`

Use this canonical closeout state:

```markdown
Billing / Invoices status: MVP baseline complete.

Built:

- plan Billing / Invoices module
- read-only Invoices list
- create draft rent Invoice flow
- validation checklist
- Billing / Invoices module closeout

Deferred:

- invoice detail
- invoice edit
- invoice issue/send
- invoice cancel
- payments
- receipts
- reminders and WhatsApp messages
- automatic overdue status jobs
- utility reading capture and utility billing
- invoice PDFs, downloads, email, and WhatsApp delivery
- dashboard metrics

Next recommended module: Payments planning.
```

- [ ] **Step 4: Verify closeout docs and source**

Run:

```bash
git diff --check
npm run lint
npm run build
```

Expected:

- all commands exit `0`
- build has no chunk-size warning regression

- [ ] **Step 5: Commit Task 5**

Run:

```bash
git add docs/06-development-checklist.md docs/20-billing-invoices-validation-checklist.md wiki/00-home.md wiki/03-domain/billing.md wiki/04-roadmap/mvp-epics.md wiki/04-roadmap/release-plan.md wiki/06-task-breakdown/task-index.md wiki/06-task-breakdown/ready-soon.md wiki/06-task-breakdown/backlog.md wiki/08-decisions/decision-log.md wiki/09-status/built.md wiki/09-status/not-built.md
git commit -m "Close out Billing Invoices module"
```

Expected: one commit containing closeout documentation and wiki updates.

---

## Final Verification

After Task 5, run:

```bash
npm run lint
npm run build
git diff --check
git status --short
```

Expected:

- `npm run lint` exits `0`.
- `npm run build` exits `0`.
- build has no chunk-size warning regression.
- `git diff --check` exits `0`.
- `git status --short` shows no uncommitted changes except user-owned files that were already untracked or modified before execution.

## Handoff

When this plan is complete, the next recommended epic is Payments MVP Baseline:

1. Create Payments module plan.
2. Add manual record Payment flow.
3. Add payment list or invoice payment context.
4. Close out Payments and promote Receipts.
