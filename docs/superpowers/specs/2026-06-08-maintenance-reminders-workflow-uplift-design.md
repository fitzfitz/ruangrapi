# Maintenance and Reminders Workflow UI Uplift Design

## Context

The dashboard and list views for Properties, Tenants, Leases, Invoices, Payments, and Receipts have been migrated to the Lagoon Command List visual style. The **Maintenance** and **Reminders** modules are distinct because they manage multi-step operational workflows rather than flat tabular records.

This design spec outlines how we apply the Lagoon Command Center visual language to these workflow surfaces, optimizing them for rapid status tracking and clear state transitions.

---

## Design Decisions

### 1. Maintenance Page

- **Layout**: High-density **3-column Kanban-style board** on desktop viewports.
  - Column 1: **Open** (`open` status).
  - Column 2: **In Progress** (`in_progress` status).
  - Column 3: **Completed** (includes `resolved` and `cancelled` statuses).
- **Header**: Standard command header with title, short description, and primary "Add ticket" action.
- **Summary Strip**: 3-card metrics bar at the top:
  - _Active Tickets_: Sum of `open` + `in_progress` tickets.
  - _Urgent priority_: Count of tickets with `urgent` priority.
  - _Completed Cost_: Sum of `actual_cost` of all resolved tickets in current query.
- **Priority Badge**: Distinct color-coding matching the Warm Admin Ledger semantic feedback:
  - `urgent`: Orange text and light orange background (`color: #c2410c; background: #fff7ed; border-color: #ffedd5;`).
  - `high`: Amber text and light amber background (`color: #b45309; background: #fef3c7; border-color: #fde68a;`).
  - `medium`: Sky-blue text and light blue background (`color: #0369a1; background: #f0f9ff; border-color: #e0f2fe;`).
  - `low`: Muted gray text and light gray background (`color: #4b5563; background: #f3f4f6; border-color: #e5e7eb;`).
- **Contextual Actions**: Show logical transition buttons only to reduce card clutter:
  - If `open`: Show **"Start Work"** (`in_progress`) and **"Cancel"** (`cancelled`).
  - If `in_progress`: Show **"Resolve"** (`resolved`), **"Put on Hold"** (`open`), and **"Cancel"** (`cancelled`).
  - If `resolved` or `cancelled`: Show **"Reopen"** (`open`).

### 2. Reminders Page

- **Layout**: High-density **2-column split workspace** on desktop viewports.
  - **Left Column**: _Prepare Panel_ (width: 440px, non-shrinking card styled as `command-list-surface`). Holds the invoice selector, remaining balance widget, generated message preview, and the primary "Prepare reminder" action button.
  - **Right Column**: _Follow-up Queue_ (flex-grow). Holds the list of prepared, sent, and cancelled reminder cards.
- **Summary Strip**: 3-card metrics bar at the top:
  - _Prepared_: Reminders with status `prepared` (ready to copy/send).
  - _Sent_: Reminders with status `sent`.
  - _Cancelled_: Reminders with status `cancelled`.
- **Contextual Actions**:
  - If `prepared`: Show **"Copy Message"** and **"Open WhatsApp"** (if URL exists) side-by-side as primary actions. Show secondary buttons **"Mark Sent"** and **"Cancel"** below.
  - If `sent`: Show **"Copy Message"** as primary action, and secondary buttons **"Revert to Prepared"** and **"Cancel"** below.
  - If `cancelled`: Show primary button **"Restore"** (reverts status to `prepared`).

---

## Styling & Layout Architecture

Add custom classes to `src/App.css` to build the grids:

- `.maintenance-board`: `display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 14px; align-items: start;`
- `.maintenance-column`: Styled column container with light border `var(--border)` and radius `var(--radius)`.
- `.reminders-split-grid`: `display: grid; grid-template-columns: 440px minmax(0, 1fr); gap: 16px; align-items: start;`

### Design System Compliance

- App background relies on `--bg` and linear-gradients already present in `body`.
- Cards and surfaces must use `var(--surface-glass)` and `var(--radius)` for modern rounded depth.
- Buttons must use standard spacing and height matching `.properties-page__header a` variables.
- Color transitions must use smooth durations (160ms) without causing layout shifts.

---

## Responsive Design

- **Tablet (max-width: 980px)**:
  - `.reminders-split-grid` collapses to a single-column layout, stacking the Prepare Panel above the Queue.
  - `.maintenance-board` collapses to a single-column stacked layout.
- **Mobile (max-width: 720px)**:
  - Metrics cards in the summary strip stack vertically.
  - Preserve bottom spacing with `padding-bottom: 96px` to prevent the floating bottom navigation bar from covering card actions.

---

## Accessibility

- Retain semantic layout elements (`section`, `aside`, `article`, `dl`).
- Ensure action buttons have clean `aria-disabled` and screen reader announcements during loading states (`isUpdating`).
- Outline rings (`:focus-visible`) must stay clear and follow the design system values.

---

## Out of Scope

- New columns, fields, or database tables.
- WhatsApp Business API setup (keep the manual WhatsApp copy-and-open model).
- ApexCharts or any graphing upgrades.
- Modifying create/edit forms or detail layouts (deferred to a future task).
