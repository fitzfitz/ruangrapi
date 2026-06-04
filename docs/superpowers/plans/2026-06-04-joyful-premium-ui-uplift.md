# Joyful Premium UI Uplift Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Evolve RuangRapi's active visual system from Warm Admin Ledger to Joyful Premium Ops while preserving all product behavior.

**Architecture:** Implement this as a presentation-only design-system pass. Update design tokens in `src/index.css`, shared primitive defaults in `src/components/ui/`, and the current broad BEM visual mappings in `src/App.css`; only adjust `AppLayout` markup if the shell needs presentational hooks. Keep domain hooks, schemas, repositories, route paths, Supabase code, and receipt content unchanged.

**Tech Stack:** React 19, TypeScript, Vite, Tailwind CSS 4, shadcn-style Base UI primitives, Plus Jakarta Sans, Lucide icons, Recharts.

---

## File Structure

- Modify `src/index.css`: active design-system token layer, Tailwind theme variables, body background, focus/motion rules.
- Modify `src/components/ui/button.tsx`: Joyful Premium Ops button radii, gradients, secondary/outline defaults, and disabled affordances.
- Modify `src/components/ui/card.tsx`: card radius/elevation defaults that support expressive dashboard cards and restrained work cards through `className`.
- Modify `src/components/ui/badge.tsx`: semantic badge palette with teal, indigo, orange, green, amber, red, and outline variants.
- Modify `src/components/ui/alert.tsx`: richer but readable alert defaults.
- Modify `src/components/ui/input.tsx`, `src/components/ui/select.tsx`, and `src/components/ui/textarea.tsx`: calm work-surface controls.
- Modify `src/app/layouts/app-layout.tsx` only if a presentational wrapper or tagline copy is needed; keep routes and nav behavior unchanged.
- Modify `src/App.css`: dark premium shell, dashboard hero/metrics/charts, restrained lists/forms/details, playful empty states, status treatments, receipt detail, print overrides, and responsive behavior.
- Modify `src/modules/dashboard/dashboard-shell.tsx` only if chart config color references need token alignment; no widget or data changes.
- Modify `wiki/09-status/built.md`, `wiki/04-roadmap/release-plan.md`, `wiki/06-task-breakdown/ready-soon.md`, and `wiki/06-task-breakdown/task-index.md`: design-system closeout and next UI task guidance.

## Tasks

### Task 1: Baseline and Isolation

**Files:**

- Read: `docs/superpowers/specs/2026-06-04-joyful-premium-ui-uplift-design.md`
- Read: `src/index.css`
- Read: `src/App.css`
- Read: `src/components/ui/*.tsx`
- Read: `src/app/layouts/app-layout.tsx`

- [ ] **Step 1: Create or confirm an isolated workspace**

Run:

```bash
git status --short --branch
git rev-parse --git-dir
git rev-parse --git-common-dir
```

Expected: clean branch state before edits. If working from `main`, use `superpowers:using-git-worktrees` and create a branch named `joyful-premium-ui-uplift`.

- [ ] **Step 2: Run baseline validation**

Run:

```bash
npm run format:check
npm run build
npm run lint
git diff --check
```

Expected: all commands pass before presentation edits. If `build` reports missing packages, run `npm install` once and rerun the full command set.

### Task 2: Evolve Design Tokens

**Files:**

- Modify: `src/index.css`

- [ ] **Step 1: Replace the current root token block with Joyful Premium Ops tokens**

Update `:root` so these token names exist and retain the existing app aliases:

```css
:root {
  --font-sans:
    'Plus Jakarta Sans', ui-sans-serif, system-ui, -apple-system,
    BlinkMacSystemFont, 'Segoe UI', sans-serif;
  --text: #475569;
  --text-h: #111827;
  --bg: #fff7ed;
  --surface: #ffffff;
  --surface-subtle: #fffaf2;
  --surface-raised: #ffffff;
  --surface-glass: rgba(255, 255, 255, 0.78);
  --border: #eadfd0;
  --border-strong: #d8c7b2;
  --navy: #080b16;
  --navy-2: #111827;
  --indigo: #6366f1;
  --orange: #f97316;
  --teal: #0f766e;
  --mint: #2dd4bf;
  --background: var(--bg);
  --foreground: var(--text-h);
  --card: var(--surface);
  --card-foreground: var(--text-h);
  --popover: var(--surface);
  --popover-foreground: var(--text-h);
  --muted: #f3eadc;
  --muted-foreground: var(--text);
  --accent: #eef2ff;
  --accent-foreground: #3730a3;
  --primary: var(--teal);
  --primary-foreground: #ffffff;
  --secondary: #fff1e6;
  --secondary-foreground: #9a3412;
  --destructive: #b42318;
  --destructive-foreground: #ffffff;
  --success: #047857;
  --success-foreground: #ffffff;
  --warning: #b7791f;
  --warning-foreground: #2f2107;
  --info: #2563eb;
  --info-foreground: #ffffff;
  --ring: #2dd4bf;
  --input: #ded2c2;
  --radius: 0.75rem;
  --radius-sm: 0.625rem;
  --radius-lg: 1.25rem;
  --radius-xl: 1.5rem;
  --shadow-card: 0 10px 28px rgb(15 23 42 / 0.08);
  --shadow-raised: 0 24px 60px rgb(15 23 42 / 0.14);
  --shadow-glow: 0 22px 44px rgb(15 118 110 / 0.18);
  --gradient-brand: linear-gradient(135deg, #2dd4bf, #6366f1 58%, #f97316);
  --gradient-surface:
    radial-gradient(circle at 88% 8%, rgb(45 212 191 / 0.28), transparent 34%),
    linear-gradient(135deg, #ffffff 0%, #ecfeff 100%);
  --chart-1: #0f766e;
  --chart-2: #6366f1;
  --chart-3: #f97316;
  --chart-4: #22c55e;
  --chart-5: #2563eb;
  --sidebar: var(--navy);
  --sidebar-foreground: #f8fafc;
  --sidebar-primary: var(--mint);
  --sidebar-primary-foreground: #042f2e;
  --sidebar-accent: rgb(255 255 255 / 0.11);
  --sidebar-accent-foreground: #ccfbf1;
  --sidebar-border: rgb(255 255 255 / 0.12);
  --sidebar-ring: var(--mint);

  font: 15px/1.5 var(--font-sans);
  color: var(--text);
  background: var(--bg);
  font-synthesis: none;
  text-rendering: optimizeLegibility;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}
```

- [ ] **Step 2: Extend Tailwind theme variables**

Add these entries inside `@theme inline` while keeping existing mappings:

```css
--color-navy: var(--navy);
--color-indigo: var(--indigo);
--color-orange: var(--orange);
--color-teal: var(--teal);
--color-mint: var(--mint);
--radius-xl: var(--radius-xl);
```

- [ ] **Step 3: Update body background**

Set `body` background to a vivid but light operational canvas:

```css
background:
  radial-gradient(circle at 82% 2%, rgb(249 115 22 / 0.22), transparent 30%),
  radial-gradient(circle at 42% -16%, rgb(20 184 166 / 0.32), transparent 36%),
  linear-gradient(180deg, #fffaf2 0%, #f8fafc 54%, #fff7ed 100%);
```

- [ ] **Step 4: Verify token-only build**

Run:

```bash
npm run build
```

Expected: TypeScript and Vite build pass.

### Task 3: Update Shared Primitive Defaults

**Files:**

- Modify: `src/components/ui/button.tsx`
- Modify: `src/components/ui/card.tsx`
- Modify: `src/components/ui/badge.tsx`
- Modify: `src/components/ui/alert.tsx`
- Modify: `src/components/ui/input.tsx`
- Modify: `src/components/ui/select.tsx`
- Modify: `src/components/ui/textarea.tsx`

- [ ] **Step 1: Update `Button` classes**

In `src/components/ui/button.tsx`, keep the API unchanged. Update `buttonVariants` with these classes:

```ts
const buttonVariants = cva(
  'inline-flex shrink-0 cursor-pointer items-center justify-center gap-2 whitespace-nowrap rounded-[12px] text-sm font-extrabold transition-colors disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-60 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0',
  {
    variants: {
      variant: {
        default:
          'bg-primary text-primary-foreground shadow-[var(--shadow-glow)] hover:bg-teal-800',
        destructive:
          'bg-destructive text-destructive-foreground shadow-sm hover:bg-red-800',
        outline:
          'border border-border bg-card text-foreground shadow-sm hover:border-[var(--border-strong)] hover:bg-secondary',
        secondary:
          'bg-secondary text-secondary-foreground shadow-sm hover:bg-orange-100',
        ghost: 'text-foreground hover:bg-secondary',
        link: 'h-auto rounded-none p-0 text-primary underline-offset-4 hover:underline',
      },
      size: {
        default: 'h-10 px-4 py-2',
        sm: 'h-8 px-3 text-xs',
        lg: 'h-11 px-5',
        icon: 'size-10',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
)
```

