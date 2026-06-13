# Create/Edit/Detail Guided Layout Uplift Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Redesign all creation, edit, and detail views to align with the Lagoon Command Center design system, centering all form layouts horizontally in the viewport for consistency, and introducing context-aware guided stepper structures.

**Architecture:** Add page centering rules and form card overrides to `src/App.css`. Wrap form elements in `.command-form-card`. For complex multi-step forms (Type 2), wrap field clusters in `.form-section` divs. Detail pages utilize responsive CSS grids that collapse on mobile.

**Tech Stack:** React 19, TypeScript, Lucide Icons, Vite, Vanilla CSS.

---

### Task 1: Global CSS Layout & Centering Styles

**Files:**

- Modify: `src/App.css`

- [x] **Step 1: Add centering, glassmorphism card, and stepper style tokens to App.css**
      Append the following class definitions to `src/App.css`:

  ```css
  /* Centered form container selectors */
  .create-property-page,
  .create-tenant-page,
  .create-lease-page,
  .create-invoice-page,
  .create-payment-page,
  .edit-tenant-page,
  .edit-property-page,
  .create-unit-page,
  .edit-unit-page {
    display: grid;
    gap: 24px;
    max-width: 640px;
    width: 100%;
    margin-inline: auto; /* Centers the forms */
  }

  /* Maintenance page layouts centering */
  .create-maintenance-page,
  .create-maintenance-ticket-page {
    display: grid;
    gap: 24px;
    max-width: 720px;
    width: 100%;
    margin-inline: auto; /* Centers the forms */
  }

  /* Unified Form Card Container */
  .command-form-card {
    background: rgb(255 255 255 / 0.88);
    border: 1px solid var(--lagoon-light-border);
    border-radius: 16px;
    padding: 24px;
    box-shadow: 0 12px 30px rgb(14 116 144 / 0.04);
    backdrop-filter: blur(8px);
    display: flex;
    flex-direction: column;
    gap: 20px;
  }

  /* Guided Form Sections */
  .form-section {
    border-bottom: 1px solid var(--border);
    padding-bottom: 20px;
    margin-bottom: 12px;
  }

  .form-section:last-of-type {
    border-bottom: 0;
    padding-bottom: 0;
    margin-bottom: 0;
  }

  .form-section h3 {
    margin: 0 0 4px;
    font-size: 14px;
    font-weight: 800;
    color: var(--text-h);
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  .form-section__helper {
    margin: 0 0 14px;
    font-size: 13px;
    color: var(--text);
  }

  /* Split detail layout on desktop */
  .property-detail-layout {
    display: grid;
    grid-template-columns: minmax(0, 1fr) 440px;
    gap: 16px;
    align-items: start;
    margin-top: 18px;
  }

  /* Form inputs focus state override */
  .command-form-card input:focus,
  .command-form-card select:focus,
  .command-form-card textarea:focus {
    outline: none;
    border-color: var(--lagoon-500);
    box-shadow: 0 0 0 3px rgb(6 182 212 / 0.15);
  }
  ```

- [x] **Step 2: Commit CSS changes**
      Skipped by repository policy: staging and commits require explicit user approval.

---

### Task 2: Properties Module

**Files:**

- Modify: `src/modules/properties/presentation/create-property-page.tsx`
- Modify: `src/modules/properties/presentation/edit-property-page.tsx`
- Modify: `src/modules/properties/presentation/property-detail-page.tsx`

- [x] **Step 1: Update Create Property Form class name**
    Modify `<form className="create-property-form">` to:
    `tsx
<form className="create-property-form command-form-card" ...>
`

- [x] **Step 2: Update Edit Property Form class name**
    Modify `<form className="edit-property-form">` to:
    `tsx
<form className="edit-property-form command-form-card" ...>
`

- [x] **Step 3: Redesign Property Detail layout**
      Modify `property-detail-page.tsx` to wrap the details and units list in a `.property-detail-layout` container.

- [x] **Step 4: Commit Properties uplift**
      Skipped by repository policy: staging and commits require explicit user approval.

---

### Task 3: Tenants Module

**Files:**

