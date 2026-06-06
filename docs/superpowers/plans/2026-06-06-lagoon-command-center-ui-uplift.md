# Lagoon Command Center UI Uplift Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the sidebar-based RuangRapi shell with a blue Lagoon Command Center shell, floating bottom navigation, and a denser dashboard layout while preserving routes, data, Recharts, and workflows.

**Architecture:** Keep the redesign in the presentation layer. `app-layout.tsx` owns the shell and navigation markup, `src/index.css` owns lagoon tokens, `src/App.css` owns shell/dashboard styling, and `dashboard-shell.tsx` owns dashboard composition over existing metrics. No repositories, route paths, Supabase code, package files, or chart library dependencies change.

**Tech Stack:** React, TypeScript, Vite, React Router `NavLink`, Lucide React icons, Recharts through existing shadcn chart primitives, CSS tokens in `src/index.css`, global app CSS in `src/App.css`.

---

## File Structure

- Modify `src/app/layouts/app-layout.tsx`
  - Replace sidebar markup with bottom navigation markup.
  - Keep route paths and `NavLink` behavior.
  - Add a More menu for secondary routes on compact widths.
  - Omit the future Units item from primary bottom navigation.
- Modify `src/index.css`
  - Add lagoon color tokens and update base background variables.
  - Keep Plus Jakarta Sans and existing semantic tokens.
- Modify `src/App.css`
  - Replace sidebar/top-shell styling with Lagoon Command Center shell styling.
  - Add fixed bottom nav styling, More menu styling, and global bottom padding.
  - Update dashboard cards/charts to the Lagoon Command Center visual system.
  - Keep non-dashboard work surfaces readable and avoid broad unrelated redesigns.
- Modify `src/modules/dashboard/dashboard-shell.tsx`
  - Add top highlight cards for collection health, occupancy, and attention.
  - Reorganize existing metrics and charts into denser Lagoon Command Center sections.
  - Keep current data hooks, Recharts, chart data, and range behavior.
- Modify documentation and wiki pages for closeout:
  - `wiki/04-roadmap/release-plan.md`
  - `wiki/09-status/built.md`
  - `wiki/09-status/not-built.md`
  - `wiki/06-task-breakdown/task-index.md`
  - `wiki/06-task-breakdown/ready-soon.md`
  - create `docs/27-lagoon-command-center-validation-checklist.md`

---

### Task 1: App Shell Bottom Navigation Markup

**Files:**

- Modify: `src/app/layouts/app-layout.tsx`

- [ ] **Step 1: Replace imports**

Replace the current imports with:

```tsx
import { useState, type ReactNode } from 'react'
import {
  Banknote,
  Bell,
  ClipboardList,
  FileText,
  Home,
  LayoutDashboard,
  MoreHorizontal,
  ReceiptText,
  Users,
  Wrench,
} from 'lucide-react'
import { NavLink } from 'react-router-dom'

import { routePaths } from '../router/route-paths'
```

Expected: `Building2`, `Menu`, and `X` are removed because the sidebar and header menu button are removed.

- [ ] **Step 2: Replace navigation arrays**

Replace `sidebarLinks` and `futureSidebarItems` with:

```tsx
const primaryNavigationItems = [
  {
    label: 'Dashboard',
    path: routePaths.dashboard,
    icon: LayoutDashboard,
  },
  { label: 'Properties', path: routePaths.dashboardProperties, icon: Home },
  { label: 'Tenants', path: routePaths.dashboardTenants, icon: Users },
  { label: 'Invoices', path: routePaths.dashboardInvoices, icon: FileText },
  { label: 'Payments', path: routePaths.dashboardPayments, icon: Banknote },
]

const secondaryNavigationItems = [
  { label: 'Leases', path: routePaths.dashboardLeases, icon: ClipboardList },
  { label: 'Receipts', path: routePaths.dashboardReceipts, icon: ReceiptText },
  { label: 'Reminders', path: routePaths.dashboardReminders, icon: Bell },
  { label: 'Maintenance', path: routePaths.dashboardMaintenance, icon: Wrench },
]
```

