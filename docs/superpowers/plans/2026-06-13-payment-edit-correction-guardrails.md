# Payment Edit and Correction Guardrails Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add guarded payment editing so unreceipted payments can be corrected while receipt-backed payments stay immutable.

**Architecture:** Add a protected edit route, a dedicated edit schema, payment detail/update repository functions, query/mutation hooks, and an edit page that reuses the existing guided payment form patterns. The update flow stays app-side like current payment creation, validates receipt lock and invoice allowance, updates only allowed fields, then recalculates invoice status from payment totals.

**Tech Stack:** React 19, TypeScript, React Router, TanStack Query, React Hook Form, Zod, Supabase JS, Vite, vanilla CSS.

---

## File Map

- Modify: `src/app/router/route-paths.ts`
  - Add the payment edit route constant.
- Modify: `src/app/router/app-router.tsx`
  - Lazy-load and register the edit payment route behind the dashboard access gate.
- Create: `src/modules/payments/domain/edit-payment-schema.ts`
  - Validate editable payment fields and normalize optional text values.
- Modify: `src/modules/payments/domain/payment.ts`
  - Add `PaymentEditDetail` and `PaymentEditInvoiceContext` types for the edit page.
- Modify: `src/modules/payments/infrastructure/payments-repository.ts`
  - Add query key, detail loader, update input type, allowance calculation, status recalculation, and guarded update function.
- Create: `src/modules/payments/application/use-payment-edit-query.ts`
  - Fetch one payment for the edit route.
- Create: `src/modules/payments/application/use-update-payment-mutation.ts`
  - Save allowed edits and invalidate related queries.
- Create: `src/modules/payments/presentation/edit-payment-page.tsx`
  - Render loading/error/not-found/locked/edit states for payment edits.
- Modify: `src/modules/payments/presentation/payments-page.tsx`
  - Add edit action for unreceipted payments and locked guardrail copy for receipted payments.
- Modify: `src/modules/payments/index.ts`
  - Export new schema/types/hooks/page/repository items needed by the route and future modules.
- Modify: `src/App.css`
  - Add payment edit page layout, guardrail, and action styles following existing command form patterns.
- Modify: `docs/22-payments-validation-checklist.md`
  - Add payment edit/correction guardrail validation coverage.
- Modify: `wiki/09-status/built.md`
  - Record the built payment edit guardrail slice.
- Modify: `wiki/09-status/not-built.md`
  - Remove direct unreceipted payment edit from not-built while keeping correction/delete/refund scope deferred.
- Modify: `wiki/06-task-breakdown/ready-soon.md`
  - Move payment edit/correction guardrails into completed candidates and identify the next focused candidate.
- Modify: `wiki/06-task-breakdown/task-index.md`
  - Move payment edit/correction guardrails into completed candidates.
- Modify: `wiki/04-roadmap/release-plan.md`
  - Update current baseline and next recommended task.

---

### Task 1: Routing

**Files:**

- Modify: `src/app/router/route-paths.ts`
- Modify: `src/app/router/app-router.tsx`

- [ ] **Step 1: Add the route path**

  In `src/app/router/route-paths.ts`, add this property after `dashboardPaymentsNew`:

  ```ts
  dashboardPaymentEdit: '/dashboard/payments/:paymentId/edit',
  ```

- [ ] **Step 2: Add the lazy page import**

  In `src/app/router/app-router.tsx`, add this lazy import after `CreatePaymentPage`:

  ```ts
  const EditPaymentPage = lazy(() =>
    import('../../modules/payments/presentation/edit-payment-page').then(
      (module) => ({
        default: module.EditPaymentPage,
      }),
    ),
  )
  ```

- [ ] **Step 3: Register the protected route**

  In `src/app/router/app-router.tsx`, add this route after the new payment route:

  ```tsx
  <Route
    path={routePaths.dashboardPaymentEdit}
    element={
      <RouteAccessGate route="dashboard">
        <EditPaymentPage />
      </RouteAccessGate>
    }
  />
  ```

