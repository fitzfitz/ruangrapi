# Leases MVP Baseline Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the Leases MVP baseline so an authenticated, onboarded rental owner can view and create organization-scoped lease records connecting one Tenant to one Unit.

**Architecture:** Add a `src/modules/leases/` domain module that follows the existing Properties, Units, and Tenants module patterns. Keep Leases limited to basic lease record management; occupancy sync, lifecycle actions, and billing generation remain deferred. Use existing Supabase RLS, React Router, TanStack Query, React Hook Form, and Zod.

**Tech Stack:** React, TypeScript, Vite, React Router, TanStack Query, React Hook Form, Zod, Supabase.

---

## Source Documents

Read these before executing Task 1:

- `docs/superpowers/specs/2026-05-30-leases-mvp-baseline-design.md`
- `README.md`
- `AGENTS.md`
- `HERMES.md`
- `docs/01-mvp-scope.md`
- `docs/03-architecture.md`
- `docs/04-data-model-draft.md`
- `docs/06-development-checklist.md`
- `docs/07-rls-strategy.md`
- `wiki/03-domain/leases.md`
- `wiki/04-roadmap/mvp-epics.md`
- `wiki/04-roadmap/release-plan.md`
- `wiki/06-task-breakdown/task-index.md`

## File Map

Create during implementation:

- `docs/17-leases-module-plan.md`: planning record for the Leases module.
- `docs/18-leases-validation-checklist.md`: manual validation checklist and closeout notes for Leases.
- `src/modules/leases/domain/lease.ts`: Lease types and list row types.
- `src/modules/leases/domain/create-lease-schema.ts`: create Lease form schema and inferred types.
- `src/modules/leases/infrastructure/leases-repository.ts`: Supabase reads and writes for leases plus option queries.
- `src/modules/leases/application/use-leases-query.ts`: list query hook.
- `src/modules/leases/application/use-lease-form-options-query.ts`: create form Tenant/Unit option query hook.
- `src/modules/leases/application/use-create-lease-mutation.ts`: create mutation hook.
- `src/modules/leases/presentation/leases-page.tsx`: read-only leases list with loading/error/empty states.
- `src/modules/leases/presentation/create-lease-page.tsx`: create lease page.
- `src/modules/leases/index.ts`: public exports for routing and future module consumers.

Modify during implementation:

- `src/app/layouts/app-layout.tsx`: promote Leases from coming soon to primary navigation.
- `src/app/router/route-paths.ts`: add Leases route constants in the slices that use them.
- `src/app/router/app-router.tsx`: register Leases routes behind the existing dashboard gate.
- `src/App.css`: add Leases page/form classes using existing conventions.
- `docs/06-development-checklist.md`: add Leases module status and validation references.
- `wiki/04-roadmap/mvp-epics.md`: mark Leases built at closeout.
- `wiki/04-roadmap/release-plan.md`: promote Billing / Invoices planning as the next step.
- `wiki/06-task-breakdown/task-index.md`: mark Leases complete and promote Billing planning.
- `wiki/06-task-breakdown/ready-soon.md`: replace Leases ready-soon candidates with Billing planning.
- `wiki/06-task-breakdown/backlog.md`: remove completed Leases baseline items and keep deferred Leases lifecycle work.
- `wiki/09-status/built.md`: add Leases baseline.
- `wiki/09-status/not-built.md`: remove Leases baseline items after closeout.
- `wiki/00-home.md`, `wiki/03-domain/leases.md`, and decision pages if needed to avoid stale wiki status.

## Global Decisions

- Use the existing `leases` table. Do not create a migration.
- Do not add a lease detail route in this epic.
- Do not add lease edit, end, cancel, delete, archive, occupancy sync, invoice generation, payment, receipt, reminder, maintenance, or document behavior.
- Add `dashboardLeases` route path in the read-only list slice.
- Add `dashboardLeasesNew` route path only in the create flow slice.
- After create success, navigate to `/dashboard/leases`.
- Use organization-scoped Tenant and Unit option queries to avoid invalid cross-organization selections in normal UI.
- Leave `status` to the database default `active` when creating a lease.
- Store money fields as whole-rupiah integer amounts.
- Run `npm run lint`, `npm run build`, and `git diff --check` before each implementation commit.

---

### Task 1: Document Leases Module Plan

**Files:**

- Create: `docs/17-leases-module-plan.md`

- [ ] **Step 1: Create the planning document**

Create `docs/17-leases-module-plan.md`:

````markdown
# Leases Module Plan

## Status

Status: approved for sliced implementation.

This document plans the Leases MVP baseline. It does not implement source code, create migrations, alter RLS policies, synchronize Unit occupancy, or introduce billing behavior.

## Purpose

Leases connect one Tenant to one Unit for a rental period with basic lease terms. Leases are the future source for occupancy, rent terms, and invoice generation, but this baseline only supports viewing and creating lease records.

## Approved Scope

The Leases MVP baseline includes:

- Top-level Leases navigation.
- `/dashboard/leases` read-only list.
- `/dashboard/leases/new` create flow.
- Lease type and create validation schema.
- Repository functions, query hooks, and mutation hooks.
- Tenant and Unit option loading for the create form.
- Manual validation checklist.
- Closeout documentation and wiki updates.

## Existing Schema

The existing `leases` table has:

- `id`
- `organization_id`
- `tenant_id`
- `unit_id`
- `start_date`
- `end_date`
- `monthly_rent_amount`
- `billing_day`
- `deposit_amount`
- `status`
- `cancelled_at`
- `created_at`
- `updated_at`

