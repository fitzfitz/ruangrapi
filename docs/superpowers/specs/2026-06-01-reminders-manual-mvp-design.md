# Reminders Manual MVP Design

## Context

RuangRapi now has the core rent collection flow in place: tenants, leases, invoices, payments, and receipts. The project docs identify Reminders as the next module after manual Payments and Receipts validation.

The initial Supabase schema already includes a `reminders` table with organization, invoice, tenant, channel, message, status, cancellation, and timestamp fields. Existing domain docs define reminders as prepared tenant communication. The MVP should use that table without adding migrations.

## Decision

Build a manual-first Reminders MVP.

RuangRapi should prepare reminder records from payable invoices and provide copyable WhatsApp-style message text. Owners/admins manually send messages outside the app and then update the reminder status.

No WhatsApp Business API, scheduled sending, delivery tracking, or automation is included.

## Scope

In scope:

- Add a `src/modules/reminders/` module.
- Add a `/dashboard/reminders` route and sidebar navigation item.
- List active reminders, excluding cancelled reminders from the default list.
- Prepare reminder records from payable invoices.
- Generate message text from invoice, tenant, unit, property, billing period, amount, due date, and payment state.
- Show a WhatsApp link when the tenant has a usable phone number.
- Allow copying the message text.
- Allow status transitions to `prepared`, `sent`, and `cancelled`.
- Add a focused reminders validation checklist and update wiki/status docs.

Out of scope:

- WhatsApp Business API integration.
- Automatic delivery.
- Scheduled reminders.
- Bulk reminder sending.
- Delivery/read status tracking.
- Reminder templates management.
- Phone normalization migrations.
- New database migrations or seed data.
- Automatic overdue status jobs.
- Invoice edit/cancel/detail work beyond what reminders need.

## UX Design

The Reminders page is an operational work queue.

Header:

- Title: `Reminders`
- Description: explains these are manually sent reminder messages.

Page sections:

1. **Prepare reminder**
   - Shows invoices eligible for reminders.
   - Eligible invoice statuses: `unpaid`, `partially_paid`, `overdue`.
   - Each option should show tenant, unit, property, billing period, due date, invoice total, paid amount, and remaining amount.
   - User selects an invoice and creates a reminder.

2. **Reminder list**
   - Shows active reminder records.
   - Each reminder card shows tenant, unit, property, invoice billing period, amount context, status, channel, and created/updated dates.
   - Message text is visible in a readable block.
   - Actions:
     - Copy message.
     - Open WhatsApp link when a phone number exists.
     - Mark prepared.
     - Mark sent.
     - Cancel.

State handling:

- Loading, error, empty, and success states follow existing page patterns.
- Copy action should use `navigator.clipboard.writeText` when available.
- If copy fails, leave the text visible so the user can select it manually.
- If the tenant phone is missing, show no WhatsApp link and keep Copy available.

## Data Design

Use existing tables:

- `reminders`
- `invoices`
- `payments`
- `tenants`
- `units`
- `properties`

Reminder list query should load:

- reminder id, organization id, invoice id, tenant id, channel, message, status, cancelled_at, timestamps
- invoice billing period, due date, total amount, status
- tenant full name and phone
- unit name
- property name

Reminder form options query should load payable invoices:

- invoice id, organization id, tenant id, billing period, due date, total amount, status
- tenant full name and phone
- unit name
- property name
- related payment amounts

Remaining amount is calculated client-side as:

```txt
max(invoice.total_amount - sum(invoice.payments.amount), 0)
```

Form options should filter out invoices with zero remaining amount.

Reminder creation inserts:

- `organization_id`
- `invoice_id`
- `tenant_id`
- `channel`: `whatsapp`
- `message`
- `status`: `prepared`

Status updates:

- `prepared`: set status to `prepared`, leave `cancelled_at` null.
- `sent`: set status to `sent`, leave `cancelled_at` null.
- `cancelled`: set status to `cancelled`, set `cancelled_at` to current timestamp.

Cancelled reminders should be hidden from the default reminders list.

## Message Design

Default message text should be generated in Indonesian-friendly plain language:

```txt
Halo {tenant_name}, ini pengingat pembayaran untuk {unit_name} - {property_name} periode {billing_period}. Sisa tagihan adalah {remaining_amount}. Mohon melakukan pembayaran sebelum/sekitar {due_date}. Terima kasih.
```

If due date is missing, use:

```txt
Mohon melakukan pembayaran saat memungkinkan.
```

If property name is missing, only mention the unit.

The first slice does not expose editable templates. If the generated message needs editing, that is a follow-up.

## WhatsApp Link Design

When a tenant phone exists, generate:

```txt
https://wa.me/{normalized_phone_digits}?text={encoded_message}
```

Minimal link normalization:

- strip non-digits
- if phone starts with `0`, replace leading `0` with `62`
- if phone starts with `62`, keep it
- otherwise use the stripped digits as-is

Do not save the normalized phone back to the tenant record in this slice.

## Error Handling

- If reminder list loading fails, show a page-level error.
- If form options loading fails, show a page-level error in the prepare section.
- If reminder creation fails, show an inline error near the create action.
- If status update fails, show an inline error on that reminder card.
- Duplicate reminder prevention is best-effort in this slice:
  - The UI may show existing reminders for the same invoice.
  - The database has no uniqueness constraint for invoice reminders, so do not invent one in application code.
  - A future slice may add stronger duplicate rules if needed.

## Module Shape

Create:

```txt
src/modules/reminders/
  application/
    use-create-reminder-mutation.ts
    use-reminder-form-options-query.ts
    use-reminders-query.ts
    use-update-reminder-status-mutation.ts
  domain/
    reminder.ts
  infrastructure/
    reminders-repository.ts
  presentation/
    reminders-page.tsx
  index.ts
```

Router changes:

- Add `dashboardReminders: '/dashboard/reminders'`.
- Add lazy route for `RemindersPage`.
- Add `Reminders` to the sidebar navigation.

## Validation

Automated checks:

- `npm run format:check`
- `npm run build`
- `npm run lint`
- `git diff --check`

Manual validation:

- Reminders nav appears.
- `/dashboard/reminders` loads.
- Payable invoices are available for reminder preparation.
- Paid invoices are not available for reminder preparation.
- Creating a reminder inserts one reminder row with status `prepared`.
- Generated message contains tenant, unit, billing period, remaining amount, and due date fallback when needed.
- Reminder list shows prepared reminders.
- Copy message works or leaves text visible for manual selection.
- WhatsApp link appears when tenant phone exists.
- No WhatsApp link appears when tenant phone is missing.
- Mark prepared works.
- Mark sent works.
- Cancel hides reminder from the default list.
- No WhatsApp API, scheduled job, bulk send, migration, or seed data is introduced.

## Follow-Up Work

- Editable reminder message before saving.
- Reminder detail/history page.
- Duplicate reminder policy.
- Bulk reminder preparation.
- Message templates.
- Better Indonesian phone normalization.
- WhatsApp Business API integration.
- Scheduled reminder jobs.
- Delivery/read status tracking.
- Automatic overdue status jobs.
