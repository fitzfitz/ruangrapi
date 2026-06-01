# Reminders Manual MVP Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a manual reminders module that prepares WhatsApp-style reminder messages from payable invoices, lists active reminder records, and lets users copy/open/send/cancel reminders without delivery automation.

**Architecture:** Add a `src/modules/reminders/` module following the existing Invoices, Payments, and Receipts patterns. The repository will use Supabase nested selects over existing `reminders`, `invoices`, `payments`, `tenants`, `units`, and `properties` tables; the page will stay single-route and operational, with no new migrations or automation.

**Tech Stack:** React, TypeScript, Vite, TanStack Query, Supabase.

---

## File Structure

Create:

- `src/modules/reminders/domain/reminder.ts`
  Defines reminder record types, reminder list item types, payable invoice option types, creation/update input types, channel/status unions, and message/link helper return shapes.

- `src/modules/reminders/infrastructure/reminders-repository.ts`
  Owns Supabase queries/mutations, message generation, WhatsApp link normalization, row mapping, and query keys.

- `src/modules/reminders/application/use-reminders-query.ts`
  TanStack Query hook for active reminder list.

- `src/modules/reminders/application/use-reminder-form-options-query.ts`
  TanStack Query hook for payable invoice reminder options.

- `src/modules/reminders/application/use-create-reminder-mutation.ts`
  Mutation hook for inserting a prepared reminder and invalidating reminders/form-options queries.

- `src/modules/reminders/application/use-update-reminder-status-mutation.ts`
  Mutation hook for status transitions and invalidating reminders queries.

- `src/modules/reminders/presentation/reminders-page.tsx`
  Route page containing prepare-reminder UI, active reminder list, copy action, WhatsApp link, and status actions.

- `src/modules/reminders/index.ts`
  Public module exports.

- `docs/24-reminders-validation-checklist.md`
  Manual and automated validation checklist.

Modify:

- `src/app/router/route-paths.ts`
  Add `dashboardReminders`.

- `src/app/router/app-router.tsx`
  Add lazy `RemindersPage` route.

- `src/app/layouts/app-layout.tsx`
  Add Reminders sidebar link and remove it from future-only status if needed.

- `src/App.css`
  Add page, card, form, action, message block, and responsive styles.

- `wiki/03-domain/reminders.md`
  Move Reminders from future-only status to manual MVP baseline.

- `wiki/09-status/built.md`
  Record the manual reminders MVP as built after implementation.

- `wiki/09-status/not-built.md`
  Remove manual reminders baseline from not-built and leave automation/deferred items.

- `wiki/06-task-breakdown/ready-soon.md`
  Mark Reminders planning as completed/currently implemented.

- `wiki/06-task-breakdown/backlog.md`
  Keep advanced reminder work in backlog.

No automated test runner is configured in this repository. Use `npm run format:check`, `npm run build`, `npm run lint`, `git diff --check`, and the manual checklist as verification.

---

### Task 1: Reminders Domain And Repository

**Files:**

- Create: `src/modules/reminders/domain/reminder.ts`
- Create: `src/modules/reminders/infrastructure/reminders-repository.ts`
- Create: `src/modules/reminders/index.ts`

- [ ] **Step 1: Create reminder domain types**

Create `src/modules/reminders/domain/reminder.ts`:

```ts
export type ReminderChannel = 'whatsapp' | 'manual'

export type ReminderStatus = 'draft' | 'prepared' | 'sent' | 'cancelled'

export type Reminder = {
  id: string
  organization_id: string
  invoice_id: string
  tenant_id: string
  channel: ReminderChannel
  message: string
  status: ReminderStatus
  cancelled_at: string | null
  created_at: string
  updated_at: string
}

export type ReminderListItem = Reminder & {
  invoice_billing_period: string
  invoice_due_date: string | null
  invoice_total_amount: number
  invoice_status: string
  tenant_name: string
  tenant_phone: string | null
  unit_name: string
  property_name: string | null
  whatsapp_url: string | null
}

export type ReminderInvoiceOption = {
  id: string
  organization_id: string
  tenant_id: string
  billing_period: string
  due_date: string | null
  total_amount: number
  status: string
  tenant_name: string
  tenant_phone: string | null
  unit_name: string
  property_name: string | null
  paid_amount: number
  remaining_amount: number
  generated_message: string
  whatsapp_url: string | null
}

export type ReminderFormOptions = {
  invoices: ReminderInvoiceOption[]
}

export type CreateReminderInput = {
  organization_id: string
  invoice_id: string
  tenant_id: string
  message: string
}

export type UpdateReminderStatusInput = {
  reminder_id: string
  status: Extract<ReminderStatus, 'prepared' | 'sent' | 'cancelled'>
}
```

- [ ] **Step 2: Add repository query keys, helper functions, row types, and mappers**

Create `src/modules/reminders/infrastructure/reminders-repository.ts` with these core exports and helpers:

```ts
import { supabaseClient } from '../../../shared/lib'
import type {
  CreateReminderInput,
  Reminder,
  ReminderFormOptions,
  ReminderInvoiceOption,
  ReminderListItem,
  ReminderStatus,
  UpdateReminderStatusInput,
} from '../domain/reminder'

export const remindersQueryKey = ['reminders'] as const
export const reminderFormOptionsQueryKey = [
  ...remindersQueryKey,
  'form-options',
] as const

const payableInvoiceStatuses = ['unpaid', 'partially_paid', 'overdue'] as const

const reminderSelectColumns = `
  id,
  organization_id,
  invoice_id,
  tenant_id,
  channel,
  message,
  status,
  cancelled_at,
  created_at,
  updated_at,
  invoices (
    billing_period,
    due_date,
    total_amount,
    status,
    tenants (
      full_name,
      phone
    ),
    units (
      name,
      properties (
        name
      )
    )
  )
`

const reminderInvoiceOptionSelectColumns = `
  id,
  organization_id,
  tenant_id,
  billing_period,
  due_date,
  total_amount,
  status,
  tenants (
    full_name,
    phone
  ),
  units (
    name,
    properties (
      name
    )
  ),
  payments (
    amount
  )
`

type ReminderRow = Reminder & {
  invoices: {
    billing_period: string
    due_date: string | null
    total_amount: number
    status: string
    tenants: { full_name: string; phone: string | null } | null
    units: { name: string; properties: { name: string } | null } | null
  } | null
}

type ReminderInvoiceOptionRow = {
  id: string
  organization_id: string
  tenant_id: string
  billing_period: string
  due_date: string | null
  total_amount: number
  status: string
  tenants: { full_name: string; phone: string | null } | null
  units: { name: string; properties: { name: string } | null } | null
  payments: { amount: number }[] | null
}

const reminderBaseSelectColumns =
  'id, organization_id, invoice_id, tenant_id, channel, message, status, cancelled_at, created_at, updated_at'

function formatBillingPeriod(value: string) {
  const [year, month] = value.split('-').map(Number)

  return new Intl.DateTimeFormat('id-ID', {
    month: 'long',
    year: 'numeric',
  }).format(new Date(year, month - 1, 1))
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(value)
}

function formatDueDate(value: string | null) {
  if (value === null) {
    return 'saat memungkinkan'
  }

  const [year, month, day] = value.split('-').map(Number)

  return new Intl.DateTimeFormat('id-ID', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  }).format(new Date(year, month - 1, day))
}

function formatUnitProperty(unitName: string, propertyName: string | null) {
  return propertyName === null ? unitName : `${unitName} - ${propertyName}`
}

function sumPaymentAmounts(payments: { amount: number }[] | null) {
  return payments?.reduce((total, payment) => total + payment.amount, 0) ?? 0
}

export function normalizeWhatsAppPhone(phone: string | null) {
  const digits = phone?.replace(/\D/g, '') ?? ''

  if (digits.length === 0) {
    return null
  }

  if (digits.startsWith('0')) {
    return `62${digits.slice(1)}`
  }

  return digits
}

export function buildWhatsAppUrl(phone: string | null, message: string) {
  const normalizedPhone = normalizeWhatsAppPhone(phone)

  if (normalizedPhone === null) {
    return null
  }

  return `https://wa.me/${normalizedPhone}?text=${encodeURIComponent(message)}`
}

export function generateReminderMessage(invoice: {
  tenant_name: string
  unit_name: string
  property_name: string | null
  billing_period: string
  due_date: string | null
  remaining_amount: number
}) {
  const placeName = formatUnitProperty(invoice.unit_name, invoice.property_name)
  const dueText =
    invoice.due_date === null
      ? 'Mohon melakukan pembayaran saat memungkinkan.'
      : `Mohon melakukan pembayaran sebelum/sekitar ${formatDueDate(
          invoice.due_date,
        )}.`

  return `Halo ${invoice.tenant_name}, ini pengingat pembayaran untuk ${placeName} periode ${formatBillingPeriod(
    invoice.billing_period,
  )}. Sisa tagihan adalah ${formatCurrency(
    invoice.remaining_amount,
  )}. ${dueText} Terima kasih.`
}
```

- [ ] **Step 3: Add list/form/create/update repository functions**

Continue `src/modules/reminders/infrastructure/reminders-repository.ts` with:

```ts
function mapReminderRow(row: ReminderRow): ReminderListItem {
  const invoice = row.invoices
  const tenant = invoice?.tenants
  const unit = invoice?.units

  return {
    id: row.id,
    organization_id: row.organization_id,
    invoice_id: row.invoice_id,
    tenant_id: row.tenant_id,
    channel: row.channel,
    message: row.message,
    status: row.status,
    cancelled_at: row.cancelled_at,
    created_at: row.created_at,
    updated_at: row.updated_at,
    invoice_billing_period:
      invoice?.billing_period ?? row.created_at.slice(0, 7),
    invoice_due_date: invoice?.due_date ?? null,
    invoice_total_amount: invoice?.total_amount ?? 0,
    invoice_status: invoice?.status ?? 'unknown',
    tenant_name: tenant?.full_name ?? 'Unknown tenant',
    tenant_phone: tenant?.phone ?? null,
    unit_name: unit?.name ?? 'Unknown unit',
    property_name: unit?.properties?.name ?? null,
    whatsapp_url: buildWhatsAppUrl(tenant?.phone ?? null, row.message),
  }
}

