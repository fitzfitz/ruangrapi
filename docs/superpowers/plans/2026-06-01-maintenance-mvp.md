# Maintenance MVP Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a Maintenance MVP with property/unit tickets, simple status actions, and ticket-level estimated/actual cost tracking.

**Architecture:** Add a `src/modules/maintenance/` module following existing domain/application/infrastructure/presentation patterns. Add one Supabase migration for optional cost columns on `maintenance_tickets`, then expose list/create/status-update workflows through TanStack Query hooks and dashboard routes.

**Tech Stack:** React, TypeScript, Vite, TanStack Query, React Hook Form, Zod, Supabase.

---

## File Structure

Create:

- `supabase/migrations/20260601000000_add_maintenance_ticket_costs.sql`
  Adds optional non-negative `estimated_cost` and `actual_cost` columns.
- `src/modules/maintenance/domain/maintenance.ts`
  Domain types for tickets, priorities, statuses, list items, form options, and status update input.
- `src/modules/maintenance/domain/create-maintenance-ticket-schema.ts`
  Zod form schema for create-ticket validation.
- `src/modules/maintenance/infrastructure/maintenance-repository.ts`
  Supabase queries/mutations, mappers, validation, query keys, and status timestamp rules.
- `src/modules/maintenance/application/use-maintenance-tickets-query.ts`
  List query hook.
- `src/modules/maintenance/application/use-maintenance-form-options-query.ts`
  Form options query hook.
- `src/modules/maintenance/application/use-create-maintenance-ticket-mutation.ts`
  Create mutation hook.
- `src/modules/maintenance/application/use-update-maintenance-ticket-status-mutation.ts`
  Status update mutation hook.
- `src/modules/maintenance/presentation/maintenance-page.tsx`
  Maintenance list page and ticket status actions.
- `src/modules/maintenance/presentation/create-maintenance-ticket-page.tsx`
  Create ticket form.
- `src/modules/maintenance/index.ts`
  Public module exports.
- `docs/25-maintenance-validation-checklist.md`
  Manual/automated validation checklist.

Modify:

- `src/app/router/route-paths.ts`
  Add `dashboardMaintenance` and `dashboardMaintenanceNew`.
- `src/app/router/app-router.tsx`
  Lazy-load and route Maintenance pages.
- `src/app/layouts/app-layout.tsx`
  Add Maintenance to active sidebar navigation and remove from future-only items.
- `src/App.css`
  Add compact operational styles for list cards, create form, status actions, and responsive layout.
- `wiki/03-domain/maintenance.md`
  Update Maintenance from future/not-started to MVP baseline implementation complete, manual validation pending.
- `wiki/09-status/built.md`
  Add Maintenance section.
- `wiki/09-status/not-built.md`
  Change Maintenance to deferred advanced items only.
- `wiki/06-task-breakdown/ready-soon.md`
  Mark Maintenance planning/current MVP as no longer a candidate; point next candidate to Reporting/Dashboard metrics.
- `wiki/06-task-breakdown/backlog.md`
  Keep advanced Maintenance items in backlog.
- `wiki/04-roadmap/release-plan.md`
  Move Maintenance into current baseline and put Reporting/Dashboard metrics next.
- `wiki/06-task-breakdown/task-index.md`
  Move Maintenance planning/build/checklist to completed candidates.

No vendor management, attachments, recurring schedules, payments, work orders, or cost ledger should be added.

---

### Task 1: Database Migration

**Files:**

- Create: `supabase/migrations/20260601000000_add_maintenance_ticket_costs.sql`

- [ ] **Step 1: Add cost columns migration**

Create `supabase/migrations/20260601000000_add_maintenance_ticket_costs.sql`:

```sql
alter table public.maintenance_tickets
  add column estimated_cost bigint check (estimated_cost is null or estimated_cost >= 0),
  add column actual_cost bigint check (actual_cost is null or actual_cost >= 0);
```

- [ ] **Step 2: Verify migration syntax**

Run:

```bash
npm run build
```

Expected: TypeScript/Vite build still exits 0. This does not apply the migration; it verifies no source breakage before code starts.

---

### Task 2: Maintenance Domain, Schema, And Repository

**Files:**

- Create: `src/modules/maintenance/domain/maintenance.ts`
- Create: `src/modules/maintenance/domain/create-maintenance-ticket-schema.ts`
- Create: `src/modules/maintenance/infrastructure/maintenance-repository.ts`
- Create: `src/modules/maintenance/index.ts`

- [ ] **Step 1: Create Maintenance domain types**

Create `src/modules/maintenance/domain/maintenance.ts`:

```ts
export type MaintenanceTicketStatus =
  | 'open'
  | 'in_progress'
  | 'resolved'
  | 'cancelled'

export type MaintenanceTicketPriority = 'low' | 'medium' | 'high' | 'urgent'

export type MaintenanceTicket = {
  id: string
  organization_id: string
  property_id: string
  unit_id: string | null
  title: string
  description: string | null
  status: MaintenanceTicketStatus
  priority: MaintenanceTicketPriority
  estimated_cost: number | null
  actual_cost: number | null
  reported_at: string
  resolved_at: string | null
  cancelled_at: string | null
  created_at: string
  updated_at: string
}

export type MaintenanceTicketListItem = MaintenanceTicket & {
  property_name: string
  unit_name: string | null
}

export type MaintenancePropertyOption = {
  id: string
  organization_id: string
  name: string
}

export type MaintenanceUnitOption = {
  id: string
  organization_id: string
  property_id: string
  name: string
}

export type MaintenanceFormOptions = {
  properties: MaintenancePropertyOption[]
  units: MaintenanceUnitOption[]
}

export type CreateMaintenanceTicketInput = {
  organization_id: string
  property_id: string
  unit_id: string | null
  title: string
  description: string | null
  priority: MaintenanceTicketPriority
  reported_at: string
  estimated_cost: number | null
  actual_cost: number | null
}

export type UpdateMaintenanceTicketStatusInput = {
  ticket_id: string
  status: MaintenanceTicketStatus
}
```

