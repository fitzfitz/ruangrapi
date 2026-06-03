# Context7 Library Workflow Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a durable Context7 library-documentation workflow rule and mirror it in the existing Codex hook reminder.

**Architecture:** `AGENTS.md` is the source of truth for the policy. The existing project-local `UserPromptSubmit` hook remains non-blocking and injects a combined reminder for UI/UX Pro Max and Context7.

**Tech Stack:** Markdown, Python 3, Codex hooks.

---

## File Structure

- Modify `AGENTS.md`: add a `Library Documentation Workflow` section after the UI/UX Pro Max workflow.
- Modify `.codex/hooks/ui_ux_pro_max_prompt.py`: extend the reminder text to include Context7 guidance.
- Leave `.codex/hooks.json` unchanged.

## Tasks

### Task 1: Add AGENTS.md Context7 Policy

**Files:**

- Modify: `AGENTS.md`

- [ ] **Step 1: Add `Library Documentation Workflow` section**

Add a section after `UI/UX Pro Max Workflow` that requires Context7 for version-sensitive external library work and allows skipping it for codebase-local or language-fundamental tasks.

- [ ] **Step 2: Review section placement**

Run: `sed -n '60,100p' AGENTS.md`

Expected: the UI/UX Pro Max section, new Library Documentation Workflow section, and Security section appear in order.

### Task 2: Extend Codex Hook Reminder

**Files:**

- Modify: `.codex/hooks/ui_ux_pro_max_prompt.py`

- [ ] **Step 1: Update hook docstring**

Change the docstring so it describes injecting RuangRapi workflow policy context, not only UI/UX Pro Max.

- [ ] **Step 2: Extend additional context**

Append Context7 guidance to the existing `additional_context` string. Keep the hook non-blocking and keep `hookEventName` as `UserPromptSubmit`.

- [ ] **Step 3: Smoke test hook output**

Run:

```bash
printf '{"prompt":"upgrade TanStack Query","turn_id":"smoke"}' | python3 .codex/hooks/ui_ux_pro_max_prompt.py
```

Expected: valid JSON containing `ui-ux-pro-max`, `Context7`, and `hookEventName` set to `UserPromptSubmit`.

### Task 3: Validate and Commit

**Files:**

- Review all modified files.

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

- [ ] **Step 5: Commit implementation**

Run:

```bash
git add AGENTS.md .codex/hooks/ui_ux_pro_max_prompt.py
git commit -m "chore: add Context7 library workflow"
```

Expected: commit contains only the Context7 policy and hook reminder updates.
