# Dashboard / Reporting UI/UX Polish Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Polish the existing `/dashboard` reporting UI with richer in-place interactions, clearer hierarchy, better responsive behavior, and improved status surfaces without changing dashboard data, routes, or workflows.

**Architecture:** Keep the work inside the dashboard presentation layer. Refactor `DashboardShell` only enough to express metric groups, tone, and chart surface metadata clearly, then apply dashboard-specific CSS using the existing Joyful Premium Ops tokens. Close out documentation after implementation and verification.

**Tech Stack:** React, TypeScript, Vite, Recharts, shadcn chart primitives, CSS in `src/App.css`, existing Plus Jakarta Sans and Joyful Premium Ops tokens.

---

## File Structure

- Modify `src/modules/dashboard/dashboard-shell.tsx`
  - Add presentational metric metadata.
  - Group existing metric cards into portfolio, collection, and attention sections.
  - Add non-clicking chart legends and richer status surfaces.
  - Preserve existing hooks, query keys, metrics, route behavior, and chart data.
- Modify `src/App.css`
  - Replace the current flat dashboard card, range, chart, loading, empty, and error styles.
  - Add responsive dashboard breakpoints.
  - Keep CSS scoped to `.dashboard-shell*` selectors.
- Modify `docs/26-reporting-dashboard-validation-checklist.md`
  - Record that the deferred dashboard/reporting UI/UX polish item has been completed separately from the functional validation pass.
- Modify `wiki/03-domain/reporting.md`
  - Record completed in-place dashboard polish and deferred advanced reporting features.
- Modify `wiki/04-roadmap/release-plan.md`
  - Move dashboard/reporting UI/UX polish out of deferred reporting scope.
- Modify `wiki/06-task-breakdown/ready-soon.md`
  - Mark the chosen candidate as completed and identify the next candidate bucket.
- Modify `wiki/06-task-breakdown/task-index.md`
  - Move “Dashboard/reporting UI/UX polish based on the Joyful Premium Ops foundation” from later candidates to completed candidates.
- Modify `wiki/09-status/built.md`
  - Add dashboard/reporting UI/UX polish to the built reporting baseline.
- Modify `wiki/09-status/not-built.md`
  - Remove dashboard/reporting UI/UX polish from not-built reporting scope while leaving custom ranges, exports, saved reports, drilldowns, and cross-module workflow links deferred.

---

### Task 1: Refactor Dashboard Presentation Markup

**Files:**
- Modify: `src/modules/dashboard/dashboard-shell.tsx`

- [ ] **Step 1: Add presentational metric types near the imports**

Add these types below the imports and above `collectionChartConfig`:

```ts
type DashboardMetricTone = 'neutral' | 'positive' | 'warning' | 'attention'

type DashboardMetricGroup = {
  id: string
  title: string
  summary: string
  metrics: DashboardMetricCardView[]
}

type DashboardMetricCardView = {
  id: string
  label: string
  value: string
  helper: string
  tone: DashboardMetricTone
}
```

Expected: TypeScript knows this metadata is presentation-only and independent from `DashboardMetrics`.

- [ ] **Step 2: Replace `buildMetricCards` with grouped metric metadata**

Replace the existing `buildMetricCards(metrics: DashboardMetrics)` function with:

```ts
function buildMetricGroups(metrics: DashboardMetrics): DashboardMetricGroup[] {
  return [
    {
      id: 'portfolio',
      title: 'Portfolio state',
      summary: 'Current unit availability',
      metrics: [
        {
          id: 'total-units',
          label: 'Total units',
          value: formatNumber(metrics.totalUnits),
          helper: 'Current portfolio',
          tone: 'neutral',
        },
        {
          id: 'occupied-units',
          label: 'Occupied units',
          value: formatNumber(metrics.occupiedUnits),
          helper: 'Currently occupied',
          tone: 'positive',
        },
        {
          id: 'vacant-units',
          label: 'Vacant units',
          value: formatNumber(metrics.vacantUnits),
          helper: 'Available to fill',
          tone: metrics.vacantUnits > 0 ? 'warning' : 'positive',
        },
      ],
    },
    {
      id: 'collection',
      title: 'Collection health',
      summary: metrics.range.label,
      metrics: [
        {
          id: 'expected-rent',
          label: 'Expected rent',
          value: formatCurrency(metrics.expectedRent),
          helper: metrics.range.label,
          tone: 'neutral',
        },
        {
          id: 'collected-rent',
          label: 'Collected rent',
          value: formatCurrency(metrics.collectedRent),
          helper: metrics.range.label,
          tone: 'positive',
        },
        {
          id: 'outstanding-rent',
          label: 'Outstanding rent',
          value: formatCurrency(metrics.outstandingRent),
          helper: metrics.range.label,
          tone: metrics.outstandingRent > 0 ? 'attention' : 'positive',
        },
      ],
    },
    {
      id: 'attention',
      title: 'Attention workload',
      summary: 'Records to monitor',
      metrics: [
        {
          id: 'attention-invoices',
          label: 'Invoices needing attention',
          value: formatNumber(metrics.attentionInvoiceCount),
          helper: 'Unpaid, partial, or overdue',
          tone: metrics.attentionInvoiceCount > 0 ? 'attention' : 'positive',
        },
        {
          id: 'open-maintenance',
          label: 'Open maintenance',
          value: formatNumber(metrics.openMaintenanceTicketCount),
          helper: 'Open or in progress',
          tone:
            metrics.openMaintenanceTicketCount > 0 ? 'warning' : 'positive',
        },
        {
          id: 'prepared-reminders',
          label: 'Prepared reminders',
          value: formatNumber(metrics.reminderCounts.prepared),
          helper: metrics.range.label,
          tone: metrics.reminderCounts.prepared > 0 ? 'warning' : 'neutral',
        },
      ],
    },
  ]
}
```

Expected: The same nine metric values render from the same source data, with no new business rules beyond presentation tones.

- [ ] **Step 3: Add chart legend helper functions**

Add these helpers below `EmptyChart`:

```tsx
function ChartLegendList({ data }: { data: DashboardBreakdownItem[] }) {
  if (data.length === 0) {
    return null
  }

  return (
    <ul className="dashboard-shell__legend" aria-label="Chart legend">
      {data.map((item) => (
        <li key={item.name}>
          <span
            className="dashboard-shell__legend-swatch"
            style={{ backgroundColor: item.fill }}
            aria-hidden="true"
          />
          <span>{item.name}</span>
          <strong>{formatNumber(item.value)}</strong>
        </li>
      ))}
    </ul>
  )
}

function CollectionLegend() {
  return (
    <ul className="dashboard-shell__legend dashboard-shell__legend--inline">
      <li>
        <span
          className="dashboard-shell__legend-swatch dashboard-shell__legend-swatch--expected"
          aria-hidden="true"
        />
        <span>Expected</span>
      </li>
      <li>
        <span
          className="dashboard-shell__legend-swatch dashboard-shell__legend-swatch--collected"
          aria-hidden="true"
        />
        <span>Collected</span>
      </li>
    </ul>
  )
}
```

Expected: Legends are presentational only and do not add click behavior.

- [ ] **Step 4: Update `BreakdownChart` to render a chart and legend together**

Replace the successful return in `BreakdownChart` with:

```tsx
  return (
    <div className="dashboard-shell__breakdown">
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
      <ChartLegendList data={data} />
    </div>
  )
```

Expected: Existing pie charts render with the same data and a readable static legend.

- [ ] **Step 5: Replace the loading state markup**

Replace:

```tsx
      {metricsQuery.isLoading ? (
        <p className="dashboard-shell__status">Loading dashboard metrics...</p>
      ) : null}
```

with:

```tsx
      {metricsQuery.isLoading ? (
        <div className="dashboard-shell__status" aria-live="polite">
          <span className="dashboard-shell__status-kicker">Loading</span>
          <strong>Preparing dashboard metrics</strong>
          <p>Collection, invoice, reminder, and maintenance summaries are being loaded.</p>
        </div>
      ) : null}
```

Expected: Loading remains non-blocking and accessible.

- [ ] **Step 6: Replace the error state markup**

Replace:

```tsx
      {metricsQuery.isError ? (
        <p className="dashboard-shell__error" role="alert">
          We could not load dashboard metrics right now. Please try again later.
        </p>
      ) : null}
```