Expected: Core routes fit the bottom bar; secondary routes are accessible through More. Units is omitted from this pass.

- [ ] **Step 3: Replace `AppLayout` return markup**

Replace the full `AppLayout` component body with:

```tsx
export function AppLayout({ children }: AppLayoutProps) {
  const [isMoreOpen, setIsMoreOpen] = useState(false)

  return (
    <div className="app-layout">
      <header className="app-header">
        <NavLink className="app-brand" to={routePaths.dashboard}>
          <span className="app-brand__mark" aria-hidden="true">
            RR
          </span>
          <span>
            <span className="app-brand__name">RuangRapi</span>
            <span className="app-brand__tagline">Rental ops with rhythm</span>
          </span>
        </NavLink>

        <div className="app-header__status" aria-label="Workspace status">
          <span>Lagoon command</span>
          <strong>Live ops</strong>
        </div>
      </header>

      <main className="app-main">{children}</main>

      <nav
        className="app-bottom-nav"
        aria-label="Primary app sections"
        id="primary-navigation"
      >
        <ul className="app-bottom-nav__list">
          {primaryNavigationItems.map((item) => {
            const Icon = item.icon

            return (
              <li key={item.path}>
                <NavLink
                  className="app-bottom-nav__item"
                  end={item.path === routePaths.dashboard}
                  to={item.path}
                  onClick={() => {
                    setIsMoreOpen(false)
                  }}
                >
                  <Icon aria-hidden="true" />
                  <span>{item.label}</span>
                </NavLink>
              </li>
            )
          })}
          <li className="app-bottom-nav__more">
            <button
              className={
                isMoreOpen
                  ? 'app-bottom-nav__item app-bottom-nav__item--active'
                  : 'app-bottom-nav__item'
              }
              type="button"
              aria-expanded={isMoreOpen}
              aria-controls="secondary-navigation"
              onClick={() => {
                setIsMoreOpen((current) => !current)
              }}
            >
              <MoreHorizontal aria-hidden="true" />
              <span>More</span>
            </button>
            {isMoreOpen ? (
              <div className="app-bottom-nav__menu" id="secondary-navigation">
                {secondaryNavigationItems.map((item) => {
                  const Icon = item.icon

                  return (
                    <NavLink
                      className="app-bottom-nav__menu-item"
                      key={item.path}
                      to={item.path}
                      onClick={() => {
                        setIsMoreOpen(false)
                      }}
                    >
                      <Icon aria-hidden="true" />
                      <span>{item.label}</span>
                    </NavLink>
                  )
                })}
              </div>
            ) : null}
          </li>
        </ul>
      </nav>
    </div>
  )
}
```

Expected: `header`, `main`, and `nav` landmarks remain. Primary route paths are unchanged. The More menu closes after navigation.

- [ ] **Step 4: Run build**

Run:

```bash
npm run build
```

Expected: Build succeeds. Fix only TypeScript/JSX errors introduced in this task.

- [ ] **Step 5: Commit shell markup**

Run:

```bash
git add src/app/layouts/app-layout.tsx
git commit -m "feat: add lagoon bottom navigation shell"
```

Expected: Commit includes only `src/app/layouts/app-layout.tsx`.

---

### Task 2: Lagoon Tokens and App Shell CSS

**Files:**

- Modify: `src/index.css`
- Modify: `src/App.css`

- [ ] **Step 1: Add lagoon tokens in `src/index.css`**

Inside `:root`, after `--mint`, add:

```css
--lagoon-50: #f0f9ff;
--lagoon-100: #e0f7ff;
--lagoon-200: #bae6fd;
--lagoon-300: #7dd3fc;
--lagoon-400: #38bdf8;
--lagoon-500: #0ea5e9;
--lagoon-600: #0284c7;
--lagoon-700: #0369a1;
--lagoon-900: #082f49;
--lagoon-bg: #e0f7ff;
--lagoon-surface: rgba(255, 255, 255, 0.86);
--lagoon-glass: rgba(255, 255, 255, 0.72);
--lagoon-nav: rgba(8, 47, 73, 0.9);
```

Then update these existing variables:

```css
--bg: var(--lagoon-bg);
--surface-subtle: #f0f9ff;
--border: #bfdbfe;
--border-strong: #7dd3fc;
--indigo: #4f46e5;
--teal: #0284c7;
--mint: #38bdf8;
--accent: #dbeafe;
--accent-foreground: #1e3a8a;
--secondary: #e0f2fe;
--secondary-foreground: #075985;
--ring: #38bdf8;
--input: #93c5fd;
```

Expected: The app gets a blue-forward token set while preserving semantic token names used elsewhere.

- [ ] **Step 2: Update `body` background in `src/index.css`**

Replace the current `body` background with:

```css
background:
  radial-gradient(circle at 12% 4%, rgb(14 165 233 / 0.34), transparent 30%),
  radial-gradient(circle at 88% 0%, rgb(37 99 235 / 0.22), transparent 28%),
  radial-gradient(circle at 52% 86%, rgb(45 212 191 / 0.2), transparent 34%),
  linear-gradient(180deg, #e0f7ff 0%, #eef6ff 44%, #f8fbff 100%);
```

Expected: The global workspace background becomes lagoon-blue.

- [ ] **Step 3: Replace top app layout CSS block in `src/App.css`**

Replace the CSS from `.app-layout {` through `.app-main { ... }` with:

```css
.app-layout {
  min-height: 100svh;
  background: transparent;
  color: var(--text);
}

.app-header {
  position: sticky;
  z-index: 30;
  top: 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  border-bottom: 1px solid rgb(255 255 255 / 0.62);
  padding: 16px 28px;
  background: color-mix(in srgb, var(--lagoon-glass) 88%, transparent);
  backdrop-filter: blur(18px);
}

.app-brand {
  display: inline-flex;
  align-items: center;
  gap: 12px;
  min-width: 0;
  color: var(--text-h);
  text-decoration: none;
}

.app-brand__mark {
  display: grid;
  width: 46px;
  height: 46px;
  flex: 0 0 auto;
  place-items: center;
  border: 1px solid rgb(255 255 255 / 0.42);
  border-radius: 18px;
  color: #ffffff;
  background: linear-gradient(135deg, var(--lagoon-500), var(--indigo));
  font-size: 13px;
  font-weight: 900;
  box-shadow: 0 18px 36px rgb(2 132 199 / 0.24);
}

.app-brand__name,
.app-brand__tagline {
  display: block;
}

.app-brand__name {
  color: var(--text-h);
  font-size: 18px;
  font-weight: 900;
  line-height: 1.15;
}

.app-brand__tagline {
  color: var(--lagoon-700);
  font-size: 12px;
  font-weight: 800;
}

.app-header__status {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  border: 1px solid rgb(255 255 255 / 0.72);
  border-radius: 999px;
  padding: 8px 12px;
  background: rgb(255 255 255 / 0.76);
  box-shadow: var(--shadow-card);
}

.app-header__status span {
  color: var(--lagoon-700);
  font-size: 12px;
  font-weight: 900;
  text-transform: uppercase;
}

.app-header__status strong {
  color: var(--text-h);
  font-size: 13px;
}

.app-main {
  min-width: 0;
  padding: 24px 28px 128px;
}
```

Expected: The old sidebar layout CSS at the top is gone and main content reserves bottom nav space.

- [ ] **Step 4: Add bottom nav CSS after `.app-main`**

Add:

```css
.app-bottom-nav {
  position: fixed;
  z-index: 40;
  left: 50%;
  bottom: 22px;
  width: min(calc(100% - 32px), 760px);
  transform: translateX(-50%);
  border: 1px solid rgb(255 255 255 / 0.18);
  border-radius: 999px;
  padding: 9px;
  background: var(--lagoon-nav);
  box-shadow: 0 24px 58px rgb(8 47 73 / 0.34);
  backdrop-filter: blur(18px);
}

.app-bottom-nav__list {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  list-style: none;
  margin: 0;
  padding: 0;
}

.app-bottom-nav__item,
.app-bottom-nav__menu-item {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  border: 0;
  border-radius: 999px;
  min-height: 48px;
  color: #dbeafe;
  background: transparent;
  font: inherit;
  font-size: 13px;
  font-weight: 900;
  text-decoration: none;
  cursor: pointer;
  white-space: nowrap;
}

.app-bottom-nav__item {
  width: 48px;
  padding: 0;
}

.app-bottom-nav__item svg,
.app-bottom-nav__menu-item svg {
  width: 19px;
  height: 19px;
  flex: 0 0 auto;
}

.app-bottom-nav__item span {
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip: rect(0 0 0 0);
  white-space: nowrap;
}

.app-bottom-nav__item:hover,
.app-bottom-nav__item:focus-visible {
  color: #ffffff;
  background: rgb(255 255 255 / 0.12);
}

.app-bottom-nav__item.active,
.app-bottom-nav__item--active {
  width: auto;
  min-width: 112px;
  padding: 0 16px;
  color: var(--lagoon-900);
  background: var(--lagoon-400);
  box-shadow: 0 14px 30px rgb(56 189 248 / 0.28);
}

.app-bottom-nav__item.active span,
.app-bottom-nav__item--active span {
  position: static;
  width: auto;
  height: auto;
  overflow: visible;
  clip: auto;
}

.app-bottom-nav__more {
  position: relative;
}

.app-bottom-nav__menu {
  position: absolute;
  right: 0;
  bottom: calc(100% + 12px);
  display: grid;
  gap: 6px;
  min-width: 190px;
  border: 1px solid rgb(255 255 255 / 0.24);
  border-radius: 22px;
  padding: 8px;
  background: rgb(8 47 73 / 0.94);
  box-shadow: 0 22px 44px rgb(8 47 73 / 0.34);
}

.app-bottom-nav__menu-item {
  justify-content: flex-start;
  min-height: 42px;
  padding: 0 12px;
}

.app-bottom-nav__menu-item:hover,
.app-bottom-nav__menu-item:focus-visible,
.app-bottom-nav__menu-item.active {
  color: #ffffff;
  background: rgb(255 255 255 / 0.12);
}
```

Expected: Navigation floats at bottom center, active primary item expands, secondary routes are available through More.

- [ ] **Step 5: Remove obsolete sidebar/menu CSS rules from later design-system blocks**

In `src/App.css`, remove or update later selectors for:

```css
.app-sidebar
.app-sidebar li
.app-sidebar a
.app-sidebar a:hover
.app-sidebar a:focus-visible
.app-sidebar a.active
.app-sidebar__coming-soon
.app-header__menu
.app-header__menu:hover
.app-header__menu:focus-visible
```

Expected: No obsolete sidebar/menu selector changes the new bottom navigation. `rg -n "app-sidebar|app-header__menu" src/App.css src/app/layouts/app-layout.tsx` returns no matches.

- [ ] **Step 6: Update mobile shell CSS**

In the `@media (max-width: 720px)` block, replace old `.app-header`, `.app-main`, `.app-sidebar`, and menu rules with:

```css
@media (max-width: 720px) {
  .app-header {
    padding: 14px 18px;
  }

  .app-brand__tagline,
  .app-header__status span {
    display: none;
  }

  .app-main {
    padding: 18px 18px 122px;
  }

  .app-bottom-nav {
    bottom: 14px;
    width: min(calc(100% - 20px), 520px);
    border-radius: 28px;
  }

  .app-bottom-nav__list {
    gap: 5px;
  }

  .app-bottom-nav__item {
    width: 44px;
    min-height: 44px;
  }

  .app-bottom-nav__item.active,
  .app-bottom-nav__item--active {
    min-width: 96px;
    padding: 0 12px;
  }
}
```

Expected: Mobile shell no longer references sidebar and keeps enough bottom padding.

- [ ] **Step 7: Run checks**

Run:

```bash
npm run format:check
npm run build
```

Expected: Both pass. If formatting fails, run `npm run format`, review the diff, and rerun `npm run format:check`.

- [ ] **Step 8: Commit lagoon shell styling**

Run:

```bash
git add src/index.css src/App.css
git commit -m "feat: style lagoon command shell"
```