No migration is expected for this module.

## Validation Rules

- `tenant_id` is required.
- `unit_id` is required.
- `start_date` is required.
- `end_date` is optional.
- `end_date` cannot be before `start_date` when present.
- `monthly_rent_amount` is required and must be a whole number greater than or equal to zero.
- `billing_day` is required and must be an integer from 1 through 31.
- `deposit_amount` is optional and must be a whole number greater than or equal to zero when present.

## Routes

- `/dashboard/leases`
- `/dashboard/leases/new`

All routes use the existing dashboard `RouteAccessGate`.

## Module Shape

```txt
src/modules/leases/
  application/
  domain/
  infrastructure/
  presentation/
  index.ts
```
````

## Query and Mutation Strategy

- List query key: `['leases']`.
- Form options query key: `['leases', 'form-options']`.
- Create mutation invalidates `['leases']`.
- Supabase RLS remains the organization boundary.
- Tenant and Unit choices come from organization-scoped queries.

## Deferred Work

The Leases module does not include:

- Lease edit flow.
- Ending leases.
- Cancelling leases.
- Lease delete/archive.
- Unit occupancy or status synchronization.
- Invoice generation.
- Billing, payment, receipt, reminder, maintenance, or reporting behavior.
- Deposit ledger or accounting workflows.
- Contract files, PDFs, or document uploads.
- Schema or RLS migrations.

## Next Module

After Leases closeout, the next recommended epic is Billing / Invoices MVP Baseline, starting with Billing module planning and a read-only Invoices list.

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
git add docs/17-leases-module-plan.md
git commit -m "Document Leases module plan"
```

Expected: one commit containing only `docs/17-leases-module-plan.md`.

---

### Task 2: Add Read-Only Leases List

**Files:**

- Create: `src/modules/leases/domain/lease.ts`
- Create: `src/modules/leases/infrastructure/leases-repository.ts`
- Create: `src/modules/leases/application/use-leases-query.ts`
- Create: `src/modules/leases/presentation/leases-page.tsx`
- Create: `src/modules/leases/index.ts`
- Modify: `src/app/router/route-paths.ts`
- Modify: `src/app/router/app-router.tsx`
- Modify: `src/app/layouts/app-layout.tsx`
- Modify: `src/App.css`

- [ ] **Step 1: Add Lease domain types**

Create `src/modules/leases/domain/lease.ts`:

```ts
export type LeaseStatus = 'active' | 'ended' | 'cancelled'

export type Lease = {
  id: string
  organization_id: string
  tenant_id: string
  unit_id: string
  start_date: string
  end_date: string | null
  monthly_rent_amount: number
  billing_day: number
  deposit_amount: number | null
  status: LeaseStatus
  cancelled_at: string | null
  created_at: string
  updated_at: string
}

export type LeaseListItem = Lease & {
  tenant_name: string
  unit_name: string
  property_name: string | null
}
```

- [ ] **Step 2: Add Leases repository list query**

Create `src/modules/leases/infrastructure/leases-repository.ts`:

```ts
import { supabaseClient } from '../../../shared/lib'
import type { LeaseListItem, LeaseStatus } from '../domain/lease'

export const leasesQueryKey = ['leases'] as const

const leaseListSelectColumns = `
  id,
  organization_id,
  tenant_id,
  unit_id,
  start_date,
  end_date,
  monthly_rent_amount,
  billing_day,
  deposit_amount,
  status,
  cancelled_at,
  created_at,
  updated_at,
  tenants (
    full_name
  ),
  units (
    name,
    properties (
      name
    )
  )
`

type LeaseListRow = {
  id: string
  organization_id: string
  tenant_id: string
  unit_id: string
  start_date: string
  end_date: string | null
  monthly_rent_amount: number
  billing_day: number
  deposit_amount: number | null
  status: LeaseStatus
  cancelled_at: string | null
  created_at: string
  updated_at: string
  tenants: { full_name: string } | null
  units: { name: string; properties: { name: string } | null } | null
}

function mapLeaseListRow(row: LeaseListRow): LeaseListItem {
  return {
    id: row.id,
    organization_id: row.organization_id,
    tenant_id: row.tenant_id,
    unit_id: row.unit_id,
    start_date: row.start_date,
    end_date: row.end_date,
    monthly_rent_amount: row.monthly_rent_amount,
    billing_day: row.billing_day,
    deposit_amount: row.deposit_amount,
    status: row.status,
    cancelled_at: row.cancelled_at,
    created_at: row.created_at,
    updated_at: row.updated_at,
    tenant_name: row.tenants?.full_name ?? 'Unknown tenant',
    unit_name: row.units?.name ?? 'Unknown unit',
    property_name: row.units?.properties?.name ?? null,
  }
}

export async function listLeases(): Promise<LeaseListItem[]> {
  const { data, error } = await supabaseClient
    .from('leases')
    .select(leaseListSelectColumns)
    .order('created_at', { ascending: false })
    .returns<LeaseListRow[]>()

  if (error !== null) {
    throw new Error(`Could not load leases: ${error.message}`)
  }

  return data.map(mapLeaseListRow)
}
```

- [ ] **Step 3: Add Leases list query hook**

Create `src/modules/leases/application/use-leases-query.ts`:

```ts
import { useQuery } from '@tanstack/react-query'

import { leasesQueryKey, listLeases } from '../infrastructure/leases-repository'

