# Receipt Print Preview Design

## Status

Approved for implementation planning.

## Summary

Add a focused Receipt product-value refinement that separates operational receipt review from printable receipt presentation.

The task will keep the existing receipts list and receipt detail route, add a dedicated receipt print-preview route, and extract the receipt document into a reusable component. The printable document will use the approved Joyful Premium Ops visual direction with a cleaner, more eye-catching receipt layout. Browser printing is included in this slice; generated PDF/download files are intentionally deferred but the component structure should make a future PDF/download task straightforward.

## Goals

- Make generated receipts easier for owners/admins to inspect and print.
- Keep `/dashboard/receipts/:receiptId` as an operational receipt detail page.
- Add `/dashboard/receipts/:receiptId/print` as a dedicated document-style print-preview route.
- Extract a reusable receipt document component that can be used by the print route now and future PDF/download work later.
- Improve the visual hierarchy of the receipt itself so the receipt document feels polished, official, and easy to scan.
- Preserve the existing Supabase-backed receipt data model and RLS behavior.

## Non-goals

This task will not:

- Generate PDF files.
- Add a PDF/download dependency.
- Add email or WhatsApp receipt delivery.
- Add receipt edit or delete workflows.
- Automatically generate receipts after payment recording.
- Change receipt numbering behavior.
- Change invoice/payment business rules.
- Change database schema, RLS policies, SQL, or migrations.
- Add receipt search, filtering, pagination, or exports.

## Current State

Existing receipt routes:

```txt
/dashboard/receipts
/dashboard/receipts/:receiptId
```

Existing implementation notes:

- `src/modules/receipts/presentation/receipts-page.tsx` lists generated receipts and links each receipt card to the detail route.
- `src/modules/receipts/presentation/receipt-detail-page.tsx` currently fetches a receipt, renders an internal `ReceiptDocument`, and prints directly via `window.print()`.
- `src/modules/receipts/infrastructure/receipts-repository.ts` already maps receipt detail data from receipts, payments, invoices, tenants, units, and properties.
- `ReceiptDetail` currently includes receipt number, issued date, payment amount/date/method/reference/notes, invoice billing period/status/total/due date, tenant name, unit name, and optional property name.

## Proposed Route Architecture

Target receipt routes:

```txt
/dashboard/receipts
/dashboard/receipts/:receiptId
/dashboard/receipts/:receiptId/print
```

Add route path:

```ts
dashboardReceiptPrint: '/dashboard/receipts/:receiptId/print'
```

The print route should be protected with the existing dashboard route access pattern.

## Proposed Component Boundaries

Expected receipt presentation files:

```txt
src/modules/receipts/presentation/receipt-detail-page.tsx
src/modules/receipts/presentation/receipt-print-page.tsx
src/modules/receipts/presentation/receipt-document.tsx
```

### `receipt-detail-page.tsx`

Purpose: operational receipt review page.

Responsibilities:

- Read `receiptId` from route params.
- Use the existing receipt query hook.
- Handle loading, error, missing ID, and inaccessible/not-found states.
- Show receipt context for an owner/admin reviewing a receipt inside the application.
- Provide a primary action to open the print-preview route.
- Provide a secondary action back to the receipts list.
- Avoid calling `window.print()` directly from the detail page.

### `receipt-print-page.tsx`

Purpose: dedicated print-preview page.

Responsibilities:

- Read `receiptId` from route params.
- Use the existing receipt query hook.
- Handle loading, error, missing ID, and inaccessible/not-found states.
- Render a minimal top command bar with:
  - breadcrumb/title context,
  - `Print receipt` action,
  - `Back to detail` action.
- Call `window.print()` only from the print-preview page.
- Center the reusable receipt document on a soft preview background.
- Avoid the full `AppLayout` sidebar/chrome unless implementation planning finds a project constraint that requires it; the intended UX is a focused print-preview route with only a minimal command bar.
- Hide command chrome and preview background in print media, leaving only the receipt document.

### `receipt-document.tsx`

Purpose: reusable branded receipt document.

Responsibilities:

- Accept a `ReceiptDetail` object as input.
- Format receipt content without fetching data.
- Present a polished document-style receipt that can be reused by browser print now and future PDF/download work later.
- Keep fallback handling for optional fields so the document never has blank holes.
- Avoid route, query, or mutation dependencies.

## User Experience Design

### Receipt list

The receipts list should keep its current behavior:

- Load generated receipts.
- Show loading, error, and empty states.
- Link each receipt card to `/dashboard/receipts/:receiptId`.

No list filters, search, export, or pagination are part of this task.

### Receipt detail page

The detail page is the operational app view. It should help the owner/admin confirm the receipt before printing.

Recommended content:

- Receipt number.
- Paid amount.
- Tenant name.
- Unit name.
- Property name fallback when unavailable.
- Issued date.
- Payment date.
- Payment method.
- Payment reference number fallback when unavailable.
- Invoice billing period.
- Invoice status.
- Invoice total.
- Payment notes fallback when unavailable.

Recommended actions:

- Primary: `Open print preview`.
- Secondary: `Back to receipts`.

Do not show a working or disabled `Download PDF` action in this slice. PDF/download should be documented as future-planned rather than teased as a non-functional control.

### Print-preview page

The print route is the document view. It should feel focused and uncluttered.

