# Kanban Workflow

Kanban is the approval gate between wiki ideas and Hermes execution.

## Columns

```txt
Backlog → Ready → In Progress → Review → Done
```

## Column meanings

### Backlog

Task candidates from the wiki. Not approved yet.

### Ready

Approved and scoped task cards. Hermes can execute these.

### In Progress

Currently being executed.

### Review

Hermes output exists. Needs ChatGPT review and owner validation.

### Done

Validated, committed, and documented.

## Approval rule

No task should move to Ready unless it has:

- clear goal
- scope
- out-of-scope boundaries
- acceptance criteria
- validation commands
- owner approval