with:

```tsx
      {metricsQuery.isError ? (
        <div className="dashboard-shell__error" role="alert">
          <span className="dashboard-shell__status-kicker">Dashboard unavailable</span>
          <strong>We could not load dashboard metrics right now.</strong>
          <p>Please try again later.</p>
        </div>
      ) : null}
```

Expected: Error keeps `role="alert"` and remains high-contrast.

- [ ] **Step 7: Replace the metric card rendering block**

Replace the current `dashboard-shell__metrics` block with:

```tsx
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
```

Expected: Cards are grouped but remain non-clickable articles.

- [ ] **Step 8: Add collection legend in the collection chart header**

Inside the `Collection by month` chart header, after `<p>{metricsQuery.data.range.label}</p>`, add:

```tsx
                <CollectionLegend />
```

Expected: The bar chart explains Expected and Collected without relying only on tooltip discovery.

- [ ] **Step 9: Run TypeScript build for this markup refactor**

Run:

```bash
npm run build
```

Expected: Build succeeds. If it fails, fix only type or JSX issues introduced in this task.

- [ ] **Step 10: Commit dashboard markup refactor**

Run:

```bash
git add src/modules/dashboard/dashboard-shell.tsx
git commit -m "feat: refine dashboard presentation structure"
```

Expected: Commit includes only `src/modules/dashboard/dashboard-shell.tsx`.

---

### Task 2: Apply Dashboard Styling and Responsive Polish

**Files:**
- Modify: `src/App.css`

- [ ] **Step 1: Replace the dashboard CSS block**

In `src/App.css`, replace the dashboard-specific block from `.dashboard-shell {` through `.dashboard-shell__empty-chart { ... }` with this block:

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
  border: 1px solid color-mix(in srgb, var(--teal) 20%, var(--border));
  border-radius: var(--radius-xl);
  padding: 22px;
  background: var(--gradient-surface);
  box-shadow: var(--shadow-card);
}

.dashboard-shell__header h2 {
  margin: 0 0 8px;
  font-size: 40px;
  line-height: 1;
}

.dashboard-shell__header p,
.dashboard-shell__metric p,
.dashboard-shell__metric-group-header p,
.dashboard-shell__chart-header p,
.dashboard-shell__empty-chart,
.dashboard-shell__status p,
.dashboard-shell__error p {
  color: var(--text);
}

.dashboard-shell__range {
  display: inline-flex;
  flex-wrap: wrap;
  gap: 4px;
  justify-content: flex-end;
  border: 1px solid color-mix(in srgb, var(--indigo) 18%, var(--border));
  border-radius: 999px;
  padding: 4px;
  background: color-mix(in srgb, var(--surface) 88%, transparent);
  box-shadow: inset 0 1px 0 rgb(255 255 255 / 0.78);
}

.dashboard-shell__range-button {
  border: 1px solid transparent;
  border-radius: 999px;
  background: transparent;
  color: var(--text);
  cursor: pointer;
  font-weight: 800;
  padding: 8px 12px;
  transition:
    background-color 160ms ease,
    border-color 160ms ease,
    color 160ms ease,
    box-shadow 160ms ease;
}

.dashboard-shell__range-button:hover,
.dashboard-shell__range-button:focus-visible {
  color: var(--text-h);
  background: var(--surface);
}

.dashboard-shell__range-button--active {
  border-color: color-mix(in srgb, var(--teal) 22%, var(--border));
  color: var(--primary-foreground);
  background: linear-gradient(135deg, var(--teal), var(--indigo));
  box-shadow: 0 10px 22px rgb(15 118 110 / 0.2);
}

.dashboard-shell__status,
.dashboard-shell__error {
  display: grid;
  gap: 6px;
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  background: var(--surface);
  box-shadow: var(--shadow-card);
  padding: 18px;
}

.dashboard-shell__status {
  border-color: color-mix(in srgb, var(--teal) 22%, var(--border));
}

.dashboard-shell__error {
  border-color: #fecaca;
  background: #fef2f2;
  color: #991b1b;
}

.dashboard-shell__status strong,
.dashboard-shell__error strong {
  color: var(--text-h);
  font-size: 17px;
}