- [ ] **Step 2: Create create-ticket schema**

Create `src/modules/maintenance/domain/create-maintenance-ticket-schema.ts`:

```ts
import { z } from 'zod'

const optionalTextField = z
  .string()
  .trim()
  .transform((value) => (value.length > 0 ? value : null))

const optionalWholeRupiahField = z
  .string()
  .trim()
  .transform((value) => (value.length > 0 ? value : null))
  .pipe(
    z
      .string()
      .regex(/^\d+$/, 'Cost must be a whole number.')
      .transform(Number)
      .refine((value) => value >= 0, 'Cost must be zero or greater.')
      .nullable(),
  )

export const createMaintenanceTicketSchema = z.object({
  property_id: z.string().trim().min(1, 'Select a property.'),
  unit_id: z
    .string()
    .trim()
    .transform((value) => (value.length > 0 ? value : null)),
  title: z.string().trim().min(1, 'Title is required.'),
  description: optionalTextField,
  priority: z.enum(['low', 'medium', 'high', 'urgent'], {
    error: 'Select a priority.',
  }),
  reported_at: z.string().trim().min(1, 'Reported date is required.'),
  estimated_cost: optionalWholeRupiahField,
  actual_cost: optionalWholeRupiahField,
})

export type CreateMaintenanceTicketInput = z.infer<
  typeof createMaintenanceTicketSchema
>
export type CreateMaintenanceTicketFormValues = z.input<
  typeof createMaintenanceTicketSchema
>
```

- [ ] **Step 3: Create repository query keys, selects, row types, and mappers**

Create the start of `src/modules/maintenance/infrastructure/maintenance-repository.ts`:

```ts
import { supabaseClient } from '../../../shared/lib'
import type {
  CreateMaintenanceTicketInput,
  MaintenanceFormOptions,
  MaintenancePropertyOption,
  MaintenanceTicket,
  MaintenanceTicketListItem,
  MaintenanceTicketStatus,
  MaintenanceUnitOption,
  UpdateMaintenanceTicketStatusInput,
} from '../domain/maintenance'

export const maintenanceTicketsQueryKey = ['maintenance-tickets'] as const
export const maintenanceFormOptionsQueryKey = [
  ...maintenanceTicketsQueryKey,
  'form-options',
] as const

const maintenanceTicketSelectColumns = `
  id,
  organization_id,
  property_id,
  unit_id,
  title,
  description,
  status,
  priority,
  estimated_cost,
  actual_cost,
  reported_at,
  resolved_at,
  cancelled_at,
  created_at,
  updated_at,
  properties (
    name
  ),
  units (
    name
  )
`

const maintenanceTicketBaseSelectColumns =
  'id, organization_id, property_id, unit_id, title, description, status, priority, estimated_cost, actual_cost, reported_at, resolved_at, cancelled_at, created_at, updated_at'

type MaintenanceTicketRow = MaintenanceTicket & {
  properties: { name: string } | null
  units: { name: string } | null
}

type PropertyOptionRow = {
  id: string
  organization_id: string
  name: string
}

type UnitOptionRow = {
  id: string
  organization_id: string
  property_id: string
  name: string
}

function mapMaintenanceTicketRow(
  row: MaintenanceTicketRow,
): MaintenanceTicketListItem {
  return {
    id: row.id,
    organization_id: row.organization_id,
    property_id: row.property_id,
    unit_id: row.unit_id,
    title: row.title,
    description: row.description,
    status: row.status,
    priority: row.priority,
    estimated_cost: row.estimated_cost,
    actual_cost: row.actual_cost,
    reported_at: row.reported_at,
    resolved_at: row.resolved_at,
    cancelled_at: row.cancelled_at,
    created_at: row.created_at,
    updated_at: row.updated_at,
    property_name: row.properties?.name ?? 'Unknown property',
    unit_name: row.units?.name ?? null,
  }
}

function mapPropertyOption(row: PropertyOptionRow): MaintenancePropertyOption {
  return {
    id: row.id,
    organization_id: row.organization_id,
    name: row.name,
  }
}

function mapUnitOption(row: UnitOptionRow): MaintenanceUnitOption {
  return {
    id: row.id,
    organization_id: row.organization_id,
    property_id: row.property_id,
    name: row.name,
  }
}
```

- [ ] **Step 4: Add list and form option repository functions**

Append:

```ts
export async function listMaintenanceTickets(): Promise<
  MaintenanceTicketListItem[]
> {
  const { data, error } = await supabaseClient
    .from('maintenance_tickets')
    .select(maintenanceTicketSelectColumns)
    .order('reported_at', { ascending: false })
    .order('created_at', { ascending: false })
    .returns<MaintenanceTicketRow[]>()

  if (error !== null) {
    throw new Error(`Could not load maintenance tickets: ${error.message}`)
  }

  return data.map(mapMaintenanceTicketRow)
}

export async function listMaintenanceFormOptions(): Promise<MaintenanceFormOptions> {
  const [
    { data: properties, error: propertiesError },
    { data: units, error: unitsError },
  ] = await Promise.all([
    supabaseClient
      .from('properties')
      .select('id, organization_id, name')
      .order('name', { ascending: true })
      .returns<PropertyOptionRow[]>(),
    supabaseClient
      .from('units')
      .select('id, organization_id, property_id, name')
      .order('name', { ascending: true })
      .returns<UnitOptionRow[]>(),
  ])

  if (propertiesError !== null) {
    throw new Error(
      `Could not load maintenance properties: ${propertiesError.message}`,
    )
  }

  if (unitsError !== null) {
    throw new Error(`Could not load maintenance units: ${unitsError.message}`)
  }

  return {
    properties: properties.map(mapPropertyOption),
    units: units.map(mapUnitOption),
  }
}
```