- Modify: `src/modules/tenants/presentation/create-tenant-page.tsx`
- Modify: `src/modules/tenants/presentation/edit-tenant-page.tsx`

- [x] **Step 1: Wrap Create Tenant Form fields in Guided Sections**
      Append `command-form-card` to `tenant-form` and partition details into two `.form-section` elements.

- [x] **Step 2: Wrap Edit Tenant Form fields in Guided Sections**
      Append `command-form-card` to `tenant-form` and partition details into two `.form-section` elements.

- [x] **Step 3: Commit Tenants uplift**
      Skipped by repository policy: staging and commits require explicit user approval.

---

### Task 4: Leases Module

**Files:**

- Modify: `src/modules/leases/presentation/create-lease-page.tsx`

- [x] **Step 1: Wrap Create Lease Form fields in three Guided Sections**
      Append `command-form-card` to `<form>` and partition details into three `.form-section` elements: 1. Tenant & Unit Context 2. Lease Term & Dates 3. Financial Terms

- [x] **Step 2: Commit Leases uplift**
      Skipped by repository policy: staging and commits require explicit user approval.

---

### Task 5: Invoices Module

**Files:**

- Modify: `src/modules/invoices/presentation/create-invoice-page.tsx`

- [x] **Step 1: Wrap Create Invoice Form fields in two Guided Sections**
      Append `command-form-card` to `<form>` and partition details into: 1. Lease Context 2. Invoice Details

- [x] **Step 2: Commit Invoices uplift**
      Skipped by repository policy: staging and commits require explicit user approval.

---

### Task 6: Payments Module

**Files:**

- Modify: `src/modules/payments/presentation/create-payment-page.tsx`

- [x] **Step 1: Wrap Create Payment Form fields in three Guided Sections**
      Append `command-form-card` to `<form>` and partition details into: 1. Invoice context & Balance 2. Payment Details 3. Reference & Notes

- [x] **Step 2: Commit Payments uplift**
      Skipped by repository policy: staging and commits require explicit user approval.

---

### Task 7: Receipts Module

**Files:**

- Modify: `src/modules/receipts/presentation/receipt-detail-page.tsx`

- [x] **Step 1: Redesign Receipt Detail layout**
      Structure the Receipt Detail content to look like a high-density, printable payment voucher/slip layout.

- [x] **Step 2: Commit Receipts uplift**
      Skipped by repository policy: staging and commits require explicit user approval.

---

### Task 8: Maintenance Module

**Files:**

- Modify: `src/modules/maintenance/presentation/create-maintenance-ticket-page.tsx`

- [x] **Step 1: Wrap Create Maintenance Ticket Form fields in two Guided Sections**
      Append `command-form-card` to `<form>` and partition details into: 1. Ticket Description 2. Priority & Budget

- [x] **Step 2: Commit Maintenance uplift**
      Skipped by repository policy: staging and commits require explicit user approval.

---

### Task 9: Units Module

**Files:**

- Modify: `src/modules/units/presentation/create-unit-page.tsx`
- Modify: `src/modules/units/presentation/edit-unit-page.tsx`

- [x] **Step 1: Update Create Unit Form class name**
    Modify `<form className="unit-form">` to:
    `tsx
<form className="unit-form command-form-card" ...>
`

- [x] **Step 2: Update Edit Unit Form class name**
    Modify `<form className="edit-unit-form">` to:
    `tsx
<form className="edit-unit-form command-form-card" ...>
`

- [x] **Step 3: Commit Units uplift**
      Skipped by repository policy: staging and commits require explicit user approval.

---

### Task 10: Validation

- [x] **Step 1: Run formatting check**
      Run: `npm run format:check`
      Expected: Formatting passes.

- [x] **Step 2: Run build**
      Run: `npm run build`
      Expected: Build passes.

- [x] **Step 3: Run lint**
      Run: `npm run lint`
      Expected: Linting passes.

- [x] **Step 4: Run diff check**
      Run: `git diff --check`
      Expected: No whitespace/diff issues.

Validation result:

- `npm run format:check` passed.
- `npm run build` passed.
- `npm run lint` passed.
- `git diff --check` passed.