export function useLeasesQuery() {
  return useQuery({
    queryKey: leasesQueryKey,
    queryFn: listLeases,
  })
}
```

- [ ] **Step 4: Add Leases list page**

Create `src/modules/leases/presentation/leases-page.tsx`:

```tsx
import { AppLayout } from '../../../app/layouts'
import { useLeasesQuery } from '../application/use-leases-query'
import type { LeaseListItem } from '../domain/lease'

function formatDate(value: string | null) {
  if (value === null) {
    return 'No end date'
  }

  return new Intl.DateTimeFormat('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(new Date(value))
}

function formatCurrency(value: number | null) {
  if (value === null) {
    return 'No deposit'
  }

  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(value)
}

function formatPropertyName(lease: LeaseListItem) {
  return lease.property_name ?? 'No property name'
}

export function LeasesPage() {
  const leasesQuery = useLeasesQuery()

  return (
    <AppLayout>
      <section className="leases-page" aria-labelledby="leases-title">
        <div className="leases-page__header">
          <div>
            <h2 id="leases-title">Leases</h2>
            <p>
              View rental agreements that connect tenants to units. Creation,
              lifecycle, occupancy, and billing workflows are handled in
              separate slices.
            </p>
          </div>
        </div>

        {leasesQuery.isLoading ? (
          <p className="leases-page__status">Loading leases...</p>
        ) : null}

        {leasesQuery.isError ? (
          <p className="leases-page__error" role="alert">
            We could not load leases right now. Please try again later.
          </p>
        ) : null}

        {leasesQuery.isSuccess && leasesQuery.data.length === 0 ? (
          <div className="leases-page__empty">
            <h3>No leases yet</h3>
            <p>
              Lease records will appear here once tenants are connected to units
              in the create flow.
            </p>
          </div>
        ) : null}

        {leasesQuery.isSuccess && leasesQuery.data.length > 0 ? (
          <div className="leases-page__list" aria-label="Lease list">
            {leasesQuery.data.map((lease) => (
              <article className="lease-card" key={lease.id}>
                <div className="lease-card__header">
                  <div>
                    <h3>{lease.tenant_name}</h3>
                    <p>
                      {lease.unit_name} · {formatPropertyName(lease)}
                    </p>
                  </div>
                  <span className="lease-card__status">{lease.status}</span>
                </div>

                <dl className="lease-card__details">
                  <div>
                    <dt>Lease period</dt>
                    <dd>
                      {formatDate(lease.start_date)} -{' '}
                      {formatDate(lease.end_date)}
                    </dd>
                  </div>
                  <div>
                    <dt>Monthly rent</dt>
                    <dd>{formatCurrency(lease.monthly_rent_amount)}</dd>
                  </div>
                  <div>
                    <dt>Billing day</dt>
                    <dd>Day {lease.billing_day}</dd>
                  </div>
                  <div>
                    <dt>Deposit</dt>
                    <dd>{formatCurrency(lease.deposit_amount)}</dd>
                  </div>
                </dl>
              </article>
            ))}
          </div>
        ) : null}
      </section>
    </AppLayout>
  )
}
```

- [ ] **Step 5: Add Leases module exports**

Create `src/modules/leases/index.ts`:

```ts
export type { Lease, LeaseListItem, LeaseStatus } from './domain/lease'
export { leasesQueryKey, listLeases } from './infrastructure/leases-repository'
export { useLeasesQuery } from './application/use-leases-query'
export { LeasesPage } from './presentation/leases-page'
```

- [ ] **Step 6: Add Leases list route path**

Modify `src/app/router/route-paths.ts` and add only this Leases route constant:

```ts
dashboardLeases: '/dashboard/leases',
```

Do not add `dashboardLeasesNew` in this task.

- [ ] **Step 7: Register Leases list route**

Modify `src/app/router/app-router.tsx` to import:

```ts
import { LeasesPage } from '../../modules/leases'
```

Add this route near the other dashboard routes:

```tsx
<Route
  path={routePaths.dashboardLeases}
  element={
    <RouteAccessGate route="dashboard">
      <LeasesPage />
    </RouteAccessGate>
  }
/>
```

- [ ] **Step 8: Promote Leases navigation**

Modify `src/app/layouts/app-layout.tsx`:

```tsx
const sidebarLinks = [
  { label: 'Dashboard', path: routePaths.dashboard },
  { label: 'Properties', path: routePaths.dashboardProperties },
  { label: 'Tenants', path: routePaths.dashboardTenants },
  { label: 'Leases', path: routePaths.dashboardLeases },
]

const futureSidebarItems = ['Units', 'Billing', 'Maintenance']
```

- [ ] **Step 9: Add Leases list CSS**

Modify `src/App.css` by adding:

```css
.leases-page {
  display: grid;
  gap: 24px;
  max-width: 960px;
}

.leases-page__header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 24px;
}

.leases-page__header h2 {
  margin: 0 0 8px;
}

.leases-page__header p,
.leases-page__status,
.lease-card p {
  color: var(--text);
}

.leases-page__error {
  border: 1px solid #fecdca;
  border-radius: 12px;
  padding: 16px;
  color: #b42318;
  background: #fffbfa;
}

.leases-page__empty,
.lease-card {
  border: 1px solid var(--border);
  border-radius: 12px;
  background: var(--surface);
}

.leases-page__empty {
  padding: 24px;
}

.leases-page__empty h3,
.lease-card h3 {
  margin: 0 0 8px;
  color: var(--text-h);
}

.leases-page__list {
  display: grid;
  gap: 12px;
}

.lease-card {
  display: grid;
  gap: 16px;
  padding: 20px;
}

.lease-card__header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
}

.lease-card__header p,
.lease-card__details dd {
  overflow-wrap: anywhere;
}

