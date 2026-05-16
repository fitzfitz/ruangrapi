# ADR 0002: Use React Router for MVP Routing

## Status

Accepted

## Context

RuangRapi will need client-side routing when the app shell and feature screens are introduced.

Routing is not being implemented yet. The project is still progressing in small infrastructure and planning steps, and no routes, pages, or layout shell should be created as part of this decision.

## Decision

Use React Router for the MVP app routing when routing implementation begins.

## Rationale

React Router is a good fit for the MVP because:

- It is a common choice in the React ecosystem.
- It is simple enough for the MVP.
- It works well with route-based layouts.
- It avoids custom routing logic.
- It does not require migrating to a framework.

## Consequences

Positive:

- The app can keep using React, TypeScript, and Vite.
- Route structure can be introduced incrementally.
- Future route-based layouts can be added without changing the current architecture direction.

Tradeoffs:

- React Router should not be installed until routing implementation actually begins.
- Route files and pages should not be created until there is an approved routing task.

## Non-goals

This decision does not:

- Install React Router.
- Create routes.
- Create pages.
- Create an app shell UI.
- Add product features.
