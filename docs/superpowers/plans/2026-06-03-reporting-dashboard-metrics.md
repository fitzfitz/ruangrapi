# Reporting Dashboard Metrics Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the first `/dashboard` reporting slice with preset range filters, operational summary metrics, and shadcn/Recharts charts over existing RuangRapi records.

**Architecture:** Keep reporting in `src/modules/dashboard` with app-side aggregation over existing Supabase tables. Add Tailwind CSS v4 and shadcn/ui only as much as needed for chart rendering, without migrating the whole app UI.

**Tech Stack:** React, TypeScript, Vite, TanStack Query, Supabase, Tailwind CSS v4, shadcn/ui, Recharts.

---

## Source Spec

- `docs/superpowers/specs/2026-06-03-reporting-dashboard-metrics-design.md`

## File Structure

- Modify `package.json` and `package-lock.json`: add Tailwind, shadcn support dependencies, and Recharts through npm/shadcn CLI.
- Modify `vite.config.ts`: add the Tailwind Vite plugin and `@` path alias.
- Modify `tsconfig.app.json` and `tsconfig.node.json`: add `baseUrl` and `paths` for `@/*`.
- Modify `src/index.css`: import Tailwind while preserving existing CSS variables and reset rules.
- Create `components.json`: shadcn CLI configuration.
- Create `src/lib/utils.ts`: shadcn `cn` helper.
- Create `src/components/ui/chart.tsx`: generated shadcn chart component.
- Create `src/modules/dashboard/domain/dashboard-metrics.ts`: dashboard range, metric, and chart data types.
- Create `src/modules/dashboard/infrastructure/dashboard-metrics-repository.ts`: Supabase reads and TypeScript aggregation.
- Create `src/modules/dashboard/application/use-dashboard-metrics-query.ts`: TanStack Query hook.
- Modify `src/modules/dashboard/index.ts`: export dashboard metrics hook and types as needed.
- Modify `src/modules/dashboard/dashboard-shell.tsx`: render range controls, metric cards, charts, loading, error, and empty states.
- Modify `src/App.css`: add dashboard layout styles and chart sizing; keep existing module styles intact.
- Create `docs/26-reporting-dashboard-validation-checklist.md`: manual validation checklist.
- Modify `wiki/03-domain/reporting.md`: document planned/built dashboard metrics behavior.
- Modify `wiki/09-status/built.md`: add Reporting / Dashboard Metrics after implementation.
- Modify `wiki/09-status/not-built.md`: record deferred reporting work.
- Modify `wiki/06-task-breakdown/ready-soon.md`: move reporting planning from candidate to completed candidate.
- Modify `wiki/06-task-breakdown/task-index.md`: move Reporting / Dashboard metrics planning into completed candidates and add next candidates.
- Modify `wiki/06-task-breakdown/backlog.md`: remove or reclassify dashboard metrics backlog items covered by this slice.
- Modify `wiki/04-roadmap/release-plan.md`: record reporting/dashboard metrics slice status and next recommended task.

## Task 1: Tailwind, shadcn, and Recharts Setup

**Files:**

- Modify: `package.json`
- Modify: `package-lock.json`
- Modify: `vite.config.ts`
- Modify: `tsconfig.app.json`
- Modify: `tsconfig.node.json`
- Modify: `src/index.css`
- Create: `components.json`
- Create: `src/lib/utils.ts`
- Create: `src/components/ui/chart.tsx`

- [ ] **Step 1: Install approved dependencies**

Run:

```bash
npm install tailwindcss @tailwindcss/vite recharts clsx tailwind-merge
```

Expected: npm updates `package.json` and `package-lock.json` with the listed dependencies.

- [ ] **Step 2: Add Vite alias and Tailwind plugin**

Modify `vite.config.ts`:

```ts
import path from 'node:path'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  build: {
    rolldownOptions: {
      output: {
        codeSplitting: {
          groups: [
            {
              name: 'react-vendor',
              test: /node_modules[\\/](react|react-dom|scheduler)[\\/]/,
              priority: 3,
            },
            {
              name: 'router-vendor',
              test: /node_modules[\\/]react-router/,
              priority: 2,
            },
            {
              name: 'data-vendor',
              test: /node_modules[\\/](@supabase|@tanstack)[\\/]/,
              priority: 2,
            },
            {
              name: 'form-vendor',
              test: /node_modules[\\/](@hookform|react-hook-form|zod)[\\/]/,
              priority: 2,
            },
          ],
        },
      },
    },
  },
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
```

- [ ] **Step 3: Add TypeScript path alias for app files**

Modify `tsconfig.app.json` so `compilerOptions` includes `baseUrl` and `paths`:

```json
{
  "compilerOptions": {
    "tsBuildInfoFile": "./node_modules/.tmp/tsconfig.app.tsbuildinfo",
    "target": "es2023",
    "lib": ["ES2023", "DOM"],
    "module": "esnext",
    "types": ["vite/client"],
    "skipLibCheck": true,
    "strict": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    },
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "verbatimModuleSyntax": true,
    "moduleDetection": "force",
    "noEmit": true,
    "jsx": "react-jsx",
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "erasableSyntaxOnly": true,
    "noFallthroughCasesInSwitch": true
  },
  "include": ["src"]
}
```

- [ ] **Step 4: Add TypeScript path alias for Vite config**

Modify `tsconfig.node.json` so `compilerOptions` includes `baseUrl` and `paths`:

```json
{
  "compilerOptions": {
    "tsBuildInfoFile": "./node_modules/.tmp/tsconfig.node.tsbuildinfo",
    "target": "es2023",
    "lib": ["ES2023"],
    "module": "esnext",
    "types": ["node"],
    "skipLibCheck": true,
    "strict": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    },
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "verbatimModuleSyntax": true,
    "moduleDetection": "force",
    "noEmit": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "erasableSyntaxOnly": true,
    "noFallthroughCasesInSwitch": true
  },
  "include": ["vite.config.ts"]
}
```

