# Command List Page Uplift Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Upgrade Properties, Tenants, Leases, Invoices, Payments, and Receipts into dashboard-matching command list pages.

**Architecture:** Keep behavior and data fetching unchanged. Each page computes local summary metrics from its existing query result and renders a shared command-list structure styled through grouped selectors in `src/App.css`.

**Tech Stack:** React 19, TypeScript, React Router, TanStack Query, Vite, existing CSS in `src/App.css`.

---

## Files

- Modify: `src/App.css`
  - Add shared command-list page shell styles.
  - Add summary strip, content grid, list surface, and utility rail styles.
  - Refine existing card groups so these six pages inherit dashboard-like density.
- Modify: `src/modules/properties/presentation/properties-page.tsx`
  - Add local summary metrics and command-list wrapper markup.
- Modify: `src/modules/tenants/presentation/tenants-page.tsx`
  - Add local summary metrics and command-list wrapper markup.
- Modify: `src/modules/leases/presentation/leases-page.tsx`
  - Add local summary metrics and command-list wrapper markup.
- Modify: `src/modules/invoices/presentation/invoices-page.tsx`
  - Add local summary metrics, status rail, and command-list wrapper markup.
- Modify: `src/modules/payments/presentation/payments-page.tsx`
  - Add local summary metrics, receipt rail, and command-list wrapper markup.
- Modify: `src/modules/receipts/presentation/receipts-page.tsx`
  - Add local summary metrics and command-list wrapper markup.
- Review: docs/wiki closeout pages after implementation to decide whether module status or deferred scope wording changed.

Do not modify Maintenance, Reminders, create pages, edit pages, or detail pages in this plan.

---

### Task 1: Shared Command-List CSS Foundation

**Files:**

- Modify: `src/App.css`

- [ ] **Step 1: Add shared command-list selectors near the grouped page styles**

Add these selectors after the existing page header/list group around `properties-page`, `tenants-page`, `leases-page`, `invoices-page`, `payments-page`, and `receipts-page`:

```css
.properties-page,
.tenants-page,
.leases-page,
.invoices-page,
.payments-page,
.receipts-page {
  gap: 18px;
  width: min(100%, var(--lagoon-shell-max));
  max-width: var(--lagoon-shell-max);
}

.command-list-summary {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 10px;
}

.command-list-summary__item {
  position: relative;
  display: grid;
  gap: 6px;
  overflow: hidden;
  border: 1px solid var(--lagoon-light-border);
  border-radius: 14px;
  padding: 14px;
  background: rgb(255 255 255 / 0.9);
  box-shadow: 0 10px 24px rgb(14 116 144 / 0.08);
}

.command-list-summary__item::before {
  content: '';
  position: absolute;
  inset: 0 auto 0 0;
  width: 4px;
  background: var(--lagoon-500);
}

.command-list-summary__item span {
  color: #52697a;
  font-size: 12px;
  font-weight: 900;
  text-transform: uppercase;
}

.command-list-summary__item strong {
  color: var(--text-h);
  font-size: 24px;
  line-height: 1;
}

.command-list-summary__item p {
  margin: 0;
  color: var(--text);
  font-size: 13px;
}

.command-list-grid {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 280px;
  gap: 14px;
  align-items: start;
}

.command-list-grid--single {
  grid-template-columns: minmax(0, 1fr);
}

.command-list-surface,
.command-list-rail {
  border: 1px solid var(--lagoon-light-border);
  border-radius: 16px;
  background: rgb(255 255 255 / 0.88);
  box-shadow: 0 12px 28px rgb(14 116 144 / 0.08);
}

.command-list-surface {
  display: grid;
  gap: 0;
  padding: 8px;
}

.command-list-rail {
  display: grid;
  gap: 12px;
  padding: 14px;
}

.command-list-rail h3 {
  margin: 0;
  color: var(--text-h);
  font-size: 15px;
}

.command-list-rail p {
  margin: 0;
  color: var(--text);
  font-size: 13px;
}

.command-list-rail__items {
  display: grid;
  gap: 8px;
}

.command-list-rail__item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  border-radius: 10px;
  padding: 9px 10px;
  background: #f4fbff;
}

.command-list-rail__item span {
  color: #52697a;
  font-size: 12px;
  font-weight: 900;
}

.command-list-rail__item strong {
  color: var(--text-h);
  font-size: 14px;
}
```

