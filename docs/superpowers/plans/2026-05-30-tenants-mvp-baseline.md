# Tenants MVP Baseline Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the Tenants MVP baseline so an authenticated, onboarded rental owner can view, create, and edit organization-scoped tenant contact records.

**Architecture:** Add a `src/modules/tenants/` domain module that mirrors the existing Properties and Units patterns. Keep Tenants limited to renter/contact records; Leases will later connect tenants to units. Use existing Supabase RLS, current organization context, React Router routes, TanStack Query hooks, React Hook Form, and Zod schemas.

**Tech Stack:** React, TypeScript, Vite, React Router, TanStack Query, React Hook Form, Zod, Supabase.

---

## Source Documents

Read these before executing Task 1:

- `docs/superpowers/specs/2026-05-30-tenants-mvp-baseline-design.md`
- `README.md`
- `HERMES.md`
- `docs/00-product-brief.md`
- `docs/01-mvp-scope.md`
- `docs/03-architecture.md`
- `docs/06-development-checklist.md`
- `docs/07-rls-strategy.md`
- `wiki/03-domain/tenants.md`
- `wiki/04-roadmap/mvp-epics.md`
- `wiki/04-roadmap/release-plan.md`
- `wiki/06-task-breakdown/task-index.md`

## File Map

Create during implementation:

- `docs/15-tenants-module-plan.md`: planning record for the Tenants module.
- `docs/16-tenants-validation-checklist.md`: manual validation checklist and closeout notes for Tenants.
- `src/modules/tenants/domain/tenant.ts`: Tenant type matching the existing database schema.
- `src/modules/tenants/domain/tenant-form-schema.ts`: shared tenant form schema and inferred types for create/edit.
- `src/modules/tenants/infrastructure/tenants-repository.ts`: Supabase reads and writes for tenants.
- `src/modules/tenants/application/use-tenants-query.ts`: list query hook.
- `src/modules/tenants/application/use-tenant-query.ts`: detail query hook.
- `src/modules/tenants/application/use-create-tenant-mutation.ts`: create mutation hook.
- `src/modules/tenants/application/use-update-tenant-mutation.ts`: update mutation hook.
- `src/modules/tenants/presentation/tenants-page.tsx`: read-only tenants list with create/edit entry points.
- `src/modules/tenants/presentation/create-tenant-page.tsx`: create tenant page.
- `src/modules/tenants/presentation/edit-tenant-page.tsx`: edit tenant page.
- `src/modules/tenants/index.ts`: public exports for routing and future module consumers.

Modify during implementation:

- `src/app/layouts/app-layout.tsx`: promote Tenants from coming soon to primary navigation.
- `src/app/router/route-paths.ts`: add Tenants route constants.
- `src/app/router/app-router.tsx`: register Tenants routes behind the existing dashboard gate.
- `src/App.css`: add Tenants page/form classes using existing visual conventions.
- `docs/06-development-checklist.md`: add Tenants module status and validation references.
- `wiki/04-roadmap/mvp-epics.md`: mark Tenants built at closeout.
- `wiki/04-roadmap/release-plan.md`: promote Leases planning as the next step.
- `wiki/06-task-breakdown/task-index.md`: mark Tenants complete and promote Leases planning.
- `wiki/06-task-breakdown/ready-soon.md`: replace Tenants ready-soon candidates with Leases planning.
- `wiki/06-task-breakdown/backlog.md`: remove completed Tenants baseline items and keep Leases next.
- `wiki/09-status/built.md`: add Tenants baseline.
- `wiki/09-status/not-built.md`: remove Tenants baseline items after closeout.

## Global Decisions

- Use existing `tenants` table fields. Do not create a migration.
- Do not add a tenant detail route in this epic.
- After create and edit success, navigate to `/dashboard/tenants`.
- Defer phone normalization to a later refinement before Leases unless Task 1 explicitly records a clear rule and the owner approves implementing it in the Tenants baseline.
- Save optional blank form fields as `null`.
- Use `full_name` in database/repository/domain code and display it as "Full name" in UI.
- Run `npm run lint`, `npm run build`, and `git diff --check` before each implementation commit.

---

### Task 1: Document Tenants Module Plan

**Files:**

- Create: `docs/15-tenants-module-plan.md`

- [ ] **Step 1: Create the planning document**

Create `docs/15-tenants-module-plan.md` with this content:

````markdown
# Tenants Module Plan

## Status

Status: approved for sliced implementation.

This document plans the Tenants MVP baseline. It does not implement source code, create migrations, alter RLS policies, or introduce lease behavior.

## Purpose

Tenants are renter/contact records owned by an organization. A tenant can exist before a lease is created. Leases will later connect tenants to units; Tenants must not directly assign renters to units.

## Approved Scope

The Tenants MVP baseline includes:

- Top-level Tenants navigation.
- `/dashboard/tenants` read-only list.
- `/dashboard/tenants/new` create flow.
- `/dashboard/tenants/:tenantId/edit` edit flow.
- Tenant type, form schema, repository functions, query hooks, and mutation hooks.
- Manual validation checklist.
- Closeout documentation and wiki updates.

## Existing Schema

The existing `tenants` table has:

- `id`
- `organization_id`
- `full_name`
- `phone`
- `email`
- `identity_notes`
- `emergency_contact_name`
- `emergency_contact_phone`
- `notes`
- `created_at`
- `updated_at`

No migration is expected for this module.

## Validation Rules

- `full_name` is required and cannot be blank after trimming.
- `email` is optional and must be valid when present.
- `phone` is optional.
- `emergency_contact_phone` is optional.
- Optional text fields save as `null` when blank.

Phone normalization to Indonesian `+62` format is deferred. This keeps the first Tenants baseline focused and avoids creating a partial normalization rule without dedicated validation. Revisit phone normalization before Leases relies on tenant contact data for reminders or billing workflows.

## Routes

- `/dashboard/tenants`
- `/dashboard/tenants/new`
- `/dashboard/tenants/:tenantId/edit`

All routes use the existing dashboard `RouteAccessGate`.

## Module Shape

```txt
src/modules/tenants/
  application/
  domain/
  infrastructure/
  presentation/
  index.ts
```
````

## Query and Mutation Strategy

- List query key: `['tenants']`.
- Detail query key: `['tenants', tenantId]`.
- Create mutation invalidates `['tenants']`.
- Update mutation invalidates `['tenants']` and `['tenants', tenantId]`.
- Supabase RLS remains the organization boundary.

## Deferred Work

The Tenants module does not include:

- Lease assignment.
- Direct tenant-to-unit assignment.
- Occupancy status.
- Delete or archive.
- Billing, payment, receipt, reminder, or maintenance status.
- Tenant portal or tenant authentication.
- Identity number storage.
- Document uploads.
- Schema or RLS migrations.

## Next Module

