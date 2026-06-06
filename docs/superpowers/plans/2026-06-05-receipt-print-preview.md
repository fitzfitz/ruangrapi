# Receipt Print Preview Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a dedicated receipt print-preview route and reusable branded receipt document while keeping the receipt detail page as the operational review view.

**Architecture:** Keep this as a frontend-only receipts presentation slice. Reuse the existing `ReceiptDetail` query data, extract the current internal receipt document into a route-independent component, add a protected `/dashboard/receipts/:receiptId/print` route, and update CSS for Joyful Premium Ops preview and print media behavior without changing Supabase schema/RLS or adding dependencies.

**Tech Stack:** React, TypeScript, React Router, TanStack Query, Vite, CSS in `src/App.css`, existing Supabase receipt repository/query hooks.

---

## File Structure

- Modify `src/app/router/route-paths.ts`: add the new route path constant `dashboardReceiptPrint`.
- Modify `src/app/router/app-router.tsx`: lazy-load `ReceiptPrintPage` and register the protected route before the existing detail route.
- Modify `src/modules/receipts/presentation/receipt-detail-page.tsx`: remove the internal `ReceiptDocument`, remove direct `window.print()`, keep operational loading/error/not-found states, and add an `Open print preview` link.
- Create `src/modules/receipts/presentation/receipt-document.tsx`: reusable, fetch-free, branded receipt document component plus local formatting helpers.
- Create `src/modules/receipts/presentation/receipt-print-page.tsx`: focused print-preview route with minimal command bar, same receipt query handling, `window.print()` action, and back-to-detail link.
- Modify `src/App.css`: add print-preview page styles, refresh receipt document styles, include new error/status selectors, and update print-media rules to hide command chrome/preview background and print only the document.
- Optional closeout docs after implementation only if module status/source-of-truth changes: `docs/06-development-checklist.md`, `wiki/09-status/built.md`, `wiki/09-status/not-built.md`, `wiki/06-task-breakdown/task-index.md`.

## Chunk 1: Routing and reusable document extraction

### Task 1: Add receipt print route constant

**Files:**

- Modify: `src/app/router/route-paths.ts`

- [ ] **Step 1: Add the route constant**

  Insert the print route immediately after `dashboardReceiptDetail`:

  ```ts
  dashboardReceiptDetail: '/dashboard/receipts/:receiptId',
  dashboardReceiptPrint: '/dashboard/receipts/:receiptId/print',
  dashboardReminders: '/dashboard/reminders',
  ```

- [ ] **Step 2: Run a focused build check**

  Run:

  ```bash
  npm run build
  ```

  Expected: TypeScript knows the new route key and the existing build still passes or only reports unrelated pre-existing issues.

### Task 2: Prepare detail-page route helper only when it is used

**Files:**

- Modify: `src/modules/receipts/presentation/receipt-detail-page.tsx`

- [ ] **Step 1: Add the print path helper in the same edit that adds the print-preview link**

  Do not add unused helpers. When Task 4 adds the `Open print preview` link, add only this helper to `receipt-detail-page.tsx`:

  ```ts
  function getReceiptPrintPath(receiptId: string) {
    return routePaths.dashboardReceiptPrint.replace(':receiptId', receiptId)
  }
  ```

- [ ] **Step 2: Defer detail-path helper to the print page**

  Do not touch `receipt-print-page.tsx` in Chunk 1. Add `getReceiptDetailPath()` later in Task 5 when the print page is created and the helper is immediately used by `Back to detail`.

- [ ] **Step 3: Verify helper usage, not runtime navigation yet**

  Run:

  ```bash
  npm run build
  ```

  Expected: build passes with no unused local helper errors. Runtime path replacement is covered by the manual navigation checklist in Task 9.

### Task 3: Extract reusable receipt document component

**Files:**

- Create: `src/modules/receipts/presentation/receipt-document.tsx`
- Modify: `src/modules/receipts/presentation/receipt-detail-page.tsx`