- [ ] **Step 4: Confirm route registration**

  Run: `rg -n "dashboardPaymentEdit|EditPaymentPage" src/app/router`

  Expected: `route-paths.ts` contains `dashboardPaymentEdit`, and `app-router.tsx` contains both the lazy import and protected route.

---

### Task 2: Domain Types and Edit Schema

**Files:**

- Modify: `src/modules/payments/domain/payment.ts`
- Create: `src/modules/payments/domain/edit-payment-schema.ts`
- Modify: `src/modules/payments/index.ts`

- [ ] **Step 1: Add edit detail types**

  In `src/modules/payments/domain/payment.ts`, append:

  ```ts
  export type PaymentEditInvoiceContext = {
    id: string
    billing_period: string
    total_amount: number
    status: string
    tenant_name: string
    unit_name: string
    property_name: string | null
    paid_amount: number
    other_paid_amount: number
    editable_remaining_amount: number
  }

  export type PaymentEditDetail = Payment & {
    receipt_id: string | null
    receipt_number: string | null
    receipt_issued_at: string | null
    invoice: PaymentEditInvoiceContext
  }
  ```

- [ ] **Step 2: Create the edit schema**

  Create `src/modules/payments/domain/edit-payment-schema.ts`:

  ```ts
  import { z } from 'zod'

  export const editPaymentSchema = z.object({
    amount: z.coerce
      .number({ error: 'Amount is required.' })
      .int('Amount must be a whole number.')
      .positive('Amount must be greater than zero.'),
    payment_date: z.string().trim().min(1, 'Payment date is required.'),
    payment_method: z.enum(['cash', 'bank_transfer', 'e_wallet', 'other'], {
      error: 'Select a payment method.',
    }),
    reference_number: z
      .string()
      .trim()
      .max(120, 'Reference number must be 120 characters or fewer.')
      .transform((value) => value || null),
    notes: z
      .string()
      .trim()
      .max(1000, 'Notes must be 1000 characters or fewer.')
      .transform((value) => value || null),
  })

  export type EditPaymentFormValues = z.input<typeof editPaymentSchema>
  export type EditPaymentInput = z.output<typeof editPaymentSchema>
  ```

- [ ] **Step 3: Export schema and types**

  In `src/modules/payments/index.ts`, add:

  ```ts
  export {
    editPaymentSchema,
    type EditPaymentFormValues,
    type EditPaymentInput,
  } from './domain/edit-payment-schema'
  export type {
    PaymentEditDetail,
    PaymentEditInvoiceContext,
  } from './domain/payment'
  ```

- [ ] **Step 4: Confirm domain exports**

  Run: `rg -n "editPaymentSchema|EditPaymentFormValues|EditPaymentInput|PaymentEditDetail|PaymentEditInvoiceContext" src/modules/payments`

  Expected: the edit schema file defines the schema and form/input types, `payment.ts` defines the edit detail types, and `index.ts` exports all of them.

---

### Task 3: Repository Guardrails

**Files:**

- Modify: `src/modules/payments/infrastructure/payments-repository.ts`
- Modify: `src/modules/payments/index.ts`

- [ ] **Step 1: Add imports and query key**

  In `src/modules/payments/infrastructure/payments-repository.ts`, import `EditPaymentInput` and edit detail types:

  ```ts
  import type { EditPaymentInput } from '../domain/edit-payment-schema'
  import type {
    PayableInvoiceStatus,
    Payment,
    PaymentEditDetail,
    PaymentEditInvoiceContext,
    PaymentListItem,
    PaymentMethod,
  } from '../domain/payment'
  ```

  Add the edit query key after `paymentFormOptionsQueryKey`:

  ```ts
  export const paymentEditQueryKey = (paymentId: string | undefined) =>
    [...paymentsQueryKey, 'edit', paymentId ?? 'missing'] as const
  ```