- [ ] **Step 5: Import Tailwind in global CSS**

Modify the top of `src/index.css`:

```css
@import 'tailwindcss';

:root {
  --text: #5f6673;
  --text-h: #172033;
  --bg: #f8fafc;
  --surface: #ffffff;
  --border: #e2e8f0;

  font:
    16px/1.5 system-ui,
    'Segoe UI',
    Roboto,
    sans-serif;
  color: var(--text);
  background: var(--bg);
  font-synthesis: none;
  text-rendering: optimizeLegibility;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}
```

Keep the rest of `src/index.css` unchanged.

- [ ] **Step 6: Initialize shadcn configuration**

Create `components.json`:

```json
{
  "$schema": "https://ui.shadcn.com/schema.json",
  "style": "new-york",
  "rsc": false,
  "tsx": true,
  "tailwind": {
    "config": "",
    "css": "src/index.css",
    "baseColor": "slate",
    "cssVariables": true,
    "prefix": ""
  },
  "aliases": {
    "components": "@/components",
    "utils": "@/lib/utils",
    "ui": "@/components/ui",
    "lib": "@/lib",
    "hooks": "@/hooks"
  },
  "iconLibrary": "lucide"
}
```

- [ ] **Step 7: Add shadcn utils helper**

Create `src/lib/utils.ts`:

```ts
import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
```

- [ ] **Step 8: Add shadcn chart component**

Run:

```bash
npx shadcn@latest add chart
```

Expected: creates or updates `src/components/ui/chart.tsx` and may confirm use of the existing `components.json`.

- [ ] **Step 9: Verify setup builds before dashboard code**

Run:

```bash
npm run build
```

Expected: PASS with Vite production build output. If TypeScript reports the generated chart component needs a dependency such as `lucide-react`, install the exact missing dependency with `npm install lucide-react`, then rerun `npm run build`.

- [ ] **Step 10: Commit setup**

Run:

```bash
git add package.json package-lock.json vite.config.ts tsconfig.app.json tsconfig.node.json src/index.css components.json src/lib/utils.ts src/components/ui/chart.tsx
git commit -m "chore: add shadcn chart setup"
```

Expected: commit contains only Tailwind, shadcn, Recharts setup files.

## Task 2: Dashboard Metrics Domain Types

**Files:**

- Create: `src/modules/dashboard/domain/dashboard-metrics.ts`
- Modify: `src/modules/dashboard/index.ts`

- [ ] **Step 1: Create dashboard metric types**

Create `src/modules/dashboard/domain/dashboard-metrics.ts`:

```ts
export type DashboardRangePreset =
  | 'this-month'
  | 'last-month'
  | 'last-3-months'
  | 'this-year'

export type DashboardRange = {
  preset: DashboardRangePreset
  label: string
  startBillingPeriod: string
  endBillingPeriod: string
  monthLabels: string[]
}

export type DashboardMetricCard = {
  id: string
  label: string
  value: string
  helper: string
}

export type DashboardMonthlyCollection = {
  month: string
  expected: number
  collected: number
}

export type DashboardBreakdownItem = {
  name: string
  value: number
  fill: string
}

export type DashboardMetrics = {
  range: DashboardRange
  totalUnits: number
  occupiedUnits: number
  vacantUnits: number
  expectedRent: number
  collectedRent: number
  outstandingRent: number
  attentionInvoiceCount: number
  openMaintenanceTicketCount: number
  reminderCounts: {
    draft: number
    prepared: number
    sent: number
    cancelled: number
  }
  monthlyCollections: DashboardMonthlyCollection[]
  invoiceStatusBreakdown: DashboardBreakdownItem[]
  maintenanceStatusBreakdown: DashboardBreakdownItem[]
  reminderStatusBreakdown: DashboardBreakdownItem[]
}

export const dashboardRangePresets: {
  value: DashboardRangePreset
  label: string
}[] = [
  { value: 'this-month', label: 'This month' },
  { value: 'last-month', label: 'Last month' },
  { value: 'last-3-months', label: 'Last 3 months' },
  { value: 'this-year', label: 'This year' },
]
```

- [ ] **Step 2: Export dashboard types**

Modify `src/modules/dashboard/index.ts`:

```ts
export { DashboardPage } from './dashboard-page'
export { DashboardShell } from './dashboard-shell'
export {
  dashboardRangePresets,
  type DashboardBreakdownItem,
  type DashboardMetrics,
  type DashboardRange,
  type DashboardRangePreset,
} from './domain/dashboard-metrics'
```

- [ ] **Step 3: Verify domain types compile**

Run:

```bash
npm run build
```

Expected: PASS. The new export should not be used yet, but TypeScript should compile.

- [ ] **Step 4: Commit dashboard domain types**

Run:

```bash
git add src/modules/dashboard/domain/dashboard-metrics.ts src/modules/dashboard/index.ts
git commit -m "feat: define dashboard metrics types"
```

Expected: commit contains only dashboard type definitions and exports.

## Task 3: Dashboard Metrics Repository

**Files:**

- Create: `src/modules/dashboard/infrastructure/dashboard-metrics-repository.ts`

- [ ] **Step 1: Create app-side aggregate repository**

Create `src/modules/dashboard/infrastructure/dashboard-metrics-repository.ts`:

```ts
import { supabaseClient } from '../../../shared/lib'
import type {
  DashboardBreakdownItem,
  DashboardMetrics,
  DashboardMonthlyCollection,
  DashboardRange,
  DashboardRangePreset,
} from '../domain/dashboard-metrics'

export const dashboardMetricsQueryKey = ['dashboard-metrics'] as const

type UnitStatus = 'vacant' | 'occupied' | 'maintenance' | 'inactive'
type InvoiceStatus =
  | 'draft'
  | 'unpaid'
  | 'partially_paid'
  | 'paid'
  | 'overdue'
  | 'cancelled'
type ReminderStatus = 'draft' | 'prepared' | 'sent' | 'cancelled'
type MaintenanceTicketStatus = 'open' | 'in_progress' | 'resolved' | 'cancelled'

type UnitMetricsRow = {
  status: UnitStatus
}

type InvoiceMetricsRow = {
  id: string
  billing_period: string
  total_amount: number
  status: InvoiceStatus
  payments: { amount: number }[] | null
}

type ReminderMetricsRow = {
  status: ReminderStatus
  invoices: { billing_period: string; status: InvoiceStatus } | null
}

type MaintenanceMetricsRow = {
  status: MaintenanceTicketStatus
}

const invoiceAttentionStatuses = new Set<InvoiceStatus>([
  'unpaid',
  'partially_paid',
  'overdue',
])

const openMaintenanceStatuses = new Set<MaintenanceTicketStatus>([
  'open',
  'in_progress',
])

const statusColors = {
  draft: '#64748b',
  unpaid: '#f97316',
  partially_paid: '#eab308',
  paid: '#16a34a',
  overdue: '#dc2626',
  cancelled: '#94a3b8',
  prepared: '#2563eb',
  sent: '#16a34a',
  open: '#dc2626',
  in_progress: '#2563eb',
  resolved: '#16a34a',
} as const

function toBillingPeriod(date: Date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')

  return `${year}-${month}-01`
}

function addMonths(date: Date, amount: number) {
  return new Date(date.getFullYear(), date.getMonth() + amount, 1)
}

function getMonthLabel(billingPeriod: string) {
  const [year, month] = billingPeriod.split('-').map(Number)

  return new Intl.DateTimeFormat('id-ID', {
    month: 'short',
    year: 'numeric',
  }).format(new Date(year, month - 1, 1))
}

function listBillingPeriods(start: string, end: string) {
  const periods: string[] = []
  const [startYear, startMonth] = start.split('-').map(Number)
  const [endYear, endMonth] = end.split('-').map(Number)
  let cursor = new Date(startYear, startMonth - 1, 1)
  const final = new Date(endYear, endMonth - 1, 1)

  while (cursor <= final) {
    periods.push(toBillingPeriod(cursor))
    cursor = addMonths(cursor, 1)
  }

  return periods
}

export function getDashboardRange(
  preset: DashboardRangePreset,
  now = new Date(),
): DashboardRange {
  const currentMonth = new Date(now.getFullYear(), now.getMonth(), 1)

  if (preset === 'last-month') {
    const month = addMonths(currentMonth, -1)
    const billingPeriod = toBillingPeriod(month)

    return {
      preset,
      label: 'Last month',
      startBillingPeriod: billingPeriod,
      endBillingPeriod: billingPeriod,
      monthLabels: [getMonthLabel(billingPeriod)],
    }
  }

  if (preset === 'last-3-months') {
    const start = toBillingPeriod(addMonths(currentMonth, -2))
    const end = toBillingPeriod(currentMonth)

    return {
      preset,
      label: 'Last 3 months',
      startBillingPeriod: start,
      endBillingPeriod: end,
      monthLabels: listBillingPeriods(start, end).map(getMonthLabel),
    }
  }

  if (preset === 'this-year') {
    const start = toBillingPeriod(new Date(now.getFullYear(), 0, 1))
    const end = toBillingPeriod(currentMonth)

    return {
      preset,
      label: 'This year',
      startBillingPeriod: start,
      endBillingPeriod: end,
      monthLabels: listBillingPeriods(start, end).map(getMonthLabel),
    }
  }

  const billingPeriod = toBillingPeriod(currentMonth)

  return {
    preset,
    label: 'This month',
    startBillingPeriod: billingPeriod,
    endBillingPeriod: billingPeriod,
    monthLabels: [getMonthLabel(billingPeriod)],
  }
}

function sumPayments(payments: { amount: number }[] | null) {
  return payments?.reduce((total, payment) => total + payment.amount, 0) ?? 0
}

function createBreakdown<TStatus extends string>({
  counts,
  labels,
  colors,
}: {
  counts: Map<TStatus, number>
  labels: Record<TStatus, string>
  colors: Record<TStatus, string>
}): DashboardBreakdownItem[] {
  return Object.entries(labels)
    .map(([status, label]) => ({
      name: label,
      value: counts.get(status as TStatus) ?? 0,
      fill: colors[status as TStatus],
    }))
    .filter((item) => item.value > 0)
}

function incrementCount<TStatus extends string>(
  counts: Map<TStatus, number>,
  status: TStatus,
) {
  counts.set(status, (counts.get(status) ?? 0) + 1)
}

function buildMonthlyCollections({
  range,
  invoices,
}: {
  range: DashboardRange
  invoices: InvoiceMetricsRow[]
}): DashboardMonthlyCollection[] {
  const periods = listBillingPeriods(
    range.startBillingPeriod,
    range.endBillingPeriod,
  )
  const collectionsByPeriod = new Map(
    periods.map((period) => [
      period,
      {
        month: getMonthLabel(period),
        expected: 0,
        collected: 0,
      },
    ]),
  )

  invoices.forEach((invoice) => {
    if (invoice.status === 'cancelled') {
      return
    }

    const collection = collectionsByPeriod.get(invoice.billing_period)

    if (collection === undefined) {
      return
    }

    collection.expected += invoice.total_amount
    collection.collected += sumPayments(invoice.payments)
  })

  return Array.from(collectionsByPeriod.values())
}

export async function getDashboardMetrics(
  preset: DashboardRangePreset,
): Promise<DashboardMetrics> {
  const range = getDashboardRange(preset)
  const [
    { data: units, error: unitsError },
    { data: invoices, error: invoicesError },
    { data: reminders, error: remindersError },
    { data: maintenanceTickets, error: maintenanceError },
  ] = await Promise.all([
    supabaseClient.from('units').select('status').returns<UnitMetricsRow[]>(),
    supabaseClient
      .from('invoices')
      .select(
        `
          id,
          billing_period,
          total_amount,
          status,
          payments (
            amount
          )
        `,
      )
      .gte('billing_period', range.startBillingPeriod)
      .lte('billing_period', range.endBillingPeriod)
      .returns<InvoiceMetricsRow[]>(),
    supabaseClient
      .from('reminders')
      .select(
        `
          status,
          invoices (
            billing_period,
            status
          )
        `,
      )
      .returns<ReminderMetricsRow[]>(),
    supabaseClient
      .from('maintenance_tickets')
      .select('status')
      .returns<MaintenanceMetricsRow[]>(),
  ])

  if (unitsError !== null) {
    throw new Error(`Could not load dashboard units: ${unitsError.message}`)
  }

  if (invoicesError !== null) {
    throw new Error(
      `Could not load dashboard invoices: ${invoicesError.message}`,
    )
  }

  if (remindersError !== null) {
    throw new Error(
      `Could not load dashboard reminders: ${remindersError.message}`,
    )
  }

  if (maintenanceError !== null) {
    throw new Error(
      `Could not load dashboard maintenance tickets: ${maintenanceError.message}`,
    )
  }

  const activeInvoices = invoices.filter(
    (invoice) => invoice.status !== 'cancelled',
  )
  const expectedRent = activeInvoices.reduce(
    (total, invoice) => total + invoice.total_amount,
    0,
  )
  const collectedRent = activeInvoices.reduce(
    (total, invoice) => total + sumPayments(invoice.payments),
    0,
  )
  const invoiceStatusCounts = new Map<InvoiceStatus, number>()
  const maintenanceStatusCounts = new Map<MaintenanceTicketStatus, number>()
  const reminderStatusCounts = new Map<ReminderStatus, number>()

  activeInvoices.forEach((invoice) => {
    incrementCount(invoiceStatusCounts, invoice.status)
  })

  maintenanceTickets.forEach((ticket) => {
    incrementCount(maintenanceStatusCounts, ticket.status)
  })

  reminders
    .filter((reminder) => {
      const invoice = reminder.invoices

      return (
        invoice !== null &&
        invoice.status !== 'cancelled' &&
        invoice.billing_period >= range.startBillingPeriod &&
        invoice.billing_period <= range.endBillingPeriod
      )
    })
    .forEach((reminder) => {
      incrementCount(reminderStatusCounts, reminder.status)
    })

  return {
    range,
    totalUnits: units.length,
    occupiedUnits: units.filter((unit) => unit.status === 'occupied').length,
    vacantUnits: units.filter((unit) => unit.status === 'vacant').length,
    expectedRent,
    collectedRent,
    outstandingRent: Math.max(expectedRent - collectedRent, 0),
    attentionInvoiceCount: activeInvoices.filter((invoice) =>
      invoiceAttentionStatuses.has(invoice.status),
    ).length,
    openMaintenanceTicketCount: maintenanceTickets.filter((ticket) =>
      openMaintenanceStatuses.has(ticket.status),
    ).length,
    reminderCounts: {
      draft: reminderStatusCounts.get('draft') ?? 0,
      prepared: reminderStatusCounts.get('prepared') ?? 0,
      sent: reminderStatusCounts.get('sent') ?? 0,
      cancelled: reminderStatusCounts.get('cancelled') ?? 0,
    },
    monthlyCollections: buildMonthlyCollections({
      range,
      invoices,
    }),
    invoiceStatusBreakdown: createBreakdown({
      counts: invoiceStatusCounts,
      labels: {
        draft: 'Draft',
        unpaid: 'Unpaid',
        partially_paid: 'Partially paid',
        paid: 'Paid',
        overdue: 'Overdue',
        cancelled: 'Cancelled',
      },
      colors: statusColors,
    }),
    maintenanceStatusBreakdown: createBreakdown({
      counts: maintenanceStatusCounts,
      labels: {
        open: 'Open',
        in_progress: 'In progress',
        resolved: 'Resolved',
        cancelled: 'Cancelled',
      },
      colors: statusColors,
    }),
    reminderStatusBreakdown: createBreakdown({
      counts: reminderStatusCounts,
      labels: {
        draft: 'Draft',
        prepared: 'Prepared',
        sent: 'Sent',
        cancelled: 'Cancelled',
      },
      colors: statusColors,
    }),
  }
}
```

