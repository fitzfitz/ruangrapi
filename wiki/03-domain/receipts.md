# Receipts

Receipts provide proof of payment for recorded payments.

## Current status

Receipts module: browsing baseline and manual validation complete.

## Purpose

Receipts provide proof of payment.

## Known numbering direction

Receipt numbers should be organization-scoped, using a pattern such as:

```txt
RR-{YYYY}-{0001}
```

Example:

```txt
RR-2026-0001
```

## Dependencies

Receipts should come after payments.

## Built

- plan Receipts module
- manual Generate receipt action from the Payments list
- receipt number display after generation
- issued date display after generation
- pending receipt state for payments without receipts
- receipt list page
- receipt detail page
- browser print action for receipt detail
- Receipts validation checklist

## Deferred

- receipt edit or delete workflow
- PDF/download receipt
- PDF generation
- email or WhatsApp delivery
- automatic receipt generation after payment recording
- payment edit blocking after receipt generation
- payment correction workflow

## Related pages

- [[payments]]
- [[billing]]