- [ ] **Step 2: Add edit row types**

  Add these types near the existing row types:

  ```ts
  type PaymentEditReceiptRow = {
    id: string
    receipt_number: string
    issued_at: string
  }

  type PaymentEditRow = {
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
    receipt: PaymentEditReceiptRow | null
    invoices: {
      id: string
      billing_period: string
      total_amount: number
      status: string
      tenants: { full_name: string } | null
      units: { name: string; properties: { name: string } | null } | null
      payments: { id: string; amount: number }[] | null
    } | null
  }

  export type UpdatePaymentRecord = EditPaymentInput & {
    organization_id: string
    payment_id: string
  }
  ```

- [ ] **Step 3: Add calculation helpers**

  Add these helpers after `sumPaymentAmounts`:

  ```ts
  function getInvoiceStatusFromPaidAmount(
    paidAmount: number,
    totalAmount: number,
  ) {
    if (paidAmount >= totalAmount) {
      return 'paid'
    }

    if (paidAmount > 0) {
      return 'partially_paid'
    }

    return 'unpaid'
  }

  function sumOtherPaymentAmounts(
    payments: { id: string; amount: number }[] | null,
    currentPaymentId: string,
  ) {
    return (
      payments
        ?.filter((payment) => payment.id !== currentPaymentId)
        .reduce((total, payment) => total + payment.amount, 0) ?? 0
    )
  }
  ```

- [ ] **Step 4: Add edit detail mapper**

  Add this mapper after `mapPaymentInvoiceOptionRow`:

  ```ts
  function mapPaymentEditRow(row: PaymentEditRow): PaymentEditDetail | null {
    const invoice = row.invoices

    if (invoice === null) {
      return null
    }

    const receipt = row.receipt
    const paidAmount = sumPaymentAmounts(invoice.payments)
    const otherPaidAmount = sumOtherPaymentAmounts(invoice.payments, row.id)
    const editableRemainingAmount = Math.max(
      invoice.total_amount - otherPaidAmount,
      0,
    )

    const invoiceContext: PaymentEditInvoiceContext = {
      id: invoice.id,
      billing_period: invoice.billing_period,
      total_amount: invoice.total_amount,
      status: invoice.status,
      tenant_name: invoice.tenants?.full_name ?? 'Unknown tenant',
      unit_name: invoice.units?.name ?? 'Unknown unit',
      property_name: invoice.units?.properties?.name ?? null,
      paid_amount: paidAmount,
      other_paid_amount: otherPaidAmount,
      editable_remaining_amount: editableRemainingAmount,
    }

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
      receipt_id: receipt?.id ?? null,
      receipt_number: receipt?.receipt_number ?? null,
      receipt_issued_at: receipt?.issued_at ?? null,
      invoice: invoiceContext,
    }
  }
  ```

- [ ] **Step 5: Add payment edit select columns**

  Add this constant after `paymentSelectColumns`:

  ```ts
  const paymentEditSelectColumns = `
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
    receipt:receipts (
      id,
      receipt_number,
      issued_at
    ),
    invoices (
      id,
      billing_period,
      total_amount,
      status,
      tenants (
        full_name
      ),
      units (
        name,
        properties (
          name
        )
      ),
      payments (
        id,
        amount
      )
    )
  `
  ```

- [ ] **Step 6: Add the detail loader**

  Add this function after `listPayments`:

  ```ts
  export async function getPaymentForEdit(
    paymentId: string,
  ): Promise<PaymentEditDetail | null> {
    const { data, error } = await supabaseClient
      .from('payments')
      .select(paymentEditSelectColumns)
      .eq('id', paymentId)
      .maybeSingle<PaymentEditRow>()

    if (error !== null) {
      throw new Error(`Could not load payment: ${error.message}`)
    }

    return data === null ? null : mapPaymentEditRow(data)
  }
  ```