function mapReminderInvoiceOptionRow(
  row: ReminderInvoiceOptionRow,
): ReminderInvoiceOption {
  const paidAmount = sumPaymentAmounts(row.payments)
  const remainingAmount = Math.max(row.total_amount - paidAmount, 0)
  const tenantName = row.tenants?.full_name ?? 'Unknown tenant'
  const unitName = row.units?.name ?? 'Unknown unit'
  const propertyName = row.units?.properties?.name ?? null
  const generatedMessage = generateReminderMessage({
    tenant_name: tenantName,
    unit_name: unitName,
    property_name: propertyName,
    billing_period: row.billing_period,
    due_date: row.due_date,
    remaining_amount: remainingAmount,
  })

  return {
    id: row.id,
    organization_id: row.organization_id,
    tenant_id: row.tenant_id,
    billing_period: row.billing_period,
    due_date: row.due_date,
    total_amount: row.total_amount,
    status: row.status,
    tenant_name: tenantName,
    tenant_phone: row.tenants?.phone ?? null,
    unit_name: unitName,
    property_name: propertyName,
    paid_amount: paidAmount,
    remaining_amount: remainingAmount,
    generated_message: generatedMessage,
    whatsapp_url: buildWhatsAppUrl(
      row.tenants?.phone ?? null,
      generatedMessage,
    ),
  }
}

export async function listReminders(): Promise<ReminderListItem[]> {
  const { data, error } = await supabaseClient
    .from('reminders')
    .select(reminderSelectColumns)
    .neq('status', 'cancelled')
    .order('updated_at', { ascending: false })
    .returns<ReminderRow[]>()

  if (error !== null) {
    throw new Error(`Could not load reminders: ${error.message}`)
  }

  return data.map(mapReminderRow)
}

export async function listReminderFormOptions(): Promise<ReminderFormOptions> {
  const { data, error } = await supabaseClient
    .from('invoices')
    .select(reminderInvoiceOptionSelectColumns)
    .in('status', [...payableInvoiceStatuses])
    .order('billing_period', { ascending: false })
    .returns<ReminderInvoiceOptionRow[]>()

  if (error !== null) {
    throw new Error(`Could not load reminder invoices: ${error.message}`)
  }

  return {
    invoices: data
      .map(mapReminderInvoiceOptionRow)
      .filter((invoice) => invoice.remaining_amount > 0),
  }
}

export async function createReminder(
  input: CreateReminderInput,
): Promise<Reminder> {
  const { data, error } = await supabaseClient
    .from('reminders')
    .insert({
      organization_id: input.organization_id,
      invoice_id: input.invoice_id,
      tenant_id: input.tenant_id,
      channel: 'whatsapp',
      message: input.message,
      status: 'prepared',
    })
    .select(reminderBaseSelectColumns)
    .single<Reminder>()

  if (error !== null) {
    throw new Error(`Could not create reminder: ${error.message}`)
  }

  return data
}

export async function updateReminderStatus({
  reminder_id,
  status,
}: UpdateReminderStatusInput): Promise<Reminder> {
  const updateRecord: {
    status: ReminderStatus
    cancelled_at?: string | null
  } = {
    status,
  }

  if (status === 'cancelled') {
    updateRecord.cancelled_at = new Date().toISOString()
  } else {
    updateRecord.cancelled_at = null
  }

  const { data, error } = await supabaseClient
    .from('reminders')
    .update(updateRecord)
    .eq('id', reminder_id)
    .select(reminderBaseSelectColumns)
    .single<Reminder>()

  if (error !== null) {
    throw new Error(`Could not update reminder: ${error.message}`)
  }

  return data
}
```

- [ ] **Step 4: Export module API**

Create `src/modules/reminders/index.ts`:

```ts
export type {
  CreateReminderInput,
  Reminder,
  ReminderChannel,
  ReminderFormOptions,
  ReminderInvoiceOption,
  ReminderListItem,
  ReminderStatus,
  UpdateReminderStatusInput,
} from './domain/reminder'
export {
  buildWhatsAppUrl,
  createReminder,
  generateReminderMessage,
  listReminderFormOptions,
  listReminders,
  normalizeWhatsAppPhone,
  reminderFormOptionsQueryKey,
  remindersQueryKey,
  updateReminderStatus,
} from './infrastructure/reminders-repository'
```

- [ ] **Step 5: Verification checkpoint**

Run:

```bash
npm run build
```

Expected: TypeScript and Vite build complete successfully.

---

### Task 2: Reminders Query And Mutation Hooks

**Files:**

- Create: `src/modules/reminders/application/use-reminders-query.ts`
- Create: `src/modules/reminders/application/use-reminder-form-options-query.ts`
- Create: `src/modules/reminders/application/use-create-reminder-mutation.ts`
- Create: `src/modules/reminders/application/use-update-reminder-status-mutation.ts`
- Modify: `src/modules/reminders/index.ts`

- [ ] **Step 1: Add reminders list query hook**

Create `src/modules/reminders/application/use-reminders-query.ts`:

```ts
import { useQuery } from '@tanstack/react-query'

import {
  listReminders,
  remindersQueryKey,
} from '../infrastructure/reminders-repository'

export function useRemindersQuery() {
  return useQuery({
    queryKey: remindersQueryKey,
    queryFn: listReminders,
  })
}
```

- [ ] **Step 2: Add form options query hook**

Create `src/modules/reminders/application/use-reminder-form-options-query.ts`:

```ts
import { useQuery } from '@tanstack/react-query'