After Tenants closeout, the next recommended epic is Leases MVP Baseline, starting with Leases module planning and a read-only Leases list.

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
git add docs/15-tenants-module-plan.md
git commit -m "Document Tenants module plan"
```

Expected: one commit containing only `docs/15-tenants-module-plan.md`.

---

### Task 2: Add Read-Only Tenants List

**Files:**

- Create: `src/modules/tenants/domain/tenant.ts`
- Create: `src/modules/tenants/infrastructure/tenants-repository.ts`
- Create: `src/modules/tenants/application/use-tenants-query.ts`
- Create: `src/modules/tenants/presentation/tenants-page.tsx`
- Create: `src/modules/tenants/index.ts`
- Modify: `src/app/router/route-paths.ts`
- Modify: `src/app/router/app-router.tsx`
- Modify: `src/app/layouts/app-layout.tsx`
- Modify: `src/App.css`

- [ ] **Step 1: Add Tenant domain type**

Create `src/modules/tenants/domain/tenant.ts`:

```ts
export type Tenant = {
  id: string
  organization_id: string
  full_name: string
  phone: string | null
  email: string | null
  identity_notes: string | null
  emergency_contact_name: string | null
  emergency_contact_phone: string | null
  notes: string | null
  created_at: string
  updated_at: string
}
```

- [ ] **Step 2: Add Tenants repository list query**

Create `src/modules/tenants/infrastructure/tenants-repository.ts`:

```ts
import { supabaseClient } from '../../../shared/lib'
import type { Tenant } from '../domain/tenant'

export const tenantsQueryKey = ['tenants'] as const

export function tenantQueryKey(tenantId: string) {
  return [...tenantsQueryKey, tenantId] as const
}

const tenantSelectColumns =
  'id, organization_id, full_name, phone, email, identity_notes, emergency_contact_name, emergency_contact_phone, notes, created_at, updated_at'

export async function listTenants(): Promise<Tenant[]> {
  const { data, error } = await supabaseClient
    .from('tenants')
    .select(tenantSelectColumns)
    .order('created_at', { ascending: false })
    .returns<Tenant[]>()

  if (error !== null) {
    throw new Error(`Could not load tenants: ${error.message}`)
  }

  return data
}
```

- [ ] **Step 3: Add Tenants list query hook**

Create `src/modules/tenants/application/use-tenants-query.ts`:

```ts
import { useQuery } from '@tanstack/react-query'

import {
  listTenants,
  tenantsQueryKey,
} from '../infrastructure/tenants-repository'

export function useTenantsQuery() {
  return useQuery({
    queryKey: tenantsQueryKey,
    queryFn: listTenants,
  })
}
```

- [ ] **Step 4: Add Tenants list page**

Create `src/modules/tenants/presentation/tenants-page.tsx`:

```tsx
import { AppLayout } from '../../../app/layouts'
import { useTenantsQuery } from '../application/use-tenants-query'
import type { Tenant } from '../domain/tenant'

function formatOptionalValue(value: string | null, fallback: string) {
  return value?.trim() || fallback
}

function formatTenantContact(tenant: Tenant) {
  const phone = formatOptionalValue(tenant.phone, 'No phone added')
  const email = formatOptionalValue(tenant.email, 'No email added')

  return `${phone} · ${email}`
}

