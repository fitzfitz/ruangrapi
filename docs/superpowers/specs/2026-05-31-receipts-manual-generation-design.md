# Receipts Manual Generation Design

## Context

Payments MVP baseline is complete and manually validated. The next recommended module is Receipts. The existing initial Supabase migration already includes `receipts`, one receipt per payment, organization-scoped receipt number uniqueness, `RR-{YYYY}-{0001}` receipt number format, and database-backed receipt number assignment.

This slice should introduce manual receipt generation without adding automatic generation, PDFs, delivery, receipt detail pages, payment corrections, or new database migrations.

## Decision

Build manual receipt generation from the Payments list.

Each payment may have one receipt. If an invoice is paid through multiple payments, each payment can receive its own receipt. This keeps receipts tied to money-received events rather than invoice totals.

## Scope

In scope:

- Add a `src/modules/receipts/` module.
- Add manual `Generate receipt` behavior to payment cards.
- Show receipt status on each payment card.
- Insert receipt records using the existing `receipts` table.
- Let the database assign `receipt_number` and `issued_at`.
- Refresh the Payments list after receipt generation.
- Add a focused validation checklist and update wiki/module status docs after implementation.

Out of scope:

- Automatic receipt generation when recording payment.
- Receipt detail page.
- Receipt list page.
- View/print/download receipt.
- PDF generation.
- Email or WhatsApp delivery.
- Receipt edit or delete.
- Payment correction workflow.
- New migrations, seed data, or RLS changes.

## UX Design

Payments list becomes receipt-aware.

Payments without receipts show a polished receipt panel:

- dashed or subtle neutral border
- `Receipt`
- `Not generated yet`
- short helper copy: `Create one receipt for this payment.`
- `Generate receipt` button

Payments with receipts show a polished issued panel:

- green success treatment
- `Receipt issued`
- prominent receipt number, for example `RR-2026-0007`
- issued date

While generating a receipt:

- only the selected payment card action is disabled
- button label changes to `Generating...`
- the rest of the list remains usable

If generation fails:

- show an inline error inside that payment card receipt panel
- keep the card on the no-receipt state
- allow retry

Do not show a `View receipt` button in this slice. It should be added when a receipt detail page exists.

## Data Design

Extend the Payments list query to load nested receipt data.

Payment list items should expose a nullable receipt summary:

- `receipt_id`
- `receipt_number`
- `receipt_issued_at`

Because `receipts.payment_id` is unique, a payment maps to zero or one receipt.

Receipt creation sends:

- `organization_id`
- `payment_id`

The app should not calculate receipt numbers. The existing database trigger assigns receipt numbers and issued timestamps.

## Module Shape

Create a Receipts module:

```txt
src/modules/receipts/
  application/
    use-create-receipt-mutation.ts
  domain/
    receipt.ts
  infrastructure/
    receipts-repository.ts
  index.ts
```

Repository behavior:

- `createReceiptFromPayment({ organization_id, payment_id })`
- inserts into `receipts`
- returns the created receipt
- throws a clear error if Supabase rejects the insert

Mutation behavior:

- calls `createReceiptFromPayment`
- invalidates the Payments query on success

Payments module changes:

- include receipt summary in `PaymentListItem`
- map nested receipt rows safely
- render receipt panel states in `PaymentsPage`
- keep formatting helpers local unless reuse becomes necessary

## Error Handling

The UI should prevent obvious duplicate generation by hiding the action when a receipt already exists.

The database remains the source of truth for duplicate prevention. If two clients try to generate a receipt for the same payment, the unique constraint on `receipts.payment_id` may reject one request. The rejected client should show a normal inline error; a reload or query refresh can reveal the existing receipt.

If the receipt insert fails for permission, connectivity, or validation reasons, show a concise inline message:

```txt
We could not generate this receipt. Please try again.
```

## Validation

Automated checks:

- `npm run build`
- `npm run lint`
- `git diff --check`

Manual validation:

- Payment without receipt shows `Generate receipt`.
- Generating a receipt creates one receipt row.
- Receipt number appears on the payment card after generation.
- Generated number follows `RR-{YYYY}-{0001}`.
- Payment with existing receipt does not show `Generate receipt`.
- Two payments for one invoice can each receive separate receipts.
- No receipt detail, PDF, delivery, edit, delete, or automatic receipt behavior is introduced.

## Follow-Up Work

- Receipt detail page.
- Receipt list page.
- Print/download receipt.
- PDF generation.
- Email or WhatsApp delivery.
- Automatic receipt generation after payment recording.
- Payment edit blocking after receipt generation.
- Payment correction workflow.