- [ ] **Step 7: Add the guarded update function**

  Add this function after `createPayment`:

  ```ts
  export async function updatePayment({
    organization_id,
    payment_id,
    amount,
    payment_date,
    payment_method,
    reference_number,
    notes,
  }: UpdatePaymentRecord): Promise<Payment> {
    const payment = await getPaymentForEdit(payment_id)

    if (payment === null || payment.organization_id !== organization_id) {
      throw new Error('Payment must belong to this organization.')
    }

    if (payment.receipt_id !== null) {
      throw new Error(
        'This payment already has an issued receipt and cannot be edited directly.',
      )
    }

    if (amount > payment.invoice.editable_remaining_amount) {
      throw new Error(
        'Payment amount cannot exceed the invoice remaining allowance.',
      )
    }

    const { data, error } = await supabaseClient
      .from('payments')
      .update({
        amount,
        payment_date,
        payment_method,
        reference_number,
        notes,
      })
      .eq('id', payment_id)
      .eq('organization_id', organization_id)
      .select(paymentSelectColumns)
      .single<Payment>()

    if (error !== null) {
      throw new Error(`Could not update payment: ${error.message}`)
    }

    const nextPaidAmount = payment.invoice.other_paid_amount + amount
    const nextStatus = getInvoiceStatusFromPaidAmount(
      nextPaidAmount,
      payment.invoice.total_amount,
    )

    const { error: invoiceError } = await supabaseClient
      .from('invoices')
      .update({ status: nextStatus })
      .eq('id', payment.invoice.id)
      .eq('organization_id', organization_id)

    if (invoiceError !== null) {
      throw new Error(
        `Payment was updated, but invoice status update failed: ${invoiceError.message}`,
      )
    }

    return data
  }
  ```

- [ ] **Step 8: Export repository additions**

  In `src/modules/payments/index.ts`, add these exports to the repository export block:

  ```ts
  getPaymentForEdit,
  paymentEditQueryKey,
  updatePayment,
  type UpdatePaymentRecord,
  ```

- [ ] **Step 9: Confirm repository exports**

  Run: `rg -n "getPaymentForEdit|paymentEditQueryKey|updatePayment|UpdatePaymentRecord" src/modules/payments`

  Expected: `payments-repository.ts` defines the new query/update exports, and `index.ts` re-exports them.

---

### Task 4: Query and Mutation Hooks

**Files:**

- Create: `src/modules/payments/application/use-payment-edit-query.ts`
- Create: `src/modules/payments/application/use-update-payment-mutation.ts`
- Modify: `src/modules/payments/index.ts`

- [ ] **Step 1: Create edit query hook**

  Create `src/modules/payments/application/use-payment-edit-query.ts`:

  ```ts
  import { useQuery } from '@tanstack/react-query'

  import {
    getPaymentForEdit,
    paymentEditQueryKey,
  } from '../infrastructure/payments-repository'

  export function usePaymentEditQuery(paymentId: string | undefined) {
    return useQuery({
      queryKey: paymentEditQueryKey(paymentId),
      queryFn: () => {
        if (!paymentId) {
          return null
        }

        return getPaymentForEdit(paymentId)
      },
      enabled: Boolean(paymentId),
    })
  }
  ```

- [ ] **Step 2: Create update mutation hook**

  Create `src/modules/payments/application/use-update-payment-mutation.ts`:

  ```ts
  import { useMutation, useQueryClient } from '@tanstack/react-query'

  import { invoicesQueryKey } from '../../invoices'
  import type { EditPaymentInput } from '../domain/edit-payment-schema'
  import {
    paymentEditQueryKey,
    paymentFormOptionsQueryKey,
    paymentsQueryKey,
    updatePayment,
  } from '../infrastructure/payments-repository'

  type UpdatePaymentMutationVariables = {
    organizationId: string
    paymentId: string
    input: EditPaymentInput
  }

  export function useUpdatePaymentMutation() {
    const queryClient = useQueryClient()

    return useMutation({
      mutationFn: ({
        organizationId,
        paymentId,
        input,
      }: UpdatePaymentMutationVariables) =>
        updatePayment({
          organization_id: organizationId,
          payment_id: paymentId,
          ...input,
        }),
      onSuccess: async (_payment, variables) => {
        await Promise.all([
          queryClient.invalidateQueries({ queryKey: paymentsQueryKey }),
          queryClient.invalidateQueries({
            queryKey: paymentEditQueryKey(variables.paymentId),
          }),
          queryClient.invalidateQueries({
            queryKey: paymentFormOptionsQueryKey,
          }),
          queryClient.invalidateQueries({ queryKey: invoicesQueryKey }),
        ])
      },
    })
  }
  ```