Expected: Commit includes only `src/index.css` and `src/App.css`.

---

### Task 3: Dashboard Lagoon Composition

**Files:**

- Modify: `src/modules/dashboard/dashboard-shell.tsx`
- Modify: `src/App.css`

- [ ] **Step 1: Add dashboard highlight types and helpers**

In `src/modules/dashboard/dashboard-shell.tsx`, below `DashboardMetricCardView`, add:

```tsx
type DashboardHighlightTone = 'collection' | 'occupancy' | 'attention'

type DashboardHighlight = {
  id: string
  label: string
  value: string
  helper: string
  tone: DashboardHighlightTone
}
```

Below `formatNumber`, add:

```tsx
function formatPercent(value: number) {
  return new Intl.NumberFormat('id-ID', {
    maximumFractionDigits: 0,
    style: 'percent',
  }).format(value)
}

function calculateOccupancyRate(metrics: DashboardMetrics) {
  if (metrics.totalUnits === 0) {
    return 0
  }

  return metrics.occupiedUnits / metrics.totalUnits
}

function buildDashboardHighlights(
  metrics: DashboardMetrics,
): DashboardHighlight[] {
  const attentionTotal =
    metrics.attentionInvoiceCount +
    metrics.openMaintenanceTicketCount +
    metrics.reminderCounts.prepared

  return [
    {
      id: 'collection-health',
      label: 'Collection health',
      value: formatCurrency(metrics.collectedRent),
      helper: `Collected in ${metrics.range.label}`,
      tone: 'collection',
    },
    {
      id: 'occupancy',
      label: 'Occupancy',
      value: formatPercent(calculateOccupancyRate(metrics)),
      helper: `${formatNumber(metrics.occupiedUnits)} of ${formatNumber(metrics.totalUnits)} units occupied`,
      tone: 'occupancy',
    },
    {
      id: 'attention',
      label: 'Needs attention',
      value: formatNumber(attentionTotal),
      helper: 'Invoices, tickets, and prepared reminders',
      tone: attentionTotal > 0 ? 'attention' : 'occupancy',
    },
  ]
}
```

Expected: Highlight cards use only existing dashboard metrics and no new data sources.

- [ ] **Step 2: Add `DashboardHighlights` component**

Below `CollectionLegend`, add:

```tsx
function DashboardHighlights({ metrics }: { metrics: DashboardMetrics }) {
  return (
    <div
      className="dashboard-shell__highlights"
      aria-label="Dashboard highlights"
    >
      {buildDashboardHighlights(metrics).map((highlight) => (
        <article
          className={`dashboard-shell__highlight dashboard-shell__highlight--${highlight.tone}`}
          key={highlight.id}
        >
          <span>{highlight.label}</span>
          <strong>{highlight.value}</strong>
          <p>{highlight.helper}</p>
        </article>
      ))}
    </div>
  )
}
```

Expected: Highlight cards are non-clickable and presentation-only.

- [ ] **Step 3: Reorganize success markup**

Inside `metricsQuery.isSuccess`, replace the fragment contents with:

```tsx
          <DashboardHighlights metrics={metricsQuery.data} />

          <div className="dashboard-shell__command-grid">
            <article className="dashboard-shell__chart dashboard-shell__chart--wide dashboard-shell__chart--collection">
              <div className="dashboard-shell__chart-header">
                <h3>Collection by month</h3>
                <p>{metricsQuery.data.range.label}</p>
                <CollectionLegend />
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
                      radius={8}
                    />
                    <Bar
                      dataKey="collected"
                      fill="var(--color-collected)"
                      radius={8}
                    />
                  </BarChart>
                </ChartContainer>
              ) : (
                <EmptyChart label="No collection data for this range." />
              )}
            </article>

            <section className="dashboard-shell__attention-panel">
              <div className="dashboard-shell__attention-header">
                <h3>Attention queue</h3>
                <p>Current workload signals</p>
              </div>
              <div className="dashboard-shell__attention-list">
                {buildMetricGroups(metricsQuery.data)[2].metrics.map((metric) => (
                  <article
                    className={`dashboard-shell__attention-item dashboard-shell__attention-item--${metric.tone}`}
                    key={metric.id}
                  >
                    <span>{metric.label}</span>
                    <strong>{metric.value}</strong>
                    <p>{metric.helper}</p>
                  </article>
                ))}
              </div>
            </section>
          </div>

          <div
            className="dashboard-shell__metric-groups"
            aria-label="Dashboard metrics"
          >
            {buildMetricGroups(metricsQuery.data).map((group) => (
              <section className="dashboard-shell__metric-group" key={group.id}>
                <div className="dashboard-shell__metric-group-header">
                  <h3>{group.title}</h3>
                  <p>{group.summary}</p>
                </div>
                <div className="dashboard-shell__metrics">
                  {group.metrics.map((metric) => (
                    <article
                      className={`dashboard-shell__metric dashboard-shell__metric--${metric.tone}`}
                      key={metric.id}
                    >
                      <span>{metric.label}</span>
                      <strong>{metric.value}</strong>
                      <p>{metric.helper}</p>
                    </article>
                  ))}
                </div>
              </section>
            ))}
          </div>

          <div className="dashboard-shell__charts dashboard-shell__charts--compact">
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
```

Expected: Existing chart/data rendering remains, but collection chart and attention queue move up into a denser command-grid layout.

- [ ] **Step 4: Add dashboard composition CSS**

In `src/App.css`, update dashboard styles by adding these blocks after `.dashboard-shell__range-button--active`:

```css
.dashboard-shell__highlights {
  display: grid;
  grid-template-columns: minmax(0, 1.35fr) repeat(2, minmax(0, 0.85fr));
  gap: 14px;
  min-width: 0;
}

.dashboard-shell__highlight {
  display: grid;
  gap: 10px;
  min-width: 0;
  min-height: 150px;
  border: 1px solid rgb(255 255 255 / 0.78);
  border-radius: 28px;
  padding: 22px;
  background: var(--lagoon-surface);
  box-shadow: var(--shadow-card);
}

.dashboard-shell__highlight span {
  color: var(--lagoon-700);
  font-size: 12px;
  font-weight: 900;
  letter-spacing: 0.06em;
  text-transform: uppercase;
}

.dashboard-shell__highlight strong {
  color: var(--text-h);
  font-size: 38px;
  font-weight: 900;
  line-height: 1;
  overflow-wrap: anywhere;
}

.dashboard-shell__highlight p {
  color: var(--text);
  font-size: 14px;
  font-weight: 700;
}

.dashboard-shell__highlight--collection {
  color: #ffffff;
  background: linear-gradient(135deg, var(--lagoon-700), #2563eb);
  box-shadow: 0 22px 44px rgb(2 132 199 / 0.28);
}

.dashboard-shell__highlight--collection span,
.dashboard-shell__highlight--collection strong,
.dashboard-shell__highlight--collection p {
  color: #ffffff;
}

.dashboard-shell__highlight--attention span {
  color: var(--orange);
}

.dashboard-shell__command-grid {
  display: grid;
  grid-template-columns: minmax(0, 1.35fr) minmax(280px, 0.65fr);
  gap: 16px;
  min-width: 0;
}

.dashboard-shell__chart--collection {
  grid-column: auto;
  min-height: 320px;
}

.dashboard-shell__attention-panel {
  display: grid;
  align-content: start;
  gap: 14px;
  min-width: 0;
  border: 1px solid var(--border);
  border-radius: var(--radius-xl);
  padding: 20px;
  background: var(--lagoon-surface);
  box-shadow: var(--shadow-card);
}

.dashboard-shell__attention-header h3 {
  margin: 0 0 4px;
  color: var(--text-h);
  font-size: 18px;
  font-weight: 900;
}

.dashboard-shell__attention-header p {
  color: var(--text);
  font-size: 14px;
  font-weight: 700;
}

.dashboard-shell__attention-list {
  display: grid;
  gap: 10px;
}

.dashboard-shell__attention-item {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  gap: 4px 12px;
  border-radius: 16px;
  padding: 12px;
  background: rgb(255 255 255 / 0.72);
}

.dashboard-shell__attention-item span,
.dashboard-shell__attention-item p {
  min-width: 0;
  color: var(--text);
  font-size: 12px;
  font-weight: 800;
}

.dashboard-shell__attention-item span {
  color: var(--text-h);
}

.dashboard-shell__attention-item strong {
  grid-row: span 2;
  color: var(--text-h);
  font-size: 24px;
  font-weight: 900;
}

.dashboard-shell__attention-item--attention {
  background: #fff7ed;
}

.dashboard-shell__charts--compact {
  grid-template-columns: repeat(3, minmax(0, 1fr));
}
```

