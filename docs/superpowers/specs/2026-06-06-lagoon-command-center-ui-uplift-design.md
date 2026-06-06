# Lagoon Command Center UI Uplift Design

## Goal

Redesign RuangRapi's product shell and dashboard into a more crowded, fresh, fun, blue full-screen workspace. The uplift should make the app feel more distinctive and modern than the current sidebar-based Joyful Premium Ops shell while preserving daily operational usability.

## Approved Direction

Use **Lagoon Command Center**.

The target feel is a bright blue operations cockpit:

- full-screen blue, sky, cyan, and teal workspace
- no persistent left sidebar
- floating rounded center-bottom navigation
- compact top brand/status strip
- dense dashboard layout with hero metrics, chart surfaces, attention queue, and smaller operational tiles
- small orange accents for attention states
- polished glassy surfaces and shadows without making controls hard to read

## Scope

In scope:

- app shell/navigation redesign
- replacing the persistent sidebar with a floating rounded bottom navigation bar
- compact top brand/status treatment
- dashboard layout uplift based on the Lagoon Command Center mockup
- blue-forward design token adjustments and shell/dashboard CSS
- responsive desktop, tablet, and mobile behavior
- preserving active navigation visibility
- preserving route access behavior and existing route paths
- documentation closeout for the shell/dashboard visual direction

Out of scope:

- new dashboard metrics
- new reporting calculations
- chart drilldowns
- chart export/download
- custom reporting date ranges
- saved reports
- switching chart libraries
- ApexCharts implementation
- Supabase migrations, RPCs, views, or repository changes
- authentication, permission, or route gate changes
- reworking every list/form/detail page layout beyond what is required for shell spacing
- changing invoice, payment, receipt, reminder, maintenance, tenant, lease, property, or unit workflows

## Navigation Model

Replace the current left sidebar with a center-bottom floating navigation bar.

The bottom nav should:

- be fixed to the viewport bottom center
- use a rounded pill or rounded capsule shape
- have a glassy/dark translucent surface with blue/cyan highlights
- show the active route clearly
- expand the active route into an icon-plus-label pill when space allows
- use icon-only items for inactive routes
- keep labels or tooltips available for accessibility and discoverability
- keep keyboard focus visible
- avoid covering page content by adding global bottom padding to the main content area

Primary routes remain the same:

- Dashboard
- Properties
- Tenants
- Leases
- Invoices
- Payments
- Receipts
- Reminders
- Maintenance

The future Units item should not become a primary active route in this pass. If it remains visible, it should stay visually disabled or be omitted from the compact bottom nav to avoid crowding.

## App Shell

The top shell should become a compact brand/status strip rather than a large navigation container.

It should include:

- RuangRapi brand mark and name
- short product tagline or workspace status
- room for future lightweight status controls, such as current range or account status

It should not duplicate all bottom navigation labels. The bottom nav owns primary route switching.

The main content area should:

- fill the screen more completely
- use a blue/cyan/sky background system
- keep content constrained enough to remain readable on wide screens
- reserve bottom spacing for the floating nav
- avoid horizontal scrolling on mobile

## Dashboard Layout

The dashboard should move toward the Lagoon Command Center mockup.

Desktop composition:

- top brand/status strip
- first row: large collection health hero card plus occupancy and attention cards
- second row: dominant collection chart plus attention queue/status panel
- lower row: smaller operational tiles or existing breakdown chart panels
- floating bottom nav over reserved page space, not over content

The dashboard should feel more crowded than the current version, but not cramped. Use dense cards, compact headings, and clear grid rhythm.

Data remains unchanged:

- existing dashboard metrics
- existing preset ranges
- existing collection chart data
- existing invoice, maintenance, and reminder breakdown data

No new data source, route, query, or mutation should be introduced.

## Chart Library Decision

Keep **Recharts** for this pass.

Reasoning:

- RuangRapi already uses Recharts through the existing shadcn chart primitives.
- The current dashboard needs visual and layout polish more than a chart engine migration.
- Recharts supports the current bar and status breakdown charts with responsive containers, custom legends, and custom tooltips.
- Switching chart libraries would add dependency, API migration, styling, and validation cost during an already large shell redesign.

ApexCharts is explicitly deferred.

Reconsider ApexCharts later for:

- chart drilldowns
- custom reporting ranges
- synced charts
- zooming
- annotations
- export/download workflows
- more advanced reporting dashboards

The design should make Recharts feel richer through:

- stronger chart containers
- improved legends
- better tooltip styling
- blue/cyan/teal chart colors
- denser chart placement
- composed chart styling where useful and supported by existing data