Recommended layout:

- Minimal command bar at the top of the page.
- Centered receipt document on a soft neutral preview background.
- No full dashboard sidebar inside the print surface.
- `Print receipt` button calls `window.print()`.
- `Back to detail` navigates to `/dashboard/receipts/:receiptId`.

Print media behavior:

- Hide command bar and app/preview chrome.
- Remove backgrounds and shadows that waste ink.
- Preserve the document layout and readable text hierarchy.
- Avoid page breaks inside key receipt blocks where practical.

## Receipt Document Visual Direction

Use the approved V2 visual direction from brainstorming.

The receipt document should be more eye-catching and organized than the current baseline:

- Warm printable paper surface.
- Premium branded header with RuangRapi name.
- Teal/indigo gradient accent consistent with Joyful Premium Ops.
- Large `Payment Receipt` title.
- Clear `Paid` status badge.
- Prominent receipt number.
- Summary cards for recipient and payment date/method/reference.
- Payment breakdown section with aligned currency amounts.
- Strong total-received band as the visual anchor.
- Metadata cards for property, unit, and payment method.
- Footer note explaining the receipt was generated from RuangRapi operational records.
- Static owner/admin signature placeholder with a simple label such as `Owner/Admin`; it is a printed-document affordance only, not an editable signature feature.

The layout should remain responsive:

- Desktop: document centered and comfortably wide.
- Small screens: cards stack vertically, long text wraps, no horizontal scrolling.
- Print: document remains readable and avoids unnecessary app chrome.

## Receipt Document Content

The document should include:

- RuangRapi brand.
- Title: `Payment Receipt`.
- Status: `Paid`.
- Receipt number.
- Tenant name under `Received from`.
- Unit and property context.
- Payment date.
- Payment method.
- Payment reference number when present, with fallback copy when missing.
- Invoice billing period.
- Invoice reference context when available from existing data; otherwise use billing period/status context only.
- Payment amount as total received.
- Invoice total amount for context.
- Payment notes when present, with fallback copy when missing.
- Footer note and owner/admin signature placeholder.

The implementation should not invent data that is not currently available from `ReceiptDetail`. If a desired field is unavailable, use the current available field or a clear fallback rather than expanding the data model or query scope unnecessarily.

## Error, Loading, and Empty States

Both the receipt detail page and print-preview page should handle:

- Missing `receiptId` route parameter.
- Loading state while the receipt query is pending.
- Query error with a clear retry-later message.
- `null` receipt result for not-found or inaccessible receipts.
- Optional fields such as property name, payment reference, and notes.

Fallback text should be clear and user-facing, for example:

- `Not added` for optional notes/reference.
- `No property name` or an equivalent clear property fallback.
- `Receipt not found` for missing or inaccessible receipt records.

## Styling and Accessibility Requirements

Use existing project styling conventions in `src/App.css` unless implementation planning decides a narrower CSS organization is appropriate.

Requirements:

- Preserve keyboard-accessible links and buttons.
- Use semantic buttons for print actions.
- Use semantic links for navigation actions.
- Ensure action text is descriptive; avoid icon-only controls.
- Keep text contrast readable in both preview and document surfaces.
- Keep focus states visible through existing global styles or explicit page styles.
- Avoid using color alone to communicate paid status; include visible text `Paid`.
- Use tabular/consistent numeric presentation for currency amounts where practical.

## Expected Implementation File Scope

Likely source files:

```txt
src/app/router/app-router.tsx
src/app/router/route-paths.ts
src/modules/receipts/presentation/receipt-detail-page.tsx
src/modules/receipts/presentation/receipt-print-page.tsx
src/modules/receipts/presentation/receipt-document.tsx
src/App.css
```

Likely planning/spec file:

```txt
docs/superpowers/specs/2026-06-05-receipt-print-preview-design.md
```

Possible closeout documentation during implementation, only if source-of-truth status changes:

```txt
docs/06-development-checklist.md
wiki/06-task-breakdown/task-index.md
wiki/09-status/built.md
wiki/09-status/not-built.md
```

Documentation should stay minimal and only update files whose source-of-truth content changes.

## Validation Plan

Implementation validation should run:

```txt
npm run format:check
npm run build
npm run lint
git diff --check
```

Manual validation should cover:

- A valid generated receipt exists for the test user/organization; use existing local data if available or create one through the existing payment-to-receipt flow before validation.
- `/dashboard/receipts` loads and existing receipt cards still open details.
- `/dashboard/receipts/:receiptId` loads the operational detail view.
- Detail page `Open print preview` goes to `/dashboard/receipts/:receiptId/print`.
- Print-preview page loads the same receipt data.
- Print-preview `Back to detail` returns to `/dashboard/receipts/:receiptId`.
- Print-preview `Print receipt` opens the browser print dialog.
- Print media hides command chrome and prints the receipt document only.
- Missing or inaccessible receipt IDs show a not-found state.
- Loading and query-error states are present.
- Optional reference/notes/property fields have clear fallbacks.
- Browser console has no errors during list → detail → print navigation.

## Implementation Planning Notes

The next step after this design is approved is to create an implementation plan with the Superpowers `writing-plans` workflow.

The plan should keep this as one focused product-value slice and avoid pulling in PDF generation, new dependencies, schema changes, delivery workflows, or receipt lifecycle changes.
