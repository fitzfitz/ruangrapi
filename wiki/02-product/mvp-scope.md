# MVP Scope

The MVP should prove the core rental operations loop.

## MVP module order

1. Properties
2. Units
3. Tenants
4. Leases
5. Billing / invoices
6. Payments
7. Receipts
8. Reminders
9. Maintenance
10. Basic reporting / dashboard

## Built

### Foundation

- authentication/session flow
- onboarding
- organization/profile context
- dashboard shell
- route gating
- Supabase/RLS foundation

### Properties

- list properties
- create property
- view property detail
- edit property

### Units

- view units under a property
- create unit under a property
- edit unit under a property

## Not built yet

- tenants
- leases
- billing/invoices
- payments
- receipts
- reminders
- maintenance
- reporting/dashboard metrics

## MVP success definition

A rental owner can use RuangRapi to understand:

- what properties they manage
- what units exist under each property
- who their tenants are
- which tenant rents which unit
- what rent is due
- what has been paid
- who needs follow-up