- [ ] **Step 2: Update `Card` default surface**

In `src/components/ui/card.tsx`, keep exports unchanged. Update the root `Card` class to:

```ts
'flex flex-col gap-5 rounded-[14px] border bg-card py-5 text-card-foreground shadow-[var(--shadow-card)]'
```

Keep `CardHeader`, `CardContent`, and `CardFooter` spacing at `px-5`.

- [ ] **Step 3: Update `Badge` variants**

In `src/components/ui/badge.tsx`, update `badgeVariants` to:

```ts
const badgeVariants = cva(
  'inline-flex w-fit items-center rounded-full border px-2.5 py-1 text-xs font-extrabold leading-none',
  {
    variants: {
      variant: {
        default: 'border-transparent bg-primary text-primary-foreground',
        secondary: 'border-orange-200 bg-orange-50 text-orange-800',
        success: 'border-green-200 bg-green-50 text-green-800',
        warning: 'border-amber-200 bg-amber-50 text-amber-800',
        destructive: 'border-red-200 bg-red-50 text-red-800',
        outline: 'border-border bg-card text-foreground',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  },
)
```

- [ ] **Step 4: Update form control defaults**

Update `Input`, `SelectTrigger`, and `Textarea` root classes to use rounded `12px`, calm white backgrounds, and border/input tokens. The input class should include:

```ts
'h-10 w-full rounded-[12px] border border-input bg-card px-3 py-2 text-sm text-foreground shadow-xs transition-colors placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:bg-muted disabled:opacity-70 aria-invalid:border-destructive'
```

Apply the same visual direction to `Textarea` and `SelectTrigger`, preserving their component structure and Base UI usage.

- [ ] **Step 5: Run primitive validation**

Run:

```bash
npm run lint
npm run build
```

Expected: lint and build pass with no Fast Refresh export errors.

### Task 4: Uplift the Product Shell

**Files:**

- Modify: `src/App.css`
- Modify: `src/app/layouts/app-layout.tsx`

- [ ] **Step 1: Keep `AppLayout` route behavior unchanged**

Inspect `src/app/layouts/app-layout.tsx`. Keep:

```tsx
end={item.path === routePaths.dashboard}
onClick={() => {
  setIsNavigationOpen(false)
}}
```

Do not change route paths, nav item order, or protected-route behavior.

- [ ] **Step 2: Update brand tagline**

Change the brand tagline from:

```tsx
<span className="app-brand__tagline">Rental operations ledger</span>
```

to:

```tsx
<span className="app-brand__tagline">Rental ops with rhythm</span>
```

- [ ] **Step 3: Update shell CSS**

In `src/App.css`, update the shell selectors so the header and sidebar use the dark premium shell:

```css
.app-header {
  position: sticky;
  z-index: 30;
  top: 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  border-bottom: 1px solid var(--sidebar-border);
  padding: 14px 24px;
  background:
    radial-gradient(circle at 8% 0%, rgb(45 212 191 / 0.2), transparent 28%),
    linear-gradient(90deg, var(--navy) 0%, var(--navy-2) 62%, #172554 100%);
  color: var(--sidebar-foreground);
}

.app-brand__mark {
  display: grid;
  width: 42px;
  height: 42px;
  place-items: center;
  border: 1px solid rgb(255 255 255 / 0.22);
  border-radius: 16px;
  color: #ffffff;
  background: var(--gradient-brand);
  font-size: 13px;
  font-weight: 900;
  box-shadow: 0 16px 34px rgb(20 184 166 / 0.28);
}

.app-brand__name {
  color: #ffffff;
  font-size: 17px;
  font-weight: 900;
  line-height: 1.2;
}

.app-brand__tagline {
  color: #c7d2fe;
  font-size: 12px;
  font-weight: 700;
}
```

Also update `.app-sidebar`, `.app-sidebar a`, `.app-sidebar a.active`, and `.app-sidebar__coming-soon` to use dark backgrounds, translucent active states, and light text. Preserve sticky positioning and mobile show/hide behavior.