Run Prettier after implementation; the Promise destructuring may be wrapped by the formatter.

- [ ] **Step 5: Add validation helpers and create mutation**

Append:

```ts
async function validateMaintenanceLocation({
  organization_id,
  property_id,
  unit_id,
}: Pick<
  CreateMaintenanceTicketInput,
  'organization_id' | 'property_id' | 'unit_id'
>) {
  const { data: property, error: propertyError } = await supabaseClient
    .from('properties')
    .select('id')
    .eq('id', property_id)
    .eq('organization_id', organization_id)
    .maybeSingle<{ id: string }>()

  if (propertyError !== null) {
    throw new Error(
      `Could not validate maintenance property: ${propertyError.message}`,
    )
  }

  if (property === null) {
    throw new Error(
      'Maintenance ticket property must belong to this organization.',
    )
  }

  if (unit_id === null) {
    return
  }

  const { data: unit, error: unitError } = await supabaseClient
    .from('units')
    .select('id')
    .eq('id', unit_id)
    .eq('property_id', property_id)
    .eq('organization_id', organization_id)
    .maybeSingle<{ id: string }>()

  if (unitError !== null) {
    throw new Error(`Could not validate maintenance unit: ${unitError.message}`)
  }

  if (unit === null) {
    throw new Error(
      'Maintenance ticket unit must belong to the selected property.',
    )
  }
}

export async function createMaintenanceTicket(
  input: CreateMaintenanceTicketInput,
): Promise<MaintenanceTicket> {
  await validateMaintenanceLocation({
    organization_id: input.organization_id,
    property_id: input.property_id,
    unit_id: input.unit_id,
  })

  const { data, error } = await supabaseClient
    .from('maintenance_tickets')
    .insert({
      organization_id: input.organization_id,
      property_id: input.property_id,
      unit_id: input.unit_id,
      title: input.title,
      description: input.description,
      priority: input.priority,
      reported_at: input.reported_at,
      estimated_cost: input.estimated_cost,
      actual_cost: input.actual_cost,
    })
    .select(maintenanceTicketBaseSelectColumns)
    .single<MaintenanceTicket>()

  if (error !== null) {
    throw new Error(`Could not create maintenance ticket: ${error.message}`)
  }

  return data
}
```

- [ ] **Step 6: Add status update mutation**

Append:

```ts
export async function updateMaintenanceTicketStatus({
  ticket_id,
  status,
}: UpdateMaintenanceTicketStatusInput): Promise<MaintenanceTicket> {
  const updateRecord: {
    status: MaintenanceTicketStatus
    resolved_at: string | null
    cancelled_at: string | null
  } = {
    status,
    resolved_at: null,
    cancelled_at: null,
  }

  if (status === 'resolved') {
    updateRecord.resolved_at = new Date().toISOString()
  }

  if (status === 'cancelled') {
    updateRecord.cancelled_at = new Date().toISOString()
  }

  const { data, error } = await supabaseClient
    .from('maintenance_tickets')
    .update(updateRecord)
    .eq('id', ticket_id)
    .select(maintenanceTicketBaseSelectColumns)
    .single<MaintenanceTicket>()

  if (error !== null) {
    throw new Error(`Could not update maintenance ticket: ${error.message}`)
  }

  return data
}
```

- [ ] **Step 7: Create module barrel**

Create `src/modules/maintenance/index.ts`:

```ts
export type {
  CreateMaintenanceTicketInput,
  MaintenanceFormOptions,
  MaintenancePropertyOption,
  MaintenanceTicket,
  MaintenanceTicketListItem,
  MaintenanceTicketPriority,
  MaintenanceTicketStatus,
  MaintenanceUnitOption,
  UpdateMaintenanceTicketStatusInput,
} from './domain/maintenance'
export {
  createMaintenanceTicketSchema,
  type CreateMaintenanceTicketFormValues,
} from './domain/create-maintenance-ticket-schema'
export {
  createMaintenanceTicket,
  listMaintenanceFormOptions,
  listMaintenanceTickets,
  maintenanceFormOptionsQueryKey,
  maintenanceTicketsQueryKey,
  updateMaintenanceTicketStatus,
} from './infrastructure/maintenance-repository'
```

- [ ] **Step 8: Verification checkpoint**

Run:

```bash
npm run build
```

Expected: build exits 0.

---

### Task 3: Maintenance Query And Mutation Hooks

**Files:**

- Create: `src/modules/maintenance/application/use-maintenance-tickets-query.ts`
- Create: `src/modules/maintenance/application/use-maintenance-form-options-query.ts`
- Create: `src/modules/maintenance/application/use-create-maintenance-ticket-mutation.ts`
- Create: `src/modules/maintenance/application/use-update-maintenance-ticket-status-mutation.ts`
- Modify: `src/modules/maintenance/index.ts`

- [ ] **Step 1: Add tickets query hook**

Create `src/modules/maintenance/application/use-maintenance-tickets-query.ts`:

```ts
import { useQuery } from '@tanstack/react-query'

import {
  listMaintenanceTickets,
  maintenanceTicketsQueryKey,
} from '../infrastructure/maintenance-repository'

export function useMaintenanceTicketsQuery() {
  return useQuery({
    queryKey: maintenanceTicketsQueryKey,
    queryFn: listMaintenanceTickets,
  })
}
```

- [ ] **Step 2: Add form options query hook**

Create `src/modules/maintenance/application/use-maintenance-form-options-query.ts`:

```ts
import { useQuery } from '@tanstack/react-query'

import {
  listMaintenanceFormOptions,
  maintenanceFormOptionsQueryKey,
} from '../infrastructure/maintenance-repository'

export function useMaintenanceFormOptionsQuery() {
  return useQuery({
    queryKey: maintenanceFormOptionsQueryKey,
    queryFn: listMaintenanceFormOptions,
  })
}
```