- [ ] **Step 3: Export hooks**

  In `src/modules/payments/index.ts`, add:

  ```ts
  export { usePaymentEditQuery } from './application/use-payment-edit-query'
  export { useUpdatePaymentMutation } from './application/use-update-payment-mutation'
  ```

- [ ] **Step 4: Confirm hook exports**

  Run: `rg -n "usePaymentEditQuery|useUpdatePaymentMutation" src/modules/payments`

  Expected: both hook files exist and `src/modules/payments/index.ts` exports both hooks.

---

### Task 5: Edit Payment Page

**Files:**

- Create: `src/modules/payments/presentation/edit-payment-page.tsx`
- Modify: `src/modules/payments/index.ts`

- [ ] **Step 1: Create the edit page**

  Create `src/modules/payments/presentation/edit-payment-page.tsx` using the same form layout conventions as `create-payment-page.tsx`. The page must:
  - read `paymentId` from `useParams`
  - load the payment with `usePaymentEditQuery`
  - use `editPaymentSchema` with `zodResolver`
  - initialize default values from the loaded payment
  - show invoice context as read-only
  - block receipted payment edits with a locked state
  - prevent amount above `editable_remaining_amount`
  - call `useUpdatePaymentMutation`
  - navigate back to `routePaths.dashboardPayments` on success

  Use this structure:

  ```tsx
  import { zodResolver } from '@hookform/resolvers/zod'
  import { useEffect } from 'react'
  import { useForm } from 'react-hook-form'
  import { Link, useNavigate, useParams } from 'react-router-dom'

  import { AppLayout } from '../../../app/layouts'
  import { routePaths } from '../../../app/router/route-paths'
  import { useAccountState } from '../../identity/account-state'
  import { usePaymentEditQuery } from '../application/use-payment-edit-query'
  import { useUpdatePaymentMutation } from '../application/use-update-payment-mutation'
  import {
    editPaymentSchema,
    type EditPaymentFormValues,
  } from '../domain/edit-payment-schema'
  import type { PaymentEditDetail, PaymentMethod } from '../domain/payment'

  function formatCurrency(value: number) {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0,
    }).format(value)
  }

  function formatBillingPeriod(value: string) {
    const [year, month] = value.split('-').map(Number)

    return new Intl.DateTimeFormat('id-ID', {
      month: 'long',
      year: 'numeric',
    }).format(new Date(year, month - 1, 1))
  }

  function formatPropertyName(value: string | null) {
    return value ?? 'No property name'
  }

  function getDefaultValues(payment: PaymentEditDetail): EditPaymentFormValues {
    return {
      amount: payment.amount,
      payment_date: payment.payment_date,
      payment_method: payment.payment_method,
      reference_number: payment.reference_number ?? '',
      notes: payment.notes ?? '',
    }
  }

  const paymentMethodOptions: { value: PaymentMethod; label: string }[] = [
    { value: 'bank_transfer', label: 'Bank transfer' },
    { value: 'cash', label: 'Cash' },
    { value: 'e_wallet', label: 'E-wallet' },
    { value: 'other', label: 'Other' },
  ]
  ```

  The component body should follow this behavior:

  ```tsx
  export function EditPaymentPage() {
    const { paymentId } = useParams<{ paymentId: string }>()
    const navigate = useNavigate()
    const accountState = useAccountState()
    const paymentQuery = usePaymentEditQuery(paymentId)
    const updatePaymentMutation = useUpdatePaymentMutation()

    const {
      register,
      handleSubmit,
      reset,
      watch,
      formState: { errors, isSubmitting },
    } = useForm<EditPaymentFormValues>({
      resolver: zodResolver(editPaymentSchema),
    })

    const payment = paymentQuery.data ?? null
    const parsedAmount = Number(watch('amount') ?? 0)
    const exceedsEditableAllowance =
      payment !== null &&
      Number.isFinite(parsedAmount) &&
      parsedAmount > payment.invoice.editable_remaining_amount

    useEffect(() => {
      if (payment !== null) {
        reset(getDefaultValues(payment))
      }
    }, [payment, reset])

    async function onSubmit(values: EditPaymentFormValues) {
      if (!paymentId || !accountState.organizationId || payment === null) {
        return
      }

      const input = editPaymentSchema.parse(values)

      if (input.amount > payment.invoice.editable_remaining_amount) {
        return
      }

      await updatePaymentMutation.mutateAsync({
        organizationId: accountState.organizationId,
        paymentId,
        input,
      })

      void navigate(routePaths.dashboardPayments)
    }

    return (
      <AppLayout>
        <section
          className="edit-payment-page"
          aria-labelledby="edit-payment-title"
        >
          <div className="edit-payment-page__header">
            <div>
              <h2 id="edit-payment-title">Edit payment</h2>
              <p>
                Correct an unreceipted payment while keeping receipt-backed
                records locked.
              </p>
            </div>
            <Link to={routePaths.dashboardPayments}>Back to payments</Link>
          </div>

          <p className="edit-payment-page__status">Loading payment...</p>
        </section>
      </AppLayout>
    )
  }
  ```

  Replace the sample loading paragraph with concrete state rendering before marking this step complete:
  - loading state: `<p className="edit-payment-page__status">Loading payment...</p>`
  - query error state: `<p className="edit-payment-page__error" role="alert">We could not load this payment right now. Please try again later.</p>`
  - missing payment state: `.edit-payment-page__empty` with heading `Payment not found`
  - locked state: `.edit-payment-page__locked` with heading `Receipt issued` and copy explaining direct edits are blocked
  - editable state: `<form className="payment-form command-form-card" onSubmit={handleSubmit(onSubmit)}>`

  Implement the editable form using these class names:
  - `edit-payment-page`
  - `edit-payment-page__header`
  - `edit-payment-page__status`
  - `edit-payment-page__error`
  - `edit-payment-page__empty`
  - `edit-payment-page__locked`
  - `payment-form command-form-card`
  - `form-section`
  - `payment-form__context`
  - `payment-form__field`
  - `payment-form__error`
  - `payment-form__actions`