Expected: Dashboard now has the Lagoon mockup structure.

- [ ] **Step 5: Update dashboard responsive CSS**

Inside `@media (max-width: 980px)`, add:

```css
.dashboard-shell__highlights,
.dashboard-shell__command-grid,
.dashboard-shell__charts--compact {
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.dashboard-shell__highlight--collection,
.dashboard-shell__chart--collection {
  grid-column: span 2;
}
```

Inside `@media (max-width: 720px)`, add:

```css
.dashboard-shell__highlights,
.dashboard-shell__command-grid,
.dashboard-shell__charts--compact {
  grid-template-columns: minmax(0, 1fr);
}

.dashboard-shell__highlight--collection,
.dashboard-shell__chart--collection {
  grid-column: span 1;
}
```

Inside `@media (max-width: 640px)`, add:

```css
.dashboard-shell__highlight {
  min-height: 132px;
  padding: 18px;
}

.dashboard-shell__highlight strong {
  font-size: 32px;
}
```

Expected: Dashboard does not overlap or horizontally scroll on mobile.

- [ ] **Step 6: Run checks**

Run:

```bash
npm run format:check
npm run build
```

Expected: Both pass.

- [ ] **Step 7: Commit dashboard composition**

Run:

```bash
git add src/modules/dashboard/dashboard-shell.tsx src/App.css
git commit -m "feat: densify lagoon dashboard"
```

Expected: Commit includes only dashboard markup and dashboard CSS.

---

### Task 4: Documentation Closeout

**Files:**

- Create: `docs/27-lagoon-command-center-validation-checklist.md`
- Modify: `wiki/04-roadmap/release-plan.md`
- Modify: `wiki/09-status/built.md`
- Modify: `wiki/09-status/not-built.md`
- Modify: `wiki/06-task-breakdown/task-index.md`
- Modify: `wiki/06-task-breakdown/ready-soon.md`

- [ ] **Step 1: Create validation checklist**

Create `docs/27-lagoon-command-center-validation-checklist.md`:

```md
# Lagoon Command Center Validation Checklist

Status: implementation pending manual validation.

## Scope

- [ ] Product shell uses Lagoon Command Center visual direction.
- [ ] Persistent left sidebar is removed.
- [ ] Floating bottom navigation appears on authenticated app routes.
- [ ] Primary routes remain unchanged.
- [ ] Secondary routes remain available through More navigation.
- [ ] Dashboard uses dense Lagoon Command Center composition.
- [ ] Recharts remains the dashboard chart library.
- [ ] ApexCharts is not introduced.
- [ ] No new dashboard metrics are introduced.
- [ ] No custom date ranges, exports, saved reports, or drilldowns are introduced.

## Manual Validation

- [ ] Desktop dashboard renders without overlap.
- [ ] Tablet dashboard renders without overlap.
- [ ] Mobile dashboard renders without horizontal scrolling.
- [ ] Bottom nav does not cover page content.
- [ ] Active bottom nav route is visible.
- [ ] Bottom nav keyboard focus is visible.
- [ ] More menu opens, closes, and navigates to secondary routes.
- [ ] One list page remains readable.
- [ ] One form page remains readable.
- [ ] One detail or receipt page remains readable.
- [ ] Auth or sign-in route remains readable.
- [ ] Browser console shows no errors during navigation.

## Deferred

- ApexCharts evaluation
- chart drilldowns
- custom reporting date ranges
- chart/image export
- saved reports
- new dashboard metrics
```

