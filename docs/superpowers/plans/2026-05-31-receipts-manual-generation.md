# Receipts Manual Generation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add manual receipt generation from the Payments list, using the existing `receipts` table and database-backed receipt numbering.

**Architecture:** Add a focused `src/modules/receipts/` module for receipt domain, repository, and mutation behavior. Extend the Payments list query to include zero-or-one receipt summary data, then render polished receipt panels inside existing payment cards. Keep this slice app-side only: no migrations, no seed data, no receipt detail/list route, no PDF, no delivery, and no automatic generation.

**Tech Stack:** React, TypeScript, Vite, TanStack Query, Supabase JS, existing CSS in `src/App.css`.

---

## File Map

- Create `src/modules/receipts/domain/receipt.ts`: Receipt types returned by Supabase and used by the UI.
- Create `src/modules/receipts/infrastructure/receipts-repository.ts`: `createReceiptFromPayment` insert helper.
- Create `src/modules/receipts/application/use-create-receipt-mutation.ts`: TanStack mutation that invalidates Payments.
- Create `src/modules/receipts/index.ts`: Receipts module exports.
- Modify `src/modules/payments/domain/payment.ts`: Add nullable receipt summary fields to `PaymentListItem`.
- Modify `src/modules/payments/infrastructure/payments-repository.ts`: Load nested `receipts` data and map it into payment list items.
- Modify `src/modules/payments/presentation/payments-page.tsx`: Add receipt generation UI state and card panels.
- Modify `src/App.css`: Add polished receipt panel styles.
- Create `docs/23-receipts-validation-checklist.md`: Manual validation checklist.
- Modify wiki status files: mark Receipts MVP baseline as implementation-ready/complete after implementation and record deferred work.

---

### Task 1: Add Receipts Module

**Files:**

- Create: `src/modules/receipts/domain/receipt.ts`
- Create: `src/modules/receipts/infrastructure/receipts-repository.ts`
- Create: `src/modules/receipts/application/use-create-receipt-mutation.ts`
- Create: `src/modules/receipts/index.ts`

- [ ] **Step 1: Create the receipt domain type**

Create `src/modules/receipts/domain/receipt.ts`:

```ts
export type Receipt = {
  id: string
  organization_id: string
  payment_id: string
  receipt_number: string
  issued_at: string
  created_at: string
  updated_at: string
}
```

- [ ] **Step 2: Create the receipt repository**

Create `src/modules/receipts/infrastructure/receipts-repository.ts`:

```ts
import { supabaseClient } from '../../../shared/lib'
import type { Receipt } from '../domain/receipt'

export type CreateReceiptFromPaymentInput = {
  organization_id: string
  payment_id: string
}

const receiptSelectColumns =
  'id, organization_id, payment_id, receipt_number, issued_at, created_at, updated_at'

export async function createReceiptFromPayment({
  organization_id,
  payment_id,
}: CreateReceiptFromPaymentInput): Promise<Receipt> {
  const { data, error } = await supabaseClient
    .from('receipts')
    .insert({
      organization_id,
      payment_id,
    })
    .select(receiptSelectColumns)
    .single<Receipt>()

  if (error !== null) {
    throw new Error(`Could not generate receipt: ${error.message}`)
  }

  return data
}
```

- [ ] **Step 3: Create the receipt mutation**

Create `src/modules/receipts/application/use-create-receipt-mutation.ts`:

```ts
import { useMutation, useQueryClient } from '@tanstack/react-query'

import { paymentsQueryKey } from '../../payments'
import {
  createReceiptFromPayment,
  type CreateReceiptFromPaymentInput,
} from '../infrastructure/receipts-repository'

export function useCreateReceiptMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: CreateReceiptFromPaymentInput) =>
      createReceiptFromPayment(input),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: paymentsQueryKey })
    },
  })
}
```

- [ ] **Step 4: Create module exports**

Create `src/modules/receipts/index.ts`:

```ts
export type { Receipt } from './domain/receipt'
export { useCreateReceiptMutation } from './application/use-create-receipt-mutation'
export {
  createReceiptFromPayment,
  type CreateReceiptFromPaymentInput,
} from './infrastructure/receipts-repository'
```

- [ ] **Step 5: Run type/build verification**

Run:

```bash
npm run build
```

Expected: build succeeds. If it fails because an import path cannot resolve, fix the exact path before continuing.

- [ ] **Step 6: Commit**

