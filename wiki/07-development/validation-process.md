# Validation Process

Every implementation slice should be validated before commit.

## Standard commands

```bash
npm run format:check
npm run lint
npm run build
git diff --check
git status --short --untracked-files=all
```

## Manual validation

Commands are not enough. Browser behavior should be checked for:

- route protection
- authenticated/onboarded access
- loading state
- empty state
- error state
- populated state
- create/edit flow behavior
- query invalidation/refetch
- browser console errors
- regression of neighboring routes

## Commit rule

Commit only after:

- Hermes output is reviewed
- validation commands pass
- manual validation passes
- scope is confirmed