- [ ] **Step 2: Run build to catch repository type issues**

Run:

```bash
npm run build
```

Expected: PASS. If Supabase nested relation typing differs for `reminders.invoices`, adjust only `ReminderMetricsRow` and the mapping code to match the returned shape.

- [ ] **Step 3: Commit dashboard metrics repository**

Run:

```bash
git add src/modules/dashboard/infrastructure/dashboard-metrics-repository.ts
git commit -m "feat: aggregate dashboard metrics"
```

Expected: commit contains only the repository and aggregation logic.

## Task 4: Dashboard Metrics Query Hook

**Files:**

- Create: `src/modules/dashboard/application/use-dashboard-metrics-query.ts`
- Modify: `src/modules/dashboard/index.ts`

- [ ] **Step 1: Create TanStack Query hook**

Create `src/modules/dashboard/application/use-dashboard-metrics-query.ts`:

```ts
import { useQuery } from '@tanstack/react-query'
import type { DashboardRangePreset } from '../domain/dashboard-metrics'
import {
  dashboardMetricsQueryKey,
  getDashboardMetrics,
} from '../infrastructure/dashboard-metrics-repository'

export function useDashboardMetricsQuery(preset: DashboardRangePreset) {
  return useQuery({
    queryKey: [...dashboardMetricsQueryKey, preset],
    queryFn: () => getDashboardMetrics(preset),
  })
}
```

