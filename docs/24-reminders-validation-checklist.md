# Reminders Validation Checklist

Status: ready for manual validation after the Reminders manual MVP implementation.

Scope: manual reminders only. Do not validate WhatsApp Business API delivery, scheduled sending, bulk sending, delivery/read tracking, migrations, or seed data as part of this baseline.

## Automated Checks

- [ ] `npm run format:check`
- [ ] `npm run build`
- [ ] `npm run lint`
- [ ] `git diff --check`

## Manual Setup

Use disposable local records only.

- [ ] Create or reuse a disposable local organization.
- [ ] Create or reuse a disposable local property.
- [ ] Create or reuse a disposable local unit.
- [ ] Create one disposable tenant with a phone number.
- [ ] Create one disposable tenant without a phone number.
- [ ] Create one disposable lease connected to the test unit and tenant data.
- [ ] Create one unpaid invoice.
- [ ] Create one partially paid invoice.
- [ ] Create one paid invoice.

## Page And Navigation Checks

- [ ] Sidebar shows `Reminders`.
- [ ] `/dashboard/reminders` loads.
- [ ] Page explains reminders are manually sent outside RuangRapi.
- [ ] Loading and empty states render without blocking navigation.

## Prepare Reminder Checks

- [ ] Unpaid invoice appears in reminder invoice options.
- [ ] Partially paid invoice appears in reminder invoice options.
- [ ] Overdue invoice appears in reminder invoice options.
- [ ] Paid invoice does not appear in reminder invoice options.
- [ ] Invoice option shows enough tenant, unit, period, due date, and amount context to choose the right invoice.
- [ ] Clicking `Prepare reminder` creates one reminder row with status `prepared`.
- [ ] Generated message text includes tenant, invoice, due date, and amount context.

## Reminder Queue Checks

- [ ] Prepared reminder appears in the reminder queue.
- [ ] Copy message action copies the generated message text.
- [ ] WhatsApp link appears when tenant phone exists.
- [ ] WhatsApp link does not appear when tenant phone is missing.
- [ ] Reminder status can be changed back to `prepared`.
- [ ] Reminder status can be changed to `sent`.
- [ ] Reminder status can be changed to `cancelled`.
- [ ] Cancelled reminder is hidden from the default queue.

## Scope Checks

- [ ] No WhatsApp Business API integration was introduced.
- [ ] No automation workflow was introduced.
- [ ] No scheduled reminder job was introduced.
- [ ] No bulk sending workflow was introduced.
- [ ] No delivery or read tracking was introduced.
- [ ] No database migration was introduced.
- [ ] No seed data was introduced.
