# Development Workflow

RuangRapi uses a controlled agent-assisted workflow.

## Core loop

```txt
Wiki creates task candidates
Kanban turns candidates into approved task cards
Hermes executes only approved task cards
Repo docs define implementation constraints
```

## Full loop

```txt
1. Capture idea in Wiki
2. Convert idea into candidate task
3. Move candidate into Kanban backlog
4. Refine into small approved task card
5. Generate Hermes prompt
6. Hermes executes
7. Paste Hermes output for review
8. Review scope, risks, validation
9. Owner validates locally
10. Owner commits manually
11. Update docs/wiki/status
12. Move task to Done
```

## Important rules

- one small task at a time
- no auto-commit
- no risky migrations without owner approval
- no unapproved scope expansion
- repo docs override wiki for implementation details