- [ ] **Step 2: Confirm dashboard index exports the hook**

Ensure `src/modules/dashboard/index.ts` contains:

```ts
export { DashboardPage } from './dashboard-page'
export { DashboardShell } from './dashboard-shell'
export { useDashboardMetricsQuery } from './application/use-dashboard-metrics-query'
export {
  dashboardRangePresets,
  type DashboardBreakdownItem,
  type DashboardMetrics,
  type DashboardRange,
  type DashboardRangePreset,
} from './domain/dashboard-metrics'
```

- [ ] **Step 3: Run build**

Run:

```bash
npm run build
```

Expected: PASS.

- [ ] **Step 4: Commit query hook**

Run:

```bash
git add src/modules/dashboard/application/use-dashboard-metrics-query.ts src/modules/dashboard/index.ts
git commit -m "feat: add dashboard metrics query"
```

Expected: commit contains only the query hook and export changes.

## Task 5: Dashboard UI and Charts

**Files:**

- Modify: `src/modules/dashboard/dashboard-shell.tsx`
- Modify: `src/App.css`

- [ ] **Step 1: Replace dashboard placeholder with operational dashboard UI**

Modify `src/modules/dashboard/dashboard-shell.tsx`:

```tsx
import { useState } from 'react'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  XAxis,
  YAxis,
} from 'recharts'
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from '@/components/ui/chart'
import {
  dashboardRangePresets,
  type DashboardBreakdownItem,
  type DashboardMetrics,
  type DashboardRangePreset,
} from './domain/dashboard-metrics'
import { useDashboardMetricsQuery } from './application/use-dashboard-metrics-query'

const collectionChartConfig = {
  expected: {
    label: 'Expected',
    color: '#2563eb',
  },
  collected: {
    label: 'Collected',
    color: '#16a34a',
  },
} satisfies ChartConfig

function formatCurrency(value: number) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(value)
}

function formatNumber(value: number) {
  return new Intl.NumberFormat('id-ID').format(value)
}

function buildMetricCards(metrics: DashboardMetrics) {
  return [
    {
      id: 'total-units',
      label: 'Total units',
      value: formatNumber(metrics.totalUnits),
      helper: 'Current portfolio state',
    },
    {
      id: 'occupied-units',
      label: 'Occupied units',
      value: formatNumber(metrics.occupiedUnits),
      helper: 'Current unit status',
    },
    {
      id: 'vacant-units',
      label: 'Vacant units',
      value: formatNumber(metrics.vacantUnits),
      helper: 'Current unit status',
    },
    {
      id: 'expected-rent',
      label: 'Expected rent',
      value: formatCurrency(metrics.expectedRent),
      helper: metrics.range.label,
    },
    {
      id: 'collected-rent',
      label: 'Collected rent',
      value: formatCurrency(metrics.collectedRent),
      helper: metrics.range.label,
    },
    {
      id: 'outstanding-rent',
      label: 'Outstanding rent',
      value: formatCurrency(metrics.outstandingRent),
      helper: metrics.range.label,
    },
    {
      id: 'attention-invoices',
      label: 'Invoices needing attention',
      value: formatNumber(metrics.attentionInvoiceCount),
      helper: 'Unpaid, partial, or overdue',
    },
    {
      id: 'open-maintenance',
      label: 'Open maintenance',
      value: formatNumber(metrics.openMaintenanceTicketCount),
      helper: 'Open or in progress',
    },
    {
      id: 'prepared-reminders',
      label: 'Prepared reminders',
      value: formatNumber(metrics.reminderCounts.prepared),
      helper: metrics.range.label,
    },
  ]
}

function EmptyChart({ label }: { label: string }) {
  return <p className="dashboard-shell__empty-chart">{label}</p>
}

function BreakdownChart({
  data,
  emptyLabel,
}: {
  data: DashboardBreakdownItem[]
  emptyLabel: string
}) {
  if (data.length === 0) {
    return <EmptyChart label={emptyLabel} />
  }

  const chartConfig = data.reduce<ChartConfig>((config, item) => {
    config[item.name] = {
      label: item.name,
      color: item.fill,
    }

    return config
  }, {})

  return (
    <ChartContainer config={chartConfig} className="dashboard-shell__pie">
      <PieChart>
        <ChartTooltip content={<ChartTooltipContent nameKey="name" />} />
        <Pie data={data} dataKey="value" nameKey="name" innerRadius={54}>
          {data.map((item) => (
            <Cell key={item.name} fill={item.fill} />
          ))}
        </Pie>
      </PieChart>
    </ChartContainer>
  )
}

export function DashboardShell() {
  const [selectedPreset, setSelectedPreset] =
    useState<DashboardRangePreset>('this-month')
  const metricsQuery = useDashboardMetricsQuery(selectedPreset)

  return (
    <section className="dashboard-shell" aria-labelledby="dashboard-title">
      <div className="dashboard-shell__header">
        <div>
          <h2 id="dashboard-title">Dashboard</h2>
          <p>
            Review rental collection, invoice status, reminders, and maintenance
            workload.
          </p>
        </div>
        <div
          className="dashboard-shell__range"
          role="group"
          aria-label="Dashboard date range"
        >
          {dashboardRangePresets.map((preset) => (
            <button
              key={preset.value}
              type="button"
              className={
                preset.value === selectedPreset
                  ? 'dashboard-shell__range-button dashboard-shell__range-button--active'
                  : 'dashboard-shell__range-button'
              }
              onClick={() => {
                setSelectedPreset(preset.value)
              }}
            >
              {preset.label}
            </button>
          ))}
        </div>
      </div>

      {metricsQuery.isLoading ? (
        <p className="dashboard-shell__status">Loading dashboard metrics...</p>
      ) : null}

      {metricsQuery.isError ? (
        <p className="dashboard-shell__error" role="alert">
          We could not load dashboard metrics right now. Please try again later.
        </p>
      ) : null}

      {metricsQuery.isSuccess ? (
        <>
          <div
            className="dashboard-shell__metrics"
            aria-label="Dashboard metrics"
          >
            {buildMetricCards(metricsQuery.data).map((metric) => (
              <article className="dashboard-shell__metric" key={metric.id}>
                <span>{metric.label}</span>
                <strong>{metric.value}</strong>
                <p>{metric.helper}</p>
              </article>
            ))}
          </div>

          <div className="dashboard-shell__charts">
            <article className="dashboard-shell__chart dashboard-shell__chart--wide">
              <div className="dashboard-shell__chart-header">
                <h3>Collection by month</h3>
                <p>{metricsQuery.data.range.label}</p>
              </div>
              {metricsQuery.data.monthlyCollections.some(
                (item) => item.expected > 0 || item.collected > 0,
              ) ? (
                <ChartContainer
                  config={collectionChartConfig}
                  className="dashboard-shell__bar"
                >
                  <BarChart data={metricsQuery.data.monthlyCollections}>
                    <CartesianGrid vertical={false} />
                    <XAxis dataKey="month" tickLine={false} axisLine={false} />
                    <YAxis
                      tickLine={false}
                      axisLine={false}
                      tickFormatter={(value) =>
                        new Intl.NumberFormat('id-ID', {
                          notation: 'compact',
                          maximumFractionDigits: 1,
                        }).format(Number(value))
                      }
                    />
                    <ChartTooltip
                      content={<ChartTooltipContent indicator="dashed" />}
                    />
                    <Bar
                      dataKey="expected"
                      fill="var(--color-expected)"
                      radius={4}
                    />
                    <Bar
                      dataKey="collected"
                      fill="var(--color-collected)"
                      radius={4}
                    />
                  </BarChart>
                </ChartContainer>
              ) : (
                <EmptyChart label="No collection data for this range." />
              )}
            </article>

            <article className="dashboard-shell__chart">
              <div className="dashboard-shell__chart-header">
                <h3>Invoice status</h3>
                <p>{metricsQuery.data.range.label}</p>
              </div>
              <BreakdownChart
                data={metricsQuery.data.invoiceStatusBreakdown}
                emptyLabel="No invoices for this range."
              />
            </article>

            <article className="dashboard-shell__chart">
              <div className="dashboard-shell__chart-header">
                <h3>Maintenance status</h3>
                <p>Current tickets</p>
              </div>
              <BreakdownChart
                data={metricsQuery.data.maintenanceStatusBreakdown}
                emptyLabel="No maintenance tickets yet."
              />
            </article>

            <article className="dashboard-shell__chart">
              <div className="dashboard-shell__chart-header">
                <h3>Reminder status</h3>
                <p>{metricsQuery.data.range.label}</p>
              </div>
              <BreakdownChart
                data={metricsQuery.data.reminderStatusBreakdown}
                emptyLabel="No reminders for this range."
              />
            </article>
          </div>
        </>
      ) : null}
    </section>
  )
}
```