- [ ] **Step 2: Export the page**

  In `src/modules/payments/index.ts`, add:

  ```ts
  export { EditPaymentPage } from './presentation/edit-payment-page'
  ```

- [ ] **Step 3: Validate edit page compile**

  Run: `npm run build`

  Expected: build passes and route import resolves.

---

### Task 6: Payments List Guardrail Actions

**Files:**

- Modify: `src/modules/payments/presentation/payments-page.tsx`

- [ ] **Step 1: Add edit path helper**

  Add near `getReceiptDetailPath`:

  ```ts
  function getPaymentEditPath(paymentId: string) {
    return routePaths.dashboardPaymentEdit.replace(':paymentId', paymentId)
  }
  ```

- [ ] **Step 2: Add edit action for unreceipted payments**

  In each payment card, when `hasReceipt` is false, add an `Edit payment` link alongside the existing generate receipt action:

  ```tsx
  <Link
    className="payment-card__receipt-action"
    to={getPaymentEditPath(payment.id)}
  >
    Edit payment
  </Link>
  ```

  Keep `Generate receipt` available for the same unreceipted payment.

- [ ] **Step 3: Add locked copy for receipted payments**

  In the receipt-issued block, add:

  ```tsx
  <p className="payment-card__receipt-helper">
    Direct edits are locked because this payment already has an issued receipt.
  </p>
  ```

  Keep `View receipt` unchanged.

