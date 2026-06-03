#!/usr/bin/env python3
"""Inject RuangRapi UI/UX Pro Max policy context into Codex prompts."""

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
        "do not change how users see, understand, or interact with the product."
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