- [ ] **Step 3: Add create mutation hook**

Create `src/modules/maintenance/application/use-create-maintenance-ticket-mutation.ts`:

```ts
import { useMutation, useQueryClient } from '@tanstack/react-query'

import type { CreateMaintenanceTicketInput } from '../domain/maintenance'
import {
  createMaintenanceTicket,
  maintenanceTicketsQueryKey,
} from '../infrastructure/maintenance-repository'

export function useCreateMaintenanceTicketMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: CreateMaintenanceTicketInput) =>
      createMaintenanceTicket(input),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: maintenanceTicketsQueryKey,
      })
    },
  })
}
```

- [ ] **Step 4: Add status update mutation hook**

Create `src/modules/maintenance/application/use-update-maintenance-ticket-status-mutation.ts`:

```ts
import { useMutation, useQueryClient } from '@tanstack/react-query'

import type { UpdateMaintenanceTicketStatusInput } from '../domain/maintenance'
import {
  maintenanceTicketsQueryKey,
  updateMaintenanceTicketStatus,
} from '../infrastructure/maintenance-repository'

export function useUpdateMaintenanceTicketStatusMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: UpdateMaintenanceTicketStatusInput) =>
      updateMaintenanceTicketStatus(input),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: maintenanceTicketsQueryKey,
      })
    },
  })
}
```

- [ ] **Step 5: Export hooks from barrel**

Append to `src/modules/maintenance/index.ts`:

```ts
export { useCreateMaintenanceTicketMutation } from './application/use-create-maintenance-ticket-mutation'
export { useMaintenanceFormOptionsQuery } from './application/use-maintenance-form-options-query'
export { useMaintenanceTicketsQuery } from './application/use-maintenance-tickets-query'
export { useUpdateMaintenanceTicketStatusMutation } from './application/use-update-maintenance-ticket-status-mutation'
```

- [ ] **Step 6: Verification checkpoint**

Run:

```bash
npm run build
```

Expected: build exits 0.

---

### Task 4: Maintenance Routing And List Page

**Files:**

- Create: `src/modules/maintenance/presentation/maintenance-page.tsx`
- Modify: `src/app/router/route-paths.ts`
- Modify: `src/app/router/app-router.tsx`
- Modify: `src/app/layouts/app-layout.tsx`

- [ ] **Step 1: Add route paths**

Modify `src/app/router/route-paths.ts` near other dashboard paths:

```ts
dashboardMaintenance: '/dashboard/maintenance',
dashboardMaintenanceNew: '/dashboard/maintenance/new',
```

- [ ] **Step 2: Add sidebar navigation**

Modify `src/app/layouts/app-layout.tsx`:

```ts
const sidebarLinks = [
  { label: 'Dashboard', path: routePaths.dashboard },
  { label: 'Properties', path: routePaths.dashboardProperties },
  { label: 'Tenants', path: routePaths.dashboardTenants },
  { label: 'Leases', path: routePaths.dashboardLeases },
  { label: 'Invoices', path: routePaths.dashboardInvoices },
  { label: 'Payments', path: routePaths.dashboardPayments },
  { label: 'Receipts', path: routePaths.dashboardReceipts },
  { label: 'Reminders', path: routePaths.dashboardReminders },
  { label: 'Maintenance', path: routePaths.dashboardMaintenance },
]

const futureSidebarItems = ['Units']
```

- [ ] **Step 3: Add lazy routes**

Modify `src/app/router/app-router.tsx` near other lazy pages:

```ts
const MaintenancePage = lazy(() =>
  import('../../modules/maintenance/presentation/maintenance-page').then(
    (module) => ({
      default: module.MaintenancePage,
    }),
  ),
)
const CreateMaintenanceTicketPage = lazy(() =>
  import('../../modules/maintenance/presentation/create-maintenance-ticket-page').then(
    (module) => ({
      default: module.CreateMaintenanceTicketPage,
    }),
  ),
)
```

Add routes after Reminders:

```tsx
<Route
  path={routePaths.dashboardMaintenance}
  element={
    <RouteAccessGate route="dashboard">
      <MaintenancePage />
    </RouteAccessGate>
  }
/>
<Route
  path={routePaths.dashboardMaintenanceNew}
  element={
    <RouteAccessGate route="dashboard">
      <CreateMaintenanceTicketPage />
    </RouteAccessGate>
  }
/>
```

- [ ] **Step 4: Create list page helpers and component**

Create `src/modules/maintenance/presentation/maintenance-page.tsx`:

```tsx
import { useState } from 'react'
import { Link } from 'react-router-dom'

import { AppLayout } from '../../../app/layouts'
import { routePaths } from '../../../app/router/route-paths'
import { useMaintenanceTicketsQuery } from '../application/use-maintenance-tickets-query'
import { useUpdateMaintenanceTicketStatusMutation } from '../application/use-update-maintenance-ticket-status-mutation'
import type {
  MaintenanceTicketListItem,
  MaintenanceTicketStatus,
} from '../domain/maintenance'

type TicketActionState = Record<string, true>

function formatDateTime(value: string | null) {
  if (value === null) {
    return 'Not set'
  }

  return new Intl.DateTimeFormat('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value))
}

function formatCurrency(value: number | null) {
  if (value === null) {
    return 'Not set'
  }

  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(value)
}

function formatLabel(value: string) {
  return value.replaceAll('_', ' ')
}

function getStatusDate(ticket: MaintenanceTicketListItem) {
  if (ticket.status === 'resolved') {
    return `Resolved ${formatDateTime(ticket.resolved_at)}`
  }

  if (ticket.status === 'cancelled') {
    return `Cancelled ${formatDateTime(ticket.cancelled_at)}`
  }

  return `Reported ${formatDateTime(ticket.reported_at)}`
}

export function MaintenancePage() {
  const ticketsQuery = useMaintenanceTicketsQuery()
  const updateStatusMutation = useUpdateMaintenanceTicketStatusMutation()
  const [updatingTicketIds, setUpdatingTicketIds] = useState<TicketActionState>(
    {},
  )
  const [updateErrorTicketIds, setUpdateErrorTicketIds] =
    useState<TicketActionState>({})

  async function handleUpdateStatus(
    ticket: MaintenanceTicketListItem,
    status: MaintenanceTicketStatus,
  ) {
    if (updatingTicketIds[ticket.id] === true || ticket.status === status) {
      return
    }

    setUpdatingTicketIds((current) => ({ ...current, [ticket.id]: true }))
    setUpdateErrorTicketIds((current) => {
      const next = { ...current }
      delete next[ticket.id]
      return next
    })

    try {
      await updateStatusMutation.mutateAsync({
        ticket_id: ticket.id,
        status,
      })
    } catch {
      setUpdateErrorTicketIds((current) => ({
        ...current,
        [ticket.id]: true,
      }))
    } finally {
      setUpdatingTicketIds((current) => {
        const next = { ...current }
        delete next[ticket.id]
        return next
      })
    }
  }

  return (
    <AppLayout>
      <section className="maintenance-page" aria-labelledby="maintenance-title">
        <div className="maintenance-page__header">
          <div>
            <h2 id="maintenance-title">Maintenance</h2>
            <p>
              Track property and unit repair issues with simple cost context.
            </p>
          </div>
          <Link to={routePaths.dashboardMaintenanceNew}>Add ticket</Link>
        </div>

        {ticketsQuery.isLoading ? (
          <p className="maintenance-page__status">Loading tickets...</p>
        ) : null}

        {ticketsQuery.isError ? (
          <p className="maintenance-page__error" role="alert">
            We could not load maintenance tickets right now. Please try again
            later.
          </p>
        ) : null}

        {ticketsQuery.isSuccess && ticketsQuery.data.length === 0 ? (
          <div className="maintenance-page__empty">
            <h3>No maintenance tickets</h3>
            <p>
              Record the first property or unit issue to start tracking
              follow-up.
            </p>
            <Link to={routePaths.dashboardMaintenanceNew}>Add ticket</Link>
          </div>
        ) : null}

        {ticketsQuery.isSuccess && ticketsQuery.data.length > 0 ? (
          <div
            className="maintenance-page__list"
            aria-label="Maintenance tickets"
          >
            {ticketsQuery.data.map((ticket) => {
              const isUpdating = updatingTicketIds[ticket.id] === true
              const hasUpdateError = updateErrorTicketIds[ticket.id] === true

              return (
                <article className="maintenance-card" key={ticket.id}>
                  <div className="maintenance-card__header">
                    <div>
                      <h3>{ticket.title}</h3>
                      <p>
                        {ticket.property_name}
                        {ticket.unit_name === null
                          ? ''
                          : ` - ${ticket.unit_name}`}
                      </p>
                    </div>
                    <span className="maintenance-card__status">
                      {formatLabel(ticket.status)}
                    </span>
                  </div>

                  <dl className="maintenance-card__details">
                    <div>
                      <dt>Priority</dt>
                      <dd>{formatLabel(ticket.priority)}</dd>
                    </div>
                    <div>
                      <dt>Status date</dt>
                      <dd>{getStatusDate(ticket)}</dd>
                    </div>
                    <div>
                      <dt>Estimated cost</dt>
                      <dd>{formatCurrency(ticket.estimated_cost)}</dd>
                    </div>
                    <div>
                      <dt>Actual cost</dt>
                      <dd>{formatCurrency(ticket.actual_cost)}</dd>
                    </div>
                  </dl>

                  {ticket.description !== null ? (
                    <p className="maintenance-card__description">
                      {ticket.description}
                    </p>
                  ) : null}

                  {hasUpdateError ? (
                    <p className="maintenance-card__error" role="alert">
                      We could not update this ticket. Please try again.
                    </p>
                  ) : null}

                  <div className="maintenance-card__actions">
                    {(
                      ['open', 'in_progress', 'resolved', 'cancelled'] as const
                    ).map((status) => (
                      <button
                        type="button"
                        key={status}
                        disabled={isUpdating || ticket.status === status}
                        onClick={() => {
                          void handleUpdateStatus(ticket, status)
                        }}
                      >
                        Mark {formatLabel(status)}
                      </button>
                    ))}
                  </div>
                </article>
              )
            })}
          </div>
        ) : null}
      </section>
    </AppLayout>
  )
}
```

- [ ] **Step 5: Verification checkpoint**

Run:

```bash
npm run build
```

Expected: build exits 0. If Prettier changes wrapping, run `npx prettier --write src/modules/maintenance/presentation/maintenance-page.tsx`.

---

### Task 5: Create Maintenance Ticket Page

**Files:**

- Create: `src/modules/maintenance/presentation/create-maintenance-ticket-page.tsx`

- [ ] **Step 1: Create form page component**

Create `src/modules/maintenance/presentation/create-maintenance-ticket-page.tsx`:

```tsx
import { zodResolver } from '@hookform/resolvers/zod'
import { useMemo } from 'react'
import { useForm } from 'react-hook-form'
import { Link, useNavigate } from 'react-router-dom'

import { AppLayout } from '../../../app/layouts'
import { routePaths } from '../../../app/router/route-paths'
import { useCurrentOrganizationQuery } from '../../identity'
import { useCreateMaintenanceTicketMutation } from '../application/use-create-maintenance-ticket-mutation'
import { useMaintenanceFormOptionsQuery } from '../application/use-maintenance-form-options-query'
import {
  createMaintenanceTicketSchema,
  type CreateMaintenanceTicketFormValues,
} from '../domain/create-maintenance-ticket-schema'

const today = new Date().toISOString().slice(0, 10)

export function CreateMaintenanceTicketPage() {
  const navigate = useNavigate()
  const currentOrganizationQuery = useCurrentOrganizationQuery()
  const formOptionsQuery = useMaintenanceFormOptionsQuery()
  const createTicketMutation = useCreateMaintenanceTicketMutation()
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<CreateMaintenanceTicketFormValues>({
    resolver: zodResolver(createMaintenanceTicketSchema),
    defaultValues: {
      property_id: '',
      unit_id: '',
      title: '',
      description: '',
      priority: 'medium',
      reported_at: today,
      estimated_cost: '',
      actual_cost: '',
    },
  })

  const selectedPropertyId = watch('property_id')
  const properties = formOptionsQuery.data?.properties ?? []
  const units = formOptionsQuery.data?.units ?? []
  const filteredUnits = useMemo(
    () => units.filter((unit) => unit.property_id === selectedPropertyId),
    [selectedPropertyId, units],
  )

  async function onSubmit(values: CreateMaintenanceTicketFormValues) {
    const parsed = createMaintenanceTicketSchema.parse(values)
    const organization = currentOrganizationQuery.data

    if (organization === undefined) {
      return
    }

    await createTicketMutation.mutateAsync({
      organization_id: organization.id,
      property_id: parsed.property_id,
      unit_id: parsed.unit_id,
      title: parsed.title,
      description: parsed.description,
      priority: parsed.priority,
      reported_at: new Date(parsed.reported_at).toISOString(),
      estimated_cost: parsed.estimated_cost,
      actual_cost: parsed.actual_cost,
    })

    navigate(routePaths.dashboardMaintenance)
  }

  return (
    <AppLayout>
      <section
        className="create-maintenance-page"
        aria-labelledby="create-maintenance-title"
      >
        <div className="create-maintenance-page__header">
          <div>
            <h2 id="create-maintenance-title">Add maintenance ticket</h2>
            <p>Record a property or unit issue with simple cost context.</p>
          </div>
          <Link to={routePaths.dashboardMaintenance}>Back to maintenance</Link>
        </div>

        {formOptionsQuery.isLoading || currentOrganizationQuery.isLoading ? (
          <p className="create-maintenance-page__status">Loading options...</p>
        ) : null}

        {formOptionsQuery.isError || currentOrganizationQuery.isError ? (
          <p className="create-maintenance-page__error" role="alert">
            We could not load the form options right now. Please try again
            later.
          </p>
        ) : null}

        {formOptionsQuery.isSuccess && properties.length === 0 ? (
          <div className="create-maintenance-page__empty">
            <h3>No properties yet</h3>
            <p>Create a property before adding maintenance tickets.</p>
            <Link to={routePaths.dashboardPropertiesNew}>Add property</Link>
          </div>
        ) : null}

        {formOptionsQuery.isSuccess &&
        currentOrganizationQuery.isSuccess &&
        properties.length > 0 ? (
          <form
            className="maintenance-form"
            onSubmit={(event) => {
              void handleSubmit(onSubmit)(event)
            }}
          >
            <div className="maintenance-form__field">
              <label htmlFor="property_id">Property</label>
              <select id="property_id" {...register('property_id')}>
                <option value="">Select property</option>
                {properties.map((property) => (
                  <option key={property.id} value={property.id}>
                    {property.name}
                  </option>
                ))}
              </select>
              {errors.property_id ? <p>{errors.property_id.message}</p> : null}
            </div>

            <div className="maintenance-form__field">
              <label htmlFor="unit_id">Unit</label>
              <select id="unit_id" {...register('unit_id')}>
                <option value="">No unit / property-level issue</option>
                {filteredUnits.map((unit) => (
                  <option key={unit.id} value={unit.id}>
                    {unit.name}
                  </option>
                ))}
              </select>
              {errors.unit_id ? <p>{errors.unit_id.message}</p> : null}
            </div>

            <div className="maintenance-form__field">
              <label htmlFor="title">Title</label>
              <input id="title" type="text" {...register('title')} />
              {errors.title ? <p>{errors.title.message}</p> : null}
            </div>

            <div className="maintenance-form__field">
              <label htmlFor="description">Description</label>
              <textarea
                id="description"
                rows={4}
                {...register('description')}
              />
              {errors.description ? <p>{errors.description.message}</p> : null}
            </div>

            <div className="maintenance-form__grid">
              <div className="maintenance-form__field">
                <label htmlFor="priority">Priority</label>
                <select id="priority" {...register('priority')}>
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>
                {errors.priority ? <p>{errors.priority.message}</p> : null}
              </div>

              <div className="maintenance-form__field">
                <label htmlFor="reported_at">Reported date</label>
                <input
                  id="reported_at"
                  type="date"
                  {...register('reported_at')}
                />
                {errors.reported_at ? (
                  <p>{errors.reported_at.message}</p>
                ) : null}
              </div>

              <div className="maintenance-form__field">
                <label htmlFor="estimated_cost">Estimated cost</label>
                <input
                  id="estimated_cost"
                  inputMode="numeric"
                  type="text"
                  {...register('estimated_cost')}
                />
                {errors.estimated_cost ? (
                  <p>{errors.estimated_cost.message}</p>
                ) : null}
              </div>

              <div className="maintenance-form__field">
                <label htmlFor="actual_cost">Actual cost</label>
                <input
                  id="actual_cost"
                  inputMode="numeric"
                  type="text"
                  {...register('actual_cost')}
                />
                {errors.actual_cost ? (
                  <p>{errors.actual_cost.message}</p>
                ) : null}
              </div>
            </div>

            {createTicketMutation.isError ? (
              <p className="create-maintenance-page__error" role="alert">
                We could not create this ticket. Please try again.
              </p>
            ) : null}

            <div className="maintenance-form__actions">
              <Link to={routePaths.dashboardMaintenance}>Cancel</Link>
              <button type="submit" disabled={createTicketMutation.isPending}>
                {createTicketMutation.isPending
                  ? 'Creating...'
                  : 'Create ticket'}
              </button>
            </div>
          </form>
        ) : null}
      </section>
    </AppLayout>
  )
}
```