- [ ] **Step 4: Validate list compile**

  Run: `npm run build`

  Expected: build passes and payment list renders the new route path helper.

---

### Task 7: CSS Uplift for Edit and Locked States

**Files:**

- Modify: `src/App.css`

- [ ] **Step 1: Add edit page selectors to existing grouped styles**

  Add `.edit-payment-page` to the same grouped layout rules as create/edit payment pages:

  ```css
  .create-payment-page,
  .edit-payment-page,
  ```

  Add `.edit-payment-page__header`, `.edit-payment-page__status`, `.edit-payment-page__error`, and `.edit-payment-page__empty` to the matching grouped selectors near other payment page states.

- [ ] **Step 2: Add locked state styling**

  Add near existing payment card/receipt styles:

  ```css
  .edit-payment-page__locked,
  .payment-card__guardrail {
    display: grid;
    gap: 10px;
    border: 1px solid var(--warning-border);
    border-radius: 12px;
    padding: 16px;
    color: var(--text-h);
    background: #fff8e6;
  }

  .edit-payment-page__locked h3,
  .payment-card__guardrail h4 {
    margin: 0;
    font-size: 15px;
  }

  .edit-payment-page__locked p,
  .payment-card__guardrail p {
    margin: 0;
    color: var(--text);
  }
  ```

  If `--warning-border` does not exist in the current CSS token layer, use `#f7c948` directly for this slice.

- [ ] **Step 3: Ensure mobile action layout works**

  Add `.edit-payment-page__header a` and edit payment form actions to the existing mobile rules that set full-width action buttons for narrow screens.

- [ ] **Step 4: Validate CSS**

  Run: `npm run format:check`

  Expected: CSS and new TSX remain Prettier-formatted.

---

### Task 8: Payment Validation Checklist

**Files:**

- Modify: `docs/22-payments-validation-checklist.md`

- [ ] **Step 1: Update status**

  Change the status line to:

  ```md
  Status: manual validation complete for the Payments MVP baseline. Payment edit/correction guardrails are implemented and require focused manual validation.
  ```

- [ ] **Step 2: Add manual validation section**

  Add this section before `## Regression Checks`:

  ```md
  ## Payment Edit / Correction Guardrails

  - [ ] Authenticated and onboarded users can open `/dashboard/payments/:paymentId/edit` for an unreceipted payment.
  - [ ] Unauthenticated users cannot access `/dashboard/payments/:paymentId/edit` and are redirected through the existing auth gate.
  - [ ] Unreceipted payment cards show an Edit payment action.
  - [ ] Receipted payment cards do not expose direct edit.
  - [ ] Receipted payment cards explain that direct edits are locked after receipt issuance.
  - [ ] The edit page shows read-only invoice context for tenant, unit, property, billing period, invoice total, currently paid amount, and editable allowance.
  - [ ] The edit page allows amount, payment date, payment method, reference number, and notes changes.
  - [ ] The edit page does not allow invoice assignment changes.
  - [ ] Saving allowed field changes redirects back to `/dashboard/payments`.
  - [ ] Saving allowed field changes updates the Payments list.
  - [ ] Increasing amount above the editable invoice allowance is blocked.
  - [ ] Lowering a payment can move the invoice back to `partially_paid` or `unpaid` based on total paid amount.
  - [ ] Increasing a payment to the full allowance can move the invoice to `paid`.
  - [ ] Opening the edit route for a receipted payment shows a locked state instead of editable fields.
  ```

- [ ] **Step 3: Update boundaries**

  Change:

  ```md
  - [x] No payment edit flow was introduced.
  - [x] No payment correction workflow was introduced.
  ```

  To:

  ```md
  - [x] Payment edit is limited to unreceipted payments.
  - [x] Receipted payment direct edits are blocked.
  - [x] No formal payment correction ledger workflow was introduced.
  ```

