# Product Principles

## 1. Operational clarity over feature volume

RuangRapi should help owners manage rental operations clearly. A smaller reliable workflow is better than many half-connected features.

## 2. One domain slice at a time

Build modules in small, validated slices:

```txt
plan
implement
validate
document
commit
close out
```

## 3. Preserve history

Avoid hard deletes for business records once operational history exists. Prefer inactive/archive/cancelled states later.

## 4. Keep relationships explicit

Tenants, units, leases, invoices, payments, and receipts should have clear relationships. Avoid hidden magic.

## 5. RLS is the safety boundary

Organization-scoped data access must rely on Supabase RLS and trusted app context.

## 6. Do not automate chaos

Agents should only execute approved task cards. Ideas must pass through planning and Kanban approval first.

## 7. Mobile and WhatsApp matter

Indonesian rental owners may operate heavily through mobile and WhatsApp. Future workflows should respect that reality.