import {
  listReminderFormOptions,
  reminderFormOptionsQueryKey,
} from '../infrastructure/reminders-repository'

export function useReminderFormOptionsQuery() {
  return useQuery({
    queryKey: reminderFormOptionsQueryKey,
    queryFn: listReminderFormOptions,
  })
}
```

- [ ] **Step 3: Add create reminder mutation hook**

Create `src/modules/reminders/application/use-create-reminder-mutation.ts`:

```ts
import { useMutation, useQueryClient } from '@tanstack/react-query'

import type { CreateReminderInput } from '../domain/reminder'
import {
  createReminder,
  reminderFormOptionsQueryKey,
  remindersQueryKey,
} from '../infrastructure/reminders-repository'

export function useCreateReminderMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: CreateReminderInput) => createReminder(input),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: remindersQueryKey }),
        queryClient.invalidateQueries({
          queryKey: reminderFormOptionsQueryKey,
        }),
      ])
    },
  })
}
```

- [ ] **Step 4: Add update status mutation hook**

Create `src/modules/reminders/application/use-update-reminder-status-mutation.ts`:

```ts
import { useMutation, useQueryClient } from '@tanstack/react-query'

import type { UpdateReminderStatusInput } from '../domain/reminder'
import {
  remindersQueryKey,
  updateReminderStatus,
} from '../infrastructure/reminders-repository'

export function useUpdateReminderStatusMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: UpdateReminderStatusInput) =>
      updateReminderStatus(input),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: remindersQueryKey })
    },
  })
}
```

- [ ] **Step 5: Export hooks**

Append to `src/modules/reminders/index.ts`:

```ts
export { useCreateReminderMutation } from './application/use-create-reminder-mutation'
export { useReminderFormOptionsQuery } from './application/use-reminder-form-options-query'
export { useRemindersQuery } from './application/use-reminders-query'
export { useUpdateReminderStatusMutation } from './application/use-update-reminder-status-mutation'
```

- [ ] **Step 6: Verification checkpoint**

Run:

```bash
npm run build
```

Expected: TypeScript and Vite build complete successfully.

---

### Task 3: Reminders Page And Routing

**Files:**

- Create: `src/modules/reminders/presentation/reminders-page.tsx`
- Modify: `src/app/router/route-paths.ts`
- Modify: `src/app/router/app-router.tsx`
- Modify: `src/app/layouts/app-layout.tsx`
- Modify: `src/App.css`

- [ ] **Step 1: Add route path**

Modify `src/app/router/route-paths.ts`:

```ts
dashboardReminders: '/dashboard/reminders',
```

Place it after `dashboardReceipts`.

- [ ] **Step 2: Add sidebar navigation**

Modify `src/app/layouts/app-layout.tsx`:

```ts
{ label: 'Reminders', path: routePaths.dashboardReminders },
```

Place it after Receipts. Leave `futureSidebarItems` as `['Units', 'Maintenance']`.

- [ ] **Step 3: Add lazy route**

Modify `src/app/router/app-router.tsx` near the other lazy page declarations:

```ts
const RemindersPage = lazy(() =>
  import('../../modules/reminders/presentation/reminders-page').then(
    (module) => ({
      default: module.RemindersPage,
    }),
  ),
)
```

Add route after Receipts:

```tsx
<Route
  path={routePaths.dashboardReminders}
  element={
    <RouteAccessGate route="dashboard">
      <RemindersPage />
    </RouteAccessGate>
  }
/>
```

- [ ] **Step 4: Create page helpers and shell**

Create `src/modules/reminders/presentation/reminders-page.tsx` with imports, formatters, and helper components:

```tsx
import { useState } from 'react'

import { AppLayout } from '../../../app/layouts'
import type {
  ReminderInvoiceOption,
  ReminderListItem,
  ReminderStatus,
} from '../domain/reminder'
import { useCreateReminderMutation } from '../application/use-create-reminder-mutation'
import { useReminderFormOptionsQuery } from '../application/use-reminder-form-options-query'
import { useRemindersQuery } from '../application/use-reminders-query'
import { useUpdateReminderStatusMutation } from '../application/use-update-reminder-status-mutation'

function formatDate(value: string | null) {
  if (value === null) {
    return 'No due date'
  }

  const [year, month, day] = value.split('-').map(Number)

  return new Intl.DateTimeFormat('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(new Date(year, month - 1, day))
}

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value))
}

function formatBillingPeriod(value: string) {
  const [year, month] = value.split('-').map(Number)

  return new Intl.DateTimeFormat('id-ID', {
    month: 'long',
    year: 'numeric',
  }).format(new Date(year, month - 1, 1))
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(value)
}

function formatPropertyName(propertyName: string | null) {
  return propertyName ?? 'No property name'
}

function formatReminderStatus(status: ReminderStatus) {
  return status.replaceAll('_', ' ')
}

