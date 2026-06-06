# Lagoon Shell Light Active Nav Refinement Design

## Goal

Refine the existing Lagoon Command Center shell so it feels lighter, more centered, denser, and more polished. The current direction is correct, but the shell needs better wide-screen framing, a fresher light background, and a modern active bottom-navigation treatment.

## Approved Direction

Use the final preview direction: **light Lagoon shell with a pure-blue moving active plate**.

The approved nav behavior:

- bottom navigation remains floating and centered
- nav surface is light glass, not dark
- inactive route names are hidden
- active route name is visible
- inactive icons use a slightly darker grey-blue
- active background is a clean medium blue, not navy and not pale
- active background moves between route positions as a single animated plate
- motion should feel like a modern mobile tab indicator, with a smooth spring-like slide

## Layout Refinement

The app should feel full-screen while keeping content readable on wide displays.

Add centered shell constraints:

- topbar content should sit inside a centered max-width container
- main page content should sit inside the same centered max-width container
- target max width: about `1440px`
- side gutters should remain visible on wide screens
- mobile should use tight but comfortable horizontal padding

The dashboard should feel denser and fitter:

- reduce unnecessary vertical whitespace
- keep cards closer together
- maintain stable grid dimensions
- keep the bottom nav from covering content
- preserve readable list, form, detail, auth, and receipt surfaces

## Background Direction

Replace the heavier/darker lagoon background with a lighter fresh background.

Use:

- white and very pale sky base
- soft sky/cyan radial shading
- subtle teal shade near the lower workspace
- light glass topbar and page surfaces
- no dark dock background

Avoid:

- dark navy shell surfaces
- heavy gradients
- purple-dominant effects
- decorative blobs that compete with content
- low contrast text

## Bottom Navigation Treatment

The final nav should be a light glass capsule with a moving active plate.

Nav surface:

- fixed bottom center
- light translucent white glass
- soft border in pale blue
- subtle cyan/blue shadow
- high-radius pill shape
- backdrop blur

Active plate:

- one absolutely positioned element inside the nav
- medium app blue, approximately `#0ea5e9`
- rounded pill
- slides between nav destinations
- resizes when the active route has a visible label
- sits behind the active item content
- respects `prefers-reduced-motion`

Active item:

- icon plus route name
- white text over the blue active plate
- stable width so the nav does not jump
- active route remains visible for keyboard users

Inactive items:

- icon only
- route names visually hidden but still accessible
- darker grey-blue icon color, around `#52697a`
- hover/focus can use a pale grey-blue background
- focus ring remains visible

More menu:

- keep secondary routes available through More
- menu surface should also be light glass
- active/hover states should align with the light nav system
- opening/closing can use a subtle upward scale/fade animation
- do not use ARIA menu roles; these remain navigation links

## Animation

The important animation is the active plate traveling between active routes.

Implementation expectations:

- use CSS transitions where possible
- update the plate position from the active route state or route-derived index
- animate `transform` and `width`, not layout-affecting properties where avoidable
- keep duration around 220-320ms
- use an easing curve similar to `cubic-bezier(0.2, 0.85, 0.2, 1)`
- disable or greatly reduce motion under `prefers-reduced-motion: reduce`

The animation should not:

- bounce excessively
- move unrelated page content
- cause nav width jumps
- make keyboard focus hard to follow

## Scope

In scope:

- app shell markup changes needed for centered containers and active nav state
- shell/nav CSS refinement
- light Lagoon background refinement
- dashboard density and fit CSS adjustments
- More menu light styling and animation
- docs closeout for the refinement

Out of scope:

- new routes
- changing route paths
- new dashboard metrics
- changing chart library
- ApexCharts implementation
- Supabase changes
- data fetching changes
- auth or route gate changes
- workflow changes in domain modules
- replacing all domain-local page markup

## Validation

Automated validation:

- `npm run format:check`
- `npm run build`
- `npm run lint`
- `git diff --check`

Manual validation:

- dashboard desktop at wide width shows centered topbar and centered content
- dashboard tablet and mobile do not horizontally scroll
- floating nav is light, not dark
- active route shows icon plus name
- inactive routes hide names visually
- active plate moves when route changes
- active plate uses medium blue
- inactive icons use darker grey-blue
- More menu opens and closes cleanly
- keyboard focus remains visible
- content is not hidden behind the bottom nav
- auth/sign-in screen remains readable
- one list page remains readable
- one form page remains readable
- one detail or receipt page remains readable

## Deferred

- visual regression automation
- route-transition animation
- drag/gesture dock interactions
- custom nav personalization
- ApexCharts evaluation or migration
