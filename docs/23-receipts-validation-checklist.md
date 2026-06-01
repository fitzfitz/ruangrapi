# Receipts Validation Checklist

Status: ready for manual validation after the Receipts browsing implementation.

## Automated Checks

- [ ] `npm run build` passes.
- [ ] `npm run lint` passes.
- [ ] `git diff --check` passes.

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

- [ ] Payment without receipt shows `Generate receipt`.
- [ ] Payment without receipt shows `Not generated yet`.
- [ ] Payment without receipt uses the polished pending receipt panel.
- [ ] Payment with receipt shows `Receipt issued`.
- [ ] Payment with receipt shows receipt number.
- [ ] Payment with receipt shows issued date.
- [ ] Payment with receipt does not show `Generate receipt`.

## Receipt Generation

- [ ] Click `Generate receipt` for a payment without receipt.
- [ ] Button changes to `Generating...` while the mutation is pending.
- [ ] Exactly one receipt row is created for that payment.
- [ ] Generated receipt number follows `RR-{YYYY}-{0001}`.
- [ ] Payment card refreshes to the issued receipt state.
- [ ] A second payment for the same invoice can receive its own receipt.

## Receipt Browsing

- [ ] Sidebar shows `Receipts`.
- [ ] Receipts list page loads at `/dashboard/receipts`.
- [ ] Receipts list shows receipt number, issued date, amount, payment date, payment method, tenant, unit, property, and billing period.
- [ ] Empty receipts list explains receipts appear after generation.
- [ ] `View receipt` from the Payments list opens the matching receipt detail page.
- [ ] `View receipt` from the Receipts list opens the matching receipt detail page.

## Receipt Detail And Print

- [ ] Receipt detail page loads at `/dashboard/receipts/:receiptId`.
- [ ] Receipt detail shows receipt number, issued date, amount received, tenant, unit, property, payment date, payment method, payment reference, billing period, invoice status, invoice total, and payment notes.
- [ ] Missing or inaccessible receipt shows a not-found state.
- [ ] `Print` opens browser print.
- [ ] Print view hides app navigation and page actions.

## Failure And Scope Checks

- [ ] Duplicate receipt generation is not available from the UI once a receipt exists.
- [ ] Inline error appears if receipt generation fails.
- [ ] No PDF download, email, or WhatsApp delivery workflow was introduced.
- [ ] No automatic receipt generation after payment recording was introduced.
- [ ] No receipt edit or delete workflow was introduced.
- [ ] No payment correction workflow was introduced.
- [ ] No migrations or seed data were introduced.

## Deferred Work

PDF download, delivery workflows, automatic generation, receipt edit/delete, payment edit blocking after receipt generation, and payment correction workflows remain deferred.