.lease-card__status {
  border: 1px solid var(--border);
  border-radius: 999px;
  padding: 4px 10px;
  color: var(--text-h);
  font-size: 13px;
  font-weight: 700;
  text-transform: capitalize;
  background: #f8fafc;
}

.lease-card__details {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px;
  border-top: 1px solid var(--border);
  margin: 0;
  padding-top: 16px;
}

.lease-card__details div {
  display: grid;
  gap: 4px;
}

.lease-card__details dt {
  color: var(--text-h);
  font-size: 14px;
  font-weight: 700;
}

.lease-card__details dd {
  margin: 0;
  color: var(--text);
}
```

Add this inside the existing `@media (max-width: 720px)` block:

```css
.lease-card__details {
  grid-template-columns: 1fr;
}
```

- [ ] **Step 10: Verify read-only list**

Run:

```bash
npm run lint
npm run build
git diff --check
```

Expected all commands exit `0`.

- [ ] **Step 11: Commit Task 2**

Run:

```bash
git add src/modules/leases src/app/router/route-paths.ts src/app/router/app-router.tsx src/app/layouts/app-layout.tsx src/App.css
git commit -m "Add read-only Leases list"
```

Expected: one commit containing the Leases list, route, navigation, and styles.

---

### Task 3: Add Create Lease Flow

**Files:**

- Create: `src/modules/leases/domain/create-lease-schema.ts`
- Create: `src/modules/leases/application/use-lease-form-options-query.ts`
- Create: `src/modules/leases/application/use-create-lease-mutation.ts`
- Create: `src/modules/leases/presentation/create-lease-page.tsx`
- Modify: `src/modules/leases/infrastructure/leases-repository.ts`
- Modify: `src/modules/leases/index.ts`
- Modify: `src/modules/leases/presentation/leases-page.tsx`
- Modify: `src/app/router/route-paths.ts`
- Modify: `src/app/router/app-router.tsx`
- Modify: `src/App.css`

- [ ] **Step 1: Add create Lease schema**

Create `src/modules/leases/domain/create-lease-schema.ts`:

```ts
import { z } from 'zod'

const requiredIdField = z.string().trim().min(1, 'Selection is required.')

const requiredDateField = z.string().trim().min(1, 'Start date is required.')

const optionalDateField = z
  .string()
  .trim()
  .transform((value) => (value.length > 0 ? value : null))

const requiredNonNegativeIntegerField = (message: string) =>
  z
    .string()
    .trim()
    .min(1, message)
    .transform((value, context) => {
      const parsed = Number(value)

      if (!Number.isInteger(parsed) || parsed < 0) {
        context.addIssue({
          code: 'custom',
          message,
        })
        return z.NEVER
      }

      return parsed
    })

const optionalNonNegativeIntegerField = z
  .string()
  .trim()
  .transform((value, context) => {
    if (value.length === 0) {
      return null
    }

    const parsed = Number(value)

    if (!Number.isInteger(parsed) || parsed < 0) {
      context.addIssue({
        code: 'custom',
        message: 'Deposit must be a whole number greater than or equal to 0.',
      })
      return z.NEVER
    }

    return parsed
  })

export const createLeaseSchema = z
  .object({
    tenant_id: requiredIdField,
    unit_id: requiredIdField,
    start_date: requiredDateField,
    end_date: optionalDateField,
    monthly_rent_amount: requiredNonNegativeIntegerField(
      'Monthly rent must be a whole number greater than or equal to 0.',
    ),
    billing_day: z
      .string()
      .trim()
      .min(1, 'Billing day is required.')
      .transform((value, context) => {
        const parsed = Number(value)

        if (!Number.isInteger(parsed) || parsed < 1 || parsed > 31) {
          context.addIssue({
            code: 'custom',
            message: 'Billing day must be a whole number from 1 to 31.',
          })
          return z.NEVER
        }

        return parsed
      }),
    deposit_amount: optionalNonNegativeIntegerField,
  })
  .refine(
    (value) => value.end_date === null || value.end_date >= value.start_date,
    {
      message: 'End date cannot be before start date.',
      path: ['end_date'],
    },
  )

export type CreateLeaseInput = z.infer<typeof createLeaseSchema>
export type CreateLeaseFormValues = z.input<typeof createLeaseSchema>
```

- [ ] **Step 2: Add repository create and option queries**

Modify `src/modules/leases/infrastructure/leases-repository.ts` to import:

```ts
import type { CreateLeaseInput } from '../domain/create-lease-schema'
import type { Lease, LeaseListItem, LeaseStatus } from '../domain/lease'
```

Add these exports and types:

```ts
export const leaseFormOptionsQueryKey = [
  ...leasesQueryKey,
  'form-options',
] as const

export type LeaseTenantOption = {
  id: string
  full_name: string
}

export type LeaseUnitOption = {
  id: string
  name: string
  property_name: string | null
}

export type LeaseFormOptions = {
  tenants: LeaseTenantOption[]
  units: LeaseUnitOption[]
}

type CreateLeaseRecord = CreateLeaseInput & {
  organization_id: string
}