- [ ] **Step 2: Verification checkpoint**

Run:

```bash
npm run build
```

Expected: build exits 0. If needed, run Prettier on the new page.

---

### Task 6: Maintenance Styling

**Files:**

- Modify: `src/App.css`

- [ ] **Step 1: Add Maintenance page styles**

Append compact operational styles near the other module page styles in `src/App.css`:

```css
.maintenance-page,
.create-maintenance-page {
  display: grid;
  gap: 24px;
  max-width: 960px;
}

.maintenance-page__header,
.create-maintenance-page__header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
}

.maintenance-page__header h2,
.create-maintenance-page__header h2,
.maintenance-page__empty h3,
.create-maintenance-page__empty h3,
.maintenance-card h3 {
  margin: 0 0 8px;
  color: var(--text-h);
}

.maintenance-page__header p,
.create-maintenance-page__header p,
.maintenance-page__status,
.create-maintenance-page__status {
  margin: 0;
  color: var(--text);
}

.maintenance-page__header a,
.create-maintenance-page__header a,
.maintenance-page__empty a,
.create-maintenance-page__empty a,
.maintenance-form__actions a,
.maintenance-form__actions button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  min-height: 40px;
  padding: 10px 14px;
  font-weight: 700;
  text-decoration: none;
}

.maintenance-page__header a,
.maintenance-page__empty a,
.create-maintenance-page__empty a,
.maintenance-form__actions button {
  border: 0;
  color: #ffffff;
  background: var(--text-h);
}

.create-maintenance-page__header a,
.maintenance-form__actions a {
  border: 1px solid var(--border);
  color: var(--text-h);
  background: #ffffff;
}

.maintenance-page__error,
.create-maintenance-page__error,
.maintenance-card__error {
  border: 1px solid #fecdca;
  border-radius: 8px;
  padding: 12px;
  color: #b42318;
  background: #fffbfa;
}

.maintenance-page__empty,
.create-maintenance-page__empty,
.maintenance-card,
.maintenance-form {
  border: 1px solid var(--border);
  border-radius: 12px;
  background: var(--surface);
}

.maintenance-page__empty,
.create-maintenance-page__empty {
  display: grid;
  gap: 12px;
  padding: 24px;
}

.maintenance-page__list {
  display: grid;
  gap: 12px;
}

.maintenance-card,
.maintenance-form {
  display: grid;
  gap: 16px;
  padding: 20px;
}

.maintenance-card {
  border-left: 4px solid #475569;
}

.maintenance-card__header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
}

.maintenance-card__header p {
  margin: 0;
  color: var(--text);
}

.maintenance-card__status {
  flex: 0 0 auto;
  border: 1px solid #cbd5e1;
  border-radius: 999px;
  padding: 4px 10px;
  color: var(--text-h);
  background: #f8fafc;
  font-size: 13px;
  font-weight: 800;
  text-transform: capitalize;
  white-space: nowrap;
}

.maintenance-card__details,
.maintenance-form__grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
}

.maintenance-card__details {
  margin: 0;
}

.maintenance-card__details dt,
.maintenance-form__field label {
  color: var(--text-h);
  font-size: 13px;
  font-weight: 800;
}

.maintenance-card__details dd {
  margin: 0;
  color: var(--text);
  overflow-wrap: anywhere;
}

.maintenance-card__description {
  margin: 0;
  border-top: 1px solid var(--border);
  padding-top: 14px;
  color: var(--text);
  line-height: 1.55;
}

.maintenance-card__actions,
.maintenance-form__actions {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  border-top: 1px solid var(--border);
  padding-top: 16px;
}

.maintenance-card__actions button {
  border: 1px solid var(--border);
  border-radius: 8px;
  min-height: 40px;
  padding: 10px 14px;
  color: var(--text-h);
  background: #ffffff;
  font-weight: 700;
  cursor: pointer;
}

.maintenance-card__actions button:disabled,
.maintenance-form__actions button:disabled {
  cursor: not-allowed;
  opacity: 0.72;
}

.maintenance-form__field {
  display: grid;
  gap: 6px;
}

.maintenance-form__field input,
.maintenance-form__field select,
.maintenance-form__field textarea {
  width: 100%;
  border: 1px solid var(--border);
  border-radius: 8px;
  padding: 10px 12px;
  color: var(--text-h);
  background: #ffffff;
  font: inherit;
}

.maintenance-form__field p {
  margin: 0;
  color: #b42318;
  font-size: 13px;
  font-weight: 700;
}
```

Add to the existing `@media (max-width: 720px)` block:

```css
.maintenance-page__header,
.create-maintenance-page__header,
.maintenance-card__header {
  display: grid;
}

.maintenance-card__details,
.maintenance-form__grid {
  grid-template-columns: 1fr;
}

.maintenance-page__header a,
.create-maintenance-page__header a,
.maintenance-page__empty a,
.create-maintenance-page__empty a,
.maintenance-card__actions button,
.maintenance-form__actions a,
.maintenance-form__actions button {
  width: 100%;
}
```

- [ ] **Step 2: Verification checkpoint**

Run:

```bash
npm run format:check
npm run build
npm run lint
```

Expected: all commands exit 0.

---

### Task 7: Checklist, Wiki, Final Verification, And Commit

**Files:**