- [ ] **Step 2: Add dashboard styles**

Modify the existing dashboard section in `src/App.css` by replacing the `.dashboard-shell` block with:

```css
.dashboard-shell {
  display: grid;
  gap: 24px;
  max-width: 1180px;
}

.dashboard-shell__header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 24px;
}

.dashboard-shell__header h2 {
  margin: 0 0 8px;
}

.dashboard-shell__header p,
.dashboard-shell__metric p,
.dashboard-shell__chart-header p,
.dashboard-shell__empty-chart {
  color: var(--text);
}

.dashboard-shell__range {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  justify-content: flex-end;
}

.dashboard-shell__range-button {
  border: 1px solid var(--border);
  border-radius: 8px;
  background: var(--surface);
  color: var(--text-h);
  cursor: pointer;
  font-weight: 600;
  padding: 9px 12px;
}

.dashboard-shell__range-button:hover,
.dashboard-shell__range-button:focus-visible,
.dashboard-shell__range-button--active {
  border-color: #2563eb;
  background: #eff6ff;
  color: #1d4ed8;
}

.dashboard-shell__status,
.dashboard-shell__error {
  border: 1px solid var(--border);
  border-radius: 8px;
  background: var(--surface);
  padding: 18px;
}

.dashboard-shell__error {
  border-color: #fecaca;
  background: #fef2f2;
  color: #991b1b;
}

.dashboard-shell__metrics {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 16px;
}

.dashboard-shell__metric,
.dashboard-shell__chart {
  border: 1px solid var(--border);
  border-radius: 8px;
  background: var(--surface);
  box-shadow: 0 1px 2px rgb(15 23 42 / 0.04);
}

.dashboard-shell__metric {
  display: grid;
  gap: 6px;
  min-height: 136px;
  padding: 18px;
}

.dashboard-shell__metric span {
  color: var(--text);
  font-size: 13px;
  font-weight: 700;
  text-transform: uppercase;
}

.dashboard-shell__metric strong {
  color: var(--text-h);
  font-size: 28px;
  line-height: 1.15;
}

.dashboard-shell__metric p {
  font-size: 14px;
}

.dashboard-shell__charts {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 16px;
}

.dashboard-shell__chart {
  display: grid;
  gap: 16px;
  min-height: 340px;
  padding: 18px;
}

.dashboard-shell__chart--wide {
  grid-column: span 3;
}

.dashboard-shell__chart-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
}

.dashboard-shell__chart-header h3 {
  margin: 0;
  color: var(--text-h);
  font-size: 18px;
}

.dashboard-shell__chart-header p {
  font-size: 14px;
  text-align: right;
}

.dashboard-shell__bar {
  min-height: 280px;
}

.dashboard-shell__pie {
  min-height: 220px;
}

.dashboard-shell__empty-chart {
  display: grid;
  min-height: 220px;
  place-items: center;
  border: 1px dashed var(--border);
  border-radius: 8px;
  font-weight: 600;
  text-align: center;
}
```

