# Design Spec: Create/Edit/Detail Guided Layout Uplift

## Context

The main dashboard, operational queues (Maintenance and Reminders), and list pages for core entities have been successfully migrated to the Lagoon Command Center visual system. However, the creation, edit, and detail screens still rely on simpler, narrow layouts with legacy BEM styling and are aligned to the left of the workspace on wider viewports.

This spec defines the visual language, layout structure, and guided layouts for all creation, edit, and detail pages, ensuring they are centered, consistent, and feel like first-class cockpits in the Lagoon Command Center interface.

---

## Design Decisions

### 1. Unified Page Grid & Sizing (Centering)

- **Horizontal Centering**: To maintain consistency with the main dashboard and shell layouts, all form page containers (`.create-property-page`, `.create-tenant-page`, etc.) must be centered on the screen using `margin-inline: auto`.
- All form page containers will use a maximum content width of `640px` (`.command-form-container`), except for `.create-maintenance-page` and `.create-maintenance-ticket-page` which use a maximum content width of `720px`.
- **Detail** pages (Property Detail, Receipt Detail) will support wider layouts matching the standard shell width, but will also be centered and split into grid layouts.
- All page containers will respect the floating bottom navigation bar using appropriate bottom padding (`padding-bottom: 120px` on mobile/tablet).

### 2. Form Cards & Sizing Types (Context-Aware Cockpits)

Based on form complexity across the app, we utilize two layout types:

#### Type 1: Simple Single-Step Card

- **Applicable Modules**: Properties, Units.
- **Visuals**: A clean, single-page form wrapper using `.command-form-card`. Omit progress steppers, but apply aligned submit actions at the bottom.

#### Type 2: Multi-Step Stepper Cockpit

- **Applicable Modules**: Leases, Payments, Invoices, Maintenance.
- **Visuals**:
  - **Top Stepper Progress**: An inline horizontal stepper bar at the top of the card (e.g. `1. Context` -> `2. Terms` -> `3. Finance`).
  - **Section Accent Indicators**: Vertical left-border accent lines with circular numbered step badges (e.g., `1` and `2` with glowing cyan circles) directly on the line.
  - **Inline Validation Markers**: Dotted labels (e.g., `REQUIRED` in cyan) placed next to input labels.
  - **Defined Action Zone**: Pagination buttons (`Previous` / `Next Step`) aligned to the bottom.

### 3. Sizing & Elements Style (Lagoon Theme)

- Forms will be wrapped in a `.command-form-card` container:
  - **Background**: Translucent white glassmorphism (`background: rgb(255 255 255 / 0.88)`).
  - **Borders & Shadows**: `border: 1px solid var(--lagoon-light-border); border-radius: 16px; box-shadow: 0 12px 30px rgb(14 116 144 / 0.04);`.
  - **Blur**: `backdrop-filter: blur(8px);`.
- Form headers will feature clear operational descriptions and structured field groupings.
- **Input Focus States**: Text inputs, selects, and textareas must display smooth transitions (160ms) and focus rings matching the sky/cyan/blue lagoon brand palette (`border-color: var(--lagoon-500); box-shadow: 0 0 0 3px rgb(6 182 212 / 0.15);`).

### 4. Page-Specific Uplift Details

#### A. Properties Module

- **Create Property & Edit Property**: Single-page form (Type 1). Group name, address, and notes into structured grid rows.
- **Property Detail**: Implement a **2-column split layout** (`.property-detail-layout`) on desktop viewports:
  - **Left Column** (`flex-grow: 1`): Property information card (`.property-info-card`) with metadata.
  - **Right Column** (`width: 440px`, non-shrinking): Units list (`.property-units-card`) containing the unit list section.

#### B. Tenants Module

- **Create Tenant & Edit Tenant**: Multi-step layout (Type 2). Broken into:
  - Step 1: **Primary Contact Info** (Name, Phone, Email).
  - Step 2: **Emergency & Alternate Details** (Emergency Contact Name, Emergency Contact Phone).

#### C. Leases Module

- **Create Lease**: Stepper layout (Type 2). Divided into:
  - Step 1: **Tenant & Unit Context** (Select Tenant, Select Unit).
  - Step 2: **Lease Term & Dates** (Start Date, End Date).
  - Step 3: **Financial Terms** (Monthly Rent amount).

#### D. Billing & Invoices Module

- **Create Invoice**: Stepper layout (Type 2). Divided into:
  - Step 1: **Lease Context** (Select Lease).
  - Step 2: **Invoice Details** (Billing Period, Total Amount, Due Date).

#### E. Payments Module

- **Create Payment**: Stepper layout (Type 2). Divided into:
  - Step 1: **Invoice context & Balance** (Select Invoice, displaying remaining balance metadata).
  - Step 2: **Payment Details** (Amount, Date, Method).
  - Step 3: **Reference & Notes** (Reference Number, optional Notes).

#### F. Receipts Module

- **Receipt Detail**: Redesign the receipt card as a clean, structured printable voucher:
  - A prominent header strip displaying the **Receipt Number** and the **Voucher Value** in a large, bold format.
  - Detailed meta rows using a structured key-value layout (`dl` grid with 2 columns).
  - High-density layout emphasizing clear boundaries, aligning perfectly with standard receipt dimensions.

#### G. Maintenance Module

- **Create Maintenance Ticket**: Stepper layout (Type 2). Divided into:
  - Step 1: **Ticket Description** (Select Property/Unit, Title, Description).
  - Step 2: **Priority & Budget** (Select Priority status, Estimated Cost).

#### H. Units Module

- **Create Unit & Edit Unit**: Single-page form (Type 1). Compact, single-column forms featuring property selection and rent values.

---

## Styling & Layout Classes

Add/update the following CSS classes in `src/App.css` to build the forms and detail layouts:

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

---

## Responsive Design

- **Tablet (max-width: 980px)**:
  - `.property-detail-layout` collapses to a single-column layout, stacking the units list under the property details card.
- **Mobile (max-width: 720px)**:
  - Actions at the bottom of forms will collapse to full-width stacked buttons if horizontal space is constrained.
  - Page headers and actions stack vertically with appropriate spacing.

---

## Out of Scope

- Modifying underlying data validation hooks, DB tables, or TanStack query cache keys.
- Adding datepicker libraries or custom select controls outside React Hook Form.

---

## Closeout

Implemented:

- centered command form containers and Lagoon Command Center form cards for create/edit pages
- guided form sections for Tenants, Leases, Invoices, Payments, and Maintenance ticket creation
- single-card form treatments for Properties and Units
- split desktop Property detail layout with the Units section alongside the property record
- denser printable voucher-style Receipt detail surface using the existing receipt detail markup and updated styling

Validation:

- `npm run format:check` passed
- `npm run build` passed
- `npm run lint` passed
- `git diff --check` passed

Deferred:

- replacing every remaining domain-local BEM class with shared React primitives
- adding custom field widgets, custom date pickers, or new dependencies
- screenshot-backed visual regression automation

Next todo:

- review the remaining focused MVP gap bucket and choose one product gap for the next approved task
