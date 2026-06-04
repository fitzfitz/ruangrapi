# RuangRapi Design System Design

## Goal

Establish a warm, compact, operations-focused design system for RuangRapi and migrate the current application surfaces onto it without changing product behavior, routes, data loading, mutations, validation messages, or print receipt behavior.

## Approved Direction

Use the "Warm Admin Ledger" direction:

- warm neutral app background and white ledger-like surfaces
- teal primary actions for productive work
- slate foreground text for dense operational reading
- amber, red, green, and blue semantic colors for status and feedback
- Plus Jakarta Sans as the self-hosted product font
- compact spacing, 8px radii, clear focus rings, and stable hover states

The interface should feel like a practical property-management operations tool, not a marketing page. Screens should prioritize scanning, repeated action, and clear state transitions.

## Architecture

Design tokens live in `src/index.css` and expose both app-specific variables and Tailwind 4 theme variables. Shared shadcn-style primitives live under `src/components/ui/` and are configured for Base UI through `components.json` with the `base-rhea` style. The existing domain pages keep their route and behavior code, while global CSS patterns in `src/App.css` migrate the current BEM classes to the new visual system.

`AppLayout` becomes the main product shell with a branded sidebar, active navigation states, compact desktop navigation, and a mobile navigation toggle. The shell remains route-agnostic and receives existing page children.

## Components

Add or adapt reusable primitives:

- `Button`
- `Input`
- `Textarea`
- `Select`
- `Label`
- `Form`
- `Badge`
- `Alert`
- `Card`
- `Separator`

Component APIs should accept `className`, support disabled/error states through standard HTML attributes or data attributes, and support `asChild` where practical for link/button composition.

## Migration Scope

Migrate the visual treatment for:

- dashboard metrics and charts
- properties, units, tenants, leases, invoices, payments, receipts, reminders, and maintenance pages
- auth, signup, onboarding, and account-state placeholders
- loading, error, empty, card, form, status, action, and receipt-print patterns

The migration is intentionally broad but non-functional: it does not include new database work, RLS changes, route changes, or module scope expansion.

## Accessibility and Responsive Behavior

Use visible focus states, preserve semantic headings and landmarks, keep disabled states distinct, ensure mobile navigation can be opened and closed with a button, and avoid hover effects that move layout. Mobile surfaces should collapse to single-column content with full-width primary actions where the current page patterns already do so.

## Validation

Required validation:

- `npm run format:check`
- `npm run build`
- `npm run lint`
- `git diff --check`

Manual validation should cover representative desktop and mobile routes: dashboard, a list page, a create/edit form, a detail page, auth/onboarding, receipts/print, reminders, and maintenance.

## Deferred Scope

Do not add dark mode, new chart interactions, custom date ranges, table virtualization, new product flows, or new Supabase behavior in this pass. Future UI work can replace remaining domain-local BEM markup with the shared primitives incrementally.