.dashboard-shell__error strong {
  color: #7f1d1d;
}

.dashboard-shell__status-kicker {
  color: var(--teal);
  font-size: 12px;
  font-weight: 800;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.dashboard-shell__metric-groups {
  display: grid;
  gap: 16px;
}

.dashboard-shell__metric-group {
  display: grid;
  gap: 12px;
}

.dashboard-shell__metric-group-header {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 16px;
}

.dashboard-shell__metric-group-header h3 {
  margin: 0;
  color: var(--text-h);
  font-size: 17px;
}

.dashboard-shell__metric-group-header p {
  font-size: 13px;
  font-weight: 700;
  text-align: right;
}

.dashboard-shell__metrics {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12px;
}

.dashboard-shell__metric,
.dashboard-shell__chart {
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  background: color-mix(in srgb, var(--surface) 96%, transparent);
  box-shadow: var(--shadow-card);
}

.dashboard-shell__metric {
  position: relative;
  display: grid;
  gap: 6px;
  min-width: 0;
  min-height: 132px;
  overflow: hidden;
  padding: 18px;
  transition:
    border-color 160ms ease,
    box-shadow 160ms ease,
    background-color 160ms ease;
}

.dashboard-shell__metric::before {
  position: absolute;
  inset: 0 auto 0 0;
  width: 4px;
  background: var(--border-strong);
  content: '';
}

.dashboard-shell__metric:hover {
  border-color: color-mix(in srgb, var(--teal) 24%, var(--border));
  box-shadow: var(--shadow-raised);
}

.dashboard-shell__metric span {
  color: var(--text);
  font-size: 12px;
  font-weight: 800;
  letter-spacing: 0.04em;
  text-transform: uppercase;
}

.dashboard-shell__metric strong {
  min-width: 0;
  color: var(--text-h);
  font-size: 25px;
  line-height: 1.12;
  overflow-wrap: anywhere;
}

.dashboard-shell__metric p {
  font-size: 13px;
  font-weight: 600;
}

.dashboard-shell__metric--positive::before {
  background: var(--success);
}

.dashboard-shell__metric--warning::before {
  background: var(--orange);
}

.dashboard-shell__metric--attention::before {
  background: var(--destructive);
}

.dashboard-shell__metric--attention {
  border-color: color-mix(in srgb, var(--orange) 34%, var(--border));
  background:
    radial-gradient(circle at 94% 0%, rgb(249 115 22 / 0.14), transparent 34%),
    var(--surface);
}

.dashboard-shell__charts {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 16px;
}

.dashboard-shell__chart {
  display: grid;
  gap: 16px;
  min-width: 0;
  min-height: 340px;
  padding: 18px;
}

.dashboard-shell__chart--wide {
  grid-column: span 3;
  border-color: color-mix(in srgb, var(--indigo) 20%, var(--border));
  background:
    radial-gradient(circle at 94% 8%, rgb(99 102 241 / 0.14), transparent 28%),
    var(--surface);
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
  font-weight: 700;
  text-align: right;
}

.dashboard-shell__bar {
  min-height: 280px;
}

.dashboard-shell__breakdown {
  display: grid;
  gap: 12px;
}

.dashboard-shell__pie {
  min-height: 210px;
}

.dashboard-shell__legend {
  display: flex;
  flex-wrap: wrap;
  gap: 8px 12px;
  align-items: center;
  margin: 0;
  padding: 0;
  list-style: none;
}

.dashboard-shell__legend li {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  color: var(--text);
  font-size: 13px;
  font-weight: 700;
}

.dashboard-shell__legend strong {
  color: var(--text-h);
}

.dashboard-shell__legend--inline {
  justify-content: flex-end;
}

.dashboard-shell__legend-swatch {
  width: 10px;
  height: 10px;
  flex: 0 0 auto;
  border-radius: 999px;
  box-shadow: 0 0 0 3px rgb(15 23 42 / 0.05);
}

.dashboard-shell__legend-swatch--expected {
  background: var(--chart-2);
}

.dashboard-shell__legend-swatch--collected {
  background: var(--chart-1);
}

.dashboard-shell__empty-chart {
  display: grid;
  min-height: 220px;
  place-items: center;
  border: 1px dashed color-mix(in srgb, var(--teal) 26%, var(--border));
  border-radius: var(--radius);
  background: var(--surface-subtle);
  font-weight: 700;
  text-align: center;
}
```

Expected: Dashboard reads as Joyful Premium Ops, with no CSS leakage to non-dashboard pages.

- [ ] **Step 2: Add responsive dashboard breakpoints**

Near the existing responsive CSS in `src/App.css`, add these rules. If matching media queries already exist, place these dashboard rules inside the nearest existing query without duplicating unrelated selectors.

```css
@media (max-width: 980px) {
  .dashboard-shell__header,
  .dashboard-shell__metric-group-header,
  .dashboard-shell__chart-header {
    flex-direction: column;
    align-items: stretch;
  }

  .dashboard-shell__range,
  .dashboard-shell__legend--inline {
    justify-content: flex-start;
  }

  .dashboard-shell__metrics,
  .dashboard-shell__charts {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .dashboard-shell__chart--wide {
    grid-column: span 2;
  }
}

@media (max-width: 640px) {
  .app-main {
    padding: 18px;
  }

  .dashboard-shell__header {
    padding: 18px;
  }

  .dashboard-shell__header h2 {
    font-size: 32px;
  }

  .dashboard-shell__range {
    border-radius: var(--radius-lg);
  }

  .dashboard-shell__range-button {
    flex: 1 1 calc(50% - 4px);
    min-width: 130px;
  }

  .dashboard-shell__metrics,
  .dashboard-shell__charts {
    grid-template-columns: minmax(0, 1fr);
  }

  .dashboard-shell__chart--wide {
    grid-column: span 1;
  }

  .dashboard-shell__chart {
    min-height: 300px;
    padding: 16px;
  }

  .dashboard-shell__bar {
    min-height: 240px;
  }
}
```

Expected: No horizontal dashboard overflow at 375px, 768px, 1024px, or desktop widths.

- [ ] **Step 3: Run formatting and build checks**

Run:

```bash
npm run format:check
npm run build
```

Expected: Both commands pass. If formatting fails, run `npm run format`, review the diff, and rerun `npm run format:check`.

- [ ] **Step 4: Commit dashboard CSS polish**

Run:

```bash
git add src/App.css
git commit -m "feat: polish dashboard reporting UI"
```

Expected: Commit includes only `src/App.css`.

---

### Task 3: Documentation Closeout

**Files:**
- Modify: `docs/26-reporting-dashboard-validation-checklist.md`
- Modify: `wiki/03-domain/reporting.md`
- Modify: `wiki/04-roadmap/release-plan.md`
- Modify: `wiki/06-task-breakdown/ready-soon.md`
- Modify: `wiki/06-task-breakdown/task-index.md`
- Modify: `wiki/09-status/built.md`
- Modify: `wiki/09-status/not-built.md`

- [ ] **Step 1: Update the validation checklist**

In `docs/26-reporting-dashboard-validation-checklist.md`, change the unchecked deferred UI/UX polish line to checked and add a note that the polish was completed separately as an in-place UI pass:

```md
- [x] Detailed dashboard/reporting UI/UX polish was completed separately as an in-place polish pass.
```

In the deferred scope list, remove `dashboard/reporting UI/UX polish` and keep the remaining deferred items.

Expected: The checklist distinguishes functional validation from the later UI/UX polish closeout.

- [ ] **Step 2: Update the reporting domain page**

In `wiki/03-domain/reporting.md`, update the status language so it says the first dashboard metrics slice is built, functionally validated, and polished in place. Keep these items deferred:

```md
- custom date range picker
- CSV/export
- saved reports
- filtered drilldowns
- database reporting views or Supabase RPCs
- advanced accounting or tax reports
- automated overdue logic
- cross-module workflow links from dashboard cards
```

Expected: Reporting status reflects the completed polish while preserving advanced reporting boundaries.

- [ ] **Step 3: Update the release plan**

In `wiki/04-roadmap/release-plan.md`, add `Dashboard/reporting UI/UX polish` to the built baseline list after the Joyful Premium Ops UI uplift.

In the deferred reporting scope list, remove `dashboard/reporting UI/UX polish` and keep custom date range picker, CSV/export, saved reports, database views/RPCs, advanced accounting/tax reports, and automated overdue logic.

Expected: The release plan no longer names dashboard/reporting UI/UX polish as deferred.

- [ ] **Step 4: Update ready-soon and task index**

In `wiki/06-task-breakdown/ready-soon.md`:

```md
## Completed candidates

- Dashboard/reporting UI/UX polish based on the Joyful Premium Ops foundation
```

Remove the same item from the current bucket options if it appears there. Set the next likely candidate to:

```md
Next likely candidate: choose the next focused MVP gap from the remaining task bucket.
```

In `wiki/06-task-breakdown/task-index.md`, move:

```md
- Dashboard/reporting UI/UX polish based on the Joyful Premium Ops foundation
```

from Later candidates to Completed candidates.

Expected: Planning docs show the selected task completed and do not accidentally approve a new later candidate.

- [ ] **Step 5: Update built and not-built status**

In `wiki/09-status/built.md`, add a reporting/dashboard note that the first metrics slice has in-place UI/UX polish based on Joyful Premium Ops.

In `wiki/09-status/not-built.md`, remove `dashboard/reporting UI/UX polish` from the not-built reporting list. Keep these not-built items if present:

```md
- custom date range picker
- CSV/export
- saved reports
- filtered drilldowns
- database reporting views
- Supabase reporting RPCs
- advanced accounting or tax reporting
- automated overdue logic
- chart drilldowns
- cross-module workflow changes from dashboard cards
```

Expected: Built and not-built status pages agree about what is complete and what remains deferred.

- [ ] **Step 6: Commit documentation closeout**

Run:

```bash
git add docs/26-reporting-dashboard-validation-checklist.md wiki/03-domain/reporting.md wiki/04-roadmap/release-plan.md wiki/06-task-breakdown/ready-soon.md wiki/06-task-breakdown/task-index.md wiki/09-status/built.md wiki/09-status/not-built.md
git commit -m "docs: close dashboard reporting polish"
```

Expected: Commit includes only the listed documentation files.

---

### Task 4: Final Verification and Manual Dashboard Review

**Files:**
- Read: `src/modules/dashboard/dashboard-shell.tsx`
- Read: `src/App.css`
- Read: documentation files modified in Task 3

- [ ] **Step 1: Run required validation commands**

Run:

```bash
npm run format:check
npm run build
npm run lint
git diff --check
```

Expected: All commands pass.

- [ ] **Step 2: Start the local dev server**

Run:

```bash
npm run dev
```

Expected: Vite prints a local URL, usually `http://localhost:5173/`. Keep the server running for manual review.

- [ ] **Step 3: Manually validate `/dashboard`**

In the browser, validate these checks:

```md
- Desktop dashboard loads with grouped metric sections.
- Tablet-width dashboard does not overlap chart headers, legends, or range controls.
- Mobile-width dashboard has no horizontal page scrolling.
- This month, Last month, Last 3 months, and This year buttons switch the selected range.
- Selected range remains visually obvious.
- Keyboard focus is visible on each range button.
- Collection chart tooltip is readable.
- Invoice, maintenance, and reminder legends are readable.
- Empty chart states remain centered and readable when no data is present.
- Loading state is styled as a dashboard status surface.
- Error state keeps role="alert" in markup and remains high-contrast.
- Browser console shows no errors during load or range switching.
```

Expected: Manual dashboard review passes or produces concrete fixes before completion.

- [ ] **Step 4: Stop the dev server**

Stop the Vite process with `Ctrl-C`.

Expected: No long-running development session remains.

- [ ] **Step 5: Inspect final git state**

Run:

```bash
git status --short
git log --oneline -4
```

Expected: Working tree is clean or contains only intentional uncommitted files. Recent commits include the plan, dashboard markup, dashboard CSS, and docs closeout commits.

- [ ] **Step 6: Report final result**

Final response must include:

```md
- Summary of dashboard UI/UX changes.
- Files changed.
- Validation commands and results.
- Manual dashboard checks completed or not completed.
- Deferred scope that remains out of this task.
```

Expected: User can see exactly what changed, how it was validated, and what remains deferred.
