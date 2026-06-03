# Reporting Dashboard Validation Closeout Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Update docs and wiki pages to record Reporting / Dashboard validation completion and defer UI/UX polish.

**Architecture:** This is a documentation-only closeout. Repo docs record validation evidence; wiki pages summarize product status and next buckets.

**Tech Stack:** Markdown.

---

## File Structure

- Modify `docs/26-reporting-dashboard-validation-checklist.md`: mark functional validation complete and record UI/UX as deferred.
- Modify `wiki/03-domain/reporting.md`: update current status and boundaries.
- Modify `wiki/09-status/built.md`: mark Reporting / Dashboard validated.
- Modify `wiki/09-status/not-built.md`: add UI/UX polish to deferred reporting scope.
- Modify `wiki/04-roadmap/release-plan.md`: replace validation-next wording with next bucket review.
- Modify `wiki/04-roadmap/mvp-epics.md`: update Epic 8 status.
- Modify `wiki/06-task-breakdown/ready-soon.md`: move validation to completed candidates and show next bucket review.
- Modify `wiki/06-task-breakdown/task-index.md`: move validation to completed candidates and add dashboard UI/UX polish to later candidates.
- Modify `wiki/06-task-breakdown/backlog.md`: add dashboard/reporting UI/UX polish to Reporting backlog.
- Modify `wiki/00-home.md`: update current status and next recommended step.
- Modify `wiki/08-decisions/decision-log.md`: record validation completion and deferred UI/UX polish.
- Modify `wiki/09-status/risks.md`: update dashboard-too-early risk status.

## Tasks

### Task 1: Record Repo Validation Closeout

**Files:**

- Modify: `docs/26-reporting-dashboard-validation-checklist.md`

- [ ] **Step 1: Update status and checklist**

Change the checklist status to functional manual validation complete, mark functional and boundary items complete, and leave explicit note that UI/UX polish is deferred.

### Task 2: Update Wiki Status and Roadmap

**Files:**

- Modify: `wiki/03-domain/reporting.md`
- Modify: `wiki/09-status/built.md`
- Modify: `wiki/09-status/not-built.md`
- Modify: `wiki/04-roadmap/release-plan.md`
- Modify: `wiki/04-roadmap/mvp-epics.md`
- Modify: `wiki/00-home.md`
- Modify: `wiki/08-decisions/decision-log.md`
- Modify: `wiki/09-status/risks.md`

- [ ] **Step 1: Update reporting status pages**

Record first dashboard slice as built and manually validated. Add UI/UX polish to deferred reporting scope.

- [ ] **Step 2: Update roadmap pages**

Remove language that says Reporting / Dashboard validation is next. Replace it with next bucket review language.

### Task 3: Update Task Buckets

**Files:**

- Modify: `wiki/06-task-breakdown/ready-soon.md`
- Modify: `wiki/06-task-breakdown/task-index.md`
- Modify: `wiki/06-task-breakdown/backlog.md`

- [ ] **Step 1: Move validation to completed**

Move Reporting / Dashboard metrics validation from ready soon to completed candidates.

- [ ] **Step 2: Show next bucket**

Add a next bucket review candidate and keep dashboard/reporting UI/UX polish in later/backlog scope.

### Task 4: Validate

**Files:**

- Review all modified docs.

- [ ] **Step 1: Run format check**

Run: `npm run format:check`

Expected: formatting check passes.

- [ ] **Step 2: Run build**

Run: `npm run build`

Expected: build passes.

- [ ] **Step 3: Run lint**

Run: `npm run lint`

Expected: lint passes.

- [ ] **Step 4: Run whitespace check**

Run: `git diff --check`

Expected: no whitespace errors.