## Visual System

### Color

The dominant palette should shift from dark navy shell to a bright blue lagoon system:

- sky blue for workspace background energy
- cyan and teal for productive state and collection health
- deeper blue for primary emphasis
- indigo as a secondary accent
- orange for attention states
- red, amber, green, and blue semantic status colors remain available

Avoid a one-note blue palette. The interface should use enough white, teal, cyan, indigo, and orange contrast to keep the workspace lively and readable.

### Density

The target is intentionally crowded, but it must remain usable.

Use:

- tighter dashboard spacing than the current shell
- compact card headers
- dense but stable grids
- consistent card heights where possible
- stable dimensions for nav items, metric cards, chart panels, and status tiles

Avoid:

- overlapping text
- hidden content behind the bottom nav
- tiny unreadable labels
- viewport-width font scaling
- layout shifts on hover

### Shape and Depth

Use rounded, polished surfaces:

- bottom nav: high-radius pill/capsule
- hero cards: large radius
- chart cards: large but controlled radius
- routine panels: medium radius

Use shadow and glass effects selectively. The nav and hero cards can be expressive; dense forms and lists should remain calmer.

### Typography

Continue using self-hosted Plus Jakarta Sans.

Use fixed responsive font sizes, not viewport-width scaling. Dashboard hero values can be larger, but they must wrap safely for Indonesian currency values.

## Responsive Behavior

Desktop:

- bottom nav floats centered and remains compact
- dashboard uses a dense multi-column grid
- active nav item may show icon plus label

Tablet:

- bottom nav remains centered but may reduce labels
- dashboard cards reduce columns while preserving hierarchy
- chart surfaces should not squeeze labels into overlap

Mobile:

- bottom nav remains reachable and thumb-friendly
- inactive nav items may become icon-only
- active item should remain identifiable
- dashboard stacks into a readable single-column or simplified two-column rhythm
- main content must include enough bottom padding for the floating nav

If all primary routes cannot fit comfortably on mobile, use a compact overflow pattern rather than shrinking labels until they are unreadable. Options include:

- show core items plus a More button
- allow the nav capsule to horizontally scroll with visible affordance
- split rarely used routes into an overflow menu

The implementation plan should choose one option after checking current route count and available width.

## Accessibility

The redesigned shell must preserve:

- semantic `header`, `nav`, and `main` landmarks
- accessible navigation labels
- visible focus states
- active route state for screen readers
- keyboard navigation through all nav items
- sufficient contrast on blue and translucent surfaces
- `prefers-reduced-motion` support through the existing global media query

Icon-only nav items must still have accessible text. Tooltips can help sighted users, but accessible names must not depend on hover-only UI.

## Implementation Architecture

Primary files likely affected:

- `src/app/layouts/app-layout.tsx`
- `src/App.css`
- `src/index.css`
- `src/modules/dashboard/dashboard-shell.tsx`

Implementation guidance:

- Keep route arrays and navigation data in `app-layout.tsx`.
- Rename sidebar-specific local variables/classes only if it improves clarity.
- Preserve route paths and `NavLink` behavior.
- Keep dashboard data hooks and repository code unchanged.
- Keep Recharts and the existing chart primitives.
- Add only small presentational metadata when needed.
- Do not add dependencies.

The shell redesign is allowed to touch shared page spacing because the bottom nav affects every route. It should not redesign every domain page in this pass.

## Validation

Required automated validation:

- `npm run format:check`
- `npm run build`
- `npm run lint`
- `git diff --check`

Manual validation:

- desktop dashboard
- tablet dashboard
- mobile dashboard
- one list page
- one form page
- one detail/receipt page
- auth page or sign-in flow
- bottom nav active states
- bottom nav keyboard focus
- mobile nav fit/overflow behavior
- content not hidden behind bottom nav
- browser console during navigation

Authenticated dashboard data review should be completed if local session credentials are available. If not available, record that limitation.

## Documentation Closeout

After implementation, update relevant docs/wiki pages to record:

- Lagoon Command Center is the active shell/dashboard visual direction.
- The sidebar was replaced by a floating bottom navigation model.
- Recharts remains the chart library for this pass.
- ApexCharts remains deferred for future advanced reporting/chart drilldown work.
- New dashboard metrics, custom ranges, exports, saved reports, and drilldowns remain deferred.

Expected areas:

- `wiki/04-roadmap/release-plan.md`
- `wiki/09-status/built.md`
- `wiki/09-status/not-built.md`
- `wiki/06-task-breakdown/task-index.md`
- `wiki/06-task-breakdown/ready-soon.md`
- any validation checklist created for this UI uplift
