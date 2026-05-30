# Module Slice Workflow

Each domain module should be built in small slices.

## Preferred slice pattern

```txt
1. Plan module
2. Read-only list/section
3. Document validation
4. Create flow
5. Document validation
6. Detail page if useful
7. Edit flow
8. Document validation
9. Closeout note
```

## Slice principles

- keep one module at a time
- defer adjacent modules
- do not add dashboards too early
- do not add delete/archive until lifecycle decisions are clear
- document what was built and what was deferred

## Examples

Properties used:

```txt
list → create → detail → edit → closeout
```

Units used:

```txt
property-scoped section → create → edit → closeout
```
