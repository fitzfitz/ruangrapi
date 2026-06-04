# Joyful Premium UI Uplift Design

## Goal

Elevate RuangRapi from the current Warm Admin Ledger baseline into a more memorable, playful, and premium operations interface without reducing daily usability. The uplift should make the product feel more distinctive and enjoyable while preserving route behavior, Supabase behavior, validation messages, domain wording, and receipt print behavior.

## Approved Direction

Use **Joyful Premium Ops, restrained for daily work**.

The target feel is a vivid property-operations cockpit:

- premium dark navigation shell with richer brand presence
- teal, indigo, and orange as the signature accent set
- more expressive dashboard cards and chart surfaces
- polished shadows, glass-like highlights, and stronger metric hierarchy
- playful success, empty, and "next action" moments
- subtle motion and hover feedback that feels responsive but not distracting

Restraint applies to dense work surfaces:

- forms stay calm, readable, and low-friction
- lists use less gradient and lower visual intensity than dashboard cards
- table-like detail blocks remain scannable
- receipt print remains plain, high-contrast, and professional
- animations respect `prefers-reduced-motion`

## Scope

This pass changes interface presentation only. It does not add product flows, database work, RLS changes, routing changes, new mutations, new API calls, or new dashboard data.

In scope:

- design-system evolution from Warm Admin Ledger to Joyful Premium Ops
- design-token expansion in `src/index.css`
- shared component visual variants and default styling updates under `src/components/ui/`
- app shell visual uplift in `src/App.css` and `src/app/layouts/app-layout.tsx` only if markup changes are needed for presentation
- dashboard card, chart, range selector, and status styling
- shared list, form, detail, empty, loading, error, action, badge, and receipt-card styling
- auth, signup, onboarding, reminders, maintenance, receipt detail, and print-safe visual adjustments
- documentation closeout in relevant docs/wiki pages

Out of scope:

- dark mode toggle
- new route structure
- new dashboard widgets or reporting calculations
- custom date ranges
- replacing every domain-local BEM class with React primitives
- visual regression tooling setup
- changing receipt content or print layout semantics

## Visual System

This design becomes the next RuangRapi design-system direction. The existing Warm Admin Ledger system remains the foundation for compact operational readability, but it should be updated with a stronger Joyful Premium Ops layer.

Design-system updates should include:

- token additions for deep navy, indigo, orange, premium surface gradients, glass highlights, and stronger shadow levels
- revised radius and elevation scales that distinguish expressive dashboard surfaces from dense work surfaces
- button, badge, alert, card, input, select, and textarea visual defaults aligned with the new direction
- sidebar and navigation tokens for the premium dark shell
- chart colors aligned with teal, indigo, orange, green, amber, red, and blue semantics
- documented usage guidance for when to use expressive treatments versus restrained operational treatments

### Color

Keep the existing teal primary, then introduce a stronger premium accent system:

- deep navy shell for premium contrast
- teal for primary productive actions and positive collection state
- indigo for portfolio health, active navigation highlights, and premium glow
- orange for action-needed, warmth, and playful energy
- green, amber, red, and blue remain semantic status colors

Use gradients selectively on the dashboard, shell brand surfaces, and key callouts. Avoid gradients inside ordinary form fields and dense list rows.

### Shape and Depth

Use larger radius and deeper shadows for expressive dashboard and overview cards. Use smaller, calmer surfaces for forms, lists, and detail cards.

Recommended split:

- dashboard hero and primary metric cards: 18-24px radius
- list cards and forms: 10-14px radius
- buttons and compact controls: 10-12px radius
- receipt print: square or low-radius print-safe styling

Shadows should create premium depth without making every card float equally. Primary cards get the strongest depth; routine cards get subtle elevation.

### Typography

Continue using self-hosted Plus Jakarta Sans. Make dashboard and shell headings more confident with heavier weights and stronger scale. Keep form labels, list metadata, and detail labels compact and readable.

Do not use viewport-width font scaling. Text must fit containers at mobile and desktop widths.

### Motion

Use short transitions for color, shadow, and background changes. Avoid scale transforms that shift layout. Add small hover richness to cards and buttons, but keep interaction states predictable.

All motion must be disabled or reduced under `prefers-reduced-motion`.

## UX Behavior

The uplift should make priority clearer, not just prettier:

- active navigation should be obvious in the dark shell
- primary actions should feel more clickable and prominent
- empty states should feel warmer and more useful
- status badges should be easier to distinguish
- dashboard should communicate "what needs attention" faster
- forms should keep current validation and disabled behavior

No in-app instructional copy should be added just to explain the UI.

## Implementation Architecture

Prefer a CSS-token and shared-pattern pass before changing domain markup. The current app already maps broad BEM selectors through `src/App.css`; use that layer for the first uplift so behavior remains untouched.

Update shared primitives where they define design-system defaults:

- `src/components/ui/button.tsx`
- `src/components/ui/card.tsx`
- `src/components/ui/badge.tsx`
- `src/components/ui/alert.tsx`
- `src/components/ui/input.tsx`
- `src/components/ui/select.tsx`
- `src/components/ui/textarea.tsx`

Keep edits scoped to presentation. Do not change domain hooks, repositories, schemas, route paths, or Supabase code.

Documentation closeout should update the existing design-system status in `wiki/09-status/built.md`, the roadmap/task pages that reference UI polish, and any plan/spec docs created for this uplift. The closeout should record that Joyful Premium Ops supersedes Warm Admin Ledger as the active visual direction while preserving Warm Admin Ledger's operational-density principles.

## Validation

Required automated validation:

- `npm run format:check`
- `npm run build`
- `npm run lint`
- `git diff --check`

Manual validation:

- desktop and mobile dashboard
- one list page
- one create/edit form page
- one detail page
- auth or onboarding page
- reminders page
- maintenance page
- receipt detail page and print view

Check:

- active navigation visibility
- mobile menu usability
- keyboard focus states
- disabled states
- form errors
- loading, empty, and error states
- text wrapping and no overlap at mobile widths
- receipt print remains plain and readable

## Deferred Work

After this pass, future UI tasks can replace remaining domain-local BEM markup with shared React primitives and add screenshot-based visual regression checks. Those are intentionally deferred so this uplift stays focused on look, feel, hierarchy, and usability.
