# Lagoon Shell Light Active Nav Refinement Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Refine the Lagoon shell into a centered, light, denser workspace first, then add the approved light floating nav with a pure-blue moving active plate after user review.

**Architecture:** Split implementation into gated phases. Phase 1 changes only shell/background/content centering and dashboard fit so the user can review layout before navigation changes. Phase 2 changes navigation markup/state/CSS for the moving active plate. Phase 3 closes docs and runs full verification after all implementation is approved.

**Tech Stack:** React, TypeScript, Vite, React Router `NavLink`/`useLocation`, Lucide React icons, CSS custom properties, existing global CSS in `src/App.css` and `src/index.css`.

---

## Execution Gates

- Execute **Task 1 only** first.
- Stop after Task 1 commit and ask the user to review the layout shell.
- Do **not** execute Task 2 until the user approves the layout shell.
- Run full final validation and code-review style closeout only after Tasks 1-4 are complete.

## File Structure

- Modify `src/app/layouts/app-layout.tsx`
  - Task 1: add centered header/main wrappers.
  - Task 2: add route-derived active nav index and moving active plate markup.
- Modify `src/index.css`
  - Task 1: add light Lagoon shell tokens and lighter body background.
- Modify `src/App.css`
  - Task 1: center shell containers, lighten shell surfaces, tighten dashboard fit, keep current nav behavior unchanged.
  - Task 2: replace dark nav styling with light glass nav, pure-blue moving active plate, active label/inactive icon behavior, and More menu light styling.
- Modify documentation closeout pages after both UI phases are approved:
  - `docs/27-lagoon-command-center-validation-checklist.md`
  - `wiki/04-roadmap/release-plan.md`
  - `wiki/09-status/built.md`
  - `wiki/09-status/not-built.md`
  - `wiki/06-task-breakdown/task-index.md`
  - `wiki/06-task-breakdown/ready-soon.md`

---

### Task 1: Centered Light Shell and Dashboard Fit

**Files:**

- Modify: `src/app/layouts/app-layout.tsx`
- Modify: `src/index.css`
- Modify: `src/App.css`

- [ ] **Step 1: Add centered header wrapper in `src/app/layouts/app-layout.tsx`**

Replace the current `<header className="app-header">...</header>` block with:

```tsx
<header className="app-header">
  <div className="app-header__inner">
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
  </div>
</header>
```

Expected:

- Header content is wrapped by `.app-header__inner`.
- Header brand/status content remains unchanged.

- [ ] **Step 2: Add centered main wrapper in `src/app/layouts/app-layout.tsx`**

Replace:

```tsx
<main className="app-main">{children}</main>
```

with:

```tsx
<main className="app-main">
  <div className="app-main__inner">{children}</div>
</main>
```

Expected:

- Main content is wrapped by `.app-main__inner`.
- Existing bottom nav markup remains functionally unchanged in Task 1.
- No route paths, navigation arrays, or More menu behavior changes in Task 1.

- [ ] **Step 3: Add light shell tokens in `src/index.css`**

Inside `:root`, after `--lagoon-nav`, add:

```css
--lagoon-shell-max: 1440px;
--lagoon-shell-gutter: 28px;
--lagoon-light-bg: #f8fdff;
--lagoon-light-surface: rgba(255, 255, 255, 0.82);
--lagoon-light-panel: rgba(255, 255, 255, 0.64);
--lagoon-light-border: rgba(186, 230, 253, 0.9);
```

Then update `--lagoon-bg` from:

```css
--lagoon-bg: #e0f7ff;
```

to:

```css
--lagoon-bg: #f8fdff;
```

Expected: the app has explicit tokens for the centered light shell without removing existing Lagoon tokens used elsewhere.

- [ ] **Step 4: Replace the `body` background in `src/index.css`**

Replace the current `body` background with:

```css
background:
  radial-gradient(circle at 14% 0%, rgb(186 230 253 / 0.72), transparent 30%),
  radial-gradient(circle at 88% 6%, rgb(224 247 255 / 0.94), transparent 34%),
  radial-gradient(circle at 50% 96%, rgb(204 251 241 / 0.38), transparent 38%),
  linear-gradient(180deg, #f8fdff 0%, #f1fbff 48%, #ffffff 100%);
```

Expected: the app background becomes light, fresh, and blue-tinted without dark navy surfaces.

- [ ] **Step 5: Update shell layout CSS in `src/App.css`**

Replace the current `.app-layout`, `.app-header`, and `.app-main` related shell rules at the top of `src/App.css` with this structure:

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
  border-bottom: 1px solid rgb(255 255 255 / 0.72);
  background: color-mix(in srgb, var(--lagoon-light-surface) 92%, transparent);
  backdrop-filter: blur(18px);
}

.app-header__inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  width: min(100%, var(--lagoon-shell-max));
  margin: 0 auto;
  padding: 14px var(--lagoon-shell-gutter);
}

.app-main {
  min-width: 0;
  padding: 20px var(--lagoon-shell-gutter) 128px;
}

.app-main__inner {
  width: min(100%, var(--lagoon-shell-max));
  margin: 0 auto;
  min-width: 0;
}
```

Keep the existing `.app-brand`, `.app-brand__mark`, `.app-brand__name`, `.app-brand__tagline`, and `.app-header__status` selectors, then adjust these details:

```css
.app-brand__mark {
  width: 42px;
  height: 42px;
  border: 1px solid rgb(255 255 255 / 0.92);
  color: var(--lagoon-700);
  background: linear-gradient(135deg, #e0f7ff, var(--lagoon-200));
  box-shadow: inset 0 1px 0 rgb(255 255 255 / 0.92);
}

.app-header__status {
  border: 1px solid var(--lagoon-light-border);
  background: #e0f7ff;
  box-shadow: 0 14px 30px rgb(14 116 144 / 0.08);
}
```

Expected:

- Topbar is no longer visually full-bleed content.
- Header contents are centered with a max width.
- Main content is centered with the same max width.
- Brand mark becomes light instead of dark/gradient-heavy.
- Bottom nav is not restyled in Task 1.

- [ ] **Step 6: Tighten dashboard fit in `src/App.css`**

Change the `.dashboard-shell` base rule from:

```css
.dashboard-shell {
  display: grid;
  gap: 26px;
  width: min(100%, 1180px);
  max-width: 1180px;
  min-width: 0;
}
```

to:

```css
.dashboard-shell {
  display: grid;
  gap: 18px;
  width: 100%;
  min-width: 0;
}
```

Then update these existing dashboard spacing values:

```css
.dashboard-shell__header {
  gap: 22px;
  padding: 20px;
  background:
    radial-gradient(
      circle at 92% 12%,
      rgb(186 230 253 / 0.58),
      transparent 30%
    ),
    linear-gradient(135deg, rgb(255 255 255 / 0.9), rgb(240 249 255 / 0.68));
}

.dashboard-shell__highlights {
  gap: 12px;
}

.dashboard-shell__highlight {
  min-height: 132px;
  padding: 18px;
}

.dashboard-shell__command-grid {
  gap: 12px;
}

.dashboard-shell__metric-groups {
  gap: 18px;
}

.dashboard-shell__metrics {
  gap: 12px;
}

.dashboard-shell__charts {
  gap: 12px;
}
```

Expected: dashboard occupies the centered shell width and feels denser without changing data or chart behavior.

- [ ] **Step 7: Update mobile shell CSS in `src/App.css`**

Inside `@media (max-width: 720px)`, replace the existing `.app-header` and `.app-main` shell rules with:

```css
.app-header__inner {
  padding: 12px 16px;
}

.app-brand__tagline,
.app-header__status span {
  display: none;
}

.app-main {
  padding: 16px 16px 122px;
}
```

Inside `@media (max-width: 640px)`, replace the current `.app-main` rule with:

```css
.app-main {
  padding: 14px 14px 122px;
}
```

Expected: mobile keeps tight gutters, no horizontal scroll, and enough bottom padding for the current bottom nav.

- [ ] **Step 8: Run phase-1 verification**

Run:

```bash
npm run format:check
npm run build
git diff --check
```

Expected:

- Prettier check passes.
- TypeScript/Vite build passes.
- Diff whitespace check passes.

If `format:check` fails, run:

```bash
npm run format
npm run format:check
```

Then rerun:

```bash
npm run build
git diff --check
```

- [ ] **Step 9: Commit phase 1**

Run:

```bash
git add src/app/layouts/app-layout.tsx src/index.css src/App.css
git commit -m "feat: refine lagoon light shell layout"
```

Expected: commit includes only the shell/background/dashboard-fit changes.

- [ ] **Step 10: Stop for user review**

Do not proceed to Task 2.

Report:

```md
Phase 1 is ready for review:

- centered topbar and main content
- lighter Lagoon background
- denser dashboard fit
- existing nav behavior unchanged

Validation:

- npm run format:check: pass
- npm run build: pass
- git diff --check: pass

Please review the layout shell. I will wait for approval before changing navigation.
```

Expected: user reviews shell before nav implementation begins.

---

### Task 2: Light Floating Nav With Pure-Blue Moving Active Plate

**Start condition:** Only execute this task after the user approves Task 1.

**Files:**

- Modify: `src/app/layouts/app-layout.tsx`
- Modify: `src/App.css`

- [ ] **Step 1: Add `useLocation` import in `src/app/layouts/app-layout.tsx`**

Change:

```tsx
import { NavLink } from 'react-router-dom'
```

to:

```tsx
import { NavLink, useLocation } from 'react-router-dom'
```

Expected: layout can derive the current active primary route.

- [ ] **Step 2: Add primary nav index helpers in `src/app/layouts/app-layout.tsx`**

Below `secondaryNavigationItems`, add:

```tsx
function getActivePrimaryIndex(pathname: string) {
  const activeIndex = primaryNavigationItems.findIndex((item) => {
    if (item.path === routePaths.dashboard) {
      return pathname === item.path
    }

    return pathname === item.path || pathname.startsWith(`${item.path}/`)
  })

  if (activeIndex !== -1) {
    return activeIndex
  }

  const isSecondaryRouteActive = secondaryNavigationItems.some(
    (item) => pathname === item.path || pathname.startsWith(`${item.path}/`),
  )

  return isSecondaryRouteActive ? primaryNavigationItems.length : 0
}
```

Expected:

- Dashboard is active only on `/dashboard`.
- Nested primary pages activate their primary section.
- Secondary routes activate the More item for plate placement.

- [ ] **Step 3: Derive active plate values in `AppLayout`**

At the top of `AppLayout`, replace:

```tsx
const [isMoreOpen, setIsMoreOpen] = useState(false)
```

with:

```tsx
const [isMoreOpen, setIsMoreOpen] = useState(false)
const location = useLocation()
const activePrimaryIndex = getActivePrimaryIndex(location.pathname)
const isMoreRouteActive = activePrimaryIndex === primaryNavigationItems.length
```

Expected: layout has a stable active index for CSS variables.

- [ ] **Step 4: Add nav CSS variables and active plate markup**

Change the `<nav>` opening tag from:

```tsx
      <nav
        className="app-bottom-nav"
        aria-label="Primary app sections"
        id="primary-navigation"
      >
```

to:

```tsx
      <nav
        className="app-bottom-nav"
        aria-label="Primary app sections"
        id="primary-navigation"
        style={
          {
            '--app-bottom-nav-active-index': activePrimaryIndex,
          } as CSSProperties
        }
      >
        <span className="app-bottom-nav__active-plate" aria-hidden="true" />
```

Then update the React import from:

```tsx
import { useState, type ReactNode } from 'react'
```

to:

```tsx
import { useState, type CSSProperties, type ReactNode } from 'react'
```

Expected:

- The active plate is a single element inside the nav.
- TypeScript knows the inline custom-property style type.

- [ ] **Step 5: Update More button active class**

Replace the More button `className` expression with:

```tsx
              className={
                isMoreOpen || isMoreRouteActive
                  ? 'app-bottom-nav__item app-bottom-nav__item--active'
                  : 'app-bottom-nav__item'
              }
```

Expected:

- More shows active styling when the current route is Leases, Receipts, Reminders, or Maintenance.
- More also shows active styling while its menu is open.

- [ ] **Step 6: Keep active label visible and inactive labels hidden**

Keep existing item labels inside `<span>{item.label}</span>`.

Do not add visible labels to inactive routes in JSX. CSS will keep inactive labels visually hidden and show the active route label.

Expected:

- Active route can show icon plus name.
- Inactive labels remain available to assistive tech through existing text.

- [ ] **Step 7: Replace bottom nav CSS in `src/App.css`**

Replace the current `.app-bottom-nav` through `.app-bottom-nav__menu-item span` block with:

```css
.app-bottom-nav {
  --app-bottom-nav-item-width: 58px;
  --app-bottom-nav-active-width: 128px;
  --app-bottom-nav-gap: 6px;
  --app-bottom-nav-padding: 9px;
  --app-bottom-nav-active-index: 0;
  position: fixed;
  z-index: 40;
  left: 50%;
  bottom: 22px;
  width: min(calc(100% - 32px), 560px);
  transform: translateX(-50%);
  border: 1px solid var(--lagoon-light-border);
  border-radius: 999px;
  padding: var(--app-bottom-nav-padding);
  background: rgb(255 255 255 / 0.88);
  box-shadow:
    0 22px 46px rgb(14 116 144 / 0.16),
    inset 0 1px 0 rgb(255 255 255 / 0.96);
  backdrop-filter: blur(18px);
}

.app-bottom-nav__active-plate {
  position: absolute;
  z-index: 0;
  top: var(--app-bottom-nav-padding);
  left: var(--app-bottom-nav-padding);
  width: var(--app-bottom-nav-active-width);
  height: 46px;
  border-radius: 999px;
  background: var(--lagoon-500);
  box-shadow:
    0 14px 28px rgb(14 165 233 / 0.28),
    inset 0 1px 0 rgb(255 255 255 / 0.28);
  transform: translateX(
    calc(
      var(--app-bottom-nav-active-index) *
        (var(--app-bottom-nav-item-width) + var(--app-bottom-nav-gap))
    )
  );
  transition:
    transform 280ms cubic-bezier(0.2, 0.85, 0.2, 1),
    width 280ms cubic-bezier(0.2, 0.85, 0.2, 1);
  pointer-events: none;
}

.app-bottom-nav__list {
  position: relative;
  z-index: 1;
  display: flex;
  align-items: center;
  gap: var(--app-bottom-nav-gap);
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
  min-height: 46px;
  color: #52697a;
  background: transparent;
  font: inherit;
  font-size: 13px;
  font-weight: 900;
  text-decoration: none;
  cursor: pointer;
  white-space: nowrap;
}

.app-bottom-nav__item {
  position: relative;
  width: var(--app-bottom-nav-item-width);
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
  color: #334155;
  background: rgb(226 232 240 / 0.62);
}

.app-bottom-nav__item.active {
  width: var(--app-bottom-nav-active-width);
  color: #ffffff;
  background: transparent;
  box-shadow: none;
}

.app-bottom-nav__item--active {
  width: var(--app-bottom-nav-active-width);
  color: #ffffff;
  background: var(--lagoon-500);
}

.app-bottom-nav__item.active span {
  position: static;
  width: auto;
  height: auto;
  overflow: visible;
  clip: auto;
}

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
  border: 1px solid var(--lagoon-light-border);
  border-radius: 22px;
  padding: 8px;
  background: rgb(255 255 255 / 0.92);
  box-shadow: 0 22px 44px rgb(14 116 144 / 0.18);
  transform-origin: 85% 100%;
  animation: app-bottom-nav-menu-in 180ms ease-out;
}