- [ ] **Step 1: Create `receipt-document.tsx`**

  Create the new component with local formatting helpers and no route/query dependencies:

  ```tsx
  import type { ReceiptDetail } from '../domain/receipt'

  function formatDate(value: string) {
    return new Intl.DateTimeFormat('id-ID', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    }).format(new Date(value))
  }

  function formatBillingPeriod(value: string) {
    const [year, month] = value.split('-').map(Number)

    return new Intl.DateTimeFormat('id-ID', {
      month: 'long',
      year: 'numeric',
    }).format(new Date(year, month - 1, 1))
  }

  function formatCurrency(value: number) {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0,
    }).format(value)
  }

  function formatPaymentMethod(method: string) {
    return method.replaceAll('_', ' ')
  }

  function formatOptionalText(value: string | null) {
    return value?.trim() || 'Not added'
  }

  function formatPropertyName(value: string | null) {
    return value?.trim() || 'No property name'
  }

  export function ReceiptDocument({ receipt }: { receipt: ReceiptDetail }) {
    return (
      <article
        className="receipt-document"
        aria-label={`Receipt ${receipt.receipt_number}`}
      >
        <header className="receipt-document__hero">
          <div className="receipt-document__brand-block">
            <p className="receipt-document__brand">RuangRapi</p>
            <h2>Payment Receipt</h2>
            <p>
              Official proof of payment generated from RuangRapi operational
              records.
            </p>
          </div>
          <div className="receipt-document__receipt-meta">
            <span className="receipt-document__status">Paid</span>
            <div>
              <span>Receipt no.</span>
              <strong>{receipt.receipt_number}</strong>
            </div>
          </div>
        </header>

        <section
          className="receipt-document__total-band"
          aria-label="Total received"
        >
          <span>Total received</span>
          <strong>{formatCurrency(receipt.payment_amount)}</strong>
          <p>Issued on {formatDate(receipt.issued_at)}</p>
        </section>

        <section
          className="receipt-document__summary"
          aria-label="Receipt summary"
        >
          <div>
            <span>Received from</span>
            <strong>{receipt.tenant_name}</strong>
            <p>
              {receipt.unit_name} · {formatPropertyName(receipt.property_name)}
            </p>
          </div>
          <div>
            <span>Payment date</span>
            <strong>{formatDate(receipt.payment_date)}</strong>
            <p>{formatPaymentMethod(receipt.payment_method)}</p>
          </div>
          <div>
            <span>Reference</span>
            <strong>
              {formatOptionalText(receipt.payment_reference_number)}
            </strong>
            <p>Payment reference number</p>
          </div>
        </section>

        <section
          className="receipt-document__breakdown"
          aria-labelledby="receipt-breakdown-title"
        >
          <div>
            <p className="receipt-document__section-label">Payment breakdown</p>
            <h3 id="receipt-breakdown-title">Rental billing payment</h3>
          </div>
          <dl>
            <div>
              <dt>Billing period</dt>
              <dd>{formatBillingPeriod(receipt.invoice_billing_period)}</dd>
            </div>
            <div>
              <dt>Invoice status</dt>
              <dd>{receipt.invoice_status}</dd>
            </div>
            <div>
              <dt>Invoice total</dt>
              <dd>{formatCurrency(receipt.invoice_total_amount)}</dd>
            </div>
            <div className="receipt-document__breakdown-total">
              <dt>Amount received</dt>
              <dd>{formatCurrency(receipt.payment_amount)}</dd>
            </div>
          </dl>
        </section>

        <section
          className="receipt-document__metadata"
          aria-label="Receipt metadata"
        >
          <div>
            <span>Property</span>
            <strong>{formatPropertyName(receipt.property_name)}</strong>
          </div>
          <div>
            <span>Unit</span>
            <strong>{receipt.unit_name}</strong>
          </div>
          <div>
            <span>Payment method</span>
            <strong>{formatPaymentMethod(receipt.payment_method)}</strong>
          </div>
        </section>

        <section className="receipt-document__notes" aria-label="Payment notes">
          <span>Notes</span>
          <p>{formatOptionalText(receipt.payment_notes)}</p>
        </section>

        <footer className="receipt-document__footer">
          <p>
            This receipt confirms that the amount above was recorded as received
            for the payment shown.
          </p>
          <div
            className="receipt-document__signature"
            aria-label="Owner or admin signature placeholder"
          >
            <span />
            <strong>Owner/Admin</strong>
          </div>
        </footer>
      </article>
    )
  }
  ```