- [ ] **Step 4: Verify shell behavior**

Run:

```bash
npm run build
```

Expected: build passes. Manual check after dev server start: mobile menu still toggles and active nav remains visible.

### Task 5: Uplift Dashboard and Overview Surfaces

**Files:**

- Modify: `src/App.css`
- Modify: `src/modules/dashboard/dashboard-shell.tsx`

- [ ] **Step 1: Align dashboard chart colors**

In `src/modules/dashboard/dashboard-shell.tsx`, keep the existing data keys and labels. Confirm:

```ts
color: 'var(--chart-2)'
color: 'var(--chart-1)'
```

Expected: no data fetching, metric, or chart structure changes.

- [ ] **Step 2: Add expressive dashboard CSS**

In `src/App.css`, add or update these selectors:

```css
.dashboard-shell__header {
  border: 1px solid rgb(255 255 255 / 0.78);
  border-radius: 24px;
  padding: 22px;
  background:
    radial-gradient(circle at 92% 12%, rgb(20 184 166 / 0.26), transparent 30%),
    linear-gradient(135deg, rgb(255 255 255 / 0.88), rgb(239 246 255 / 0.68));
  box-shadow: var(--shadow-raised);
}

.dashboard-shell__header h2 {
  margin: 0 0 8px;
  font-size: clamp(28px, 4vw, 44px);
  line-height: 1;
}

.dashboard-shell__metric {
  border-radius: 22px;
  padding: 20px;
  background: var(--gradient-surface);
  box-shadow: var(--shadow-card);
}

.dashboard-shell__metric:first-child,
.dashboard-shell__metric:nth-child(5) {
  border-color: rgb(20 184 166 / 0.34);
  box-shadow: var(--shadow-glow);
}

.dashboard-shell__chart {
  border-radius: 22px;
  background: rgb(255 255 255 / 0.9);
  box-shadow: var(--shadow-card);
}
```

Keep dashboard grid behavior and chart heights stable.

- [ ] **Step 3: Update range selector**

Style `.dashboard-shell__range-button` and active state with rounded pill-like controls, teal/indigo active colors, and no layout-shifting hover effects.

- [ ] **Step 4: Run dashboard validation**

Run:

```bash
npm run build
npm run lint
```

Expected: both pass.

### Task 6: Restrain Lists, Forms, Details, and Status States

**Files:**

- Modify: `src/App.css`

- [ ] **Step 1: Update shared work-card selectors**

Keep list and form surfaces calmer than dashboard. Update shared card selectors so list cards use:

```css
border-radius: 14px;
background: rgb(255 255 255 / 0.92);
box-shadow: 0 10px 26px rgb(15 23 42 / 0.06);
```

Apply to:

```css
.property-card,
.tenant-card,
.lease-card,
.invoice-card,
.payment-card,
.receipt-card,
.reminder-card,
.maintenance-card,
.property-detail-card,
.property-units-section,
.unit-card
```

- [ ] **Step 2: Keep forms calm**

Update form selectors so forms use a restrained white surface, `14px` radius, low elevation, and normal input backgrounds. Apply to:

```css
.sign-in-form,
.sign-up-form,
.onboarding-form,
.create-property-form,
.edit-property-form,
.tenant-form,
.lease-form,
.invoice-form,
.payment-form,
.create-unit-form,
.edit-unit-form,
.maintenance-form,
.maintenance-ticket-form
```

- [ ] **Step 3: Make empty states warmer**

Update empty state selectors to use warm backgrounds, orange/teal accents, and helpful visual emphasis without adding instructional UI copy. Do not change React text strings in domain pages.

- [ ] **Step 4: Make statuses easier to distinguish**

Update status badge-like selectors:

```css
.lease-card__status,
.invoice-card__status,
.payment-card__method,
.reminder-card__status,
.maintenance-card__status,
.payment-card__receipt-status,
.receipt-document__status
```

Use semantic color backgrounds and keep text contrast at least 4.5:1.

- [ ] **Step 5: Preserve receipt print**

Inspect the `@media print` block in `src/App.css`. Do not add gradients, shadows, dark backgrounds, or decorative accents inside print rules. Receipt print should remain black-on-white and compact.

- [ ] **Step 6: Run work-surface validation**

Run:

```bash
npm run format:check
npm run build
npm run lint
git diff --check
```

Expected: all pass.

### Task 7: Documentation Closeout

**Files:**

- Modify: `wiki/09-status/built.md`
- Modify: `wiki/04-roadmap/release-plan.md`
- Modify: `wiki/06-task-breakdown/ready-soon.md`
- Modify: `wiki/06-task-breakdown/task-index.md`
- Modify: `docs/superpowers/plans/2026-06-04-joyful-premium-ui-uplift.md`

- [ ] **Step 1: Update built status**

In `wiki/09-status/built.md`, update the Design System section to say:

```md
Status: Joyful Premium Ops foundation implemented.

Built:

- Joyful Premium Ops active visual direction
- Warm Admin Ledger operational-density principles preserved
- premium dark navigation shell
- teal, indigo, and orange signature accent system
- expressive dashboard cards, chart surfaces, and priority states
- restrained list, form, detail, and receipt print surfaces
```

- [ ] **Step 2: Update release plan**

In `wiki/04-roadmap/release-plan.md`, replace the design-system baseline heading with:

```md
## Design-system baseline

Joyful Premium Ops is the active visual direction. It supersedes Warm Admin Ledger visually while preserving its compact operational-density principles.
```

Keep deferred scope for shared primitive migration and visual regression automation.

- [ ] **Step 3: Update task tracking pages**

In `wiki/06-task-breakdown/ready-soon.md` and `wiki/06-task-breakdown/task-index.md`, move Joyful Premium UI uplift into completed candidates and keep "Replace remaining domain-local BEM markup with shared UI primitives" as a future candidate.

- [ ] **Step 4: Record verification in this plan**

After validation, update this plan's final task checklist with actual command results and any manual validation limitations.

### Task 8: Final Verification and Manual Checks

**Files:**

- Review all modified files.

- [ ] **Step 1: Run required automated validation**

Run:

```bash
npm run format:check
npm run build
npm run lint
git diff --check
```

Expected: all commands pass.

- [ ] **Step 2: Start local dev server**

Run:

```bash
npm run dev -- --host 127.0.0.1
```

Expected: Vite prints a local URL, usually `http://127.0.0.1:5173/`.

- [ ] **Step 3: Smoke-check representative routes**

Run outside the sandbox if local HTTP is blocked:

```bash
curl -I http://127.0.0.1:5173/dashboard
curl -I http://127.0.0.1:5173/dashboard/properties
curl -I http://127.0.0.1:5173/dashboard/properties/new
curl -I http://127.0.0.1:5173/dashboard/reminders
curl -I http://127.0.0.1:5173/dashboard/maintenance
curl -I http://127.0.0.1:5173/auth
```

Expected: HTTP 200 for each SPA route.

- [ ] **Step 4: Manual browser checklist**

Check these at desktop and mobile widths:

- dashboard shell, metrics, charts, range controls
- one list page
- one create/edit form page
- one detail page
- auth or onboarding page
- reminders page
- maintenance page
- receipt detail page and browser print preview

Confirm:

- no incoherent overlap
- no horizontal scroll at mobile width
- active navigation is visible
- mobile menu opens and closes
- focus states are visible
- disabled states remain distinct
- form errors remain readable
- receipt print remains plain and readable

- [ ] **Step 5: Commit implementation**

Run:

```bash
git status --short
git add src/index.css src/App.css src/app/layouts/app-layout.tsx src/components/ui/button.tsx src/components/ui/card.tsx src/components/ui/badge.tsx src/components/ui/alert.tsx src/components/ui/input.tsx src/components/ui/select.tsx src/components/ui/textarea.tsx src/modules/dashboard/dashboard-shell.tsx wiki/09-status/built.md wiki/04-roadmap/release-plan.md wiki/06-task-breakdown/ready-soon.md wiki/06-task-breakdown/task-index.md docs/superpowers/plans/2026-06-04-joyful-premium-ui-uplift.md
git commit -m "feat: uplift joyful premium design system"
```

Expected: one focused implementation commit after all checks pass.

## Self-Review Notes

- Spec coverage: token evolution, shared primitives, shell, dashboard, restrained dense surfaces, print safety, docs, and validation are covered.
- Red-flag scan: this plan contains no unspecified implementation areas.
- Type consistency: component APIs remain unchanged; only visual defaults and CSS selectors change.
