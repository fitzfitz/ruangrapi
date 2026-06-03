#!/usr/bin/env python3
"""Inject RuangRapi workflow policy context into Codex prompts."""

from __future__ import annotations

import json
import sys


def main() -> int:
    try:
        json.load(sys.stdin)
    except json.JSONDecodeError:
        pass

    additional_context = (
        "RuangRapi project policy: use the installed `ui-ux-pro-max` skill "
        "before UI/UX-affecting work, including pages, layouts, components, "
        "forms, tables, charts, navigation, accessibility, responsive behavior, "
        "visual polish, animation, and UI/UX reviews. Backend-only, SQL-only, "
        "infrastructure, and direct informational tasks may skip it when they "
        "do not change how users see, understand, or interact with the product. "
        "Use Context7 before external library/API work when package APIs, "
        "installation, configuration, or examples may be version-sensitive; "
        "prefer official docs surfaced through Context7 over memory or generic "
        "examples. This applies to adding or upgrading dependencies, configuring "
        "libraries, or implementing against unfamiliar or fast-moving APIs such "
        "as React Router, TanStack Query, Supabase JS, Vite, Zod, React Hook "
        "Form, charting libraries, and UI component libraries. Skip Context7 "
        "for codebase-local patterns, simple TypeScript or React syntax, and "
        "tasks that do not depend on external library behavior."
    )

    print(
        json.dumps(
            {
                "hookSpecificOutput": {
                    "hookEventName": "UserPromptSubmit",
                    "additionalContext": additional_context,
                }
            }
        )
    )
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