export function TenantsPage() {
  const tenantsQuery = useTenantsQuery()

  return (
    <AppLayout>
      <section className="tenants-page" aria-labelledby="tenants-title">
        <div className="tenants-page__header">
          <div>
            <h2 id="tenants-title">Tenants</h2>
            <p>
              Manage renter contact records for your organization. Leases will
              connect tenants to units in a later module.
            </p>
          </div>
        </div>

        {tenantsQuery.isLoading ? (
          <p className="tenants-page__status">Loading tenants...</p>
        ) : null}

        {tenantsQuery.isError ? (
          <p className="tenants-page__error" role="alert">
            We could not load tenants right now. Please try again later.
          </p>
        ) : null}

        {tenantsQuery.isSuccess && tenantsQuery.data.length === 0 ? (
          <div className="tenants-page__empty">
            <h3>No tenants yet</h3>
            <p>
              Add renter contact records here before creating leases in a later
              module.
            </p>
          </div>
        ) : null}

        {tenantsQuery.isSuccess && tenantsQuery.data.length > 0 ? (
          <div className="tenants-page__list" aria-label="Tenant list">
            {tenantsQuery.data.map((tenant) => (
              <article className="tenant-card" key={tenant.id}>
                <div className="tenant-card__header">
                  <div>
                    <h3>{tenant.full_name}</h3>
                    <p>{formatTenantContact(tenant)}</p>
                  </div>
                </div>

                <dl className="tenant-card__details">
                  <div>
                    <dt>Emergency contact</dt>
                    <dd>
                      {formatOptionalValue(
                        tenant.emergency_contact_name,
                        'Not added',
                      )}
                    </dd>
                  </div>
                  <div>
                    <dt>Notes</dt>
                    <dd>{formatOptionalValue(tenant.notes, 'No notes.')}</dd>
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

Task 2 intentionally keeps the Tenants list read-only. Task 3 introduces
the active Add tenant link when the create route is registered, and Task 4
introduces Edit links when the edit route is registered.

- [ ] **Step 5: Add Tenants module exports**

Create `src/modules/tenants/index.ts`:

```ts
export type { Tenant } from './domain/tenant'
export {
  listTenants,
  tenantQueryKey,
  tenantsQueryKey,
} from './infrastructure/tenants-repository'
export { useTenantsQuery } from './application/use-tenants-query'
export { TenantsPage } from './presentation/tenants-page'
```

- [ ] **Step 6: Add Tenants list route path**

Modify `src/app/router/route-paths.ts` so the object includes these keys:

```ts
export const routePaths = {
  home: '/',
  auth: '/auth',
  signup: '/signup',
  onboarding: '/onboarding',
  dashboard: '/dashboard',
  dashboardProperties: '/dashboard/properties',
  dashboardPropertyDetail: '/dashboard/properties/:propertyId',
  dashboardPropertyEdit: '/dashboard/properties/:propertyId/edit',
  dashboardPropertyUnitNew: '/dashboard/properties/:propertyId/units/new',
  dashboardPropertyUnitEdit:
    '/dashboard/properties/:propertyId/units/:unitId/edit',
  dashboardPropertiesNew: '/dashboard/properties/new',
  dashboardTenants: '/dashboard/tenants',
} as const

export type RoutePath = (typeof routePaths)[keyof typeof routePaths]
```

- [ ] **Step 7: Register Tenants route**

Modify `src/app/router/app-router.tsx` imports:

```ts
import { TenantsPage } from '../../modules/tenants'
```

Add this route before property detail routes that include dynamic segments:

```tsx
<Route
  path={routePaths.dashboardTenants}
  element={
    <RouteAccessGate route="dashboard">
      <TenantsPage />
    </RouteAccessGate>
  }
/>
```

- [ ] **Step 8: Promote Tenants navigation**

Modify `src/app/layouts/app-layout.tsx`:

```tsx
const sidebarLinks = [
  { label: 'Dashboard', path: routePaths.dashboard },
  { label: 'Properties', path: routePaths.dashboardProperties },
  { label: 'Tenants', path: routePaths.dashboardTenants },
]

const futureSidebarItems = ['Units', 'Billing', 'Maintenance']
```

- [ ] **Step 9: Add Tenants CSS for list page**

Modify `src/App.css` by adding Tenants selectors alongside the existing Properties/Units selectors. Add this block near the existing page/card rules:

```css
.tenants-page {
  display: grid;
  gap: 24px;
  max-width: 880px;
}

.tenants-page__header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 24px;
}

.tenants-page__header h2 {
  margin: 0 0 8px;
}

.tenants-page__header p,
.tenants-page__status,
.tenant-card p {
  color: var(--text);
}

.tenants-page__error {
  border: 1px solid #fecdca;
  border-radius: 12px;
  padding: 16px;
  color: #b42318;
  background: #fffbfa;
}

.tenants-page__empty,
.tenant-card {
  border: 1px solid var(--border);
  border-radius: 12px;
  background: var(--surface);
}

.tenants-page__empty {
  padding: 24px;
}

.tenants-page__empty h3,
.tenant-card h3 {
  margin: 0 0 8px;
  color: var(--text-h);
}

.tenants-page__list {
  display: grid;
  gap: 12px;
}

.tenant-card {
  display: grid;
  gap: 16px;
  padding: 20px;
}

.tenant-card p,
.tenant-card__details dd {
  overflow-wrap: anywhere;
}

.tenant-card__header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
}

.tenant-card__details {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px;
  border-top: 1px solid var(--border);
  margin: 0;
  padding-top: 16px;
}

.tenant-card__details div {
  display: grid;
  gap: 4px;
}

.tenant-card__details dt {
  color: var(--text-h);
  font-size: 14px;
  font-weight: 700;
}

.tenant-card__details dd {
  margin: 0;
  color: var(--text);
}

@media (max-width: 720px) {
  .tenant-card__details {
    grid-template-columns: 1fr;
  }
}
```

- [ ] **Step 10: Verify read-only list**

Run:

```bash
npm run lint
npm run build
git diff --check
```

Expected:

- `npm run lint` exits `0`.
- `npm run build` exits `0`.
- `git diff --check` exits `0`.

- [ ] **Step 11: Commit Task 2**

Run:

```bash
git add src/modules/tenants src/app/router/route-paths.ts src/app/router/app-router.tsx src/app/layouts/app-layout.tsx src/App.css
git commit -m "Add read-only Tenants list"
```

Expected: one commit containing the Tenants list, route, navigation, and styles.

---

### Task 3: Add Create Tenant Flow

**Files:**

- Create: `src/modules/tenants/domain/tenant-form-schema.ts`
- Create: `src/modules/tenants/application/use-create-tenant-mutation.ts`
- Create: `src/modules/tenants/presentation/create-tenant-page.tsx`
- Modify: `src/modules/tenants/infrastructure/tenants-repository.ts`
- Modify: `src/modules/tenants/index.ts`
- Modify: `src/modules/tenants/presentation/tenants-page.tsx`
- Modify: `src/app/router/route-paths.ts`
- Modify: `src/app/router/app-router.tsx`
- Modify: `src/App.css`

- [ ] **Step 1: Add shared Tenant form schema**

Create `src/modules/tenants/domain/tenant-form-schema.ts`:

```ts
import { z } from 'zod'

const optionalTextField = z
  .string()
  .trim()
  .transform((value) => (value.length > 0 ? value : null))

const optionalEmailField = z
  .string()
  .trim()
  .transform((value) => (value.length > 0 ? value : null))
  .pipe(z.email('Enter a valid email address.').nullable())

export const tenantFormSchema = z.object({
  full_name: z.string().trim().min(1, 'Full name is required.'),
  phone: optionalTextField,
  email: optionalEmailField,
  identity_notes: optionalTextField,
  emergency_contact_name: optionalTextField,
  emergency_contact_phone: optionalTextField,
  notes: optionalTextField,
})

export type TenantFormInput = z.infer<typeof tenantFormSchema>
export type TenantFormValues = z.input<typeof tenantFormSchema>
```

- [ ] **Step 2: Add create repository function**

Modify `src/modules/tenants/infrastructure/tenants-repository.ts` to import the schema type:

```ts
import type { TenantFormInput } from '../domain/tenant-form-schema'
```

Add this type and function below `tenantSelectColumns`:

```ts
type CreateTenantRecord = TenantFormInput & {
  organization_id: string
}

export async function createTenant({
  organization_id,
  full_name,
  phone,
  email,
  identity_notes,
  emergency_contact_name,
  emergency_contact_phone,
  notes,
}: CreateTenantRecord): Promise<Tenant> {
  const { data, error } = await supabaseClient
    .from('tenants')
    .insert({
      organization_id,
      full_name,
      phone,
      email,
      identity_notes,
      emergency_contact_name,
      emergency_contact_phone,
      notes,
    })
    .select(tenantSelectColumns)
    .single<Tenant>()

  if (error !== null) {
    throw new Error(`Could not create tenant: ${error.message}`)
  }

  return data
}
```

- [ ] **Step 3: Add create mutation hook**

Create `src/modules/tenants/application/use-create-tenant-mutation.ts`:

```ts
import { useMutation, useQueryClient } from '@tanstack/react-query'

import type { TenantFormInput } from '../domain/tenant-form-schema'
import {
  createTenant,
  tenantsQueryKey,
} from '../infrastructure/tenants-repository'

type CreateTenantMutationVariables = {
  organizationId: string
  input: TenantFormInput
}

export function useCreateTenantMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ organizationId, input }: CreateTenantMutationVariables) =>
      createTenant({
        organization_id: organizationId,
        ...input,
      }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: tenantsQueryKey })
    },
  })
}
```

- [ ] **Step 4: Add create page**

Create `src/modules/tenants/presentation/create-tenant-page.tsx`:

```tsx
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { Link, useNavigate } from 'react-router-dom'

import { AppLayout } from '../../../app/layouts'
import { routePaths } from '../../../app/router/route-paths'
import { useCurrentProfileQuery } from '../../identity'
import { useCreateTenantMutation } from '../application/use-create-tenant-mutation'
import {
  tenantFormSchema,
  type TenantFormInput,
  type TenantFormValues,
} from '../domain/tenant-form-schema'

export function CreateTenantPage() {
  const navigate = useNavigate()
  const currentProfileQuery = useCurrentProfileQuery()
  const createTenantMutation = useCreateTenantMutation()
  const {
    formState: { errors },
    handleSubmit,
    register,
  } = useForm<TenantFormValues, unknown, TenantFormInput>({
    resolver: zodResolver(tenantFormSchema),
    defaultValues: {
      full_name: '',
      phone: '',
      email: '',
      identity_notes: '',
      emergency_contact_name: '',
      emergency_contact_phone: '',
      notes: '',
    },
  })

  const isSubmitting = createTenantMutation.isPending
  const organizationId = currentProfileQuery.data?.organization_id ?? null

  return (
    <AppLayout>
      <section
        className="create-tenant-page"
        aria-labelledby="create-tenant-title"
      >
        <div className="create-tenant-page__header">
          <div>
            <h2 id="create-tenant-title">Add tenant</h2>
            <p>
              Create a renter contact record. Unit assignment and lease
              workflows stay in the later Leases module.
            </p>
          </div>
          <Link to={routePaths.dashboardTenants}>Back to tenants</Link>
        </div>

        <form
          className="tenant-form"
          onSubmit={handleSubmit((input) => {
            if (organizationId === null) {
              return
            }

            createTenantMutation.mutate(
              { organizationId, input },
              {
                onSuccess: () => {
                  navigate(routePaths.dashboardTenants)
                },
              },
            )
          })}
          noValidate
        >
          <div className="tenant-form__field">
            <label htmlFor="tenant-full-name">Full name</label>
            <input
              id="tenant-full-name"
              type="text"
              autoComplete="name"
              disabled={isSubmitting}
              aria-invalid={errors.full_name ? 'true' : 'false'}
              {...register('full_name')}
            />
            {errors.full_name?.message ? (
              <p className="tenant-form__error" role="alert">
                {errors.full_name.message}
              </p>
            ) : null}
          </div>

          <div className="tenant-form__field">
            <label htmlFor="tenant-phone">Phone</label>
            <input
              id="tenant-phone"
              type="tel"
              autoComplete="tel"
              disabled={isSubmitting}
              aria-invalid={errors.phone ? 'true' : 'false'}
              {...register('phone')}
            />
            {errors.phone?.message ? (
              <p className="tenant-form__error" role="alert">
                {errors.phone.message}
              </p>
            ) : null}
          </div>

          <div className="tenant-form__field">
            <label htmlFor="tenant-email">Email</label>
            <input
              id="tenant-email"
              type="email"
              autoComplete="email"
              disabled={isSubmitting}
              aria-invalid={errors.email ? 'true' : 'false'}
              {...register('email')}
            />
            {errors.email?.message ? (
              <p className="tenant-form__error" role="alert">
                {errors.email.message}
              </p>
            ) : null}
          </div>

          <div className="tenant-form__field">
            <label htmlFor="tenant-identity-notes">Identity notes</label>
            <textarea
              id="tenant-identity-notes"
              rows={3}
              disabled={isSubmitting}
              aria-invalid={errors.identity_notes ? 'true' : 'false'}
              {...register('identity_notes')}
            />
            {errors.identity_notes?.message ? (
              <p className="tenant-form__error" role="alert">
                {errors.identity_notes.message}
              </p>
            ) : null}
          </div>

          <div className="tenant-form__field">
            <label htmlFor="tenant-emergency-name">
              Emergency contact name
            </label>
            <input
              id="tenant-emergency-name"
              type="text"
              autoComplete="off"
              disabled={isSubmitting}
              aria-invalid={errors.emergency_contact_name ? 'true' : 'false'}
              {...register('emergency_contact_name')}
            />
            {errors.emergency_contact_name?.message ? (
              <p className="tenant-form__error" role="alert">
                {errors.emergency_contact_name.message}
              </p>
            ) : null}
          </div>

          <div className="tenant-form__field">
            <label htmlFor="tenant-emergency-phone">
              Emergency contact phone
            </label>
            <input
              id="tenant-emergency-phone"
              type="tel"
              autoComplete="off"
              disabled={isSubmitting}
              aria-invalid={errors.emergency_contact_phone ? 'true' : 'false'}
              {...register('emergency_contact_phone')}
            />
            {errors.emergency_contact_phone?.message ? (
              <p className="tenant-form__error" role="alert">
                {errors.emergency_contact_phone.message}
              </p>
            ) : null}
          </div>

          <div className="tenant-form__field">
            <label htmlFor="tenant-notes">Notes</label>
            <textarea
              id="tenant-notes"
              rows={4}
              disabled={isSubmitting}
              aria-invalid={errors.notes ? 'true' : 'false'}
              {...register('notes')}
            />
            {errors.notes?.message ? (
              <p className="tenant-form__error" role="alert">
                {errors.notes.message}
              </p>
            ) : null}
          </div>

          {currentProfileQuery.isError ? (
            <p className="tenant-form__error" role="alert">
              We could not confirm your organization. Please try again later.
            </p>
          ) : null}

          {createTenantMutation.isError ? (
            <p className="tenant-form__error" role="alert">
              We could not create this tenant. Please check the details and try
              again.
            </p>
          ) : null}

          <div className="tenant-form__actions">
            <Link to={routePaths.dashboardTenants}>Cancel</Link>
            <button
              type="submit"
              disabled={
                isSubmitting ||
                currentProfileQuery.isLoading ||
                organizationId === null
              }
            >
              {isSubmitting ? 'Creating tenant...' : 'Create tenant'}
            </button>
          </div>
        </form>
      </section>
    </AppLayout>
  )
}
```

- [ ] **Step 5: Add create route path and list action**

Modify `src/app/router/route-paths.ts` so the object includes the create route
path before it is used:

```ts
dashboardTenantsNew: '/dashboard/tenants/new',
```

Modify `src/modules/tenants/presentation/tenants-page.tsx` to import:

```ts
import { Link } from 'react-router-dom'

import { routePaths } from '../../../app/router/route-paths'
```

Add the link in `.tenants-page__header` after the copy wrapper:

```tsx
<Link to={routePaths.dashboardTenantsNew}>Add tenant</Link>
```

- [ ] **Step 6: Register create route**

Modify `src/app/router/app-router.tsx` Tenants import:

```ts
import { CreateTenantPage, TenantsPage } from '../../modules/tenants'
```

Add this route before `dashboardTenants` is acceptable because React Router v7 ranks routes, but keep static routes near the list route for readability:

```tsx
<Route
  path={routePaths.dashboardTenantsNew}
  element={
    <RouteAccessGate route="dashboard">
      <CreateTenantPage />
    </RouteAccessGate>
  }
/>
```

- [ ] **Step 7: Export create flow pieces**

Modify `src/modules/tenants/index.ts` to include:

```ts
export type {
  TenantFormInput,
  TenantFormValues,
} from './domain/tenant-form-schema'
export { tenantFormSchema } from './domain/tenant-form-schema'
export { createTenant } from './infrastructure/tenants-repository'
export { useCreateTenantMutation } from './application/use-create-tenant-mutation'
export { CreateTenantPage } from './presentation/create-tenant-page'
```

- [ ] **Step 8: Add create form CSS**

Modify `src/App.css` by adding this block near existing form rules:

```css
.create-tenant-page {
  display: grid;
  gap: 24px;
  max-width: 640px;
}

.create-tenant-page__header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 24px;
}

.create-tenant-page__header h2 {
  margin: 0 0 8px;
}

.create-tenant-page__header p {
  color: var(--text);
}

.create-tenant-page__header a {
  border: 1px solid var(--border);
  border-radius: 8px;
  padding: 10px 14px;
  color: var(--text-h);
  background: var(--surface);
  font-weight: 700;
  text-decoration: none;
}

.tenant-form {
  display: grid;
  gap: 16px;
  border: 1px solid var(--border);
  border-radius: 12px;
  padding: 24px;
  background: var(--surface);
}

.tenant-form__field {
  display: grid;
  gap: 6px;
}

.tenant-form__field label {
  color: var(--text-h);
  font-size: 14px;
  font-weight: 600;
}

.tenant-form__field input,
.tenant-form__field textarea {
  width: 100%;
  border: 1px solid var(--border);
  border-radius: 8px;
  padding: 10px 12px;
  color: var(--text-h);
  background: #ffffff;
}

.tenant-form__field textarea {
  resize: vertical;
}

.tenant-form__field input:disabled,
.tenant-form__field textarea:disabled {
  color: var(--text);
  background: #f1f5f9;
}

.tenant-form__error {
  color: #b42318;
  font-size: 14px;
}

.tenant-form__actions {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 12px;
}

.tenant-form__actions a {
  color: var(--text-h);
  font-weight: 700;
}

.tenant-form__actions button {
  border: 0;
  border-radius: 8px;
  padding: 10px 14px;
  color: #ffffff;
  background: var(--text-h);
  font-weight: 700;
  cursor: pointer;
}

.tenant-form__actions button:disabled {
  cursor: not-allowed;
  opacity: 0.72;
}
```

- [ ] **Step 9: Verify create flow**

Run:

```bash
npm run lint
npm run build
git diff --check
```

Expected all commands exit `0`.

- [ ] **Step 10: Commit Task 3**

Run:

```bash
git add src/modules/tenants src/app/router/route-paths.ts src/app/router/app-router.tsx src/App.css
git commit -m "Add create Tenant flow"
```

Expected: one commit containing the create flow.

---

### Task 4: Add Edit Tenant Flow

**Files:**

- Create: `src/modules/tenants/application/use-tenant-query.ts`
- Create: `src/modules/tenants/application/use-update-tenant-mutation.ts`
- Create: `src/modules/tenants/presentation/edit-tenant-page.tsx`
- Modify: `src/modules/tenants/infrastructure/tenants-repository.ts`
- Modify: `src/modules/tenants/index.ts`
- Modify: `src/modules/tenants/presentation/tenants-page.tsx`
- Modify: `src/app/router/route-paths.ts`
- Modify: `src/app/router/app-router.tsx`
- Modify: `src/App.css`

- [ ] **Step 1: Add tenant detail and update repository functions**

Modify `src/modules/tenants/infrastructure/tenants-repository.ts` by adding:

```ts
export async function getTenantById(tenantId: string): Promise<Tenant | null> {
  const { data, error } = await supabaseClient
    .from('tenants')
    .select(tenantSelectColumns)
    .eq('id', tenantId)
    .maybeSingle<Tenant>()

  if (error !== null) {
    throw new Error(`Could not load tenant: ${error.message}`)
  }

  return data
}

export async function updateTenant(
  tenantId: string,
  {
    full_name,
    phone,
    email,
    identity_notes,
    emergency_contact_name,
    emergency_contact_phone,
    notes,
  }: TenantFormInput,
): Promise<Tenant> {
  const { data, error } = await supabaseClient
    .from('tenants')
    .update({
      full_name,
      phone,
      email,
      identity_notes,
      emergency_contact_name,
      emergency_contact_phone,
      notes,
    })
    .eq('id', tenantId)
    .select(tenantSelectColumns)
    .single<Tenant>()

  if (error !== null) {
    throw new Error(`Could not update tenant: ${error.message}`)
  }

  return data
}
```

- [ ] **Step 2: Add tenant detail query hook**

Create `src/modules/tenants/application/use-tenant-query.ts`:

```ts
import { useQuery } from '@tanstack/react-query'

import {
  getTenantById,
  tenantQueryKey,
} from '../infrastructure/tenants-repository'

export function useTenantQuery(tenantId: string | undefined) {
  return useQuery({
    queryKey: tenantId ? tenantQueryKey(tenantId) : tenantQueryKey('missing'),
    queryFn: () => {
      if (!tenantId) {
        return Promise.resolve(null)
      }

      return getTenantById(tenantId)
    },
    enabled: tenantId !== undefined,
  })
}
```

- [ ] **Step 3: Add update mutation hook**

Create `src/modules/tenants/application/use-update-tenant-mutation.ts`:

```ts
import { useMutation, useQueryClient } from '@tanstack/react-query'

import type { TenantFormInput } from '../domain/tenant-form-schema'
import {
  tenantQueryKey,
  tenantsQueryKey,
  updateTenant,
} from '../infrastructure/tenants-repository'

type UpdateTenantMutationVariables = {
  tenantId: string
  input: TenantFormInput
}

export function useUpdateTenantMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ tenantId, input }: UpdateTenantMutationVariables) =>
      updateTenant(tenantId, input),
    onSuccess: async (tenant) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: tenantsQueryKey }),
        queryClient.invalidateQueries({
          queryKey: tenantQueryKey(tenant.id),
        }),
      ])
    },
  })
}
```

- [ ] **Step 4: Add edit page**

Create `src/modules/tenants/presentation/edit-tenant-page.tsx`:

```tsx
import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { Link, useNavigate, useParams } from 'react-router-dom'

import { AppLayout } from '../../../app/layouts'
import { routePaths } from '../../../app/router/route-paths'
import { useTenantQuery } from '../application/use-tenant-query'
import { useUpdateTenantMutation } from '../application/use-update-tenant-mutation'
import {
  tenantFormSchema,
  type TenantFormInput,
  type TenantFormValues,
} from '../domain/tenant-form-schema'

export function EditTenantPage() {
  const navigate = useNavigate()
  const { tenantId } = useParams<{ tenantId: string }>()
  const tenantQuery = useTenantQuery(tenantId)
  const updateTenantMutation = useUpdateTenantMutation()
  const {
    formState: { errors },
    handleSubmit,
    register,
    reset,
  } = useForm<TenantFormValues, unknown, TenantFormInput>({
    resolver: zodResolver(tenantFormSchema),
    defaultValues: {
      full_name: '',
      phone: '',
      email: '',
      identity_notes: '',
      emergency_contact_name: '',
      emergency_contact_phone: '',
      notes: '',
    },
  })

  useEffect(() => {
    if (tenantQuery.data === null || tenantQuery.data === undefined) {
      return
    }

    reset({
      full_name: tenantQuery.data.full_name,
      phone: tenantQuery.data.phone ?? '',
      email: tenantQuery.data.email ?? '',
      identity_notes: tenantQuery.data.identity_notes ?? '',
      emergency_contact_name: tenantQuery.data.emergency_contact_name ?? '',
      emergency_contact_phone: tenantQuery.data.emergency_contact_phone ?? '',
      notes: tenantQuery.data.notes ?? '',
    })
  }, [reset, tenantQuery.data])

  const isSubmitting = updateTenantMutation.isPending

  return (
    <AppLayout>
      <section className="edit-tenant-page" aria-labelledby="edit-tenant-title">
        <div className="edit-tenant-page__header">
          <div>
            <h2 id="edit-tenant-title">Edit tenant</h2>
            <p>
              Update this renter contact record. Lease and unit assignment
              workflows stay outside this module.
            </p>
          </div>
          <Link to={routePaths.dashboardTenants}>Back to tenants</Link>
        </div>

        {!tenantId ? (
          <div className="edit-tenant-page__empty">
            <h3>Tenant not found</h3>
            <p>This tenant is missing or is not accessible to your account.</p>
          </div>
        ) : null}

        {tenantQuery.isLoading ? (
          <p className="edit-tenant-page__status">Loading tenant...</p>
        ) : null}

        {tenantQuery.isError ? (
          <p className="edit-tenant-page__error" role="alert">
            We could not load this tenant right now. Please try again later.
          </p>
        ) : null}

        {tenantQuery.isSuccess && tenantQuery.data === null ? (
          <div className="edit-tenant-page__empty">
            <h3>Tenant not found</h3>
            <p>
              This tenant may not exist or may not be accessible to your
              account.
            </p>
          </div>
        ) : null}

        {tenantQuery.isSuccess && tenantQuery.data !== null ? (
          <form
            className="tenant-form"
            onSubmit={handleSubmit((input) => {
              if (!tenantId) {
                return
              }

              updateTenantMutation.mutate(
                { tenantId, input },
                {
                  onSuccess: () => {
                    navigate(routePaths.dashboardTenants)
                  },
                },
              )
            })}
            noValidate
          >
            <div className="tenant-form__field">
              <label htmlFor="tenant-full-name">Full name</label>
              <input
                id="tenant-full-name"
                type="text"
                autoComplete="name"
                disabled={isSubmitting}
                aria-invalid={errors.full_name ? 'true' : 'false'}
                {...register('full_name')}
              />
              {errors.full_name?.message ? (
                <p className="tenant-form__error" role="alert">
                  {errors.full_name.message}
                </p>
              ) : null}
            </div>

            <div className="tenant-form__field">
              <label htmlFor="tenant-phone">Phone</label>
              <input
                id="tenant-phone"
                type="tel"
                autoComplete="tel"
                disabled={isSubmitting}
                aria-invalid={errors.phone ? 'true' : 'false'}
                {...register('phone')}
              />
              {errors.phone?.message ? (
                <p className="tenant-form__error" role="alert">
                  {errors.phone.message}
                </p>
              ) : null}
            </div>

            <div className="tenant-form__field">
              <label htmlFor="tenant-email">Email</label>
              <input
                id="tenant-email"
                type="email"
                autoComplete="email"
                disabled={isSubmitting}
                aria-invalid={errors.email ? 'true' : 'false'}
                {...register('email')}
              />
              {errors.email?.message ? (
                <p className="tenant-form__error" role="alert">
                  {errors.email.message}
                </p>
              ) : null}
            </div>

            <div className="tenant-form__field">
              <label htmlFor="tenant-identity-notes">Identity notes</label>
              <textarea
                id="tenant-identity-notes"
                rows={3}
                disabled={isSubmitting}
                aria-invalid={errors.identity_notes ? 'true' : 'false'}
                {...register('identity_notes')}
              />
              {errors.identity_notes?.message ? (
                <p className="tenant-form__error" role="alert">
                  {errors.identity_notes.message}
                </p>
              ) : null}
            </div>

            <div className="tenant-form__field">
              <label htmlFor="tenant-emergency-name">
                Emergency contact name
              </label>
              <input
                id="tenant-emergency-name"
                type="text"
                autoComplete="off"
                disabled={isSubmitting}
                aria-invalid={errors.emergency_contact_name ? 'true' : 'false'}
                {...register('emergency_contact_name')}
              />
              {errors.emergency_contact_name?.message ? (
                <p className="tenant-form__error" role="alert">
                  {errors.emergency_contact_name.message}
                </p>
              ) : null}
            </div>

            <div className="tenant-form__field">
              <label htmlFor="tenant-emergency-phone">
                Emergency contact phone
              </label>
              <input
                id="tenant-emergency-phone"
                type="tel"
                autoComplete="off"
                disabled={isSubmitting}
                aria-invalid={errors.emergency_contact_phone ? 'true' : 'false'}
                {...register('emergency_contact_phone')}
              />
              {errors.emergency_contact_phone?.message ? (
                <p className="tenant-form__error" role="alert">
                  {errors.emergency_contact_phone.message}
                </p>
              ) : null}
            </div>

            <div className="tenant-form__field">
              <label htmlFor="tenant-notes">Notes</label>
              <textarea
                id="tenant-notes"
                rows={4}
                disabled={isSubmitting}
                aria-invalid={errors.notes ? 'true' : 'false'}
                {...register('notes')}
              />
              {errors.notes?.message ? (
                <p className="tenant-form__error" role="alert">
                  {errors.notes.message}
                </p>
              ) : null}
            </div>

            {updateTenantMutation.isError ? (
              <p className="tenant-form__error" role="alert">
                We could not update this tenant. Please check the details and
                try again.
              </p>
            ) : null}

            <div className="tenant-form__actions">
              <Link to={routePaths.dashboardTenants}>Cancel</Link>
              <button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Saving tenant...' : 'Save tenant'}
              </button>
            </div>
          </form>
        ) : null}
      </section>
    </AppLayout>
  )
}
```

- [ ] **Step 5: Add edit route path and list actions**

Modify `src/app/router/route-paths.ts` so the object includes the edit route
path before it is used:

```ts
dashboardTenantEdit: '/dashboard/tenants/:tenantId/edit',
```

Modify `src/modules/tenants/presentation/tenants-page.tsx` to render an edit
link in each `.tenant-card__header`:

```tsx
<Link to={`${routePaths.dashboardTenants}/${tenant.id}/edit`}>Edit</Link>
```

- [ ] **Step 6: Register edit route**

Modify `src/app/router/app-router.tsx` Tenants import:

```ts
import {
  CreateTenantPage,
  EditTenantPage,
  TenantsPage,
} from '../../modules/tenants'
```

Add:

```tsx
<Route
  path={routePaths.dashboardTenantEdit}
  element={
    <RouteAccessGate route="dashboard">
      <EditTenantPage />
    </RouteAccessGate>
  }
/>
```

- [ ] **Step 7: Export edit flow pieces**

Modify `src/modules/tenants/index.ts` to include:

```ts
export {
  getTenantById,
  updateTenant,
} from './infrastructure/tenants-repository'
export { useTenantQuery } from './application/use-tenant-query'
export { useUpdateTenantMutation } from './application/use-update-tenant-mutation'
export { EditTenantPage } from './presentation/edit-tenant-page'
```

- [ ] **Step 8: Add edit page CSS**

Modify `src/App.css`:

```css
.edit-tenant-page {
  display: grid;
  gap: 24px;
  max-width: 640px;
}

.edit-tenant-page__header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 24px;
}

.edit-tenant-page__header h2 {
  margin: 0 0 8px;
}

.edit-tenant-page__header p,
.edit-tenant-page__status {
  color: var(--text);
}

.edit-tenant-page__header a {
  border: 1px solid var(--border);
  border-radius: 8px;
  padding: 10px 14px;
  color: var(--text-h);
  background: var(--surface);
  font-weight: 700;
  text-decoration: none;
}

.edit-tenant-page__error {
  border: 1px solid #fecdca;
  border-radius: 12px;
  padding: 16px;
  color: #b42318;
  background: #fffbfa;
}

.edit-tenant-page__empty {
  border: 1px solid var(--border);
  border-radius: 12px;
  padding: 24px;
  background: var(--surface);
}

.edit-tenant-page__empty h3 {
  margin: 0 0 8px;
  color: var(--text-h);
}
```

- [ ] **Step 9: Verify edit flow**

Run:

```bash
npm run lint
npm run build
git diff --check
```

Expected all commands exit `0`.

- [ ] **Step 10: Commit Task 4**

Run:

```bash
git add src/modules/tenants src/app/router/route-paths.ts src/app/router/app-router.tsx src/App.css
git commit -m "Add edit Tenant flow"
```

Expected: one commit containing the edit flow.

---

### Task 5: Document Tenants Validation Checklist

**Files:**

- Create: `docs/16-tenants-validation-checklist.md`
- Modify: `docs/06-development-checklist.md`

- [ ] **Step 1: Create validation checklist**

Create `docs/16-tenants-validation-checklist.md`:

```markdown
# Tenants Validation Checklist

## Status

Status: ready for manual validation after the Tenants implementation slices are complete.

## Automated Checks

- [ ] `npm run lint` passes.
- [ ] `npm run build` passes.
- [ ] `git diff --check` passes.

## Read-Only Tenants List

- [ ] Authenticated and onboarded users can open `/dashboard/tenants`.
- [ ] Unauthenticated users cannot access `/dashboard/tenants` and are redirected through the existing auth gate.
- [ ] The sidebar Tenants link navigates to `/dashboard/tenants`.
- [ ] The sidebar Dashboard link still navigates to `/dashboard`.
- [ ] The sidebar Properties link still navigates to `/dashboard/properties`.
- [ ] The Tenants page shows a loading state while the tenants query is pending.
- [ ] The Tenants page shows an empty state when the current organization has no tenants.
- [ ] The Tenants page shows an error state when the tenants query fails.
- [ ] The Tenants page shows a populated list when the current organization has existing tenants.
- [ ] Existing tenants listed on the page belong to the current organization.
- [ ] Tenant rows show full name.
- [ ] Tenant rows handle missing phone gracefully.
- [ ] Tenant rows handle missing email gracefully.
- [ ] Tenant rows handle missing emergency contact gracefully.
- [ ] Tenant rows handle missing notes gracefully.
- [ ] Refreshing `/dashboard/tenants` keeps the user on the protected Tenants route after account state checks finish.

## Create Tenant Flow

- [ ] Authenticated and onboarded users can open `/dashboard/tenants/new`.
- [ ] Unauthenticated users cannot access `/dashboard/tenants/new` and are redirected through the existing auth gate.
- [ ] The Back to tenants link returns to `/dashboard/tenants`.
- [ ] The Cancel link returns to `/dashboard/tenants`.
- [ ] Submitting with an empty full name shows the full-name validation error.
- [ ] Submitting with an invalid email shows the email validation error.
- [ ] Phone can be left blank.
- [ ] Email can be left blank.
- [ ] Identity notes can be left blank.
- [ ] Emergency contact name can be left blank.
- [ ] Emergency contact phone can be left blank.
- [ ] Notes can be left blank.
- [ ] Blank optional fields are stored as `null`.
- [ ] Submitting a valid tenant creates one tenant.
- [ ] The created tenant has the correct `organization_id` for the current onboarded user.
- [ ] After successful creation, the user is redirected to `/dashboard/tenants`.
- [ ] The newly created tenant appears in the Tenants list after redirect.

## Edit Tenant Flow

- [ ] Authenticated and onboarded users can open `/dashboard/tenants`.
- [ ] Existing tenant rows expose an Edit action.
- [ ] The Edit action navigates to `/dashboard/tenants/:tenantId/edit`.
- [ ] The edit page pre-fills all saved tenant fields.
- [ ] Submitting with an empty full name shows the full-name validation error.
- [ ] Submitting with an invalid email shows the email validation error.
- [ ] Updating full name succeeds.
- [ ] Updating phone succeeds.
- [ ] Updating email succeeds.
- [ ] Updating identity notes succeeds.
- [ ] Updating emergency contact name succeeds.
- [ ] Updating emergency contact phone succeeds.
- [ ] Updating notes succeeds.
- [ ] Clearing optional fields stores them as `null`.
- [ ] After successful update, the user is redirected to `/dashboard/tenants`.
- [ ] The Tenants list shows updated values after redirect.
- [ ] Invalid or inaccessible tenant IDs show the not-found or inaccessible state.
- [ ] Refreshing `/dashboard/tenants/:tenantId/edit` keeps the user on the protected edit route after account state checks finish.

## Boundaries

- [ ] No lease assignment was introduced.
- [ ] No direct tenant-to-unit assignment was introduced.
- [ ] No occupancy workflow was introduced.
- [ ] No tenant delete/archive workflow was introduced.
- [ ] No billing, payment, receipt, reminder, maintenance, or dashboard metrics were introduced.
- [ ] No tenant portal or tenant authentication was introduced.
- [ ] No identity number storage was introduced.
- [ ] No document upload was introduced.
- [ ] No schema or RLS migration was introduced.

## Deferred Work

Phone normalization to Indonesian `+62` format remains deferred and should be revisited before Leases relies on tenant contact data for billing or reminder workflows.
```

- [ ] **Step 2: Add Tenants references to development checklist**

Append this section to `docs/06-development-checklist.md`:

```markdown
### Manual validation: Tenants MVP baseline

Validate the committed Tenants baseline manually before the owner closes out the module.

- [ ] Follow `docs/16-tenants-validation-checklist.md`.
- [ ] Confirm the Tenants module remains limited to renter/contact records.
- [ ] Confirm phone normalization is either implemented with clear validation or recorded as deferred.
- [ ] Confirm the next recommended module is Leases.
```

- [ ] **Step 3: Verify documentation**

Run:

```bash
git diff --check
```

Expected exit code `0`.

- [ ] **Step 4: Commit Task 5**

Run:

```bash
git add docs/06-development-checklist.md docs/16-tenants-validation-checklist.md
git commit -m "Document Tenants validation checklist"
```

Expected: one commit containing the validation checklist and development checklist reference.

---

### Task 6: Close Out Tenants and Promote Leases

**Files:**

- Modify: `docs/06-development-checklist.md`
- Modify: `docs/16-tenants-validation-checklist.md`
- Modify: `wiki/04-roadmap/mvp-epics.md`
- Modify: `wiki/04-roadmap/release-plan.md`
- Modify: `wiki/06-task-breakdown/task-index.md`
- Modify: `wiki/06-task-breakdown/ready-soon.md`
- Modify: `wiki/06-task-breakdown/backlog.md`
- Modify: `wiki/09-status/built.md`
- Modify: `wiki/09-status/not-built.md`

- [ ] **Step 1: Update development checklist module status**

Modify the Phase 5 module status in `docs/06-development-checklist.md` so it includes:

```markdown
- [x] Tenants MVP baseline documented and implemented as the renter/contact record module
```

- [ ] **Step 2: Add Tenants closeout note**

Append this to `docs/16-tenants-validation-checklist.md` after manual validation is completed:

```markdown
## Closeout

Tenants MVP baseline is complete when:

- [ ] Read-only list is validated.
- [ ] Create tenant flow is validated.
- [ ] Edit tenant flow is validated.
- [ ] Automated checks pass.
- [ ] Deferred work is documented.
- [ ] Wiki status pages identify Leases planning as the next step.

Deferred Tenants work:

- Lease assignment belongs to Leases.
- Direct tenant-to-unit assignment remains out of scope.
- Delete/archive remains out of scope.
- Tenant portal remains out of scope.
- Document upload remains out of scope.
- Phone normalization remains deferred unless a completed implementation slice documents otherwise.
```

- [ ] **Step 3: Update MVP epics wiki**

Modify `wiki/04-roadmap/mvp-epics.md` so Epic 4 reads:

```markdown
## Epic 4: Tenants

Status: built

Goal: manage renter/contact records.

Built:

- Tenants module plan
- read-only Tenants list
- create Tenant flow
- edit Tenant flow
- validation checklist
- Tenants module closeout

Deferred:

- lease assignment
- direct tenant-to-unit assignment
- delete/archive
- tenant portal
- document upload
```

Modify Epic 5 so it reads:

```markdown
## Epic 5: Leases

Status: candidate / next planned

Goal: connect Tenants to Properties/Units through rental agreements.

First candidate slice:

- plan Leases module
- read-only Leases list
```

- [ ] **Step 4: Update release plan wiki**

Modify `wiki/04-roadmap/release-plan.md` so the current baseline and sequence read:

```markdown
## Current baseline

Built:

- Foundation
- Properties
- Units
- Tenants

## Recommended next sequence

1. Plan Leases module
2. Implement Lease read-only list
3. Implement create Lease
4. Close out Leases
5. Start Billing / Invoices
6. Start Payments
7. Start Receipts
8. Start Reminders
9. Add Maintenance
10. Add basic dashboard/reporting
```

- [ ] **Step 5: Update task index wiki**

Modify `wiki/06-task-breakdown/task-index.md` so it reads:

````markdown
# Task Index

This page tracks task candidates. Candidates are not approved for Hermes execution until they become approved Kanban task cards.

## Ready soon candidates

- Plan Leases module
- Add read-only Leases list
- Document Leases list validation checklist

## Completed candidates

- Plan Tenants module
- Add read-only Tenants list
- Create Tenant flow
- Edit Tenant flow
- Document Tenants validation checklist
- Tenants module closeout

## Later candidates

- Create Lease flow
- Lease closeout
- Plan Billing module
- Add read-only Invoices list

## Deferred candidates

- Tenant delete/archive flow
- Tenant phone normalization refinement
- Property archive flow
- Unit status/occupancy workflow
- Unit base rent pricing
- Standalone Unit detail page
- Top-level Units navigation

## Approval rule

```txt
Wiki candidate
→ Kanban card
→ owner approval
→ Hermes prompt
→ implementation
```
````

Hermes should not execute wiki candidates directly.

````

- [ ] **Step 6: Update ready-soon wiki**

Modify `wiki/06-task-breakdown/ready-soon.md` so it reads:

```markdown
# Ready Soon

These are candidates likely to become approved tasks soon.

## Candidate: Plan Leases module

Purpose:

- define Leases scope
- inspect schema
- document first slice
- defer billing, payments, receipts, reminders, maintenance, and reporting

Status:

- candidate only
- not approved until converted into Kanban task card

## Candidate: Read-only Leases list

Purpose:

- add organization-scoped Leases list
- show tenant and unit relationship data only after Leases planning confirms query shape
- no create/edit/end/cancel lifecycle yet

Status:

- candidate only
````

- [ ] **Step 7: Update backlog wiki**

Modify `wiki/06-task-breakdown/backlog.md` so the Tenants and Leases sections read:

```markdown
## Tenants

- Tenant delete/archive flow
- Tenant phone normalization refinement

## Leases

- Plan Leases module
- Read-only Leases list
- Create Lease flow
- Lease closeout
```

- [ ] **Step 8: Update built status wiki**

Append this section to `wiki/09-status/built.md`:

```markdown
## Tenants

Status: MVP baseline complete.

Routes:

- `/dashboard/tenants`
- `/dashboard/tenants/new`
- `/dashboard/tenants/:tenantId/edit`

Built:

- read-only Tenants list
- create Tenant
- edit Tenant

Fields:

- full name
- phone
- email
- identity notes
- emergency contact name
- emergency contact phone
- notes

Deferred:

- lease assignment
- direct tenant-to-unit assignment
- delete/archive
- tenant portal
- document upload
- phone normalization refinement
```

- [ ] **Step 9: Update not-built status wiki**

Modify `wiki/09-status/not-built.md` so the Tenants section reads:

```markdown
## Tenants

Status: MVP baseline built. Remaining Tenants refinements are deferred.

Not built:

- tenant delete/archive
- tenant phone normalization refinement, if not completed during baseline
- tenant portal
- tenant document upload
```

Modify the Leases section so it reads:

```markdown
## Leases

Status: not started. Recommended next module.

Not built:

- Lease planning
- lease list
- create Lease
- lease lifecycle
```

- [ ] **Step 10: Verify closeout docs**

Run:

```bash
git diff --check
npm run lint
npm run build
```

Expected all commands exit `0`.

- [ ] **Step 11: Commit Task 6**

Run:

```bash
git add docs/06-development-checklist.md docs/16-tenants-validation-checklist.md wiki/04-roadmap/mvp-epics.md wiki/04-roadmap/release-plan.md wiki/06-task-breakdown/task-index.md wiki/06-task-breakdown/ready-soon.md wiki/06-task-breakdown/backlog.md wiki/09-status/built.md wiki/09-status/not-built.md
git commit -m "Close out Tenants module"
```

Expected: one commit containing closeout documentation and wiki updates.

---

## Final Verification

After Task 6, run:

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

When this plan is complete, the next recommended epic is Leases MVP Baseline:

1. Create Leases module plan.
2. Add read-only Leases list.
3. Add create Lease flow.
4. Close out Leases and promote Billing / Invoices.
