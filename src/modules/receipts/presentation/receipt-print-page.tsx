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
    <main className="receipt-print-page" aria-labelledby="receipt-print-title">
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
            <p>This receipt is missing or is not accessible to your account.</p>
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