type LeaseUnitOptionRow = {
  id: string
  name: string
  properties: { name: string } | null
}
```

Add these functions:

```ts
export async function listLeaseFormOptions(): Promise<LeaseFormOptions> {
  const [tenantsResult, unitsResult] = await Promise.all([
    supabaseClient
      .from('tenants')
      .select('id, full_name')
      .order('full_name', { ascending: true })
      .returns<LeaseTenantOption[]>(),
    supabaseClient
      .from('units')
      .select('id, name, properties ( name )')
      .order('name', { ascending: true })
      .returns<LeaseUnitOptionRow[]>(),
  ])

  if (tenantsResult.error !== null) {
    throw new Error(
      `Could not load tenant options: ${tenantsResult.error.message}`,
    )
  }

  if (unitsResult.error !== null) {
    throw new Error(`Could not load unit options: ${unitsResult.error.message}`)
  }

  return {
    tenants: tenantsResult.data,
    units: unitsResult.data.map((unit) => ({
      id: unit.id,
      name: unit.name,
      property_name: unit.properties?.name ?? null,
    })),
  }
}

export async function createLease({
  organization_id,
  tenant_id,
  unit_id,
  start_date,
  end_date,
  monthly_rent_amount,
  billing_day,
  deposit_amount,
}: CreateLeaseRecord): Promise<Lease> {
  const { data, error } = await supabaseClient
    .from('leases')
    .insert({
      organization_id,
      tenant_id,
      unit_id,
      start_date,
      end_date,
      monthly_rent_amount,
      billing_day,
      deposit_amount,
    })
    .select(
      'id, organization_id, tenant_id, unit_id, start_date, end_date, monthly_rent_amount, billing_day, deposit_amount, status, cancelled_at, created_at, updated_at',
    )
    .single<Lease>()

  if (error !== null) {
    throw new Error(`Could not create lease: ${error.message}`)
  }

  return data
}
```

- [ ] **Step 3: Add form options query hook**

Create `src/modules/leases/application/use-lease-form-options-query.ts`:

```ts
import { useQuery } from '@tanstack/react-query'

import {
  leaseFormOptionsQueryKey,
  listLeaseFormOptions,
} from '../infrastructure/leases-repository'

export function useLeaseFormOptionsQuery() {
  return useQuery({
    queryKey: leaseFormOptionsQueryKey,
    queryFn: listLeaseFormOptions,
  })
}
```

- [ ] **Step 4: Add create mutation hook**

Create `src/modules/leases/application/use-create-lease-mutation.ts`:

```ts
import { useMutation, useQueryClient } from '@tanstack/react-query'

import type { CreateLeaseInput } from '../domain/create-lease-schema'
import {
  createLease,
  leasesQueryKey,
} from '../infrastructure/leases-repository'

type CreateLeaseMutationVariables = {
  organizationId: string
  input: CreateLeaseInput
}

export function useCreateLeaseMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ organizationId, input }: CreateLeaseMutationVariables) =>
      createLease({
        organization_id: organizationId,
        ...input,
      }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: leasesQueryKey })
    },
  })
}
```

- [ ] **Step 5: Add create route path**

Modify `src/app/router/route-paths.ts` and add:

```ts
dashboardLeasesNew: '/dashboard/leases/new',
```

- [ ] **Step 6: Add create Lease page**

Create `src/modules/leases/presentation/create-lease-page.tsx`:

```tsx
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { Link, useNavigate } from 'react-router-dom'

import { AppLayout } from '../../../app/layouts'
import { routePaths } from '../../../app/router/route-paths'
import { useCurrentProfileQuery } from '../../identity'
import { useCreateLeaseMutation } from '../application/use-create-lease-mutation'
import { useLeaseFormOptionsQuery } from '../application/use-lease-form-options-query'
import {
  createLeaseSchema,
  type CreateLeaseFormValues,
  type CreateLeaseInput,
} from '../domain/create-lease-schema'

function formatUnitOption(name: string, propertyName: string | null) {
  return propertyName ? `${name} - ${propertyName}` : name
}