Expected: Checklist captures task boundaries and manual validation.

- [ ] **Step 2: Update release plan**

In `wiki/04-roadmap/release-plan.md`:

- Add `Lagoon Command Center shell/dashboard uplift` to the built list after `Dashboard/reporting UI/UX polish`.
- Update the design-system baseline paragraph so Lagoon Command Center is the active shell/dashboard visual direction.
- Record that Recharts remains in use and ApexCharts is deferred to future advanced reporting.

Expected: Release plan reflects the new active visual direction without claiming advanced reporting features.

- [ ] **Step 3: Update built/not-built status**

In `wiki/09-status/built.md`, add to Foundation or Reporting:

```md
- Lagoon Command Center shell/dashboard visual direction
- floating rounded bottom navigation replacing the persistent sidebar
- Recharts retained for dashboard charts
```

In `wiki/09-status/not-built.md`, ensure Reporting / Dashboard Metrics still lists:

```md
- ApexCharts evaluation or migration
- custom date range picker
- CSV/export
- saved reports
- chart drilldowns
- cross-module workflow changes from dashboard cards
```

Expected: Built and not-built status pages agree.

- [ ] **Step 4: Update task planning pages**

In `wiki/06-task-breakdown/task-index.md`, add `Lagoon Command Center UI uplift` to Completed candidates.

In `wiki/06-task-breakdown/ready-soon.md`, add `Lagoon Command Center UI uplift` to Completed candidates and keep the next likely candidate as choosing a focused MVP gap from the remaining bucket.

Expected: No new implementation candidate is accidentally approved.

- [ ] **Step 5: Run checks**

Run:

```bash
npm run format:check
git diff --check
```

Expected: Both pass.

- [ ] **Step 6: Commit docs closeout**

Run:

```bash
git add docs/27-lagoon-command-center-validation-checklist.md wiki/04-roadmap/release-plan.md wiki/09-status/built.md wiki/09-status/not-built.md wiki/06-task-breakdown/task-index.md wiki/06-task-breakdown/ready-soon.md
git commit -m "docs: close lagoon command center uplift"
```

Expected: Commit includes only the listed docs/wiki files.

---

### Task 5: Final Verification and Browser Review

**Files:**

- Read: all files changed by Tasks 1-4

- [ ] **Step 1: Run required automated checks**

Run:

```bash
npm run format:check
npm run build
npm run lint
git diff --check
```

Expected: All commands pass.

- [ ] **Step 2: Start dev server**

Run:

```bash
npm run dev
```

Expected: Vite prints a local URL, usually `http://localhost:5173/`.

- [ ] **Step 3: Browser/manual review**

Validate these routes and states:

```md
- `/dashboard` desktop shell and dashboard.
- `/dashboard` tablet width.
- `/dashboard` mobile width.
- Bottom nav active states.
- Bottom nav keyboard focus.
- More menu opens and routes to Leases, Receipts, Reminders, Maintenance.
- `/dashboard/properties` remains readable.
- One create/edit form remains readable.
- One receipt/detail page remains readable.
- `/auth` or sign-in route remains readable.
- Content is not hidden behind the bottom nav.
- Browser console has no errors during route navigation.
```

Expected: Manual review passes or produces concrete fixes.

- [ ] **Step 4: Stop dev server**

Stop Vite. If the PTY cannot receive `Ctrl-C`, identify the listener with:

```bash
lsof -tiTCP:5173 -sTCP:LISTEN
```

Then stop only that PID.

Expected: No dev server remains running.

- [ ] **Step 5: Final repository check**

Run:

```bash
git status --short
git log --oneline -8
```

Expected: Working tree is clean. Recent commits include shell markup, lagoon styling, dashboard composition, docs closeout, and any review fixes.

- [ ] **Step 6: Final response**

Final response must include:

```md
- Summary of shell/dashboard changes.
- Chart library decision: Recharts kept, ApexCharts deferred.
- Files changed.
- Validation commands and results.
- Manual browser review status.
- Deferred scope.
```

Expected: User has a clear closeout with evidence and known limitations.