.app-bottom-nav__menu-item {
  justify-content: flex-start;
  min-height: 42px;
  padding: 0 12px;
  color: #52697a;
}

.app-bottom-nav__menu-item:hover,
.app-bottom-nav__menu-item:focus-visible,
.app-bottom-nav__menu-item.active {
  color: var(--lagoon-700);
  background: #e0f7ff;
}

.app-bottom-nav__menu-item span {
  min-width: 0;
}

@keyframes app-bottom-nav-menu-in {
  from {
    opacity: 0;
    transform: translateY(8px) scale(0.98);
  }

  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}
```

Expected:

- Nav surface is light glass, not dark.
- Active plate uses `var(--lagoon-500)` (`#0ea5e9`).
- Active route shows icon plus name.
- Inactive routes show icon only visually.
- Nav total width stays stable because exactly one item has active width.
- More menu is light glass.

- [ ] **Step 8: Add reduced-motion handling**

Add this explicit fallback to `src/App.css` near the bottom nav CSS:

```css
@media (prefers-reduced-motion: reduce) {
  .app-bottom-nav__active-plate,
  .app-bottom-nav__menu {
    transition: none;
    animation: none;
  }
}
```

Expected: nav motion is disabled or greatly reduced for users who request reduced motion.

- [ ] **Step 9: Update mobile nav CSS**

