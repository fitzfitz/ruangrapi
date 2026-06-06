# Decision Log

## Current decisions

- Use modular monolith with DDD-lite.
- Use Supabase RLS as data access safety boundary.
- Use Hermes only for approved small task cards.
- Do not allow Hermes to auto-commit.
- Do not create risky migrations without owner approval.
- Properties hard delete is deferred; prefer archive/inactive later.
- Units are child records under Properties.
- Unit detail page is deferred.
- Unit status/occupancy workflow is deferred.
- Unit base_rent_amount/rent pricing workflow is deferred.
- Tenants were built before Leases.
- Leases MVP baseline is complete.
- Lease edit, end, cancel, occupancy/status synchronization, invoice generation, deposit ledger, and contract files remain deferred.
- Billing / Invoices MVP baseline is complete.
- Invoice detail, edit, issue/send, cancel, reminders, overdue automation, utility billing, PDFs, delivery workflows, and dashboard metrics remain deferred.
- Payments MVP baseline implementation and manual validation are complete.
- Receipts module: browsing baseline and manual validation complete.
- Receipt detail, receipt list, receipt edit/delete, print/download, PDF generation, delivery workflows, automatic generation, payment edit blocking after receipt generation, and payment correction workflows remain deferred.
- Payments, Receipts, Reminders, and Maintenance manual validation are complete.
- Reporting / Dashboard metrics first slice is built and functionally validated.
- Dashboard/reporting UI/UX polish was completed separately as an in-place polish pass.
- Next recommended step: choose the next focused MVP gap from the task bucket.

## Related pages

- [[product-decisions]]
- [[technical-decisions]]