```bash
git add src/modules/receipts
git commit -m "feat: add receipts module foundation"
```

---

### Task 2: Add Receipt Summary To Payments Query

**Files:**

- Modify: `src/modules/payments/domain/payment.ts`
- Modify: `src/modules/payments/infrastructure/payments-repository.ts`

- [ ] **Step 1: Extend the payment list domain type**

Modify `src/modules/payments/domain/payment.ts` so `PaymentListItem` includes nullable receipt fields:

```ts
export type PaymentListItem = Payment & {
  tenant_name: string
  unit_name: string
  property_name: string | null
  invoice_billing_period: string
  invoice_status: string
  receipt_id: string | null
  receipt_number: string | null
  receipt_issued_at: string | null
}
```

- [ ] **Step 2: Extend the Supabase select**

Modify `paymentListSelectColumns` in `src/modules/payments/infrastructure/payments-repository.ts` to include nested receipts:

```ts
const paymentListSelectColumns = `
  id,
  organization_id,
  invoice_id,
  amount,
  payment_date,
  payment_method,
  reference_number,
  notes,
  created_at,
  updated_at,
  receipts (
    id,
    receipt_number,
    issued_at
  ),
  invoices (
    billing_period,
    status,
    tenants (
      full_name
    ),
    units (
      name,
      properties (
        name
      )
    )
  )
`
```

- [ ] **Step 3: Extend the payment row type**

Modify `PaymentListRow` in `src/modules/payments/infrastructure/payments-repository.ts`:

```ts
type PaymentReceiptRow = {
  id: string
  receipt_number: string
  issued_at: string
}

type PaymentListRow = {
  id: string
  organization_id: string
  invoice_id: string
  amount: number
  payment_date: string
  payment_method: PaymentMethod
  reference_number: string | null
  notes: string | null
  created_at: string
  updated_at: string
  receipts: PaymentReceiptRow[] | null
  invoices: {
    billing_period: string
    status: string
    tenants: { full_name: string } | null
    units: { name: string; properties: { name: string } | null } | null
  } | null
}
```

- [ ] **Step 4: Map the receipt summary**

Modify `mapPaymentListRow` to derive the first receipt row:

```ts
function mapPaymentListRow(row: PaymentListRow): PaymentListItem {
  const receipt = row.receipts?.[0] ?? null

  return {
    id: row.id,
    organization_id: row.organization_id,
    invoice_id: row.invoice_id,
    amount: row.amount,
    payment_date: row.payment_date,
    payment_method: row.payment_method,
    reference_number: row.reference_number,
    notes: row.notes,
    created_at: row.created_at,
    updated_at: row.updated_at,
    tenant_name: row.invoices?.tenants?.full_name ?? 'Unknown tenant',
    unit_name: row.invoices?.units?.name ?? 'Unknown unit',
    property_name: row.invoices?.units?.properties?.name ?? null,
    invoice_billing_period:
      row.invoices?.billing_period ?? `${row.payment_date.slice(0, 7)}-01`,
    invoice_status: row.invoices?.status ?? 'unknown',
    receipt_id: receipt?.id ?? null,
    receipt_number: receipt?.receipt_number ?? null,
    receipt_issued_at: receipt?.issued_at ?? null,
  }
}
```

- [ ] **Step 5: Run type/build verification**

Run:

```bash
npm run build
```

Expected: build succeeds and no `PaymentListItem` required-field errors remain.

- [ ] **Step 6: Commit**

```bash
git add src/modules/payments/domain/payment.ts src/modules/payments/infrastructure/payments-repository.ts
git commit -m "feat: include receipt status in payments"
```

---

### Task 3: Add Receipt Generation UI Behavior

**Files:**

- Modify: `src/modules/payments/presentation/payments-page.tsx`

- [ ] **Step 1: Add imports and mutation state**

Modify the top of `src/modules/payments/presentation/payments-page.tsx`:

```tsx
import { useState } from 'react'
import { Link } from 'react-router-dom'

import { routePaths } from '../../../app/router/route-paths'
import { AppLayout } from '../../../app/layouts'
import { useCreateReceiptMutation } from '../../receipts'
import { usePaymentsQuery } from '../application/use-payments-query'
import type { PaymentListItem, PaymentMethod } from '../domain/payment'
```

Inside `PaymentsPage`, add local state and the mutation:

```tsx
export function PaymentsPage() {
  const paymentsQuery = usePaymentsQuery()
  const createReceiptMutation = useCreateReceiptMutation()
  const [generatingReceiptPaymentId, setGeneratingReceiptPaymentId] = useState<
    string | null
  >(null)
  const [receiptErrorPaymentId, setReceiptErrorPaymentId] = useState<
    string | null
  >(null)
```

- [ ] **Step 2: Add receipt date formatting helper**

Add this helper near the existing format helpers:

```tsx
function formatReceiptIssuedAt(value: string) {
  return new Intl.DateTimeFormat('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(new Date(value))
}
```

- [ ] **Step 3: Add the generate handler**

Inside `PaymentsPage`, below state declarations:

```tsx
function handleGenerateReceipt(payment: PaymentListItem) {
  if (payment.receipt_id !== null) {
    return
  }

  setGeneratingReceiptPaymentId(payment.id)
  setReceiptErrorPaymentId(null)
  createReceiptMutation.mutate(
    {
      organization_id: payment.organization_id,
      payment_id: payment.id,
    },
    {
      onSuccess: () => {
        setGeneratingReceiptPaymentId(null)
      },
      onError: () => {
        setReceiptErrorPaymentId(payment.id)
        setGeneratingReceiptPaymentId(null)
      },
    },
  )
}
```

- [ ] **Step 4: Render receipt panels inside each payment card**

Inside the `paymentsQuery.data.map`, switch the concise implicit return to a block return so per-card state can be calculated:

```tsx
{
  paymentsQuery.data.map((payment) => {
    const isGeneratingReceipt = generatingReceiptPaymentId === payment.id
    const hasReceipt = payment.receipt_id !== null

    return (
      <article className="payment-card" key={payment.id}>
        ...
      </article>
    )
  })
}
```

After the existing `<dl className="payment-card__details">...</dl>`, add:

```tsx
{
  hasReceipt ? (
    <div className="payment-card__receipt payment-card__receipt--issued">
      <div className="payment-card__receipt-icon" aria-hidden="true">
        ✓
      </div>
      <div>
        <p className="payment-card__receipt-label">Receipt issued</p>
        <p className="payment-card__receipt-number">{payment.receipt_number}</p>
        {payment.receipt_issued_at !== null ? (
          <p className="payment-card__receipt-helper">
            Issued {formatReceiptIssuedAt(payment.receipt_issued_at)}
          </p>
        ) : null}
      </div>
    </div>
  ) : (
    <div className="payment-card__receipt payment-card__receipt--pending">
      <div>
        <p className="payment-card__receipt-label">Receipt</p>
        <p className="payment-card__receipt-title">Not generated yet</p>
        <p className="payment-card__receipt-helper">
          Create one receipt for this payment.
        </p>
        {receiptErrorPaymentId === payment.id ? (
          <p className="payment-card__receipt-error" role="alert">
            We could not generate this receipt. Please try again.
          </p>
        ) : null}
      </div>
      <button
        type="button"
        disabled={isGeneratingReceipt}
        onClick={() => {
          handleGenerateReceipt(payment)
        }}
      >
        {isGeneratingReceipt ? 'Generating...' : 'Generate receipt'}
      </button>
    </div>
  )
}
```

- [ ] **Step 5: Update Payments header copy**

Change the header copy to remove the statement that receipts are handled separately:

```tsx
<p>
  View money received against issued invoices and generate simple receipts for
  recorded payments.
</p>
```

- [ ] **Step 6: Run type/build verification**

Run:

```bash
npm run build
```

Expected: build succeeds. If JSX nesting or imports fail, fix before continuing.

- [ ] **Step 7: Commit**

```bash
git add src/modules/payments/presentation/payments-page.tsx
git commit -m "feat: add manual receipt generation action"
```

---

### Task 4: Add Polished Receipt Panel Styling

**Files:**

- Modify: `src/App.css`

- [ ] **Step 1: Add receipt panel styles**

Add these styles near the existing `.payment-card` styles in `src/App.css`:

