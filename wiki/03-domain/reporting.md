# Reporting

Reporting and dashboard metrics summarize existing operational records.

## Current status

First dashboard metrics slice implemented and functionally validated on `/dashboard`.

## First dashboard slice

The first `/dashboard` reporting slice uses existing records only:

- units
- invoices
- payments
- reminders
- maintenance tickets

It supports preset ranges:

- This month
- Last month
- Last 3 months
- This year

It shows:

- current unit counts
- selected-period expected rent
- selected-period collected rent
- selected-period outstanding rent
- selected-period invoice attention count
- current open maintenance count
- selected-period reminder counts
- simple shadcn/Recharts charts

## Metric rules

- Unit counts are current operational state.
- Maintenance open count is current operational state.
- Invoice, payment, and reminder metrics use invoice `billing_period` inside the selected preset range.
- Expected rent excludes cancelled invoices.
- Collected rent sums payments attached to non-cancelled selected-period invoices.
- Outstanding rent is expected rent minus collected rent, floored at zero.
- Invoice attention counts unpaid, partially paid, and overdue selected-period invoices.

## Boundaries

Not included in the first slice:

- dashboard/reporting UI/UX polish
- custom date range picker
- CSV/export
- saved reports
- database views or reporting RPCs
- advanced accounting reports
- automated overdue logic
- workflow changes in billing, payments, reminders, or maintenance

## Validation closeout

Functional dashboard/reporting validation is complete. The known UI/UX quality issue is deferred and should be handled as a separate UI/UX polish task, not as part of this validation closeout.

## Related pages

- [[billing]]
- [[payments]]
- [[reminders]]
- [[maintenance]]
