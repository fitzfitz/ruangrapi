# Context7 Library Workflow Design

## Goal

Make Context7 the preferred documentation source for RuangRapi work that depends on external library APIs, setup, configuration, or version-sensitive examples.

## Approved Approach

Use `AGENTS.md` as the authoritative project rule and extend the existing Codex prompt hook as a non-blocking reminder.

- `AGENTS.md` records when agents must use Context7 and when it is reasonable to skip it.
- `.codex/hooks/ui_ux_pro_max_prompt.py` injects a combined reminder for UI/UX Pro Max and Context7.
- `.codex/hooks.json` remains unchanged because the existing `UserPromptSubmit` hook already runs the reminder script.

## Behavior

Agents should use Context7 before implementation when work involves adding dependencies, upgrading dependencies, changing package versions, configuring libraries, or implementing against external APIs where documentation may have changed.

Examples include React Router, TanStack Query, Supabase JS, Vite, Zod, React Hook Form, charting libraries, UI component libraries, and any unfamiliar or fast-moving package.

Agents may skip Context7 for codebase-local patterns, simple TypeScript or React syntax, and tasks that do not depend on external library behavior.

## Validation

Validate that `AGENTS.md` states the rule clearly, the hook script emits valid `UserPromptSubmit` JSON with both reminders, and repository checks still pass.