export function CreateLeasePage() {
  const navigate = useNavigate()
  const currentProfileQuery = useCurrentProfileQuery()
  const formOptionsQuery = useLeaseFormOptionsQuery()
  const createLeaseMutation = useCreateLeaseMutation()
  const {
    formState: { errors },
    handleSubmit,
    register,
  } = useForm<CreateLeaseFormValues, unknown, CreateLeaseInput>({
    resolver: zodResolver(createLeaseSchema),
    defaultValues: {
      tenant_id: '',
      unit_id: '',
      start_date: '',
      end_date: '',
      monthly_rent_amount: '',
      billing_day: '',
      deposit_amount: '',
    },
  })

  const organizationId = currentProfileQuery.data?.organization_id ?? null
  const isSubmitting = createLeaseMutation.isPending
  const isLoadingOptions = formOptionsQuery.isLoading
  const tenants = formOptionsQuery.data?.tenants ?? []
  const units = formOptionsQuery.data?.units ?? []

  return (
    <AppLayout>
      <section
        className="create-lease-page"
        aria-labelledby="create-lease-title"
      >
        <div className="create-lease-page__header">
          <div>
            <h2 id="create-lease-title">Add lease</h2>
            <p>
              Connect one tenant to one unit with basic lease terms. Occupancy,
              lifecycle, and billing workflows stay outside this slice.
            </p>
          </div>
          <Link to={routePaths.dashboardLeases}>Back to leases</Link>
        </div>

        {isLoadingOptions ? (
          <p className="create-lease-page__status">Loading lease options...</p>
        ) : null}

        {formOptionsQuery.isError ? (
          <p className="create-lease-page__error" role="alert">
            We could not load tenant and unit options right now. Please try
            again later.
          </p>
        ) : null}

        {formOptionsQuery.isSuccess ? (
          <form
            className="lease-form"
            onSubmit={handleSubmit((input) => {
              if (organizationId === null) {
                return
              }

              createLeaseMutation.mutate(
                { organizationId, input },
                {
                  onSuccess: () => {
                    navigate(routePaths.dashboardLeases)
                  },
                },
              )
            })}
            noValidate
          >
            <div className="lease-form__field">
              <label htmlFor="lease-tenant">Tenant</label>
              <select
                id="lease-tenant"
                disabled={isSubmitting}
                aria-invalid={errors.tenant_id ? 'true' : 'false'}
                {...register('tenant_id')}
              >
                <option value="">Select a tenant</option>
                {tenants.map((tenant) => (
                  <option value={tenant.id} key={tenant.id}>
                    {tenant.full_name}
                  </option>
                ))}
              </select>
              {errors.tenant_id?.message ? (
                <p className="lease-form__error" role="alert">
                  {errors.tenant_id.message}
                </p>
              ) : null}
            </div>

            <div className="lease-form__field">
              <label htmlFor="lease-unit">Unit</label>
              <select
                id="lease-unit"
                disabled={isSubmitting}
                aria-invalid={errors.unit_id ? 'true' : 'false'}
                {...register('unit_id')}
              >
                <option value="">Select a unit</option>
                {units.map((unit) => (
                  <option value={unit.id} key={unit.id}>
                    {formatUnitOption(unit.name, unit.property_name)}
                  </option>
                ))}
              </select>
              {errors.unit_id?.message ? (
                <p className="lease-form__error" role="alert">
                  {errors.unit_id.message}
                </p>
              ) : null}
            </div>

            <div className="lease-form__field">
              <label htmlFor="lease-start-date">Start date</label>
              <input
                id="lease-start-date"
                type="date"
                disabled={isSubmitting}
                aria-invalid={errors.start_date ? 'true' : 'false'}
                {...register('start_date')}
              />
              {errors.start_date?.message ? (
                <p className="lease-form__error" role="alert">
                  {errors.start_date.message}
                </p>
              ) : null}
            </div>

            <div className="lease-form__field">
              <label htmlFor="lease-end-date">End date</label>
              <input
                id="lease-end-date"
                type="date"
                disabled={isSubmitting}
                aria-invalid={errors.end_date ? 'true' : 'false'}
                {...register('end_date')}
              />
              {errors.end_date?.message ? (
                <p className="lease-form__error" role="alert">
                  {errors.end_date.message}
                </p>
              ) : null}
            </div>

            <div className="lease-form__field">
              <label htmlFor="lease-monthly-rent">Monthly rent amount</label>
              <input
                id="lease-monthly-rent"
                type="number"
                min="0"
                step="1"
                inputMode="numeric"
                disabled={isSubmitting}
                aria-invalid={errors.monthly_rent_amount ? 'true' : 'false'}
                {...register('monthly_rent_amount')}
              />
              {errors.monthly_rent_amount?.message ? (
                <p className="lease-form__error" role="alert">
                  {errors.monthly_rent_amount.message}
                </p>
              ) : null}
            </div>

            <div className="lease-form__field">
              <label htmlFor="lease-billing-day">Billing day</label>
              <input
                id="lease-billing-day"
                type="number"
                min="1"
                max="31"
                step="1"
                inputMode="numeric"
                disabled={isSubmitting}
                aria-invalid={errors.billing_day ? 'true' : 'false'}
                {...register('billing_day')}
              />
              {errors.billing_day?.message ? (
                <p className="lease-form__error" role="alert">
                  {errors.billing_day.message}
                </p>
              ) : null}
            </div>

            <div className="lease-form__field">
              <label htmlFor="lease-deposit">Deposit amount</label>
              <input
                id="lease-deposit"
                type="number"
                min="0"
                step="1"
                inputMode="numeric"
                disabled={isSubmitting}
                aria-invalid={errors.deposit_amount ? 'true' : 'false'}
                {...register('deposit_amount')}
              />
              {errors.deposit_amount?.message ? (
                <p className="lease-form__error" role="alert">
                  {errors.deposit_amount.message}
                </p>
              ) : null}
            </div>

            {currentProfileQuery.isError ? (
              <p className="lease-form__error" role="alert">
                We could not confirm your organization. Please try again later.
              </p>
            ) : null}

            {createLeaseMutation.isError ? (
              <p className="lease-form__error" role="alert">
                We could not create this lease. Check whether the tenant or unit
                already has an active lease, then try again.
              </p>
            ) : null}

            <div className="lease-form__actions">
              <Link to={routePaths.dashboardLeases}>Cancel</Link>
              <button
                type="submit"
                disabled={
                  isSubmitting ||
                  currentProfileQuery.isLoading ||
                  organizationId === null
                }
              >
                {isSubmitting ? 'Creating lease...' : 'Create lease'}
              </button>
            </div>
          </form>
        ) : null}
      </section>
    </AppLayout>
  )
}
```

- [ ] **Step 7: Register create route and exports**

Modify `src/app/router/app-router.tsx` Leases import:

```ts
import { CreateLeasePage, LeasesPage } from '../../modules/leases'
```

Add:

```tsx
<Route
  path={routePaths.dashboardLeasesNew}
  element={
    <RouteAccessGate route="dashboard">
      <CreateLeasePage />
    </RouteAccessGate>
  }