- [ ] **Step 3: Extend existing mobile styles**

Inside the existing mobile media query in `src/App.css`, add:

```css
.dashboard-shell__header,
.dashboard-shell__chart-header {
  display: grid;
}

.dashboard-shell__range {
  justify-content: flex-start;
}

.dashboard-shell__metrics,
.dashboard-shell__charts {
  grid-template-columns: 1fr;
}

.dashboard-shell__chart--wide {
  grid-column: auto;
}

.dashboard-shell__chart-header p {
  text-align: left;
}
```

- [ ] **Step 4: Run build and fix type/import issues**

Run:

```bash
npm run build
```

Expected: PASS. If the generated shadcn chart file exports slightly different names, update only the imports in `dashboard-shell.tsx` to match `src/components/ui/chart.tsx`.

- [ ] **Step 5: Run lint**

Run:

```bash
npm run lint
```

Expected: PASS.

- [ ] **Step 6: Commit dashboard UI**

Run:

```bash
git add src/modules/dashboard/dashboard-shell.tsx src/App.css
git commit -m "feat: render dashboard metrics charts"
```

Expected: commit contains only dashboard UI and styles.

## Task 6: Documentation Closeout

**Files:**

- Create: `docs/26-reporting-dashboard-validation-checklist.md`
- Modify: `wiki/03-domain/reporting.md`
- Modify: `wiki/09-status/built.md`
- Modify: `wiki/09-status/not-built.md`
- Modify: `wiki/06-task-breakdown/ready-soon.md`
- Modify: `wiki/06-task-breakdown/task-index.md`
- Modify: `wiki/06-task-breakdown/backlog.md`
- Modify: `wiki/04-roadmap/release-plan.md`

- [ ] **Step 1: Create validation checklist**

Create `docs/26-reporting-dashboard-validation-checklist.md`:

```md
# Reporting / Dashboard Metrics Validation Checklist

Validate the first Reporting / Dashboard metrics slice manually after implementation. This checklist covers `/dashboard` only.

## Scope

- [ ] `/dashboard` loads for authenticated and onboarded users.
- [ ] Unauthenticated users cannot access `/dashboard` and are redirected through the existing route gate.
- [ ] The dashboard shows preset range controls for This month, Last month, Last 3 months, and This year.
- [ ] The default range is This month.
- [ ] Switching preset ranges refreshes period-limited metrics.
- [ ] Unit metrics show current total, occupied, and vacant unit counts.
- [ ] Expected rent uses non-cancelled invoices in the selected billing period range.
- [ ] Collected rent uses payments attached to non-cancelled invoices in the selected billing period range.
- [ ] Outstanding rent is expected minus collected and never below zero.
- [ ] Invoice attention count includes unpaid, partially paid, and overdue invoices in the selected billing period range.
- [ ] Open maintenance count includes open and in-progress tickets.
- [ ] Reminder counts use reminders attached to selected-period invoices.
- [ ] Cancelled invoices do not contribute to expected rent, collected rent, outstanding rent, or invoice attention metrics.
- [ ] Cancelled reminders do not appear as active reminder attention items.
- [ ] Collection chart renders expected versus collected data when invoices or payments exist.
- [ ] Invoice status chart renders when selected-period invoices exist.
- [ ] Maintenance status chart renders when maintenance tickets exist.
- [ ] Reminder status chart renders when reminder records exist for selected-period invoices.
- [ ] Empty chart states render cleanly when no chart data exists.
- [ ] Loading state appears while dashboard metrics are being fetched.
- [ ] Error state appears if dashboard metrics fail to load.
- [ ] Dashboard layout is readable on desktop.
- [ ] Dashboard layout is readable on mobile.
- [ ] Browser console shows no errors during dashboard load or range switching.

## Boundaries

- [ ] No custom date range picker is introduced.
- [ ] No CSV/export is introduced.
- [ ] No Supabase migrations are introduced.
- [ ] No Supabase RPCs or database views are introduced.
- [ ] No invoice, payment, reminder, or maintenance workflow behavior is changed.
- [ ] The rest of the app is not migrated to shadcn/ui.

## Validation Commands

- [ ] `npm run format:check`
- [ ] `npm run build`
- [ ] `npm run lint`
- [ ] `git diff --check`
```

- [ ] **Step 2: Update reporting wiki**

Modify `wiki/03-domain/reporting.md` to state:

```md
# Reporting

Reporting and dashboard metrics summarize existing operational records.

## Current status

First dashboard metrics slice planned for implementation.

## First dashboard slice

The first `/dashboard` reporting slice uses existing records only:

- units
- invoices
- payments
- reminders
- maintenance tickets

It supports preset ranges:

- This month
- Last month
- Last 3 months
- This year

It shows:

- current unit counts
- selected-period expected rent
- selected-period collected rent
- selected-period outstanding rent
- selected-period invoice attention count
- current open maintenance count
- selected-period reminder counts
- simple shadcn/Recharts charts

## Boundaries

Not included in the first slice:

- custom date range picker
- CSV/export
- database views or reporting RPCs
- advanced accounting reports
- automated overdue logic
- workflow changes in billing, payments, reminders, or maintenance

## Related pages

- [[billing]]
- [[payments]]
- [[reminders]]
- [[maintenance]]
```

