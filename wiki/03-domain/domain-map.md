# Domain Map

RuangRapi is organized around rental operations.

```txt
Organization
  ├─ Properties
  │    └─ Units
  ├─ Tenants
  ├─ Leases
  │    ├─ Tenant
  │    └─ Property / Unit
  ├─ Invoices
  │    └─ Invoice Line Items
  ├─ Payments
  ├─ Receipts
  ├─ Reminders
  └─ Maintenance Tickets
```

## Built domains

- [[properties]]
- [[units]]

## Planned next domain

- [[tenants]]

## Future domains

- [[leases]]
- [[billing]]
- [[payments]]
- [[maintenance]]

## Domain principle

Each module should be built in small slices:

```txt
read-only
create
detail if useful
edit
closeout
```

Do not connect modules prematurely.
