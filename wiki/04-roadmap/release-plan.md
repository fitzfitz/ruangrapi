# Release Plan

## Current baseline

Built:

- Foundation
- Properties
- Units
- Tenants
- Leases
- Billing / Invoices
- Payments
- Receipts manual generation baseline
- Reminders manual MVP
- Maintenance baseline
- Reporting / Dashboard metrics first slice

## Recommended next sequence

1. Manually validate Reporting / Dashboard metrics
2. Record Reporting / Dashboard validation results
3. Choose the next focused MVP gap after dashboard validation

Next recommended task: Reporting / Dashboard metrics validation.

## Reporting baseline

The first `/dashboard` reporting slice uses existing operational records and preset ranges only:

- This month
- Last month
- Last 3 months
- This year

It summarizes current unit status, selected-period rent collection, invoice attention, reminder status, and current maintenance workload. It uses app-side aggregation over existing Supabase tables and shadcn/Recharts charts.

Deferred reporting scope:

- custom date range picker
- CSV/export
- saved reports
- database reporting views or Supabase RPCs
- advanced accounting or tax reports
- automated overdue logic

## Release principle

Do not jump into dashboard metrics until the underlying operational records exist.
