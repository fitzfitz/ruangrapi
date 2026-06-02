# Validation Closeout Design

## Context

Payments, Receipts, Reminders, and Maintenance have now completed manual browser/local Supabase validation. The repo docs and wiki still contain pending-validation language for these modules, and the roadmap still lists manual validation before Reporting / Dashboard metrics.

## Goal

Close out the completed validation work in documentation and make Reporting / Dashboard metrics planning the next recommended task.

## Scope

Update documentation only. Do not change source code, Supabase migrations, RLS policies, seed data, or environment files.

## Documentation Updates

- Mark Payments, Receipts, Reminders, and Maintenance validation checklists as validated.
- Update Payments module planning status so it no longer says manual validation is pending.
- Update domain wiki pages for Payments, Receipts, Reminders, and Maintenance.
- Update built/not-built status pages so remaining work is clearly deferred rather than pending validation.
- Update roadmap and task-tracking wiki pages so Reporting / Dashboard metrics planning is the next candidate.
- Keep deferred scope explicit for payment correction, receipt delivery/PDFs, reminder automation, maintenance advanced workflows, and dashboard metrics.

## Validation

Run the repository validation commands after the docs update:

- `npm run format:check`
- `npm run build`
- `npm run lint`
- `git diff --check`

Manual validation evidence comes from the owner confirmation that Payments, Receipts, Reminders, and Maintenance validation are all good.

## Next Recommended Task

Start Reporting / Dashboard metrics planning in a new task. The first dashboard slice should summarize existing operational records without adding advanced workflows.