Inside `@media (max-width: 720px)`, replace the current bottom nav rules with:

```css
.app-bottom-nav {
  --app-bottom-nav-item-width: 48px;
  --app-bottom-nav-gap: 5px;
  --app-bottom-nav-active-width: 112px;
  bottom: 14px;
  width: min(calc(100% - 20px), 420px);
}

.app-bottom-nav__item {
  min-height: 44px;
}

.app-bottom-nav__active-plate {
  height: 44px;
}
```

Expected: nav fits mobile widths without horizontal overflow.

- [ ] **Step 10: Run phase-2 verification**

Run:

```bash
npm run format:check
npm run build
git diff --check
```

Expected:

- Prettier check passes.
- TypeScript/Vite build passes.
- Diff whitespace check passes.

- [ ] **Step 11: Commit phase 2**

Run:

```bash
git add src/app/layouts/app-layout.tsx src/App.css
git commit -m "feat: refine lagoon light active nav"
```

Expected: commit includes only nav markup/state/CSS changes.

---

### Task 3: Documentation Closeout for Approved Refinement

**Start condition:** Execute after the user approves both Task 1 and Task 2 behavior.

**Files:**

- Modify: `docs/27-lagoon-command-center-validation-checklist.md`
- Modify: `wiki/04-roadmap/release-plan.md`
- Modify: `wiki/09-status/built.md`
- Modify: `wiki/09-status/not-built.md`
- Modify: `wiki/06-task-breakdown/task-index.md`
- Modify: `wiki/06-task-breakdown/ready-soon.md`