```css
.payment-card__receipt {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  gap: 14px;
  align-items: center;
  border-radius: 10px;
  padding: 14px;
}

.payment-card__receipt--pending {
  border: 1px dashed var(--border);
  background: var(--surface-muted);
}

.payment-card__receipt--issued {
  grid-template-columns: auto minmax(0, 1fr);
  border: 1px solid #b7d7c2;
  background: linear-gradient(180deg, #f7fff9, #eefbf2);
}

.payment-card__receipt-icon {
  display: grid;
  width: 36px;
  height: 36px;
  place-items: center;
  border-radius: 10px;
  color: #ffffff;
  background: #166534;
  font-weight: 900;
}

.payment-card__receipt-label {
  margin: 0;
  color: #166534;
  font-size: 12px;
  font-weight: 900;
  letter-spacing: 0.04em;
  text-transform: uppercase;
}

.payment-card__receipt--pending .payment-card__receipt-label {
  color: var(--text-h);
}

.payment-card__receipt-title,
.payment-card__receipt-number,
.payment-card__receipt-helper,
.payment-card__receipt-error {
  margin: 0;
}

.payment-card__receipt-title {
  margin-top: 4px;
  color: var(--text-h);
  font-weight: 800;
}

.payment-card__receipt-number {
  margin-top: 4px;
  color: #14532d;
  font-size: 18px;
  font-weight: 900;
  overflow-wrap: anywhere;
}

.payment-card__receipt-helper {
  margin-top: 3px;
  color: var(--text);
  font-size: 13px;
}

.payment-card__receipt-error {
  margin-top: 8px;
  color: #b42318;
  font-weight: 700;
}

.payment-card__receipt button {
  border: 0;
  border-radius: 8px;
  padding: 10px 14px;
  color: #ffffff;
  background: var(--text-h);
  font-weight: 700;
  cursor: pointer;
}

.payment-card__receipt button:disabled {
  cursor: not-allowed;
  opacity: 0.72;
}
```

- [ ] **Step 2: Add mobile layout support**

If no matching media query exists for cards, add this near the bottom of `src/App.css`:

```css
@media (max-width: 720px) {
  .payment-card__receipt {
    grid-template-columns: 1fr;
  }

  .payment-card__receipt button {
    width: 100%;
  }
}
```

If a `max-width: 720px` media query already exists, merge the two selectors into that existing block instead of creating a duplicate block.

- [ ] **Step 3: Run format check**

Run:

```bash
npm run format:check
```

Expected: format check succeeds. If it reports formatting differences, run `npm run format`, inspect the diff, and continue.

- [ ] **Step 4: Run build**

Run:

```bash
npm run build
```

Expected: build succeeds.

- [ ] **Step 5: Commit**

```bash
git add src/App.css
git commit -m "style: polish receipt status panels"
```

---

### Task 5: Document Receipts Validation And Status

**Files:**

- Create: `docs/23-receipts-validation-checklist.md`
- Modify: `wiki/00-home.md`
- Modify: `wiki/03-domain/payments.md`
- Modify: `wiki/03-domain/receipts.md`
- Modify: `wiki/04-roadmap/mvp-epics.md`
- Modify: `wiki/04-roadmap/release-plan.md`
- Modify: `wiki/06-task-breakdown/backlog.md`
- Modify: `wiki/06-task-breakdown/ready-soon.md`
- Modify: `wiki/06-task-breakdown/task-index.md`
- Modify: `wiki/08-decisions/decision-log.md`
- Modify: `wiki/09-status/built.md`
- Modify: `wiki/09-status/not-built.md`

- [ ] **Step 1: Create validation checklist**

Create `docs/23-receipts-validation-checklist.md`:

```md
# Receipts Validation Checklist

Status: ready for manual validation after the Receipts manual generation implementation.

## Automated Checks

- [ ] `npm run build` passes.
- [ ] `npm run lint` passes.
- [ ] `git diff --check` passes.

## Manual Setup

Use disposable local records created through the app. Do not commit local users, tokens, screenshots with private data, or seed data.

Required records:

- one organization
- one property
- one unit
- one tenant
- one active lease
- one issued invoice
- at least two payment records against the same invoice

## Payments List Receipt States

- [ ] Payment without receipt shows `Generate receipt`.
- [ ] Payment without receipt shows `Not generated yet`.
- [ ] Payment without receipt uses the polished pending receipt panel.
- [ ] Payment with receipt shows `Receipt issued`.
- [ ] Payment with receipt shows receipt number.
- [ ] Payment with receipt shows issued date.
- [ ] Payment with receipt does not show `Generate receipt`.

## Receipt Generation

- [ ] Click `Generate receipt` for a payment without receipt.
- [ ] Button changes to `Generating...` while the mutation is pending.
- [ ] Exactly one receipt row is created for that payment.
- [ ] Generated receipt number follows `RR-{YYYY}-{0001}`.
- [ ] Payment card refreshes to the issued receipt state.
- [ ] A second payment for the same invoice can receive its own receipt.

## Failure And Scope Checks

- [ ] Duplicate receipt generation is not available from the UI once a receipt exists.
- [ ] Inline error appears if receipt generation fails.
- [ ] No receipt detail page was introduced.
- [ ] No receipt list page was introduced.
- [ ] No PDF, print, download, email, or WhatsApp delivery workflow was introduced.
- [ ] No automatic receipt generation after payment recording was introduced.
- [ ] No receipt edit or delete workflow was introduced.
- [ ] No payment correction workflow was introduced.
- [ ] No migrations or seed data were introduced.

## Deferred Work

Receipt detail, receipt list, print/download, PDF generation, delivery workflows, automatic generation, payment edit blocking after receipt generation, and payment correction workflows remain deferred.
```