/>
```

Modify `src/modules/leases/index.ts` to export the create pieces:

```ts
export type {
  CreateLeaseFormValues,
  CreateLeaseInput,
} from './domain/create-lease-schema'
export { createLeaseSchema } from './domain/create-lease-schema'
export type {
  LeaseFormOptions,
  LeaseTenantOption,
  LeaseUnitOption,
} from './infrastructure/leases-repository'
export {
  createLease,
  leaseFormOptionsQueryKey,
  listLeaseFormOptions,
} from './infrastructure/leases-repository'
export { useCreateLeaseMutation } from './application/use-create-lease-mutation'
export { useLeaseFormOptionsQuery } from './application/use-lease-form-options-query'
export { CreateLeasePage } from './presentation/create-lease-page'
```

- [ ] **Step 8: Add Add Lease link**

Modify `src/modules/leases/presentation/leases-page.tsx` to import `Link` and `routePaths`, then add:

```tsx
<Link to={routePaths.dashboardLeasesNew}>Add lease</Link>
```

inside `.leases-page__header`, mirroring Tenants.

- [ ] **Step 9: Add create form CSS**

Modify `src/App.css`:

```css
.create-lease-page {
  display: grid;
  gap: 24px;
  max-width: 720px;
}

.create-lease-page__header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 24px;
}

.create-lease-page__header h2 {
  margin: 0 0 8px;
}

.create-lease-page__header p,
.create-lease-page__status {
  color: var(--text);
}

.leases-page__header a,
.create-lease-page__header a {
  border: 1px solid var(--border);
  border-radius: 8px;
  padding: 10px 14px;
  color: var(--text-h);
  background: var(--surface);
  font-weight: 700;
  text-decoration: none;
}

.create-lease-page__error {
  border: 1px solid #fecdca;
  border-radius: 12px;
  padding: 16px;
  color: #b42318;
  background: #fffbfa;
}

.lease-form {
  display: grid;
  gap: 16px;
  border: 1px solid var(--border);
  border-radius: 12px;
  padding: 24px;
  background: var(--surface);
}

.lease-form__field {
  display: grid;
  gap: 6px;
}

.lease-form__field label {
  color: var(--text-h);
  font-size: 14px;
  font-weight: 600;
}

.lease-form__field input,
.lease-form__field select {
  width: 100%;
  border: 1px solid var(--border);
  border-radius: 8px;
  padding: 10px 12px;
  color: var(--text-h);
  background: #ffffff;
}

.lease-form__field input:disabled,
.lease-form__field select:disabled {
  color: var(--text);
  background: #f1f5f9;
}

.lease-form__error {
  color: #b42318;
  font-size: 14px;
}

.lease-form__actions {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 12px;
}

.lease-form__actions a {
  color: var(--text-h);
  font-weight: 700;
}

.lease-form__actions button {
  border: 0;
  border-radius: 8px;
  padding: 10px 14px;
  color: #ffffff;
  background: var(--text-h);
  font-weight: 700;
  cursor: pointer;
}

.lease-form__actions button:disabled {
  cursor: not-allowed;
  opacity: 0.72;
}
```

- [ ] **Step 10: Verify create flow**

Run:

```bash
npm run lint
npm run build
git diff --check
```

Expected all commands exit `0`.

- [ ] **Step 11: Commit Task 3**

Run:

```bash
git add src/modules/leases src/app/router/route-paths.ts src/app/router/app-router.tsx src/App.css
git commit -m "Add create Lease flow"
```

Expected: one commit containing the create flow.

---

### Task 4: Document Leases Validation Checklist

**Files:**

- Create: `docs/18-leases-validation-checklist.md`
- Modify: `docs/06-development-checklist.md`

- [ ] **Step 1: Create validation checklist**

Create `docs/18-leases-validation-checklist.md`:

```markdown
# Leases Validation Checklist

## Status

Status: ready for manual validation after the Leases implementation slices are complete.

## Automated Checks

- [ ] `npm run lint` passes.
- [ ] `npm run build` passes.
- [ ] `git diff --check` passes.

## Read-Only Leases List

- [ ] Authenticated and onboarded users can open `/dashboard/leases`.
- [ ] Unauthenticated users cannot access `/dashboard/leases` and are redirected through the existing auth gate.
- [ ] The sidebar Leases link navigates to `/dashboard/leases`.
- [ ] The sidebar Dashboard, Properties, and Tenants links still work.
- [ ] The Leases page shows a loading state while the leases query is pending.
- [ ] The Leases page shows an empty state when the current organization has no leases.
- [ ] The Leases page shows an error state when the leases query fails.
- [ ] The Leases page shows a populated list when the current organization has leases.
- [ ] Existing leases listed on the page belong to the current organization.
- [ ] Lease rows show tenant name.
- [ ] Lease rows show unit name.
- [ ] Lease rows show property name when available.
- [ ] Lease rows show start date.
- [ ] Lease rows handle missing end date gracefully.
- [ ] Lease rows show monthly rent amount.
- [ ] Lease rows show billing day.
- [ ] Lease rows handle missing deposit gracefully.
- [ ] Lease rows show status.
- [ ] Refreshing `/dashboard/leases` keeps the user on the protected Leases route after account state checks finish.

## Create Lease Flow

