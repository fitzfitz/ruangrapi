# Lagoon Command Center Validation Checklist

Status: implementation pending manual validation.

## Scope

- [ ] Product shell uses Lagoon Command Center visual direction.
- [ ] Persistent left sidebar is removed.
- [ ] Floating bottom navigation appears on authenticated app routes.
- [ ] Primary routes remain unchanged.
- [ ] Secondary routes remain available through More navigation.
- [ ] Dashboard uses dense Lagoon Command Center composition.
- [ ] Recharts remains the dashboard chart library.
- [ ] ApexCharts is not introduced.
- [ ] No new dashboard metrics are introduced.
- [ ] No custom date ranges, exports, saved reports, or drilldowns are introduced.

## Manual Validation

- [ ] Desktop dashboard renders without overlap.
- [ ] Tablet dashboard renders without overlap.
- [ ] Mobile dashboard renders without horizontal scrolling.
- [ ] Bottom nav does not cover page content.
- [ ] Active bottom nav route is visible.
- [ ] Bottom nav keyboard focus is visible.
- [ ] More menu opens, closes, and navigates to secondary routes.
- [ ] One list page remains readable.
- [ ] One form page remains readable.
- [ ] One detail or receipt page remains readable.
- [ ] Auth or sign-in route remains readable.
- [ ] Browser console shows no errors during navigation.

## Deferred

- ApexCharts evaluation
- chart drilldowns
- custom reporting date ranges
- chart/image export
- saved reports
- new dashboard metrics