---

### Task 9: Wiki Closeout

**Files:**

- Modify: `wiki/09-status/built.md`
- Modify: `wiki/09-status/not-built.md`
- Modify: `wiki/06-task-breakdown/ready-soon.md`
- Modify: `wiki/06-task-breakdown/task-index.md`
- Modify: `wiki/04-roadmap/release-plan.md`

- [ ] **Step 1: Update built Payments section**

  In `wiki/09-status/built.md`, under Payments built items, add:

  ```md
  - guarded edit flow for unreceipted payments
  - direct edit lock for receipt-backed payments
  - invoice status recalculation after allowed payment edits
  ```

  Under Payments deferred items, keep:

  ```md
  - payment delete
  - formal payment correction workflow
  - receipt invalidation or regeneration after payment changes
  ```

- [ ] **Step 2: Update not-built Payments section**

  In `wiki/09-status/not-built.md`, replace:

  ```md
  - payment edit before receipt generation
  - payment correction workflow
  - payment edit blocking after receipt generation
  ```

  With:

  ```md
  - payment edit for receipt-backed records
  - formal payment correction workflow
  - receipt invalidation or regeneration after payment changes
  ```

- [ ] **Step 3: Update task index**

  In `wiki/06-task-breakdown/task-index.md`, move `Payment edit/correction guardrails` to completed candidates and choose the next ready-soon candidate as `Invoice payment history context`.

- [ ] **Step 4: Update ready soon**

  In `wiki/06-task-breakdown/ready-soon.md`, move `Payment edit/correction guardrails` into completed candidates and make `Invoice payment history context` the candidate section.

- [ ] **Step 5: Update release plan**

  In `wiki/04-roadmap/release-plan.md`, add `Payment edit/correction guardrails` to the current baseline and set:

  ```md
  Next recommended task: add invoice payment history context.
  ```

---

### Task 10: Validation and Commit

**Files:**

- All changed files

- [ ] **Step 1: Run formatting check**

  Run: `npm run format:check`

  Expected: Prettier reports all matched files use code style.

- [ ] **Step 2: Run production build**

  Run: `npm run build`

  Expected: TypeScript and Vite build succeed.

- [ ] **Step 3: Run lint**

  Run: `npm run lint`

  Expected: ESLint exits successfully.

- [ ] **Step 4: Run diff whitespace check**

  Run: `git diff --check`

  Expected: no output and exit code 0.

- [ ] **Step 5: Manual browser validation**

  Run: `npm run dev`

  Validate with disposable local data:
  - create or locate one unreceipted payment
  - create or locate one receipted payment
  - confirm unreceipted payment card exposes `Edit payment`
  - confirm receipted payment card does not expose direct edit
  - open the unreceipted edit page
  - save reference/notes/date changes and confirm the list updates
  - try an amount above editable allowance and confirm it is blocked
  - lower an amount and confirm invoice status recalculates from total paid
  - open the receipted edit URL directly and confirm the locked state renders

- [ ] **Step 6: Commit after explicit user approval**

  After the user approves staging and committing, run:

  ```bash
  git add src/app/router/route-paths.ts src/app/router/app-router.tsx src/modules/payments/domain/payment.ts src/modules/payments/domain/edit-payment-schema.ts src/modules/payments/infrastructure/payments-repository.ts src/modules/payments/application/use-payment-edit-query.ts src/modules/payments/application/use-update-payment-mutation.ts src/modules/payments/presentation/edit-payment-page.tsx src/modules/payments/presentation/payments-page.tsx src/modules/payments/index.ts src/App.css docs/22-payments-validation-checklist.md wiki/09-status/built.md wiki/09-status/not-built.md wiki/06-task-breakdown/ready-soon.md wiki/06-task-breakdown/task-index.md wiki/04-roadmap/release-plan.md docs/superpowers/plans/2026-06-13-payment-edit-correction-guardrails.md
  git commit -m "feat: add payment edit guardrails"
  ```