- [ ] **Step 2: Remove the internal `ReceiptDocument` without leaving unused locals**

  Import the extracted component temporarily so the detail page still renders while extraction is verified:

  ```ts
  import { ReceiptDocument } from './receipt-document'
  ```

  Delete the internal component, the now-unused type import, and any now-unused formatting helpers from `receipt-detail-page.tsx` after the component is extracted:

  ```ts
  import type { ReceiptDetail } from '../domain/receipt'
  formatDate
  formatBillingPeriod
  formatCurrency
  formatPaymentMethod
  formatOptionalText
  ReceiptDocument
  ```

  Keep the formatting helpers local to `receipt-document.tsx` for Chunk 1. Re-add the detail-page formatting helpers in Task 4 when the operational review card immediately uses them, so `noUnusedLocals` stays satisfied at each verification point.

- [ ] **Step 3: Run extraction verification**

  Run:

  ```bash
  npm run build
  ```

  Expected: build passes with no missing import/export errors and no implicit `any` usage.

## Chunk 2: Operational detail page and print-preview page

### Task 4: Convert receipt detail page to operational review

**Files:**

- Modify: `src/modules/receipts/presentation/receipt-detail-page.tsx`

- [ ] **Step 1: Remove direct printing from detail page**

  Delete this handler:

  ```ts
  function handlePrint() {
    window.print()
  }
  ```

- [ ] **Step 2: Add print-preview link action**

  In the receipt detail header actions, keep `Back to receipts` and replace the old `Print` button with a primary link when a receipt is loaded:

  ```tsx
  <div className="receipt-detail-page__actions">
    <Link to={routePaths.dashboardReceipts}>Back to receipts</Link>
    {receiptQuery.isSuccess && receiptQuery.data !== null ? (
      <Link to={getReceiptPrintPath(receiptQuery.data.id)}>
        Open print preview
      </Link>
    ) : null}
  </div>
  ```

- [ ] **Step 3: Replace the printable document on the detail page with an operational review card**

  Re-add the local formatting helpers needed by the operational card, including `formatDate`, `formatBillingPeriod`, `formatCurrency`, `formatPaymentMethod`, `formatOptionalText`, and:

  ```ts
  function formatPropertyName(value: string | null) {
    return value?.trim() || 'No property name'
  }
  ```

  Then keep the same query states, but for successful receipt data render an app-context review section instead of the branded printable document:

  ```tsx
  {
    receiptQuery.isSuccess && receiptQuery.data !== null ? (
      <article className="receipt-detail-card">
        <div className="receipt-detail-card__hero">
          <div>
            <p className="receipt-detail-card__label">Receipt number</p>
            <h3>{receiptQuery.data.receipt_number}</h3>
            <p>Generated proof of payment ready for print preview.</p>
          </div>
          <strong>{formatCurrency(receiptQuery.data.payment_amount)}</strong>
        </div>
        <dl className="receipt-detail-card__details">
          <div>
            <dt>Tenant</dt>
            <dd>{receiptQuery.data.tenant_name}</dd>
          </div>
          <div>
            <dt>Unit</dt>
            <dd>{receiptQuery.data.unit_name}</dd>
          </div>
          <div>
            <dt>Property</dt>
            <dd>{formatPropertyName(receiptQuery.data.property_name)}</dd>
          </div>
          <div>
            <dt>Issued</dt>
            <dd>{formatDate(receiptQuery.data.issued_at)}</dd>
          </div>
          <div>
            <dt>Payment date</dt>
            <dd>{formatDate(receiptQuery.data.payment_date)}</dd>
          </div>
          <div>
            <dt>Payment method</dt>
            <dd>{formatPaymentMethod(receiptQuery.data.payment_method)}</dd>
          </div>
          <div>
            <dt>Payment reference</dt>
            <dd>
              {formatOptionalText(receiptQuery.data.payment_reference_number)}
            </dd>
          </div>
          <div>
            <dt>Billing period</dt>
            <dd>
              {formatBillingPeriod(receiptQuery.data.invoice_billing_period)}
            </dd>
          </div>
          <div>
            <dt>Invoice status</dt>
            <dd>{receiptQuery.data.invoice_status}</dd>
          </div>
          <div>
            <dt>Invoice total</dt>
            <dd>{formatCurrency(receiptQuery.data.invoice_total_amount)}</dd>
          </div>
          <div className="receipt-detail-card__notes">
            <dt>Payment notes</dt>
            <dd>{formatOptionalText(receiptQuery.data.payment_notes)}</dd>
          </div>
        </dl>
      </article>
    ) : null
  }
  ```

  This makes `/dashboard/receipts/:receiptId` an operational review page and keeps the branded document reserved for `/dashboard/receipts/:receiptId/print`.

