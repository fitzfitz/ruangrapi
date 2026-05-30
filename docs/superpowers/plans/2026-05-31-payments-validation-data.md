# Payments Validation Data Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Document the manual, disposable local data setup for Payments validation without adding migrations or committed seed data.

**Architecture:** This is a documentation-only implementation. It updates the Payments validation checklist so manual validators know exactly how to create local test records through the app while keeping Supabase migrations and seed files unchanged.

**Tech Stack:** Markdown documentation, existing React/Vite/Supabase app workflow.

---

## Source Documents

Read these before executing Task 1:

- `docs/superpowers/specs/2026-05-31-payments-validation-data-design.md`
- `docs/22-payments-validation-checklist.md`
- `docs/21-payments-module-plan.md`
- `supabase/README.md`
- `supabase/config.toml`
- `docs/12-onboarding-rpc-test-plan.md`

## File Map

Modify during implementation:

- `docs/22-payments-validation-checklist.md`: add a manual disposable validation data setup section and keep manual validation items unchecked.
- `supabase/README.md`: update the stale future-oriented note so it reflects that migrations already exist and that no seed file is currently committed.

Do not create or modify:

- `supabase/seed.sql`
- `supabase/migrations/*.sql`
- application source files
- package files
- environment files

## Global Decisions

- Do not add migrations.
- Do not add committed seed data.
- Use disposable local records created through the app for Payments validation.
- Keep automated validation checkboxes as they are.
- Keep manual browser/Supabase checklist items unchecked until a human validates them.

---

### Task 1: Add Payments Disposable Data Setup to Validation Checklist

**Files:**

- Modify: `docs/22-payments-validation-checklist.md`

- [ ] **Step 1: Insert manual setup section**

Add this section after the `## Status` section and before `## Automated Checks`:

```markdown
## Disposable Local Data Setup

Use disposable local records created through the app. Do not commit local test users, tokens, organization records, or seed output.

Before running the manual Payments checklist:

1. Sign up and complete onboarding with a disposable local user.
2. Create one property.
3. Create one unit under that property.
4. Create one tenant.
5. Create one lease connecting the tenant to the unit.
6. Create one draft rent invoice from the lease.
7. Issue the invoice with a due date.
8. Record one partial payment.
9. Record one remaining-balance payment.
10. Confirm the Payments list shows both records.
11. Confirm the invoice status is `partially_paid` after the partial payment and `paid` after the final payment.

Do not add `supabase/seed.sql` for this validation pass. Do not create a migration for this validation pass.
```

- [ ] **Step 2: Run Markdown diff check**

Run:

```bash
git diff --check -- docs/22-payments-validation-checklist.md
```

Expected: no output and exit code `0`.

- [ ] **Step 3: Review the checklist scope**

Run:

```bash
rg -n "seed.sql|migration|Disposable Local Data Setup|manual Payments checklist" docs/22-payments-validation-checklist.md
```

Expected output includes:

```txt
Disposable Local Data Setup
Do not add `supabase/seed.sql` for this validation pass.
Do not create a migration for this validation pass.
```

Expected output does not introduce any instruction to commit test data.

- [ ] **Step 4: Commit**

Run:

```bash
git add docs/22-payments-validation-checklist.md
git commit -m "Document Payments disposable validation data"
```

Expected: one commit containing only `docs/22-payments-validation-checklist.md`.

### Task 2: Update Supabase README Seed/Migration Note

**Files:**

- Modify: `supabase/README.md`

- [ ] **Step 1: Replace stale Supabase folder note**

Replace the current contents of `supabase/README.md` with:

```markdown
# Supabase

This folder contains Supabase project configuration and migrations for RuangRapi.

## Migrations

Committed migrations live in `supabase/migrations/`.

Do not create or modify migrations unless the task explicitly approves schema, RLS, SQL, or database behavior changes.

## Seed Data

No committed seed data is currently used.

For Payments MVP validation, create disposable local records through the app instead of adding `supabase/seed.sql`.

If repeatable local seed data becomes necessary, plan it as a separate approved task.
```

- [ ] **Step 2: Run Markdown diff check**

Run:

```bash
git diff --check -- supabase/README.md
```

Expected: no output and exit code `0`.

- [ ] **Step 3: Verify no seed file was created**

Run:

```bash
test ! -e supabase/seed.sql
```

Expected: no output and exit code `0`.

- [ ] **Step 4: Verify migrations were not modified by this task**

Run:

```bash
git diff --name-only -- supabase/migrations
```

Expected: no output.

- [ ] **Step 5: Commit**

Run:

```bash
git add supabase/README.md
git commit -m "Clarify Supabase seed data policy"
```

Expected: one commit containing only `supabase/README.md`.

### Task 3: Final Validation

**Files:**

- Inspect: `docs/22-payments-validation-checklist.md`
- Inspect: `supabase/README.md`
- Inspect: `supabase/migrations/`

- [ ] **Step 1: Run repository whitespace check**

Run:

```bash
git diff --check
```

Expected: no output and exit code `0`.

- [ ] **Step 2: Confirm no migration or seed files changed**

Run:

```bash
git status --short supabase
```

Expected output:

```txt
 M supabase/README.md
```

If Task 2 has already been committed, expected output is empty.

- [ ] **Step 3: Confirm Payments validation data design is referenced by process docs**

Run:

```bash
rg -n "Disposable Local Data Setup|supabase/seed.sql|Payments MVP validation" docs/22-payments-validation-checklist.md supabase/README.md
```

Expected output includes references to disposable local data and no committed `supabase/seed.sql`.

- [ ] **Step 4: Report final status**

Final response should state:

```txt
No migrations were created or modified.
No seed data was added.
Payments validation now documents disposable manual local data setup.
Manual browser/Supabase validation remains pending.
```