type ReminderCardState = Record<string, true>
```

- [ ] **Step 5: Add prepare reminder section component**

Add this component to `reminders-page.tsx`:

```tsx
function PrepareReminderSection({
  selectedInvoiceId,
  isCreating,
  hasCreateError,
  invoices,
  onSelectInvoice,
  onCreateReminder,
}: {
  selectedInvoiceId: string
  isCreating: boolean
  hasCreateError: boolean
  invoices: ReminderInvoiceOption[]
  onSelectInvoice: (invoiceId: string) => void
  onCreateReminder: () => void
}) {
  const selectedInvoice =
    invoices.find((invoice) => invoice.id === selectedInvoiceId) ?? null

  return (
    <section className="reminders-page__prepare">
      <div>
        <h3>Prepare reminder</h3>
        <p>Choose a payable invoice and prepare a manual WhatsApp reminder.</p>
      </div>

      {invoices.length === 0 ? (
        <div className="reminders-page__empty">
          <h3>No payable invoices</h3>
          <p>Unpaid, partially paid, or overdue invoices will appear here.</p>
        </div>
      ) : (
        <div className="reminder-create-form">
          <label htmlFor="reminder-invoice">Invoice</label>
          <select
            id="reminder-invoice"
            value={selectedInvoiceId}
            onChange={(event) => {
              onSelectInvoice(event.target.value)
            }}
          >
            <option value="">Select invoice</option>
            {invoices.map((invoice) => (
              <option key={invoice.id} value={invoice.id}>
                {invoice.tenant_name} - {invoice.unit_name} -{' '}
                {formatBillingPeriod(invoice.billing_period)} -{' '}
                {formatCurrency(invoice.remaining_amount)}
              </option>
            ))}
          </select>

          {selectedInvoice !== null ? (
            <div className="reminder-create-form__preview">
              <dl>
                <div>
                  <dt>Tenant</dt>
                  <dd>{selectedInvoice.tenant_name}</dd>
                </div>
                <div>
                  <dt>Unit</dt>
                  <dd>
                    {selectedInvoice.unit_name} -{' '}
                    {formatPropertyName(selectedInvoice.property_name)}
                  </dd>
                </div>
                <div>
                  <dt>Billing period</dt>
                  <dd>{formatBillingPeriod(selectedInvoice.billing_period)}</dd>
                </div>
                <div>
                  <dt>Due date</dt>
                  <dd>{formatDate(selectedInvoice.due_date)}</dd>
                </div>
                <div>
                  <dt>Remaining</dt>
                  <dd>{formatCurrency(selectedInvoice.remaining_amount)}</dd>
                </div>
              </dl>
              <p>{selectedInvoice.generated_message}</p>
            </div>
          ) : null}

          {hasCreateError ? (
            <p className="reminders-page__error" role="alert">
              We could not create this reminder. Please try again.
            </p>
          ) : null}

          <button
            type="button"
            disabled={selectedInvoice === null || isCreating}
            onClick={onCreateReminder}
          >
            {isCreating ? 'Preparing...' : 'Prepare reminder'}
          </button>
        </div>
      )}
    </section>
  )
}
```

- [ ] **Step 6: Add reminder card component**

Add this component to `reminders-page.tsx`:

```tsx
function ReminderCard({
  reminder,
  hasCopyState,
  hasUpdateError,
  isUpdating,
  onCopy,
  onUpdateStatus,
}: {
  reminder: ReminderListItem
  hasCopyState: boolean
  hasUpdateError: boolean
  isUpdating: boolean
  onCopy: (reminder: ReminderListItem) => void
  onUpdateStatus: (reminderId: string, status: ReminderStatus) => void
}) {
  return (
    <article className="reminder-card">
      <div className="reminder-card__header">
        <div>
          <h3>{reminder.tenant_name}</h3>
          <p>
            {reminder.unit_name} - {formatPropertyName(reminder.property_name)}
          </p>
        </div>
        <span className="reminder-card__status">
          {formatReminderStatus(reminder.status)}
        </span>
      </div>

      <dl className="reminder-card__details">
        <div>
          <dt>Billing period</dt>
          <dd>{formatBillingPeriod(reminder.invoice_billing_period)}</dd>
        </div>
        <div>
          <dt>Due date</dt>
          <dd>{formatDate(reminder.invoice_due_date)}</dd>
        </div>
        <div>
          <dt>Invoice total</dt>
          <dd>{formatCurrency(reminder.invoice_total_amount)}</dd>
        </div>
        <div>
          <dt>Channel</dt>
          <dd>{reminder.channel}</dd>
        </div>
        <div>
          <dt>Updated</dt>
          <dd>{formatDateTime(reminder.updated_at)}</dd>
        </div>
      </dl>

      <div className="reminder-card__message">
        <p>{reminder.message}</p>
      </div>

      {hasCopyState ? (
        <p className="reminder-card__feedback" role="status">
          Message copied.
        </p>
      ) : null}

      {hasUpdateError ? (
        <p className="reminders-page__error" role="alert">
          We could not update this reminder. Please try again.
        </p>
      ) : null}

      <div className="reminder-card__actions">
        <button type="button" onClick={() => onCopy(reminder)}>
          Copy message
        </button>
        {reminder.whatsapp_url !== null ? (
          <a href={reminder.whatsapp_url} target="_blank" rel="noreferrer">
            Open WhatsApp
          </a>
        ) : null}
        <button
          type="button"
          disabled={isUpdating}
          onClick={() => onUpdateStatus(reminder.id, 'prepared')}
        >
          Mark prepared
        </button>
        <button
          type="button"
          disabled={isUpdating}
          onClick={() => onUpdateStatus(reminder.id, 'sent')}
        >
          Mark sent
        </button>
        <button
          type="button"
          disabled={isUpdating}
          onClick={() => onUpdateStatus(reminder.id, 'cancelled')}
        >
          Cancel
        </button>
      </div>
    </article>
  )
}
```

- [ ] **Step 7: Add page component and event handlers**

Complete `RemindersPage` in `reminders-page.tsx`:

```tsx
export function RemindersPage() {
  const remindersQuery = useRemindersQuery()
  const formOptionsQuery = useReminderFormOptionsQuery()
  const createReminderMutation = useCreateReminderMutation()
  const updateReminderStatusMutation = useUpdateReminderStatusMutation()
  const [selectedInvoiceId, setSelectedInvoiceId] = useState('')
  const [hasCreateError, setHasCreateError] = useState(false)
  const [copiedReminderIds, setCopiedReminderIds] = useState<ReminderCardState>(
    {},
  )
  const [updateErrorReminderIds, setUpdateErrorReminderIds] =
    useState<ReminderCardState>({})
  const [updatingReminderIds, setUpdatingReminderIds] =
    useState<ReminderCardState>({})

  const selectedInvoice =
    formOptionsQuery.data?.invoices.find(
      (invoice) => invoice.id === selectedInvoiceId,
    ) ?? null

  async function handleCreateReminder() {
    if (selectedInvoice === null || createReminderMutation.isPending) {
      return
    }

    setHasCreateError(false)
    try {
      await createReminderMutation.mutateAsync({
        organization_id: selectedInvoice.organization_id,
        invoice_id: selectedInvoice.id,
        tenant_id: selectedInvoice.tenant_id,
        message: selectedInvoice.generated_message,
      })
      setSelectedInvoiceId('')
    } catch {
      setHasCreateError(true)
    }
  }

  async function handleCopy(reminder: ReminderListItem) {
    try {
      await navigator.clipboard.writeText(reminder.message)
      setCopiedReminderIds((current) => ({
        ...current,
        [reminder.id]: true,
      }))
      window.setTimeout(() => {
        setCopiedReminderIds((current) => {
          const next = { ...current }
          delete next[reminder.id]

          return next
        })
      }, 2000)
    } catch {
      setCopiedReminderIds((current) => {
        const next = { ...current }
        delete next[reminder.id]

        return next
      })
    }
  }

  async function handleUpdateStatus(
    reminderId: string,
    status: ReminderStatus,
  ) {
    if (updatingReminderIds[reminderId] === true) {
      return
    }

    setUpdatingReminderIds((current) => ({
      ...current,
      [reminderId]: true,
    }))
    setUpdateErrorReminderIds((current) => {
      const next = { ...current }
      delete next[reminderId]

      return next
    })

    try {
      await updateReminderStatusMutation.mutateAsync({
        reminder_id: reminderId,
        status,
      })
    } catch {
      setUpdateErrorReminderIds((current) => ({
        ...current,
        [reminderId]: true,
      }))
    } finally {
      setUpdatingReminderIds((current) => {
        const next = { ...current }
        delete next[reminderId]

        return next
      })
    }
  }

  return (
    <AppLayout>
      <section className="reminders-page" aria-labelledby="reminders-title">
        <div className="reminders-page__header">
          <div>
            <h2 id="reminders-title">Reminders</h2>
            <p>
              Prepare manual tenant reminders and send them outside RuangRapi.
            </p>
          </div>
        </div>

        {formOptionsQuery.isLoading ? (
          <p className="reminders-page__status">Loading payable invoices...</p>
        ) : null}

        {formOptionsQuery.isError ? (
          <p className="reminders-page__error" role="alert">
            We could not load payable invoices right now. Please try again
            later.
          </p>
        ) : null}

        {formOptionsQuery.isSuccess ? (
          <PrepareReminderSection
            selectedInvoiceId={selectedInvoiceId}
            isCreating={createReminderMutation.isPending}
            hasCreateError={hasCreateError}
            invoices={formOptionsQuery.data.invoices}
            onSelectInvoice={setSelectedInvoiceId}
            onCreateReminder={() => {
              void handleCreateReminder()
            }}
          />
        ) : null}

        <section className="reminders-page__queue">
          <div>
            <h3>Reminder queue</h3>
            <p>Prepared and sent reminders stay visible until cancelled.</p>
          </div>

          {remindersQuery.isLoading ? (
            <p className="reminders-page__status">Loading reminders...</p>
          ) : null}

          {remindersQuery.isError ? (
            <p className="reminders-page__error" role="alert">
              We could not load reminders right now. Please try again later.
            </p>
          ) : null}

          {remindersQuery.isSuccess && remindersQuery.data.length === 0 ? (
            <div className="reminders-page__empty">
              <h3>No active reminders</h3>
              <p>Prepared reminders will appear here.</p>
            </div>
          ) : null}

          {remindersQuery.isSuccess && remindersQuery.data.length > 0 ? (
            <div className="reminders-page__list" aria-label="Reminder list">
              {remindersQuery.data.map((reminder) => (
                <ReminderCard
                  key={reminder.id}
                  reminder={reminder}
                  hasCopyState={copiedReminderIds[reminder.id] === true}
                  hasUpdateError={updateErrorReminderIds[reminder.id] === true}
                  isUpdating={updatingReminderIds[reminder.id] === true}
                  onCopy={(currentReminder) => {
                    void handleCopy(currentReminder)
                  }}
                  onUpdateStatus={(reminderId, status) => {
                    void handleUpdateStatus(reminderId, status)
                  }}
                />
              ))}
            </div>
          ) : null}
        </section>
      </section>
    </AppLayout>
  )
}
```

- [ ] **Step 8: Add CSS**

Append Reminders page styles near other module/card styles in `src/App.css`:

```css
.reminders-page {
  display: grid;
  gap: 24px;
  max-width: 960px;
}

