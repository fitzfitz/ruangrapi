# UI/UX Pro Max Project Policy Design

## Goal

Make UI/UX Pro Max a mandatory project workflow aid for RuangRapi whenever work can affect interface structure, visual quality, interaction behavior, accessibility, responsive layout, or frontend user experience.

## Approved Approach

Use both durable instructions and a lightweight Codex hook:

- `AGENTS.md` records the repository policy so every agent can read the requirement before work begins.
- `.codex/hooks.json` registers a `UserPromptSubmit` hook.
- `.codex/hooks/ui_ux_pro_max_prompt.py` injects extra developer context reminding Codex to use `ui-ux-pro-max` for relevant frontend/UI/UX work.

The hook should not block prompts. It should only add context, because not every RuangRapi task is visual or UX-affecting. Backend-only, SQL-only, infrastructure, and direct informational tasks can proceed without invoking the UI/UX skill.

## Behavior

For UI/UX-affecting tasks, agents must invoke `ui-ux-pro-max` before design, implementation, or review work. Examples include page builds, component changes, layout changes, accessibility reviews, interaction changes, visual polish, and frontend refactors.

For non-visual tasks, agents may skip `ui-ux-pro-max` and continue with the relevant Superpowers workflow.

## Validation

Validate the hook script directly with a sample JSON payload and confirm it returns valid JSON containing `hookSpecificOutput.hookEventName = "UserPromptSubmit"` and `additionalContext`. Validate repository formatting and build commands according to the existing process where practical.
