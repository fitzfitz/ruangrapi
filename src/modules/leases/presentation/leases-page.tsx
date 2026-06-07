import { Link } from 'react-router-dom'

import { AppLayout } from '../../../app/layouts'
import { routePaths } from '../../../app/router/route-paths'
import { useLeasesQuery } from '../application/use-leases-query'
import type { LeaseListItem } from '../domain/lease'

function formatDate(value: string | null) {
  if (value === null) {
    return 'No end date'
  }

  const [year, month, day] = value.split('-').map(Number)

  return new Intl.DateTimeFormat('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(new Date(year, month - 1, day))
}

function formatCurrency(value: number | null) {
  if (value === null) {
    return 'No deposit'
  }

  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(value)
}

function formatPropertyName(lease: LeaseListItem) {
  return lease.property_name ?? 'No property name'
}

function buildLeaseSummary(leases: LeaseListItem[]) {
  const activeCount = leases.filter((lease) => lease.status === 'active').length
  const endedCount = leases.filter((lease) => lease.status === 'ended').length

  return [
    {
      label: 'Total leases',
      value: leases.length.toString(),
      helper: 'Agreements in workspace',
    },
    {
      label: 'Active',
      value: activeCount.toString(),
      helper: 'Currently occupying units',
    },
    {
      label: 'Ended',
      value: endedCount.toString(),
      helper: 'Completed rental periods',
    },
  ]
}

export function LeasesPage() {
  const leasesQuery = useLeasesQuery()

  return (
    <AppLayout>
      <section className="leases-page" aria-labelledby="leases-title">
        <div className="leases-page__header">
          <div>
            <h2 id="leases-title">Leases</h2>
            <p>
              View rental agreements that connect tenants to units. Lifecycle,
              occupancy, and billing workflows are handled in separate slices.
            </p>
          </div>
          <Link to={routePaths.dashboardLeasesNew}>Add lease</Link>
        </div>

        {leasesQuery.isLoading ? (
          <p className="leases-page__status">Loading leases...</p>
        ) : null}

        {leasesQuery.isError ? (
          <p className="leases-page__error" role="alert">
            We could not load leases right now. Please try again later.
          </p>
        ) : null}

        {leasesQuery.isSuccess && leasesQuery.data.length === 0 ? (
          <div className="leases-page__empty">
            <h3>No leases yet</h3>
            <p>
              Lease records will appear here once tenants are connected to units
              in the create flow.
            </p>
          </div>
        ) : null}

        {leasesQuery.isSuccess && leasesQuery.data.length > 0
          ? (() => {
              const leaseSummary = buildLeaseSummary(leasesQuery.data)

              return (
                <>
                  <div
                    className="command-list-summary"
                    aria-label="Lease summary"
                  >
                    {leaseSummary.map((item) => (
                      <article
                        className="command-list-summary__item"
                        key={item.label}
                      >
                        <span>{item.label}</span>
                        <strong>{item.value}</strong>
                        <p>{item.helper}</p>
                      </article>
                    ))}
                  </div>

                  <div className="command-list-grid">
                    <div
                      className="leases-page__list command-list-surface"
                      aria-label="Lease list"
                    >
                      {leasesQuery.data.map((lease) => (
                        <article className="lease-card" key={lease.id}>
                          <div className="lease-card__header">
                            <div>
                              <h3>{lease.tenant_name}</h3>
                              <p>
                                {lease.unit_name} - {formatPropertyName(lease)}
                              </p>
                            </div>
                            <span className="lease-card__status">
                              {lease.status}
                            </span>
                          </div>

                          <dl className="lease-card__details">
                            <div>
                              <dt>Lease period</dt>
                              <dd>
                                {formatDate(lease.start_date)} -{' '}
                                {formatDate(lease.end_date)}
                              </dd>
                            </div>
                            <div>
                              <dt>Monthly rent</dt>
                              <dd>
                                {formatCurrency(lease.monthly_rent_amount)}
                              </dd>
                            </div>
                            <div>
                              <dt>Billing day</dt>
                              <dd>Day {lease.billing_day}</dd>
                            </div>
                            <div>
                              <dt>Deposit</dt>
                              <dd>{formatCurrency(lease.deposit_amount)}</dd>
                            </div>
                          </dl>
                        </article>
                      ))}
                    </div>

                    <aside
                      className="command-list-rail"
                      aria-label="Lease lifecycle"
                    >
                      <span>Lifecycle</span>
                      <strong>{leaseSummary[1].value}</strong>
                      <p>leases are currently active across occupied units.</p>
                      <div className="command-list-rail__items">
                        <span className="command-list-rail__item">
                          {leaseSummary[2].value} ended
                        </span>
                        <span className="command-list-rail__item">
                          {leaseSummary[0].value} total agreements
                        </span>
                      </div>
                    </aside>
                  </div>
                </>
              )
            })()
          : null}
      </section>
    </AppLayout>
  )
}