.reminders-page__header,
.reminders-page__prepare,
.reminders-page__queue {
  display: grid;
  gap: 16px;
}

.reminders-page__header h2,
.reminders-page__prepare h3,
.reminders-page__queue h3,
.reminders-page__empty h3,
.reminder-card h3 {
  margin: 0 0 8px;
  color: var(--text-h);
}

.reminders-page__header p,
.reminders-page__prepare p,
.reminders-page__queue p,
.reminders-page__status {
  color: var(--text);
}

.reminders-page__error {
  border: 1px solid #fecdca;
  border-radius: 12px;
  padding: 16px;
  color: #b42318;
  background: #fffbfa;
}

.reminders-page__empty,
.reminder-card,
.reminder-create-form {
  border: 1px solid var(--border);
  border-radius: 12px;
  background: var(--surface);
}

.reminders-page__empty {
  padding: 24px;
}

.reminder-create-form,
.reminder-card {
  display: grid;
  gap: 16px;
  padding: 20px;
}

.reminder-create-form label {
  color: var(--text-h);
  font-weight: 700;
}

.reminder-create-form select {
  border: 1px solid var(--border);
  border-radius: 8px;
  padding: 10px 12px;
  color: var(--text-h);
  background: #ffffff;
}

.reminder-create-form__preview {
  display: grid;
  gap: 14px;
  border-left: 4px solid #166534;
  padding: 14px;
  background: #f7fff9;
}

