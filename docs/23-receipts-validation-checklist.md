# Receipts Validation Checklist

Status: ready for manual validation after the Receipts manual generation implementation.

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

## Failure And Scope Checks

- [ ] Duplicate receipt generation is not available from the UI once a receipt exists.
- [ ] Inline error appears if receipt generation fails.
- [ ] No receipt detail page was introduced.
- [ ] No receipt list page was introduced.
- [ ] No PDF, print, download, email, or WhatsApp delivery workflow was introduced.
- [ ] No automatic receipt generation after payment recording was introduced.
- [ ] No receipt edit or delete workflow was introduced.
- [ ] No payment correction workflow was introduced.
- [ ] No migrations or seed data were introduced.

## Deferred Work

Receipt detail, receipt list, print/download, PDF generation, delivery workflows, automatic generation, payment edit blocking after receipt generation, and payment correction workflows remain deferred.