- [ ] **Step 4: Keep existing query states intact**

  Preserve these current detail page states:
  - missing `receiptId` shows `Receipt not found` copy;
  - `receiptQuery.isLoading` shows `Loading receipt...`;
  - `receiptQuery.isError` shows an alert paragraph;
  - successful `null` data shows not-found/inaccessible copy;
  - successful receipt renders the operational `.receipt-detail-card`, not `<ReceiptDocument />`.

- [ ] **Step 5: Run focused detail-page verification**

  Run:

  ```bash
  npm run build
  grep -n "window\.print\|ReceiptDocument" src/modules/receipts/presentation/receipt-detail-page.tsx || true
  ```

  Expected: build passes and the grep command prints no matches from `receipt-detail-page.tsx`.

### Task 5: Create focused receipt print-preview page

**Files:**

- Create: `src/modules/receipts/presentation/receipt-print-page.tsx`

- [ ] **Step 1: Create the print route page**

  Use the same query hook and state handling, but do not wrap the page in `AppLayout`:

  ```tsx
  import { Link, useParams } from 'react-router-dom'

  import { routePaths } from '../../../app/router/route-paths'
  import { useReceiptQuery } from '../application/use-receipt-query'
  import { ReceiptDocument } from './receipt-document'

  function getReceiptDetailPath(receiptId: string) {
    return routePaths.dashboardReceiptDetail.replace(':receiptId', receiptId)
  }

  function handlePrint() {
    window.print()
  }

  export function ReceiptPrintPage() {
    const { receiptId } = useParams<{ receiptId: string }>()
    const receiptQuery = useReceiptQuery(receiptId)

    return (
      <main
        className="receipt-print-page"
        aria-labelledby="receipt-print-title"
      >
        <header className="receipt-print-page__command-bar">
          <div>
            <p className="receipt-print-page__breadcrumb">
              Receipts / Print preview
            </p>
            <h1 id="receipt-print-title">Receipt print preview</h1>
            <p>Review the document layout before printing this receipt.</p>
          </div>
          <div className="receipt-print-page__actions">
            {receiptId ? (
              <Link to={getReceiptDetailPath(receiptId)}>Back to detail</Link>
            ) : (
              <Link to={routePaths.dashboardReceipts}>Back to receipts</Link>
            )}
            {receiptQuery.isSuccess && receiptQuery.data !== null ? (
              <button type="button" onClick={handlePrint}>
                Print receipt
              </button>
            ) : null}
          </div>
        </header>

        <section
          className="receipt-print-page__surface"
          aria-label="Receipt print preview surface"
        >
          {!receiptId ? (
            <div className="receipt-print-page__empty">
              <h2>Receipt not found</h2>
              <p>
                This receipt is missing or is not accessible to your account.
              </p>
            </div>
          ) : null}

          {receiptQuery.isLoading ? (
            <p className="receipt-print-page__status">Loading receipt...</p>
          ) : null}

          {receiptQuery.isError ? (
            <p className="receipt-print-page__error" role="alert">
              We could not load this receipt right now. Please try again later.
            </p>
          ) : null}

          {receiptQuery.isSuccess && receiptQuery.data === null ? (
            <div className="receipt-print-page__empty">
              <h2>Receipt not found</h2>
              <p>This receipt may not exist or may not be accessible to you.</p>
            </div>
          ) : null}

          {receiptQuery.isSuccess && receiptQuery.data !== null ? (
            <ReceiptDocument receipt={receiptQuery.data} />
          ) : null}
        </section>
      </main>
    )
  }
  ```