.reminder-create-form__preview dl,
.reminder-card__details {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
  margin: 0;
}

.reminder-create-form__preview dt,
.reminder-card__details dt {
  color: var(--text-h);
  font-size: 13px;
  font-weight: 700;
}

.reminder-create-form__preview dd,
.reminder-card__details dd {
  margin: 0;
  color: var(--text);
  overflow-wrap: anywhere;
}

.reminder-create-form__preview p,
.reminder-card__message p {
  margin: 0;
  color: var(--text-h);
  white-space: pre-wrap;
}

.reminder-create-form button,
.reminder-card__actions button,
.reminder-card__actions a {
  width: max-content;
  border: 0;
  border-radius: 8px;
  padding: 10px 14px;
  color: #ffffff;
  background: var(--text-h);
  font-weight: 700;
  text-decoration: none;
  cursor: pointer;
}

.reminder-create-form button:disabled,
.reminder-card__actions button:disabled {
  cursor: not-allowed;
  opacity: 0.72;
}

.reminders-page__list {
  display: grid;
  gap: 12px;
}

.reminder-card {
  border-left: 4px solid #166534;
}

.reminder-card__header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
}

.reminder-card__header p {
  margin: 0;
  color: var(--text);
}

.reminder-card__status {
  border: 1px solid #b7d7c2;
  border-radius: 999px;
  padding: 4px 10px;
  color: #166534;
  background: #f7fff9;
  font-size: 13px;
  font-weight: 800;
  text-transform: capitalize;
  white-space: nowrap;
}

.reminder-card__message {
  border: 1px solid var(--border);
  border-radius: 8px;
  padding: 14px;
  background: #f8fafc;
}

.reminder-card__feedback {
  margin: 0;
  color: #166534;
  font-weight: 700;
}

