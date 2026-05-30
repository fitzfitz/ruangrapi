# Payments Validation Data Design

Date: 2026-05-31

## Summary

Payments MVP validation should use disposable manual local data for now. Do not add a Supabase migration, committed seed file, or payment-recording RPC for this validation step.

## Context

The current initial Supabase migration already includes the database objects needed by the Payments MVP baseline:

- `invoices`
- `invoice_line_items`
- `payments`
- `receipts`
- invoice status constraints
- payment method constraints
- payment and invoice indexes
- organization-scoped RLS policies
- receipt sequencing support for the later Receipts module

The Payments implementation currently records manual payments through application-level validation and updates invoice status after insert. This is intentionally documented as non-atomic MVP behavior.

The repository currently does not rely on committed seed data for local product validation. Existing validation guidance avoids committing local test users, tokens, or scratch evidence.

## Decision

Do not update migrations for the Payments validation step.

Do not add committed seed data for the Payments validation step.

Use disposable local records created through the app during manual validation.

## Manual Validation Data Setup

Create the minimum local data through the UI:

1. Sign up and complete onboarding with a disposable local user.
2. Create one property.
3. Create one unit.
4. Create one tenant.
5. Create one lease connecting the tenant to the unit.
6. Create one draft rent invoice from the lease.
7. Issue the invoice with a due date.
8. Record one partial payment.
9. Record one remaining-balance payment.
10. Confirm the Payments list shows both records.
11. Confirm the invoice moves to `partially_paid` after the partial payment and `paid` after the final payment.

## Non-Goals

This validation-data decision does not include:

- new Supabase migrations
- `supabase/seed.sql`
- committed demo users
- committed auth identities
- committed local organization data
- test tokens or credentials
- payment-recording RPC
- database trigger enforcement for invoice balance
- automated browser tests

## Later Options

If manual validation becomes repetitive, create a separate approved task for one of these:

- a local-only seed strategy that avoids committed real identities
- an RPC-backed payment recording flow for atomic insert and invoice status update
- automated integration tests once a test runner and test database workflow exist

## Rationale

The schema already supports the current Payments behavior. Adding migrations now would increase scope without solving a current validation blocker.

Committed seed data would make local resets faster, but the current app depends on Supabase Auth identities and organization-scoped RLS. Seed data can easily become stale or misleading unless the test-user workflow is designed carefully.

Disposable manual data is the safest fit for the current stage.
