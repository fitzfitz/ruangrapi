# Receipts Validation Checklist

Status: manual validation complete.

Validation note: Receipts manual generation, browsing, detail, and print flows were validated in browser/local Supabase with disposable local data.

## Automated Checks

- [x] `npm run build` passes.
- [x] `npm run lint` passes.
- [x] `git diff --check` passes.

## Manual Setup

Use disposable local records created through the app. Do not commit local users, tokens, screenshots with private data, or seed data.

Required records:

- one organization
- one property
- one unit
- one tenant
- one active lease
- one issued invoice
- at least two payment records against the same invoice

## Payments List Receipt States

- [x] Payment without receipt shows `Generate receipt`.
- [x] Payment without receipt shows `Not generated yet`.
- [x] Payment without receipt uses the polished pending receipt panel.
- [x] Payment with receipt shows `Receipt issued`.
- [x] Payment with receipt shows receipt number.
- [x] Payment with receipt shows issued date.
- [x] Payment with receipt does not show `Generate receipt`.

## Receipt Generation

- [x] Click `Generate receipt` for a payment without receipt.
- [x] Button changes to `Generating...` while the mutation is pending.
- [x] Exactly one receipt row is created for that payment.
- [x] Generated receipt number follows `RR-{YYYY}-{0001}`.
- [x] Payment card refreshes to the issued receipt state.
- [x] A second payment for the same invoice can receive its own receipt.

## Receipt Browsing

- [x] Sidebar shows `Receipts`.
- [x] Receipts list page loads at `/dashboard/receipts`.
- [x] Receipts list shows receipt number, issued date, amount, payment date, payment method, tenant, unit, property, and billing period.
- [x] Empty receipts list explains receipts appear after generation.
- [x] `View receipt` from the Payments list opens the matching receipt detail page.
- [x] `View receipt` from the Receipts list opens the matching receipt detail page.

## Receipt Detail And Print

- [x] Receipt detail page loads at `/dashboard/receipts/:receiptId`.
- [x] Receipt detail shows receipt number, issued date, amount received, tenant, unit, property, payment date, payment method, payment reference, billing period, invoice status, invoice total, and payment notes.
- [x] Missing or inaccessible receipt shows a not-found state.
- [x] `Print` opens browser print.
- [x] Print view hides app navigation and page actions.

## Failure And Scope Checks

- [x] Duplicate receipt generation is not available from the UI once a receipt exists.
- [x] Inline error appears if receipt generation fails.
- [x] No PDF download, email, or WhatsApp delivery workflow was introduced.
- [x] No automatic receipt generation after payment recording was introduced.
- [x] No receipt edit or delete workflow was introduced.
- [x] No payment correction workflow was introduced.
- [x] No migrations or seed data were introduced.

## Deferred Work

PDF download, delivery workflows, automatic generation, receipt edit/delete, payment edit blocking after receipt generation, and payment correction workflows remain deferred.