- [ ] **Step 2: Update wiki status pages**

Apply these status updates in the wiki files listed above:

```md
Receipts module: manual generation baseline complete; manual validation pending.
```

Use this next-step language in release/task pages:

```md
Next recommended module: Reminders planning, after manual Receipts validation.
```

Move these Receipts items from ready-soon/later candidate sections into completed candidate sections:

```md
- Plan Receipts module
- Generate Receipt after Payment
```

Keep these deferred:

```md
- Receipt detail page
- Receipt list page
- Print/download receipt
- PDF generation
- Email or WhatsApp delivery
- Automatic receipt generation after payment recording
- Payment edit blocking after receipt generation
- Payment correction workflow
```

- [ ] **Step 3: Run markdown/status scan**

Run:

```bash
rg -n "Receipts planning|Generate Receipt|receipt generation|automatic receipt|PDF|delivery" wiki docs/23-receipts-validation-checklist.md docs/22-payments-validation-checklist.md
```

Expected: old “Receipts planning is next” wording should only remain in historical Payment closeout context. Current roadmap/status pages should point to Reminders planning after manual Receipts validation.

- [ ] **Step 4: Commit**

```bash
git add docs/23-receipts-validation-checklist.md wiki
git commit -m "docs: document receipts manual generation baseline"
```

---

### Task 6: Final Verification And Manual Test Handoff

**Files:**

- No source files unless verification exposes a defect.

- [ ] **Step 1: Run full automated verification**

Run:

```bash
npm run build
npm run lint
git diff --check
```

Expected: all commands exit 0.

- [ ] **Step 2: Start dev server for manual validation**

Run:

```bash
npm run dev
```

Expected: Vite prints a local URL, usually `http://localhost:5173/`. If that port is occupied, use the URL Vite prints.

- [ ] **Step 3: Manual validation flow**

In the browser:

1. Open `/dashboard/payments`.
2. Find a payment without a receipt.
3. Confirm the pending receipt panel is visible.
4. Click `Generate receipt`.
5. Confirm the card changes to the issued receipt panel.
6. Confirm the receipt number is visible and uses `RR-{YYYY}-{0001}`.
7. Confirm the button no longer appears for that payment.
8. Create or use a second payment against the same invoice.
9. Generate a second receipt and confirm it receives a separate receipt number.

- [ ] **Step 4: Stop dev server**

Stop the Vite process with `Ctrl+C` in the terminal session running it.

- [ ] **Step 5: Record validation result**

If manual validation passes, update `docs/23-receipts-validation-checklist.md` checkboxes that were verified. If manual validation is left to the user, leave checkboxes unchecked and report that the checklist is ready.

- [ ] **Step 6: Commit validation checklist updates if any**

If Step 5 changed the checklist:

```bash
git add docs/23-receipts-validation-checklist.md
git commit -m "docs: record receipts validation results"
```

If Step 5 did not change files, do not create an empty commit.

---

## Self-Review Checklist

- Spec coverage: this plan covers the Receipts module, payment receipt summaries, manual generation UI, polished visual treatment, error handling, docs, and validation.
- Scope boundary: this plan does not add migrations, seed data, automatic generation, receipt routes, PDFs, delivery, receipt edit/delete, or payment corrections.
- Type consistency: receipt summary fields are `receipt_id`, `receipt_number`, and `receipt_issued_at` throughout.
- Query invalidation: receipt creation invalidates `paymentsQueryKey`.
- Manual validation: includes two payments for one invoice producing two receipts.
