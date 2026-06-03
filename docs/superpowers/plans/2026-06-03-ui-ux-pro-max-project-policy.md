# UI/UX Pro Max Project Policy Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Require UI/UX Pro Max usage for RuangRapi UI/UX-affecting work and add a Codex hook reminder.

**Architecture:** Update repository instructions in `AGENTS.md` and add a project-local Codex `UserPromptSubmit` hook. The hook injects developer context only; it does not block prompts or replace the skill workflow.

**Tech Stack:** Markdown, Codex hooks JSON, Python 3.

---

## File Structure

- Modify `AGENTS.md`: add a UI/UX Pro Max workflow section near the existing Superpowers workflow.
- Create `.codex/hooks.json`: register a `UserPromptSubmit` command hook.
- Create `.codex/hooks/ui_ux_pro_max_prompt.py`: read hook stdin and emit reminder context as JSON.

## Tasks

### Task 1: Add Repository Policy

**Files:**
- Modify: `AGENTS.md`

- [ ] **Step 1: Add a `UI/UX Pro Max Workflow` section**

Add a section after `Superpowers Workflow` explaining that `ui-ux-pro-max` is mandatory for UI/UX-affecting work and optional for backend-only or informational tasks.

- [ ] **Step 2: Review policy wording**

Run: `sed -n '35,90p' AGENTS.md`

Expected: the Superpowers section and new UI/UX Pro Max section are both present and do not contradict each other.

### Task 2: Add Codex Hook Reminder

**Files:**
- Create: `.codex/hooks.json`
- Create: `.codex/hooks/ui_ux_pro_max_prompt.py`

- [ ] **Step 1: Create hook config**

Create `.codex/hooks.json` with one `UserPromptSubmit` command hook that runs `python3 .codex/hooks/ui_ux_pro_max_prompt.py`.

- [ ] **Step 2: Create hook script**

Create `.codex/hooks/ui_ux_pro_max_prompt.py`. The script should parse stdin as JSON, ignore malformed input safely, and print valid JSON with `hookSpecificOutput.additionalContext`.

- [ ] **Step 3: Smoke test hook script**

Run:

```bash
printf '{"prompt":"build a dashboard","turn_id":"smoke"}' | python3 .codex/hooks/ui_ux_pro_max_prompt.py
```

Expected: valid JSON containing `hookEventName` set to `UserPromptSubmit` and reminder text mentioning `ui-ux-pro-max`.

### Task 3: Validate and Review

**Files:**
- Review all modified files.

- [ ] **Step 1: Run formatting check**

Run: `npm run format:check`

Expected: formatting check passes or reports only unrelated pre-existing issues.

- [ ] **Step 2: Run build**

Run: `npm run build`

Expected: build passes.

- [ ] **Step 3: Run lint**

Run: `npm run lint`

Expected: lint passes.

- [ ] **Step 4: Run diff check**

Run: `git diff --check`

Expected: no whitespace errors.

- [ ] **Step 5: Review diff**

Run: `git diff -- AGENTS.md .codex/hooks.json .codex/hooks/ui_ux_pro_max_prompt.py`

Expected: diff only contains the policy and hook reminder changes.
