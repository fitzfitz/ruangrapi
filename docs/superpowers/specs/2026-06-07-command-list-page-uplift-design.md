# Command List Page Uplift Design

## Context

The dashboard has moved to a wide, dense, light lagoon command surface with compact information groups, richer cards, and a centered shell. The core list pages still feel closer to the earlier app style: narrower, simpler headers, stacked cards, and less operational hierarchy.

This design updates the primary list pages so they feel structurally related to the dashboard while preserving their current data flows and user actions.

## Scope

Included in this phase:

- Properties
- Tenants
- Leases
- Invoices
- Payments
- Receipts

Deferred to the next task:

- Maintenance
- Reminders
- Create pages
- Edit pages
- Detail pages

Those deferred pages have different interaction models. Maintenance and Reminders are workflow/queue surfaces, while create/edit/detail pages need a guided form/detail treatment rather than the command-list pattern.

## Selected Direction

Use the **Command List Page** structure selected in the visual companion:

- Wide centered page body matching the dashboard shell.
- Command header with title, concise operational copy, and primary action.
- Compact summary strip below the header.
- Main list area styled as a dashboard-like surface rather than isolated legacy cards.
- Optional utility rail only when it adds real value; avoid empty decoration.

## Page Structure

Each included page should follow this hierarchy:

1. Header band: page title, short description, primary action.
2. Summary strip: 3 compact metric cards using data already available on the page.
3. Content grid: main list surface and optional side panel.
4. States: loading, error, and empty states should visually match the dashboard status/error cards.

The design should stay dense and operational. Avoid marketing-style hero sections, decorative oversized cards, or instructional copy blocks.

## Summary Strip

Metrics should use local page data, not new backend queries.

Examples:

- Properties: total properties, properties with address, missing notes.
- Tenants: total tenants, contacts with email, emergency contacts missing.
- Leases: active leases, upcoming end dates, inactive/ended leases.
- Invoices: draft, issued/paid/overdue counts where status data exists.
- Payments: total records, recent payments, receipt-linked payments.
- Receipts: total receipts, printed/downloadable records where data allows, recent receipts.

If a page does not have enough meaningful fields, use fewer metrics rather than filler.

## List Surface

The list should feel closer to the dashboard cards:

- Light lagoon surface with restrained borders and subtle shadows.
- Rows/cards with compact spacing and strong scan hierarchy.
- Status chips use consistent color and shape.
- Primary identifiers are easy to scan.
- Secondary metadata is grouped into compact detail rows.
- Actions are aligned consistently and do not dominate the row.

The implementation can keep existing card markup where practical, but CSS should unify the visual treatment. Add markup only when the current structure cannot support the required hierarchy.

## Utility Rail

Use a side rail only when it has useful page-local information, such as:

- Status breakdowns.
- Missing data warnings.
- Next best action hints.
- Recent operational signal.

If a useful rail is not available for a page, the list should occupy the full grid width.

## Responsive Behavior

Desktop:

- Use the existing app shell width.
- Use a two-column content grid only when the side rail exists.
- Keep the summary strip compact and dense.

Tablet and mobile:

- Stack header actions below text when needed.
- Summary cards become two columns or one column depending on width.
- Content grid collapses to a single column.
- Preserve bottom navigation spacing.

## Accessibility

- Keep semantic `section`, `article`, `dl`, and accessible list labels.
- Status/error states retain `aria-live` or `role="alert"` as currently used.
- Buttons and links keep visible focus states.
- Do not hide essential text behind icon-only controls.
- Respect existing reduced-motion handling.

## Implementation Notes

- Prefer shared CSS selector groups in `src/App.css` where existing page styles are already grouped.
- Keep page-specific helpers inside each page module.
- Do not add dependencies.
- Do not introduce new data fetching for this phase.
- Keep behavior unchanged; this is a layout and visual hierarchy uplift.

## Validation

Run before completion:

- `npm run format:check`
- `npm run build`
- `npm run lint`
- `git diff --check`

Manual review should include:

- Properties, Tenants, Leases, Invoices, Payments, and Receipts at desktop width.
- At least one mobile viewport check.
- Loading, empty, and error states where practical.

## Out Of Scope

- New filters or search.
- New charting.
- Backend query changes.
- Maintenance and Reminders queue redesign.
- Create/edit/detail page redesign.
- New reusable component library extraction unless it is necessary to keep the implementation sane.