- [ ] **Step 2: Run page verification**

  Run:

  ```bash
  npm run build
  ```

  Then run:

  ```bash
  grep -n "AppLayout" src/modules/receipts/presentation/receipt-print-page.tsx || true
  ```

  Expected: build passes and the grep command prints no `AppLayout` matches, confirming the print route stays focused and avoids full dashboard chrome.

### Task 6: Register protected print route

**Files:**

- Modify: `src/app/router/app-router.tsx`

- [ ] **Step 1: Add lazy import**

  Add the lazy import near the existing receipt page imports:

  ```tsx
  const ReceiptPrintPage = lazy(() =>
    import('../../modules/receipts/presentation/receipt-print-page').then(
      (module) => ({
        default: module.ReceiptPrintPage,
      }),
    ),
  )
  ```

- [ ] **Step 2: Register route before detail route**

  Add the print route before `dashboardReceiptDetail` so the specific `/print` path is clearly declared before the param-only detail path:

  ```tsx
  <Route
    path={routePaths.dashboardReceiptPrint}
    element={
      <RouteAccessGate route="dashboard">
        <ReceiptPrintPage />
      </RouteAccessGate>
    }
  />
  <Route
    path={routePaths.dashboardReceiptDetail}
    element={
      <RouteAccessGate route="dashboard">
        <ReceiptDetailPage />
      </RouteAccessGate>
    }
  />
  ```

- [ ] **Step 3: Run routing verification**

  Run:

  ```bash
  npm run build
  ```

  Expected: build passes; the new route is lazy-loaded and protected with the same dashboard access gate as receipts detail.

## Chunk 3: CSS, responsive behavior, print behavior, and validation

### Task 7: Add print-preview page CSS and refresh receipt document CSS

**Files:**

- Modify: `src/App.css`

- [ ] **Step 1: Add `receipt-print-page` to relevant status/error/empty selector groups**

  Add these selectors near the existing receipt selectors so print-preview states match app conventions:

  ```css
  .receipt-print-page__status,
  .receipt-print-page__command-bar p {
    color: var(--text);
  }

  .receipt-print-page__error {
    border: 1px solid #fecdca;
    border-radius: 12px;
    padding: 16px;
    color: #b42318;
    background: #fffbfa;
  }

  .receipt-print-page__empty {
    border: 1px solid var(--border);
    border-radius: 16px;
    padding: 24px;
    background: var(--surface);
  }
  ```

- [ ] **Step 2: Add focused print-preview layout styles**

  Add a dedicated block before the existing `.receipt-document` rules:

  ```css
  .receipt-print-page {
    min-height: 100svh;
    padding: 24px;
    color: var(--text);
    background:
      radial-gradient(
        circle at 80% 0%,
        rgb(45 212 191 / 0.22),
        transparent 32%
      ),
      radial-gradient(
        circle at 12% 8%,
        rgb(99 102 241 / 0.16),
        transparent 30%
      ),
      linear-gradient(180deg, #fffaf2 0%, #eef2ff 100%);
  }

  .receipt-print-page__command-bar {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 24px;
    max-width: 1040px;
    margin: 0 auto 24px;
    border: 1px solid rgb(255 255 255 / 0.72);
    border-radius: 20px;
    padding: 18px 20px;
    background: rgb(255 255 255 / 0.82);
    box-shadow: var(--shadow-card);
    backdrop-filter: blur(18px);
  }

  .receipt-print-page__breadcrumb {
    margin: 0 0 6px;
    color: var(--teal);
    font-size: 12px;
    font-weight: 900;
    text-transform: uppercase;
  }

  .receipt-print-page__command-bar h1 {
    margin: 0 0 6px;
    color: var(--text-h);
    font-size: clamp(24px, 4vw, 34px);
  }

  .receipt-print-page__actions {
    display: flex;
    flex-wrap: wrap;
    justify-content: flex-end;
    gap: 10px;
  }

  .receipt-print-page__actions a,
  .receipt-print-page__actions button {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    border: 1px solid var(--border);
    border-radius: 12px;
    min-height: 44px;
    padding: 10px 14px;
    color: var(--text-h);
    background: var(--surface);
    font-weight: 800;
    text-decoration: none;
    cursor: pointer;
  }

  .receipt-print-page__actions button {
    border-color: transparent;
    color: #ffffff;
    background: var(--gradient-brand);
    box-shadow: var(--shadow-glow);
  }

  .receipt-print-page__surface {
    display: grid;
    place-items: start center;
    max-width: 1040px;
    margin: 0 auto;
    border-radius: 24px;
    padding: clamp(16px, 4vw, 36px);
    background: rgb(255 255 255 / 0.54);
  }
  ```

