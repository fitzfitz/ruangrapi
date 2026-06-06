# Dashboard / Reporting UI/UX Polish Design

## Goal

Improve the existing `/dashboard` reporting experience so it is easier to scan, more responsive, and more polished during daily use. This pass should make the current first-slice dashboard feel more decision-ready without adding new reporting scope.

## Approved Direction

Use **richer in-place dashboard interactions**.

The dashboard should keep its current data model, route behavior, preset ranges, and chart set, while improving:

- metric hierarchy and grouping
- attention-state visibility
- chart tooltip and legend readability
- range selector affordance
- loading, error, and empty states
- desktop, tablet, and mobile layout quality

## Scope

In scope:

- `/dashboard` UI/UX polish only
- existing metric cards for units, rent collection, invoices, maintenance, and reminders
- existing preset range controls: This month, Last month, Last 3 months, and This year
- existing chart set: monthly collection, invoice status, maintenance status, and reminder status
- presentational component structure inside `src/modules/dashboard/dashboard-shell.tsx`
- dashboard-specific styling in `src/App.css`
- use of the existing Joyful Premium Ops tokens in `src/index.css`
- documentation closeout for the reporting/dashboard polish task

Out of scope:

- new dashboard metrics
- custom date ranges
- CSV/export
- saved reports
- filtered record drilldowns
- chart segment click behavior
- links from metric cards to record pages
- new routes
- Supabase migrations, RPCs, views, or repository changes
- invoice, payment, reminder, maintenance, receipt, property, unit, lease, or tenant workflow changes
- replacing unrelated domain-local BEM markup with shared primitives

## UX Model

The dashboard should answer three questions faster:

1. What is the current portfolio state?
2. How healthy is rent collection for the selected period?
3. What needs operational attention?

Metric presentation should support those questions by grouping existing cards into operational themes:

- portfolio state: total units, occupied units, vacant units
- collection health: expected rent, collected rent, outstanding rent
- attention workload: invoices needing attention, open maintenance, prepared reminders

Attention metrics should have stronger visual treatment than neutral metrics. This is presentation-only; it does not change thresholds, calculations, or business rules.

## Interaction Design

### Range Selector

Replace the current button cluster styling with a segmented-control treatment that has clear selected, hover, focus-visible, and loading-safe states. The selected range should be obvious without relying on color alone.

The control should stay wrap-safe on mobile and should not cause horizontal scrolling.

### Metric Cards

Metric cards should gain non-navigating hover polish and clearer hierarchy:

- small label
- large value
- helper text
- optional visual accent by group or attention state

Cards must not behave as links in this pass. Do not add `onClick` handlers, route links, or drilldown affordances.

### Charts

Keep the current chart types and data. Improve chart surfaces by:

- making the collection chart feel like the primary analytical surface
- improving tooltip contrast and spacing through existing chart primitives where practical
- making legends and color mapping easier to understand
- preserving empty chart states when no data exists
- ensuring chart containers have stable responsive dimensions

Pie charts may be visually polished, but no chart segment click behavior should be introduced.

### Loading, Empty, and Error States

Replace plain dashboard status text with polished status surfaces:

- loading state should feel consistent with dashboard cards
- error state should remain high-contrast and use `role="alert"`
- empty chart states should be calm, centered, and readable

No additional instructional copy should be added solely to explain the interface.

## Responsive Behavior

Desktop:

- preserve a dense dashboard feel
- show metric groups and charts in a clear grid
- keep collection chart visually dominant

Tablet:

- reduce columns without compressing values
- prevent chart headers and range controls from crowding

Mobile:

- stack cards and charts
- keep range controls wrap-safe
- ensure large currency values fit without overlapping
- avoid horizontal page scrolling
- maintain readable chart dimensions

## Implementation Architecture

Primary files:

- `src/modules/dashboard/dashboard-shell.tsx`
- `src/App.css`

Expected implementation approach:

- refactor dashboard JSX only enough to express metric groups and presentational variants clearly
- keep existing query hooks, domain types, repository logic, and formatting behavior
- use existing `formatCurrency`, `formatNumber`, `DashboardMetrics`, and `DashboardBreakdownItem` patterns
- add small presentational metadata in `buildMetricCards` if needed, such as group or tone
- keep styling dashboard-specific unless an existing shared token already fits
- avoid dependency changes

Do not change:

- `src/modules/dashboard/infrastructure/dashboard-metrics-repository.ts`
- Supabase migrations
- route paths
- authentication or route gates
- non-dashboard module behavior

## Accessibility

The polish must preserve or improve:

- semantic section heading for the dashboard
- `role="group"` and accessible label for the range selector
- visible focus states
- keyboard operation for range buttons
- `role="alert"` for dashboard load errors
- sufficient contrast for text, status accents, chart labels, and tooltips
- reduced-motion behavior through the existing global media query

Chart information remains visual-first in this slice, but tooltips and labels should be readable and should not depend on color alone where CSS can reasonably improve distinction.

## Validation

Required automated validation:

- `npm run format:check`
- `npm run build`
- `npm run lint`
- `git diff --check`

Manual validation:

- `/dashboard` desktop layout
- `/dashboard` tablet-width layout
- `/dashboard` mobile-width layout
- range switching across all existing presets
- chart tooltip readability
- empty chart states
- loading state
- error state, if practical to force
- keyboard focus on range controls
- browser console check during dashboard load and range switching

## Documentation Closeout

After implementation and verification, update the relevant planning and status docs to record that dashboard/reporting UI/UX polish has been completed as an in-place polish pass.

Expected docs/wiki areas:

- `docs/26-reporting-dashboard-validation-checklist.md`
- `wiki/03-domain/reporting.md`
- `wiki/04-roadmap/release-plan.md`
- `wiki/06-task-breakdown/ready-soon.md`
- `wiki/06-task-breakdown/task-index.md`
- `wiki/09-status/built.md`
- `wiki/09-status/not-built.md`

Closeout should explicitly state that custom ranges, exports, saved reports, filtered drilldowns, and cross-module dashboard workflow links remain deferred.