- [ ] **Step 1: Update validation checklist**

In `docs/27-lagoon-command-center-validation-checklist.md`, add these checklist items under `## Scope`:

```md
- [ ] App shell uses centered max-width topbar and main content.
- [ ] App background uses the lighter Lagoon direction.
- [ ] Floating nav uses a light glass surface.
- [ ] Active nav route uses a moving pure-blue plate.
- [ ] Active nav route shows the route name.
- [ ] Inactive nav routes hide names visually.
```

Add these items under `## Manual Validation`:

```md
- [ ] Wide desktop layout keeps topbar and main content centered.
- [ ] Active nav plate moves when route changes.
- [ ] Active nav color is medium blue, not navy or pale.
- [ ] Inactive icons use darker grey-blue.
```

Expected: checklist captures the refinement without claiming manual validation is complete.

- [ ] **Step 2: Update roadmap/status docs**

In `wiki/04-roadmap/release-plan.md`, add `Lagoon light shell and active nav refinement` after `Lagoon Command Center shell/dashboard uplift` in the built list.

In `wiki/09-status/built.md`, add these bullets under Foundation or Design System:

```md
- centered max-width Lagoon topbar and main content shell
- light glass floating bottom navigation refinement
- pure-blue moving active nav plate
```

In `wiki/09-status/not-built.md`, keep deferred items unchanged except ensuring these remain listed if present:

```md
- visual regression automation
- drag/gesture dock interactions
- custom nav personalization
```

Expected: built/not-built pages distinguish implemented shell/nav polish from deferred animation tooling or personalization.

- [ ] **Step 3: Update task planning pages**

In `wiki/06-task-breakdown/task-index.md`, add `Lagoon light shell and active nav refinement` to Completed candidates.

In `wiki/06-task-breakdown/ready-soon.md`, add `Lagoon light shell and active nav refinement` to Completed candidates and keep the next likely candidate as choosing the next focused MVP gap.

Expected: wiki status reflects this UI refinement as complete after implementation approval.

- [ ] **Step 4: Run docs checks**

Run:

```bash
npm run format:check
git diff --check
```

Expected:

- Prettier check passes.
- Diff whitespace check passes.

- [ ] **Step 5: Commit docs closeout**

Run:

```bash
git add docs/27-lagoon-command-center-validation-checklist.md wiki/04-roadmap/release-plan.md wiki/09-status/built.md wiki/09-status/not-built.md wiki/06-task-breakdown/task-index.md wiki/06-task-breakdown/ready-soon.md
git commit -m "docs: close lagoon light nav refinement"
```

Expected: commit includes only docs/wiki updates.

---

### Task 4: Final Verification and Review

**Start condition:** Execute after Tasks 1-3 are complete and the user has approved the staged UI behavior.

**Files:**

- Read changed files from Tasks 1-3.

- [ ] **Step 1: Run full automated verification**

Run:

```bash
npm run format:check
npm run build
npm run lint
git diff --check
```

Expected:

- All commands exit 0.
- No formatting, build, lint, or whitespace issues remain.

- [ ] **Step 2: Start dev server**

Run:

```bash
npm run dev -- --host 127.0.0.1 --port 5175
```

Expected:

- Vite reports a local URL at `http://127.0.0.1:5175/`.
- If port 5175 is unavailable, use the next free port and record it.

- [ ] **Step 3: Manual browser review**

Review these routes and states:

```md
- `/dashboard` at wide desktop width: centered topbar and centered main content.
- `/dashboard` at tablet width: no horizontal scrolling.
- `/dashboard` at mobile width: no horizontal scrolling.
- `/dashboard` bottom nav: light surface.
- Route changes between Dashboard, Properties, Tenants, Invoices, Payments: active plate moves.
- Active route: icon plus visible route name.
- Inactive routes: icons visible, labels visually hidden.
- More menu: opens, closes, and uses light surface.
- `/dashboard/properties`: list page remains readable.
- One create/edit form remains readable.
- One receipt/detail page remains readable.
- `/auth` or sign-in route remains readable.
- Content is not hidden behind the bottom nav.
- Browser console has no route/navigation errors.
```

Expected:

- Manual review passes or produces concrete fixes.

- [ ] **Step 4: Stop dev server**

Stop the Vite process with `Ctrl-C`.

If the PTY cannot receive `Ctrl-C`, run:

```bash
lsof -tiTCP:5175 -sTCP:LISTEN
```

Then stop only that PID.

Expected: no Vite process remains from this task.

- [ ] **Step 5: Final repository check**

Run:

```bash
git status --short
git log --oneline -10
```

Expected:

- Working tree is clean.
- Recent commits include the design spec, this implementation plan, Task 1, Task 2, and docs closeout.

- [ ] **Step 6: Final response**

Final response must include:

```md
- Summary of centered light shell changes.
- Summary of final nav behavior.
- Files changed.
- Validation commands and results.
- Manual browser review status.
- Deferred scope.
```

Expected: user has a concise closeout with evidence and known limitations.