- [ ] Authenticated and onboarded users can open `/dashboard/leases/new`.
- [ ] Unauthenticated users cannot access `/dashboard/leases/new` and are redirected through the existing auth gate.
- [ ] The Leases page Add lease link navigates to `/dashboard/leases/new`.
- [ ] The Back to leases link returns to `/dashboard/leases`.
- [ ] The Cancel link returns to `/dashboard/leases`.
- [ ] Tenant options load from current organization tenant records.
- [ ] Unit options load from current organization unit records.
- [ ] Unit options include property names when available.
- [ ] Submitting without a tenant shows the tenant validation error.
- [ ] Submitting without a unit shows the unit validation error.
- [ ] Submitting without a start date shows the start-date validation error.
- [ ] End date can be left blank.
- [ ] Submitting with an end date before the start date shows the end-date validation error.
- [ ] Submitting without monthly rent shows the monthly-rent validation error.
- [ ] Monthly rent must be a whole number greater than or equal to 0.
- [ ] Billing day is required.
- [ ] Billing day must be a whole number from 1 to 31.
- [ ] Deposit can be left blank.
- [ ] Deposit must be a whole number greater than or equal to 0 when present.
- [ ] Blank deposit is stored as `null`.
- [ ] Submitting a valid lease creates one active lease.
- [ ] The created lease has the correct `organization_id` for the current onboarded user.
- [ ] After successful creation, the user is redirected to `/dashboard/leases`.
- [ ] The newly created lease appears in the Leases list after redirect.
- [ ] Creating a duplicate active lease for the same tenant or unit fails gracefully.

## Regression Checks

- [ ] Browser console has no errors during Leases list navigation, create-page load, option loading, validation failures, successful create, redirects, list refresh, duplicate active lease failure, or auth redirect checks.

## Boundaries

- [ ] No lease edit flow was introduced.
- [ ] No end lease workflow was introduced.
- [ ] No cancel lease workflow was introduced.
- [ ] No lease delete/archive workflow was introduced.
- [ ] No Unit occupancy or status synchronization was introduced.
- [ ] No invoice generation was introduced.
- [ ] No billing, payment, receipt, reminder, maintenance, or dashboard metrics were introduced.
- [ ] No deposit ledger or accounting workflow was introduced.
- [ ] No contract file, PDF, or document upload workflow was introduced.
- [ ] No tenant portal or tenant authentication was introduced.
- [ ] No schema or RLS migration was introduced.

## Deferred Work

Lease edit, end, cancel, occupancy synchronization, invoice generation, deposit ledger, and document upload workflows remain deferred. Billing / Invoices planning is the next recommended module after Leases closeout.
```

- [ ] **Step 2: Add Leases references to development checklist**

Append this section to `docs/06-development-checklist.md`:

```markdown
### Manual validation: Leases MVP baseline

Validate the committed Leases baseline manually before the owner closes out the module.

- [ ] Follow `docs/18-leases-validation-checklist.md`.
- [ ] Confirm the Leases module remains limited to basic lease records.
- [ ] Confirm Unit occupancy/status synchronization is still deferred.
- [ ] Confirm invoice generation is still deferred.
- [ ] Confirm the next recommended module is Billing / Invoices.
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
git add docs/06-development-checklist.md docs/18-leases-validation-checklist.md
git commit -m "Document Leases validation checklist"
```

Expected: one commit containing the validation checklist and development checklist reference.

---

### Task 5: Close Out Leases and Promote Billing

**Files:**

- Modify: `docs/06-development-checklist.md`
- Modify: `docs/18-leases-validation-checklist.md`
- Modify: `wiki/00-home.md`
- Modify: `wiki/03-domain/leases.md`
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
- [x] Leases MVP baseline documented and implemented as the tenant-to-unit agreement module
```

- [ ] **Step 2: Add Leases closeout note**

Append this to `docs/18-leases-validation-checklist.md` after manual validation is completed:

```markdown
## Closeout

Leases MVP baseline is complete when:

- [ ] Read-only list is validated.
- [ ] Create lease flow is validated.
- [ ] Automated checks pass.
- [ ] Deferred work is documented.
- [ ] Wiki status pages identify Billing / Invoices planning as the next step.

Deferred Leases work:

- Lease edit remains out of scope.
- End lease remains out of scope.
- Cancel lease remains out of scope.
- Unit occupancy/status synchronization remains out of scope.
- Invoice generation belongs to Billing / Invoices.
- Deposit ledger remains out of scope.
- Contract files, PDFs, and document uploads remain out of scope.
```

- [ ] **Step 3: Update wiki status and roadmap**

Update these wiki pages so they consistently say Leases is built and Billing / Invoices planning is next:

- `wiki/00-home.md`
- `wiki/03-domain/leases.md`
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
Leases status: MVP baseline complete.

Built:

- plan Leases module
- read-only Leases list
- create Lease flow
- validation checklist
- Leases module closeout

Deferred:

- lease edit
- end lease
- cancel lease
- occupancy/status synchronization
- invoice generation
- deposit ledger
- contract files and document uploads

Next recommended module: Billing / Invoices planning.
```

- [ ] **Step 4: Verify closeout docs and source**

Run:

```bash
git diff --check
npm run lint
npm run build
```

Expected all commands exit `0`.

- [ ] **Step 5: Commit Task 5**

Run:

```bash
git add docs/06-development-checklist.md docs/18-leases-validation-checklist.md wiki/00-home.md wiki/03-domain/leases.md wiki/04-roadmap/mvp-epics.md wiki/04-roadmap/release-plan.md wiki/06-task-breakdown/task-index.md wiki/06-task-breakdown/ready-soon.md wiki/06-task-breakdown/backlog.md wiki/08-decisions/decision-log.md wiki/09-status/built.md wiki/09-status/not-built.md
git commit -m "Close out Leases module"
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
- `git diff --check` exits `0`.
- `git status --short` shows no uncommitted changes except user-owned files that were already untracked or modified before execution.

## Handoff

When this plan is complete, the next recommended epic is Billing / Invoices MVP Baseline:

1. Create Billing module plan.
2. Add read-only Invoices list.
3. Add create/generate Invoice flow.
4. Close out Billing / Invoices and promote Payments.