- [ ] **Step 2: Add compact card treatment for the six list pages**

Add or update grouped selectors:

```css
.properties-page .property-card,
.tenants-page .tenant-card,
.leases-page .lease-card,
.invoices-page .invoice-card,
.payments-page .payment-card,
.receipts-page .receipt-card {
  border-color: transparent;
  border-radius: 12px;
  padding: 16px;
  background: #f8fcff;
  box-shadow: none;
}

.command-list-surface > article + article {
  border-top: 1px solid var(--lagoon-light-border);
}

.properties-page .property-card:hover,
.tenants-page .tenant-card:hover,
.leases-page .lease-card:hover,
.invoices-page .invoice-card:hover,
.payments-page .payment-card:hover,
.receipts-page .receipt-card:hover {
  border-color: rgb(14 165 233 / 0.26);
  background: #ffffff;
  box-shadow: 0 12px 26px rgb(14 116 144 / 0.1);
}
```

- [ ] **Step 3: Add responsive behavior**

Add this to the existing responsive section:

```css
@media (max-width: 980px) {
  .command-list-grid {
    grid-template-columns: minmax(0, 1fr);
  }
}

@media (max-width: 720px) {
  .command-list-summary {
    grid-template-columns: minmax(0, 1fr);
  }

  .command-list-surface,
  .command-list-rail {
    border-radius: 14px;
  }
}
```

- [ ] **Step 4: Validate CSS only**

Run:

```bash
npx prettier --write src/App.css
npm run format:check
git diff --check
```

Expected: Prettier reports `src/App.css`, format check passes, diff check exits 0.

- [ ] **Step 5: Commit**

```bash
git add src/App.css
git commit -m "feat: add command list page shell styles"
```

---

### Task 2: Properties Command List Page

**Files:**

- Modify: `src/modules/properties/presentation/properties-page.tsx`

- [ ] **Step 1: Add summary helper**

Add above `PropertiesPage`:

```tsx
function buildPropertySummary(properties: Property[]) {
  const withAddressCount = properties.filter((property) =>
    property.address?.trim(),
  ).length
  const withNotesCount = properties.filter((property) =>
    property.notes?.trim(),
  ).length

  return [
    {
      label: 'Total properties',
      value: properties.length.toString(),
      helper: 'Rental locations in workspace',
    },
    {
      label: 'With address',
      value: withAddressCount.toString(),
      helper: 'Ready for unit mapping',
    },
    {
      label: 'Missing notes',
      value: (properties.length - withNotesCount).toString(),
      helper: 'Need operational context',
    },
  ]
}
```

- [ ] **Step 2: Render summary and command surface**

Inside success branch for non-empty data, wrap the list with:

```tsx
const propertySummary = buildPropertySummary(propertiesQuery.data)
```

Render before the list:

```tsx
<div className="command-list-summary" aria-label="Property summary">
  {propertySummary.map((item) => (
    <article className="command-list-summary__item" key={item.label}>
      <span>{item.label}</span>
      <strong>{item.value}</strong>
      <p>{item.helper}</p>
    </article>
  ))}
</div>
```

Change list wrapper class to:

```tsx
<div className="command-list-grid command-list-grid--single">
  <div
    className="properties-page__list command-list-surface"
    aria-label="Property list"
  >
    {/* existing property cards */}
  </div>
</div>
```

- [ ] **Step 3: Validate**

Run:

```bash
npx prettier --write src/modules/properties/presentation/properties-page.tsx
npm run build
npm run lint
```

Expected: build and lint exit 0.

- [ ] **Step 4: Commit**

```bash
git add src/modules/properties/presentation/properties-page.tsx
git commit -m "feat: uplift properties command list"
```

---

### Task 3: Tenants Command List Page

**Files:**

- Modify: `src/modules/tenants/presentation/tenants-page.tsx`

- [ ] **Step 1: Add summary helper**

Add above `TenantsPage`:

```tsx
function buildTenantSummary(tenants: Tenant[]) {
  const withEmailCount = tenants.filter((tenant) => tenant.email?.trim()).length
  const missingEmergencyContactCount = tenants.filter(
    (tenant) => !tenant.emergency_contact_name?.trim(),
  ).length

  return [
    {
      label: 'Total tenants',
      value: tenants.length.toString(),
      helper: 'Contact records in workspace',
    },
    {
      label: 'With email',
      value: withEmailCount.toString(),
      helper: 'Reachable by digital notice',
    },
    {
      label: 'Missing emergency',
      value: missingEmergencyContactCount.toString(),
      helper: 'Needs backup contact',
    },
  ]
}
```

- [ ] **Step 2: Render summary, command surface, and rail**

Inside the success/non-empty branch compute:

```tsx
const tenantSummary = buildTenantSummary(tenantsQuery.data)
```

Render summary before content. Wrap content:

```tsx
<div className="command-list-grid">
  <div
    className="tenants-page__list command-list-surface"
    aria-label="Tenant list"
  >
    {/* existing tenant cards */}
  </div>
  <aside className="command-list-rail" aria-label="Tenant data quality">
    <div>
      <h3>Data quality</h3>
      <p>Keep contacts complete before lease work starts.</p>
    </div>
    <div className="command-list-rail__items">
      <div className="command-list-rail__item">
        <span>Email contacts</span>
        <strong>{tenantSummary[1].value}</strong>
      </div>
      <div className="command-list-rail__item">
        <span>Missing emergency</span>
        <strong>{tenantSummary[2].value}</strong>
      </div>
    </div>
  </aside>
</div>
```

- [ ] **Step 3: Validate**

Run:

```bash
npx prettier --write src/modules/tenants/presentation/tenants-page.tsx
npm run build
npm run lint
```

Expected: build and lint exit 0.

- [ ] **Step 4: Commit**

```bash
git add src/modules/tenants/presentation/tenants-page.tsx
git commit -m "feat: uplift tenants command list"
```

---

### Task 4: Leases Command List Page

**Files:**

- Modify: `src/modules/leases/presentation/leases-page.tsx`

- [ ] **Step 1: Add summary helper**

Add above `LeasesPage`:

```tsx
function buildLeaseSummary(leases: LeaseListItem[]) {
  const activeCount = leases.filter((lease) => lease.status === 'active').length
  const endedCount = leases.filter((lease) => lease.status === 'ended').length

  return [
    {
      label: 'Total leases',
      value: leases.length.toString(),
      helper: 'Tenant-unit agreements',
    },
    {
      label: 'Active',
      value: activeCount.toString(),
      helper: 'Currently billing',
    },
    {
      label: 'Ended',
      value: endedCount.toString(),
      helper: 'Closed agreements',
    },
  ]
}
```

- [ ] **Step 2: Render summary, command surface, and rail**

Use `leaseSummary = buildLeaseSummary(leasesQuery.data)`.

Render content grid:

```tsx
<div className="command-list-grid">
  <div
    className="leases-page__list command-list-surface"
    aria-label="Lease list"
  >
    {/* existing lease cards */}
  </div>
  <aside className="command-list-rail" aria-label="Lease status breakdown">
    <div>
      <h3>Lifecycle</h3>
      <p>Lease status at a glance.</p>
    </div>
    <div className="command-list-rail__items">
      <div className="command-list-rail__item">
        <span>Active</span>
        <strong>{leaseSummary[1].value}</strong>
      </div>
      <div className="command-list-rail__item">
        <span>Ended</span>
        <strong>{leaseSummary[2].value}</strong>
      </div>
    </div>
  </aside>
</div>
```

- [ ] **Step 3: Validate**

Run:

```bash
npx prettier --write src/modules/leases/presentation/leases-page.tsx
npm run build
npm run lint
```

Expected: build and lint exit 0.

- [ ] **Step 4: Commit**

```bash
git add src/modules/leases/presentation/leases-page.tsx
git commit -m "feat: uplift leases command list"
```

---

### Task 5: Invoices Command List Page

**Files:**

- Modify: `src/modules/invoices/presentation/invoices-page.tsx`

- [ ] **Step 1: Add summary helper**

Add above `InvoicesPage`:

```tsx
function buildInvoiceSummary(invoices: InvoiceListItem[]) {
  const draftCount = invoices.filter(
    (invoice) => invoice.status === 'draft',
  ).length
  const issuedCount = invoices.filter(
    (invoice) => invoice.status === 'issued',
  ).length
  const paidCount = invoices.filter(
    (invoice) => invoice.status === 'paid',
  ).length

  return [
    {
      label: 'Total invoices',
      value: invoices.length.toString(),
      helper: 'Billing records',
    },
    {
      label: 'Draft',
      value: draftCount.toString(),
      helper: 'Need issue date',
    },
    {
      label: 'Issued or paid',
      value: (issuedCount + paidCount).toString(),
      helper: 'Sent into collection',
    },
  ]
}
```

- [ ] **Step 2: Render summary and rail**

Use `invoiceSummary = buildInvoiceSummary(invoicesQuery.data)`.

Add summary before the content grid and wrap list in:

```tsx
<div className="command-list-grid">
  <div
    className="invoices-page__list command-list-surface"
    aria-label="Invoice list"
  >
    {/* existing invoice cards */}
  </div>
  <aside className="command-list-rail" aria-label="Invoice status breakdown">
    <div>
      <h3>Billing flow</h3>
      <p>Draft invoices should be issued before payment collection.</p>
    </div>
    <div className="command-list-rail__items">
      <div className="command-list-rail__item">
        <span>Draft</span>
        <strong>{invoiceSummary[1].value}</strong>
      </div>
      <div className="command-list-rail__item">
        <span>Issued or paid</span>
        <strong>{invoiceSummary[2].value}</strong>
      </div>
    </div>
  </aside>
</div>
```

- [ ] **Step 3: Validate**

Run:

```bash
npx prettier --write src/modules/invoices/presentation/invoices-page.tsx
npm run build
npm run lint
```

Expected: build and lint exit 0.

- [ ] **Step 4: Commit**

```bash
git add src/modules/invoices/presentation/invoices-page.tsx
git commit -m "feat: uplift invoices command list"
```

---

### Task 6: Payments Command List Page

**Files:**

- Modify: `src/modules/payments/presentation/payments-page.tsx`

- [ ] **Step 1: Add summary helper**

Add above `PaymentsPage`:

```tsx
function buildPaymentSummary(payments: PaymentListItem[]) {
  const withReceiptCount = payments.filter(
    (payment) => payment.receipt_id !== null,
  ).length
  const totalAmount = payments.reduce((sum, payment) => sum + payment.amount, 0)

  return [
    {
      label: 'Total payments',
      value: payments.length.toString(),
      helper: 'Recorded receipts of money',
    },
    {
      label: 'With receipt',
      value: withReceiptCount.toString(),
      helper: 'Proof generated',
    },
    {
      label: 'Collected',
      value: formatCurrency(totalAmount),
      helper: 'Total recorded amount',
    },
  ]
}
```

- [ ] **Step 2: Render summary and receipt rail**

Use `paymentSummary = buildPaymentSummary(paymentsQuery.data)`.

Wrap list:

```tsx
<div className="command-list-grid">
  <div
    className="payments-page__list command-list-surface"
    aria-label="Payment list"
  >
    {/* existing payment cards */}
  </div>
  <aside className="command-list-rail" aria-label="Receipt coverage">
    <div>
      <h3>Receipt coverage</h3>
      <p>Generate receipts for payments that still need proof records.</p>
    </div>
    <div className="command-list-rail__items">
      <div className="command-list-rail__item">
        <span>With receipt</span>
        <strong>{paymentSummary[1].value}</strong>
      </div>
      <div className="command-list-rail__item">
        <span>Pending receipt</span>
        <strong>
          {(
            paymentsQuery.data.length - Number(paymentSummary[1].value)
          ).toString()}
        </strong>
      </div>
    </div>
  </aside>
</div>
```

- [ ] **Step 3: Validate**

Run:

```bash
npx prettier --write src/modules/payments/presentation/payments-page.tsx
npm run build
npm run lint
```

Expected: build and lint exit 0.

- [ ] **Step 4: Commit**

```bash
git add src/modules/payments/presentation/payments-page.tsx
git commit -m "feat: uplift payments command list"
```

---

### Task 7: Receipts Command List Page

**Files:**

- Modify: `src/modules/receipts/presentation/receipts-page.tsx`

- [ ] **Step 1: Add summary helper**

Add above `ReceiptsPage`:

```tsx
function buildReceiptSummary(receipts: ReceiptListItem[]) {
  const totalAmount = receipts.reduce(
    (sum, receipt) => sum + receipt.payment_amount,
    0,
  )
  const uniqueTenants = new Set(receipts.map((receipt) => receipt.tenant_name))
    .size

  return [
    {
      label: 'Total receipts',
      value: receipts.length.toString(),
      helper: 'Generated proof records',
    },
    {
      label: 'Tenants covered',
      value: uniqueTenants.toString(),
      helper: 'Distinct receipt parties',
    },
    {
      label: 'Receipted amount',
      value: formatCurrency(totalAmount),
      helper: 'Total payment proof',
    },
  ]
}
```

- [ ] **Step 2: Render summary and full-width surface**

Use `receiptSummary = buildReceiptSummary(receiptsQuery.data)`.

Render summary before the list and wrap list:

```tsx
<div className="command-list-grid command-list-grid--single">
  <div
    className="receipts-page__list command-list-surface"
    aria-label="Receipt list"
  >
    {/* existing receipt cards */}
  </div>
</div>
```

- [ ] **Step 3: Validate**

Run:

```bash
npx prettier --write src/modules/receipts/presentation/receipts-page.tsx
npm run build
npm run lint
```

Expected: build and lint exit 0.

- [ ] **Step 4: Commit**

```bash
git add src/modules/receipts/presentation/receipts-page.tsx
git commit -m "feat: uplift receipts command list"
```

---

### Task 8: Responsive Polish And Final Validation

**Files:**

- Modify: `src/App.css`
- Review: docs/wiki pages touched by this UI/UX work.

- [ ] **Step 1: Inspect responsive selector groups**

Review these sections in `src/App.css`:

```bash
sed -n '3670,3795p' src/App.css
sed -n '3890,3950p' src/App.css
```

Confirm command-list styles do not conflict with existing mobile rules for dashboard, maintenance, or reminders.

- [ ] **Step 2: Add small-screen refinements**

Add:

```css
@media (max-width: 520px) {
  .command-list-summary__item {
    padding: 12px;
  }

  .command-list-surface {
    padding: 6px;
  }

  .properties-page .property-card,
  .tenants-page .tenant-card,
  .leases-page .lease-card,
  .invoices-page .invoice-card,
  .payments-page .payment-card,
  .receipts-page .receipt-card {
    padding: 14px;
  }
}
```

- [ ] **Step 3: Full validation**

Run:

```bash
npm run format:check
npm run build
npm run lint
git diff --check
```

Expected: all commands exit 0.

- [ ] **Step 4: Manual browser review**

Start the dev server:

```bash
npm run dev
```

Review:

- `/dashboard/properties`
- `/dashboard/tenants`
- `/dashboard/leases`
- `/dashboard/invoices`
- `/dashboard/payments`
- `/dashboard/receipts`

Check desktop and mobile widths. Confirm Maintenance, Reminders, create/edit/detail pages are visually unchanged except for inherited global shell/nav behavior.

- [ ] **Step 5: Commit final polish**

Commit the responsive CSS:

```bash
git add src/App.css
git commit -m "chore: polish command list responsive layout"
```

---

### Task 9: Closeout

**Files:**

- Modify: relevant docs/wiki pages only if module status or next task recommendations need updates.

- [x] **Step 1: Record deferred follow-up**

Closeout recorded in task-tracking docs:

```markdown
Next UI/UX task: apply a queue/workflow layout to Maintenance and Reminders, then apply a guided form/detail layout to create/edit/detail pages.
```

Implemented scope:

- Properties, Tenants, Leases, Invoices, Payments, and Receipts now use the shared command-list page structure.
- List pages gained summary strips; Tenants, Leases, Invoices, and Payments also gained context rails.
- Responsive polish keeps command-list cards denser below 520px and protects long summary values from overflow.

Deferred scope:

- Maintenance and Reminders workflow layouts.
- Create, edit, and detail page guided-layout uplift.
- Advanced reporting features, ApexCharts evaluation/migration, exports, saved reports, and drilldowns.

- [x] **Step 2: Final validation after docs**

Run:

```bash
npm run format:check
npm run build
npm run lint
git diff --check
```

Expected: all commands exit 0.

- [x] **Step 3: Final summary**

Report:

- Pages updated.
- Pages intentionally deferred.
- Validation results.
- Any manual browser review limitations.