.reminder-card__actions {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

@media (max-width: 720px) {
  .reminder-create-form__preview dl,
  .reminder-card__details {
    grid-template-columns: 1fr;
  }

  .reminder-card__header {
    display: grid;
  }

  .reminder-create-form button,
  .reminder-card__actions button,
  .reminder-card__actions a {
    width: 100%;
  }
}
```

- [ ] **Step 9: Verification checkpoint**

Run:

```bash
npm run build
npm run lint
```

Expected: both commands exit 0.

---

### Task 4: Checklist, Wiki, Formatting, And Final Verification

**Files:**

- Create: `docs/24-reminders-validation-checklist.md`
- Modify: `wiki/03-domain/reminders.md`
- Modify: `wiki/09-status/built.md`
- Modify: `wiki/09-status/not-built.md`
- Modify: `wiki/06-task-breakdown/ready-soon.md`
- Modify: `wiki/06-task-breakdown/backlog.md`

- [ ] **Step 1: Add Reminders validation checklist**

Create `docs/24-reminders-validation-checklist.md`:

```md
# Reminders Validation Checklist

Status: ready for manual validation after the Reminders manual MVP implementation.

## Automated Checks

- [ ] `npm run format:check` passes.
- [ ] `npm run build` passes.
- [ ] `npm run lint` passes.
- [ ] `git diff --check` passes.

## Manual Setup

Use disposable local records created through the app. Do not commit local users, tokens, screenshots with private data, or seed data.

Required records:

- one organization
- one property
- one unit
- one tenant with a phone number
- one tenant without a phone number
- one active lease
- one issued unpaid invoice
- one partially paid invoice
- one paid invoice

## Page And Navigation

- [ ] Sidebar shows `Reminders`.
- [ ] `/dashboard/reminders` loads.
- [ ] Page explains reminders are manually sent.

## Prepare Reminder

- [ ] Unpaid invoice appears in reminder invoice options.
- [ ] Partially paid invoice appears in reminder invoice options.
- [ ] Overdue invoice appears in reminder invoice options.
- [ ] Paid invoice does not appear in reminder invoice options.
- [ ] Selected invoice shows tenant, unit, property, billing period, due date, and remaining amount.
- [ ] Generated message contains tenant, unit/property, billing period, remaining amount, and due date fallback when needed.
- [ ] Clicking `Prepare reminder` creates one reminder row with status `prepared`.

## Reminder Queue

- [ ] Prepared reminder appears in the reminder queue.
- [ ] Reminder card shows tenant, unit, property, billing period, due date, invoice total, channel, status, updated date, and message.
- [ ] Copy message works or leaves text visible for manual copying.
- [ ] WhatsApp link appears when tenant phone exists.
- [ ] WhatsApp link does not appear when tenant phone is missing.
- [ ] Mark prepared works.
- [ ] Mark sent works.
- [ ] Cancel hides reminder from the default queue.

## Scope Checks

- [ ] No WhatsApp Business API integration was introduced.
- [ ] No automatic delivery was introduced.
- [ ] No scheduled reminder job was introduced.
- [ ] No bulk sending workflow was introduced.
- [ ] No delivery/read status tracking was introduced.
- [ ] No new migration or seed data was introduced.
```

- [ ] **Step 2: Update reminder wiki domain page**

Change `wiki/03-domain/reminders.md` current status to:

```md
Reminders module: manual MVP baseline complete; manual validation pending.
```

Add built items:

```md
- Reminders page
- payable invoice reminder preparation
- generated WhatsApp-style message text
- manual WhatsApp link
- copy message action
- prepared/sent/cancelled status updates
- Reminders validation checklist
```

Keep deferred items:

```md
- scheduled reminders
- bulk reminders
- message templates
- reminder history/detail page
- delivery/status tracking
- WhatsApp Business API integration
- better phone normalization
```

- [ ] **Step 3: Update status and backlog docs**

In `wiki/09-status/built.md`, add a `## Reminders` section if absent, or update it:

```md
## Reminders

Status: manual MVP baseline complete; manual validation pending.

Built:

- Reminders page
- payable invoice reminder preparation
- generated WhatsApp-style message text
- manual WhatsApp link
- copy message action
- prepared/sent/cancelled status updates
- Reminders validation checklist

Deferred:

- WhatsApp Business API integration
- scheduled reminders
- bulk reminders
- delivery/read status tracking
- message templates
- reminder detail/history page
- better phone normalization
```

In `wiki/09-status/not-built.md`, keep Reminders deferred items only:

```md
## Reminders

Status: manual MVP baseline complete; remaining automation and refinement work is deferred.

Not built:

- WhatsApp Business API integration
- scheduled reminders
- bulk reminders
- delivery/read status tracking
- message templates
- reminder detail/history page
- better phone normalization
```

In `wiki/06-task-breakdown/ready-soon.md`, mark Reminders manual MVP as no longer candidate and point next likely candidate to Maintenance planning or Reporting/Dashboard metrics.

In `wiki/06-task-breakdown/backlog.md`, remove the manual reminders baseline item if present and keep advanced reminder items.

- [ ] **Step 4: Final formatting and verification**

Run:

```bash
npm run format:check
npm run build
npm run lint
git diff --check
```

Expected:

- Prettier reports all files use code style.
- TypeScript/Vite build exits 0.
- ESLint exits 0.
- `git diff --check` exits 0.

- [ ] **Step 5: Commit**

Run:

```bash
git add docs/24-reminders-validation-checklist.md src/App.css src/app/layouts/app-layout.tsx src/app/router/app-router.tsx src/app/router/route-paths.ts src/modules/reminders wiki/03-domain/reminders.md wiki/09-status/built.md wiki/09-status/not-built.md wiki/06-task-breakdown/ready-soon.md wiki/06-task-breakdown/backlog.md
git commit -m "feat: add manual reminders mvp"
```

Expected: one focused commit containing the Reminders manual MVP implementation and docs.

---

## Self-Review

Spec coverage:

- Route and navigation are covered in Task 3.
- Reminders module shape is covered in Tasks 1 and 2.
- Payable invoice preparation is covered in Tasks 1 and 3.
- Generated Indonesian-friendly message is covered in Task 1.
- WhatsApp link normalization is covered in Task 1.
- Copy action and status transitions are covered in Task 3.
- Validation checklist and wiki/status docs are covered in Task 4.
- Out-of-scope automation, migrations, seed data, bulk sending, and delivery tracking remain excluded.

Placeholder scan:

- No TBD/TODO placeholders.
- Commands and expected outcomes are explicit.
- No automated test files are referenced because the repository has no test runner.

Type consistency:

- `ReminderStatus`, `ReminderChannel`, `ReminderListItem`, `ReminderInvoiceOption`, `CreateReminderInput`, and `UpdateReminderStatusInput` are defined in Task 1 and used consistently later.