- [ ] **Step 3: Replace old receipt document styling with the branded document structure**

  Update the `.receipt-document` block and descendants to match the new class names used by `receipt-document.tsx`:

  ```css
  .receipt-document {
    display: grid;
    gap: 24px;
    width: min(100%, 880px);
    border: 1px solid #eadfd0;
    border-radius: 28px;
    padding: clamp(24px, 4vw, 40px);
    color: var(--text);
    background:
      linear-gradient(135deg, rgb(255 255 255 / 0.98), rgb(255 250 242 / 0.98)),
      radial-gradient(circle at 92% 4%, rgb(45 212 191 / 0.2), transparent 34%);
    box-shadow: 0 28px 70px rgb(15 23 42 / 0.16);
    overflow-wrap: anywhere;
  }

  .receipt-document__hero,
  .receipt-document__summary,
  .receipt-document__metadata,
  .receipt-document__footer {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 16px;
  }

  .receipt-document__hero {
    align-items: start;
    border-radius: 22px;
    padding: 24px;
    color: #ffffff;
    background: var(--gradient-brand);
  }

  .receipt-document__brand,
  .receipt-document__section-label,
  .receipt-document__summary span,
  .receipt-document__metadata span,
  .receipt-document__notes span,
  .receipt-document__receipt-meta span {
    margin: 0;
    font-size: 12px;
    font-weight: 900;
    letter-spacing: 0.04em;
    text-transform: uppercase;
  }

  .receipt-document__brand-block h2 {
    margin: 6px 0;
    font-size: clamp(30px, 5vw, 44px);
    line-height: 1;
  }

  .receipt-document__brand-block p,
  .receipt-document__total-band p,
  .receipt-document__summary p,
  .receipt-document__footer p {
    margin: 0;
  }

  .receipt-document__receipt-meta {
    display: grid;
    justify-items: end;
    gap: 14px;
    text-align: right;
  }

  .receipt-document__status {
    display: inline-flex;
    border: 1px solid rgb(255 255 255 / 0.5);
    border-radius: 999px;
    padding: 6px 12px;
    color: #042f2e;
    background: #ccfbf1;
  }

  .receipt-document__receipt-meta strong {
    display: block;
    margin-top: 4px;
    color: #ffffff;
    font-size: 20px;
  }

  .receipt-document__total-band {
    border-radius: 20px;
    padding: 20px 24px;
    color: #042f2e;
    background: linear-gradient(135deg, #ccfbf1, #eef2ff);
  }

  .receipt-document__total-band strong {
    display: block;
    margin: 4px 0;
    color: var(--text-h);
    font-size: clamp(30px, 5vw, 42px);
    font-variant-numeric: tabular-nums;
  }

  .receipt-document__summary > div,
  .receipt-document__metadata > div,
  .receipt-document__breakdown,
  .receipt-document__notes {
    border: 1px solid var(--border);
    border-radius: 18px;
    padding: 18px;
    background: #ffffff;
  }

  .receipt-document__summary strong,
  .receipt-document__metadata strong {
    display: block;
    margin-top: 6px;
    color: var(--text-h);
    font-size: 17px;
  }

  .receipt-document__breakdown {
    display: grid;
    gap: 18px;
  }

  .receipt-document__breakdown h3 {
    margin: 4px 0 0;
    color: var(--text-h);
    font-size: 22px;
  }

  .receipt-document__breakdown dl {
    display: grid;
    gap: 0;
    margin: 0;
  }

  .receipt-document__breakdown dl > div {
    display: flex;
    justify-content: space-between;
    gap: 16px;
    border-top: 1px solid var(--border);
    padding: 12px 0;
  }

  .receipt-document__breakdown dt {
    color: var(--text);
    font-weight: 700;
  }

  .receipt-document__breakdown dd {
    margin: 0;
    color: var(--text-h);
    font-weight: 900;
    text-align: right;
    font-variant-numeric: tabular-nums;
  }

  .receipt-document__breakdown-total {
    border-top: 2px solid var(--text-h) !important;
  }

  .receipt-document__notes p {
    margin: 8px 0 0;
    color: var(--text-h);
  }

  .receipt-document__footer {
    align-items: end;
    border-top: 1px solid var(--border);
    padding-top: 20px;
  }

  .receipt-document__signature {
    display: grid;
    justify-items: end;
    gap: 8px;
    color: var(--text-h);
  }

  .receipt-document__signature span {
    display: block;
    width: min(220px, 100%);
    border-top: 1px solid var(--text-h);
  }
  ```