- Create: `docs/25-maintenance-validation-checklist.md`
- Modify: `wiki/03-domain/maintenance.md`
- Modify: `wiki/09-status/built.md`
- Modify: `wiki/09-status/not-built.md`
- Modify: `wiki/06-task-breakdown/ready-soon.md`
- Modify: `wiki/06-task-breakdown/backlog.md`
- Modify: `wiki/04-roadmap/release-plan.md`
- Modify: `wiki/06-task-breakdown/task-index.md`

- [ ] **Step 1: Add validation checklist**

Create `docs/25-maintenance-validation-checklist.md`:

```md
# Maintenance Validation Checklist

Status: ready for manual validation after the Maintenance MVP implementation.

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
- one property with at least one unit

## Page And Navigation

- [ ] Sidebar shows `Maintenance`.
- [ ] `/dashboard/maintenance` loads.
- [ ] Empty state has an `Add ticket` action.
- [ ] `/dashboard/maintenance/new` loads.

## Create Ticket

- [ ] Property options load.
- [ ] Unit options filter after selecting a property.
- [ ] Ticket can be created with property only.
- [ ] Ticket can be created with property and unit.
- [ ] Title is required.
- [ ] Reported date is required.
- [ ] Negative estimated cost is rejected.
- [ ] Negative actual cost is rejected.
- [ ] Empty estimated and actual costs are accepted.
- [ ] Created ticket appears on the maintenance list.

## Status Actions

- [ ] Mark open works and clears resolved/cancelled date.
- [ ] Mark in progress works and clears resolved/cancelled date.
- [ ] Mark resolved works and shows resolved date.
- [ ] Mark cancelled works and shows cancelled date.

## Scope Checks

- [ ] No vendor management was introduced.
- [ ] No work-order assignment was introduced.
- [ ] No comments or activity timeline was introduced.
- [ ] No file/photo attachment workflow was introduced.
- [ ] No recurring maintenance workflow was introduced.
- [ ] No payment linkage was introduced.
- [ ] No cost ledger or multiple cost entries were introduced.
- [ ] No dashboard maintenance metrics were introduced.
```

- [ ] **Step 2: Update Maintenance domain wiki**

Update `wiki/03-domain/maintenance.md` to say:

```md
# Maintenance

Maintenance helps owners track property and unit repair issues.

## Current status

Maintenance status: MVP baseline implementation complete; manual validation pending.

## Built

- Maintenance list page
- Create maintenance ticket flow
- property-level tickets
- optional unit-level tickets
- priority tracking
- status tracking for open, in progress, resolved, and cancelled
- reported, resolved, and cancelled date handling
- ticket-level estimated cost
- ticket-level actual cost
- Maintenance validation checklist

## Deferred

- vendor management
- work orders
- comments/activity timeline
- attachments/photos
- recurring maintenance
- payment linkage
- cost ledger or multiple cost entries
- dashboard maintenance metrics

## Related pages

- [[properties]]
- [[units]]
```

- [ ] **Step 3: Update status and roadmap docs**

Apply these content changes:

- `wiki/09-status/built.md`: add `## Maintenance` with built/deferred lists matching the domain wiki.
- `wiki/09-status/not-built.md`: change Maintenance to “MVP baseline implementation complete; advanced Maintenance work is deferred and manual validation is pending” and list only deferred advanced work.
- `wiki/06-task-breakdown/ready-soon.md`: move Maintenance MVP out of candidate status and make Reporting/Dashboard metrics the next likely candidate after manual validation.
- `wiki/06-task-breakdown/backlog.md`: remove “Plan Maintenance module”, “Read-only Maintenance list”, and “Create Maintenance ticket” if present; keep advanced Maintenance items.
- `wiki/04-roadmap/release-plan.md`: add Maintenance to built baseline and set basic Reporting/Dashboard metrics as the next recommended module after validation.
- `wiki/06-task-breakdown/task-index.md`: move Maintenance planning/build/checklist into completed candidates; keep Reporting/Dashboard metrics in ready soon.

- [ ] **Step 4: Final verification**

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
git add supabase/migrations/20260601000000_add_maintenance_ticket_costs.sql docs/25-maintenance-validation-checklist.md src/App.css src/app/layouts/app-layout.tsx src/app/router/app-router.tsx src/app/router/route-paths.ts src/modules/maintenance wiki/03-domain/maintenance.md wiki/09-status/built.md wiki/09-status/not-built.md wiki/06-task-breakdown/ready-soon.md wiki/06-task-breakdown/backlog.md wiki/04-roadmap/release-plan.md wiki/06-task-breakdown/task-index.md
git commit -m "feat: add maintenance mvp"
```

Expected: one focused commit containing the Maintenance MVP implementation, cost migration, and docs.

---

## Self-Review

Spec coverage:

- Navigation and routes are covered in Tasks 4 and 5.
- Cost migration is covered in Task 1.
- Domain/schema/repository responsibilities are covered in Task 2.
- Query and mutation hooks are covered in Task 3.
- List page, empty state, ticket cards, costs, and status actions are covered in Task 4.
- Create ticket page, property/unit filtering, validation, and defaults are covered in Task 5.
- Styling is covered in Task 6.
- Validation checklist and wiki/status updates are covered in Task 7.
- Deferred vendor/work-order/comments/attachments/recurring/payment/cost-ledger/dashboard-metrics scope is recorded in Task 7.

Placeholder scan:

- No TBD/TODO placeholders.
- Commands and expected outcomes are explicit.
- No automated test files are referenced because the repository has no configured test runner.

Type consistency:

- `MaintenanceTicketStatus`, `MaintenanceTicketPriority`, `MaintenanceTicket`, `MaintenanceTicketListItem`, `MaintenanceFormOptions`, `CreateMaintenanceTicketInput`, and `UpdateMaintenanceTicketStatusInput` are defined before use.
- Create form schema output aligns with the repository input after the page adds `organization_id`.
- Status update names match existing database status values: `open`, `in_progress`, `resolved`, `cancelled`.
