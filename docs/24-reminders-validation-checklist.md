# Reminders Validation Checklist

Status: manual validation complete.

Validation note: Reminders manual preparation, copy, WhatsApp link, and status update flows were validated in browser/local Supabase with disposable local data.

Scope: manual reminders only. Do not validate WhatsApp Business API delivery, scheduled sending, bulk sending, delivery/read tracking, migrations, or seed data as part of this baseline.

## Automated Checks

- [x] `npm run format:check`
- [x] `npm run build`
- [x] `npm run lint`
- [x] `git diff --check`

## Manual Setup

Use disposable local records only.

- [x] Create or reuse a disposable local organization.
- [x] Create or reuse a disposable local property.
- [x] Create or reuse a disposable local unit.
- [x] Create one disposable tenant with a phone number.
- [x] Create one disposable tenant without a phone number.
- [x] Create one disposable lease connected to the test unit and tenant data.
- [x] Create one unpaid invoice.
- [x] Create one partially paid invoice.
- [x] Create one paid invoice.

## Page And Navigation Checks

- [x] Sidebar shows `Reminders`.
- [x] `/dashboard/reminders` loads.
- [x] Page explains reminders are manually sent outside RuangRapi.
- [x] Loading and empty states render without blocking navigation.

## Prepare Reminder Checks

- [x] Unpaid invoice appears in reminder invoice options.
- [x] Partially paid invoice appears in reminder invoice options.
- [x] Overdue invoice appears in reminder invoice options.
- [x] Paid invoice does not appear in reminder invoice options.
- [x] Invoice option shows enough tenant, unit, period, due date, and amount context to choose the right invoice.
- [x] Clicking `Prepare reminder` creates one reminder row with status `prepared`.
- [x] Generated message text includes tenant, invoice, due date, and amount context.

## Reminder Queue Checks

- [x] Prepared reminder appears in the reminder queue.
- [x] Copy message action copies the generated message text.
- [x] WhatsApp link appears when tenant phone exists.
- [x] WhatsApp link does not appear when tenant phone is missing.
- [x] Reminder status can be changed back to `prepared`.
- [x] Reminder status can be changed to `sent`.
- [x] Reminder status can be changed to `cancelled`.
- [x] Cancelled reminder is hidden from the default queue.

## Scope Checks

- [x] No WhatsApp Business API integration was introduced.
- [x] No automation workflow was introduced.
- [x] No scheduled reminder job was introduced.
- [x] No bulk sending workflow was introduced.
- [x] No delivery or read tracking was introduced.
- [x] No database migration was introduced.
- [x] No seed data was introduced.