- [ ] **Step 4: Preserve responsive behavior**

  Update the existing small-screen media query so these classes stack:

  ```css
  .receipt-print-page__command-bar {
    display: grid;
    grid-template-columns: 1fr;
  }

  .receipt-document__hero,
  .receipt-document__summary,
  .receipt-document__metadata,
  .receipt-document__footer {
    grid-template-columns: 1fr;
  }

  .receipt-document__receipt-meta,
  .receipt-document__signature {
    justify-items: start;
    text-align: left;
  }
  ```

  If this is placed inside an existing `@media (max-width: ...)` block, keep only the declarations and avoid opening a nested media rule.

- [ ] **Step 5: Reconcile later receipt cascade rules**

  `src/App.css` currently has later Joyful Premium Ops cascade selectors that still target `.receipt-document`, `.receipt-document__brand`, and `.receipt-document__status`. Update or remove those later rules so they do not override the new branded document styles unexpectedly.

- [ ] **Step 6: Remove stale receipt document selectors**

  Search for removed receipt document class names and delete stale rules unless a selector is intentionally kept for a compatibility reason documented in a nearby comment:

  ```bash
  grep -n "receipt-document__header\|receipt-document__meta\|receipt-document__parties\|receipt-document__grid\|receipt-document__eyebrow" src/App.css || true
  ```

  Expected after cleanup: no matches for removed selectors.

- [ ] **Step 7: Run CSS/build verification**

  Run:

  ```bash
  npm run build
  ```

  Expected: Vite build passes and CSS parsing reports no invalid selector/media syntax.

### Task 8: Update print media rules for dedicated print route

**Files:**

- Modify: `src/App.css`

- [ ] **Step 1: Hide command and preview chrome in print media**

  Update the existing `@media print` block to hide both old app chrome and new print command chrome:

  ```css
  .app-header,
  .app-sidebar,
  .receipt-detail-page__header,
  .receipt-print-page__command-bar {
    display: none !important;
  }
  ```

- [ ] **Step 2: Reset print route backgrounds and spacing**

  Add the print page classes to the layout reset inside `@media print`:

  ```css
  .app-layout,
  .app-layout__body,
  .app-main,
  .receipt-print-page,
  .receipt-print-page__surface {
    display: block;
    min-height: 0;
    padding: 0;
    background: #ffffff;
  }
  ```

- [ ] **Step 3: Update print document rules for new class names**

  Replace old print descendants such as `.receipt-document__header`, `.receipt-document__meta`, `.receipt-document__parties`, and `.receipt-document__grid` with the new structure:

  ```css
  .receipt-document {
    display: grid;
    gap: 10px;
    width: auto;
    border: 1px solid #111827;
    border-radius: 0;
    padding: 12px 14px;
    color: #111827;
    background: #ffffff;
    font-size: 11px;
  }

  .receipt-document__hero,
  .receipt-document__total-band,
  .receipt-document__summary > div,
  .receipt-document__metadata > div,
  .receipt-document__breakdown,
  .receipt-document__notes {
    border: 1px solid #111827;
    border-radius: 0;
    color: #111827;
    background: #ffffff;
    break-inside: avoid;
  }

  .receipt-document__hero {
    grid-template-columns: 1.4fr 1fr;
    padding: 12px;
  }

  .receipt-document__brand-block h2 {
    color: #111827;
    font-size: 24px;
  }

  .receipt-document__receipt-meta strong,
  .receipt-document__summary strong,
  .receipt-document__metadata strong,
  .receipt-document__breakdown dd,
  .receipt-document__notes p {
    color: #111827;
  }

  .receipt-document__total-band strong {
    color: #111827;
    font-size: 24px;
  }

  .receipt-document__summary,
  .receipt-document__metadata,
  .receipt-document__footer {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }

  .receipt-document__footer {
    grid-template-columns: 1.4fr 1fr;
  }
  ```

  Keep any existing helpful compact print typography rules only if their selectors still match the new class names.

