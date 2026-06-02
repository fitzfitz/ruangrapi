# Validation Closeout Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Close out completed manual validation for Payments, Receipts, Reminders, and Maintenance, then point the roadmap to Reporting / Dashboard metrics planning.

**Architecture:** This is a documentation-only change. Validation checklist files record completed manual checks, while wiki status and roadmap files carry the current product state and next-task handoff.

**Tech Stack:** Markdown documentation, wiki pages, npm validation scripts, Git.

---

## File Map

- Modify `docs/22-payments-validation-checklist.md`: mark Payments validation complete and record closeout note.
- Modify `docs/23-receipts-validation-checklist.md`: mark Receipts validation complete.
- Modify `docs/24-reminders-validation-checklist.md`: mark Reminders validation complete.
- Modify `docs/25-maintenance-validation-checklist.md`: mark Maintenance validation complete.
- Modify `docs/21-payments-module-plan.md`: remove stale pending-validation language.
- Modify `wiki/00-home.md`: update current status and next recommended step.
- Modify `wiki/03-domain/payments.md`: update Payments and Receipts validation status.
- Modify `wiki/03-domain/receipts.md`: update Receipts validation status.
- Modify `wiki/03-domain/reminders.md`: update Reminders validation status.
- Modify `wiki/03-domain/maintenance.md`: update Maintenance validation status.
- Modify `wiki/04-roadmap/mvp-epics.md`: mark Receipts, Reminders, and Maintenance validation complete and identify Reporting / Dashboard metrics planning.
- Modify `wiki/04-roadmap/release-plan.md`: remove completed validation steps from the next sequence.
- Modify `wiki/06-task-breakdown/ready-soon.md`: make Reporting / Dashboard metrics planning the immediate ready-soon candidate.
- Modify `wiki/06-task-breakdown/task-index.md`: clarify that operational records are validated.
- Modify `wiki/09-status/built.md`: mark the four modules validated.
- Modify `wiki/09-status/not-built.md`: remove stale pending-validation wording and keep deferred scope.
- Modify `wiki/08-decisions/decision-log.md`: update validation status and next recommendation.

## Tasks

### Task 1: Mark Validation Checklists Complete

- [ ] Update the status line in each of the four validation checklists to say manual validation is complete.
- [ ] Mark all checklist items in those four files complete because the owner confirmed the validation passes.
- [ ] Preserve deferred-scope sections so future work remains explicit.

### Task 2: Update Module And Domain Status

- [ ] Update `docs/21-payments-module-plan.md` so Payments manual validation is complete.
- [ ] Update the Payments, Receipts, Reminders, and Maintenance domain wiki pages so current status no longer says validation is pending.
- [ ] Keep each deferred list unchanged unless it only describes validation-pending state.

### Task 3: Update Roadmap And Task Tracking

- [ ] Update built/not-built status wiki pages so completed modules are validated and remaining work is deferred.
- [ ] Update release plan, ready-soon, task-index, MVP epics, home, and decision log pages to recommend Reporting / Dashboard metrics planning next.

### Task 4: Verify And Commit

- [ ] Run `npm run format:check`.
- [ ] Run `npm run build`.
- [ ] Run `npm run lint`.
- [ ] Run `git diff --check`.
- [ ] Review the diff for stale pending-validation language in current status pages.
- [ ] Commit the documentation closeout.
- [ ] Push the branch.