- [ ] **Step 3: Update status and planning wiki pages**

Edit these pages consistently:

```txt
wiki/09-status/built.md
wiki/09-status/not-built.md
wiki/06-task-breakdown/ready-soon.md
wiki/06-task-breakdown/task-index.md
wiki/06-task-breakdown/backlog.md
wiki/04-roadmap/release-plan.md
```

Required content changes:

```txt
Built:
- Add Reporting / Dashboard Metrics section after Maintenance.
- Mark first slice as planned/implemented only after the implementation task is complete.
- List `/dashboard` as the route.
- List preset ranges, summary cards, and charts.

Not built:
- Keep custom date range picker, CSV/export, database reporting views/RPCs, advanced accounting, automated overdue logic, and broader analytics as not built.

Ready soon:
- Move Reporting / Dashboard metrics from active candidate to completed candidates once implemented and validated.
- Add the next recommended task after dashboard metrics.

Task index:
- Move Reporting / Dashboard metrics planning to completed candidates.
- Add Reporting / Dashboard metrics implementation and validation to completed candidates after those commits exist.
- Add later reporting refinements to later candidates.

Backlog:
- Remove or reword dashboard billing/collection/maintenance metrics entries that are satisfied by this slice.
- Keep advanced reporting refinements in backlog.

Release plan:
- Record that the first reporting/dashboard metrics slice uses existing records and preset ranges.
- Record deferred reporting scope explicitly.
```

- [ ] **Step 4: Run diff check**

Run:

```bash
git diff --check
```

Expected: no whitespace errors.

- [ ] **Step 5: Commit docs closeout**

Run:

```bash
git add docs/26-reporting-dashboard-validation-checklist.md wiki/03-domain/reporting.md wiki/09-status/built.md wiki/09-status/not-built.md wiki/06-task-breakdown/ready-soon.md wiki/06-task-breakdown/task-index.md wiki/06-task-breakdown/backlog.md wiki/04-roadmap/release-plan.md
git commit -m "docs: document reporting dashboard metrics"
```

Expected: commit contains only docs and wiki updates.

## Task 7: Final Validation

**Files:**

- Modify if validation is completed manually: `docs/26-reporting-dashboard-validation-checklist.md`

- [ ] **Step 1: Run format check**

Run:

```bash
npm run format:check
```

Expected: PASS. If formatting fails, run `npm run format`, inspect the diff, and commit formatting changes with the relevant task commit if they are scoped.

- [ ] **Step 2: Run production build**

Run:

```bash
npm run build
```

Expected: PASS with TypeScript and Vite build output.

- [ ] **Step 3: Run lint**

Run:

```bash
npm run lint
```

Expected: PASS.

- [ ] **Step 4: Run whitespace diff check**

Run:

```bash
git diff --check
```

Expected: no whitespace errors.

- [ ] **Step 5: Start local dev server for browser validation**

Run:

```bash
npm run dev
```

Expected: Vite prints a local URL such as `http://localhost:5173/`.

- [ ] **Step 6: Manually validate `/dashboard`**

In the browser:

```txt
1. Sign in as an authenticated and onboarded user.
2. Open /dashboard.
3. Confirm the default range is This month.
4. Switch to Last month.
5. Switch to Last 3 months.
6. Switch to This year.
7. Confirm metric cards update for period-limited metrics.
8. Confirm unit and maintenance current-state cards remain understandable.
9. Confirm collection, invoice, maintenance, and reminder charts render or show empty states.
10. Confirm there are no browser console errors.
11. Confirm mobile layout remains readable at a narrow viewport.
```

- [ ] **Step 7: Record manual validation results if performed**

If manual validation is completed during implementation, update `docs/26-reporting-dashboard-validation-checklist.md` checkboxes that were actually verified. If the owner will validate manually later, leave the boxes unchecked and report that the checklist is ready.

- [ ] **Step 8: Commit validation checklist updates if changed**

Run only if `docs/26-reporting-dashboard-validation-checklist.md` changed:

```bash
git add docs/26-reporting-dashboard-validation-checklist.md
git commit -m "docs: record dashboard metrics validation"
```

Expected: commit contains only validation checklist result changes.

- [ ] **Step 9: Inspect final working tree**

Run:

```bash
git status --short
```

Expected: clean working tree, unless the dev server or local validation produced ignored files.

## Implementation Notes

- Use existing RLS for organization isolation.
- Do not add migrations, SQL files, RPCs, database views, or Edge Functions.
- Do not alter invoice, payment, reminder, receipt, or maintenance workflows.
- Keep chart colors varied and functional; do not make the dashboard a single-hue theme.
- Keep dashboard cards at 8px border radius to match the existing app.
- If shadcn CLI output differs from the code snippets, prefer the generated shadcn file and adapt only local imports and class names needed for this app.
- If dependency installation or `npx shadcn@latest add chart` fails because of network restrictions, rerun the exact failed command with escalation approval.

## Completion Criteria

- `/dashboard` shows preset range controls, metric cards, and charts.
- Metrics derive from existing `units`, `invoices`, `payments`, `reminders`, and `maintenance_tickets`.
- Tailwind, shadcn, and Recharts are set up only as needed for charts.
- Docs and wiki closeout record implemented behavior and deferred scope.
- Required validation commands pass or any failure is clearly documented with the blocking cause.