- [ ] **Step 4: Run print CSS verification**

  Run:

  ```bash
  npm run build
  ```

  Expected: build passes; CSS media block has no parse errors.

### Task 9: Full validation and implementation closeout

**Files:**

- Review: all changed files
- Optional docs only if closeout status changes: `docs/06-development-checklist.md`, `wiki/09-status/built.md`, `wiki/09-status/not-built.md`, `wiki/06-task-breakdown/task-index.md`

- [ ] **Step 1: Run formatter check**

  Run:

  ```bash
  npm run format:check
  ```

  Expected: no formatting differences. If it fails, run `npm run format`, inspect the diff, and rerun `npm run format:check`.

- [ ] **Step 2: Run production build**

  Run:

  ```bash
  npm run build
  ```

  Expected: TypeScript project build and Vite production build pass.

- [ ] **Step 3: Run lint**

  Run:

  ```bash
  npm run lint
  ```

  Expected: ESLint passes with no errors.

- [ ] **Step 4: Run diff whitespace check**

  Run:

  ```bash
  git diff --check
  ```

  Expected: no whitespace errors.

- [ ] **Step 5: Inspect changed file scope**

  Run:

  ```bash
  git status --short
  git diff -- src/app/router/route-paths.ts src/app/router/app-router.tsx src/modules/receipts/presentation/receipt-detail-page.tsx src/modules/receipts/presentation/receipt-document.tsx src/modules/receipts/presentation/receipt-print-page.tsx src/App.css
  ```

  Expected: changes stay inside the planned route/presentation/CSS scope plus previously approved spec/plan docs.

- [ ] **Step 6: Manual browser validation**

  With a valid generated receipt for the current local test user/organization, manually verify:
  - `/dashboard/receipts` loads and receipt cards still open details.
  - `/dashboard/receipts/:receiptId` loads the operational detail page.
  - Detail page `Open print preview` navigates to `/dashboard/receipts/:receiptId/print`.
  - Print-preview page loads the same receipt data.
  - Print-preview `Back to detail` returns to `/dashboard/receipts/:receiptId`.
  - Print-preview `Print receipt` opens the browser print dialog.
  - Print media hides command chrome and prints only the receipt document.
  - At a narrow/mobile viewport, print-preview command actions stack without horizontal scrolling.
  - Missing/inaccessible receipt IDs show `Receipt not found` states.
  - Optional reference, notes, and property fields show clear fallback copy.
  - Browser console has no errors during list → detail → print navigation.

- [ ] **Step 7: Documentation closeout decision**

  If implementation changes the built/not-built status or future task bucket, update only the relevant closeout docs. Do not broaden scope into PDF generation, delivery workflows, receipt edit/delete, database schema/RLS, or unrelated receipt lifecycle changes.

- [ ] **Step 8: Commit only after owner approval**

  If the owner explicitly asks to commit, use a focused commit such as:

  ```bash
  git add docs/superpowers/specs/2026-06-05-receipt-print-preview-design.md docs/superpowers/plans/2026-06-05-receipt-print-preview.md src/app/router/route-paths.ts src/app/router/app-router.tsx src/modules/receipts/presentation/receipt-detail-page.tsx src/modules/receipts/presentation/receipt-document.tsx src/modules/receipts/presentation/receipt-print-page.tsx src/App.css
  git commit -m "feat(receipts): add print preview route"
  ```

  Expected: commit is created only with owner approval and after validation evidence is available.
