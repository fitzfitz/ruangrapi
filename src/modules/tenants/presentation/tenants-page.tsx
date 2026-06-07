import { Link } from 'react-router-dom'

import { AppLayout } from '../../../app/layouts'
import { routePaths } from '../../../app/router/route-paths'
import { useTenantsQuery } from '../application/use-tenants-query'
import type { Tenant } from '../domain/tenant'

function formatOptionalValue(value: string | null, fallback: string) {
  return value?.trim() || fallback
}

function formatTenantContact(tenant: Tenant) {
  const phone = formatOptionalValue(tenant.phone, 'No phone added')
  const email = formatOptionalValue(tenant.email, 'No email added')

  return `${phone} · ${email}`
}

function getTenantEditPath(tenantId: string) {
  return `${routePaths.dashboardTenants}/${tenantId}/edit`
}

function buildTenantSummary(tenants: Tenant[]) {
  const withEmailCount = tenants.filter((tenant) => tenant.email?.trim()).length
  const withEmergencyContactCount = tenants.filter((tenant) =>
    tenant.emergency_contact_name?.trim(),
  ).length

  return [
    {
      label: 'Total tenants',
      value: tenants.length.toString(),
      helper: 'Renter records in workspace',
    },
    {
      label: 'With email',
      value: withEmailCount.toString(),
      helper: 'Ready for billing updates',
    },
    {
      label: 'Missing emergency',
      value: (tenants.length - withEmergencyContactCount).toString(),
      helper: 'Need backup contact details',
    },
  ]
}

export function TenantsPage() {
  const tenantsQuery = useTenantsQuery()

  return (
    <AppLayout>
      <section className="tenants-page" aria-labelledby="tenants-title">
        <div className="tenants-page__header">
          <div>
            <h2 id="tenants-title">Tenants</h2>
            <p>
              Manage renter contact records for your organization. Leases will
              connect tenants to units in a later module.
            </p>
          </div>
          <Link to={routePaths.dashboardTenantsNew}>Add tenant</Link>
        </div>

        {tenantsQuery.isLoading ? (
          <p className="tenants-page__status">Loading tenants...</p>
        ) : null}

        {tenantsQuery.isError ? (
          <p className="tenants-page__error" role="alert">
            We could not load tenants right now. Please try again later.
          </p>
        ) : null}

        {tenantsQuery.isSuccess && tenantsQuery.data.length === 0 ? (
          <div className="tenants-page__empty">
            <h3>No tenants yet</h3>
            <p>
              Add renter contact records here before creating leases in a later
              module.
            </p>
          </div>
        ) : null}

        {tenantsQuery.isSuccess && tenantsQuery.data.length > 0
          ? (() => {
              const tenantSummary = buildTenantSummary(tenantsQuery.data)

              return (
                <>
                  <div
                    className="command-list-summary"
                    aria-label="Tenant summary"
                  >
                    {tenantSummary.map((item) => (
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
                      className="tenants-page__list command-list-surface"
                      aria-label="Tenant list"
                    >
                      {tenantsQuery.data.map((tenant) => (
                        <article className="tenant-card" key={tenant.id}>
                          <div className="tenant-card__header">
                            <div>
                              <h3>{tenant.full_name}</h3>
                              <p>{formatTenantContact(tenant)}</p>
                            </div>
                            <Link to={getTenantEditPath(tenant.id)}>Edit</Link>
                          </div>

                          <dl className="tenant-card__details">
                            <div>
                              <dt>Emergency contact</dt>
                              <dd>
                                {formatOptionalValue(
                                  tenant.emergency_contact_name,
                                  'Not added',
                                )}
                              </dd>
                            </div>
                            <div>
                              <dt>Notes</dt>
                              <dd>
                                {formatOptionalValue(tenant.notes, 'No notes.')}
                              </dd>
                            </div>
                          </dl>
                        </article>
                      ))}
                    </div>

                    <aside
                      className="command-list-rail"
                      aria-label="Tenant data quality"
                    >
                      <span>Data quality</span>
                      <strong>{tenantSummary[2].value}</strong>
                      <p>tenants still need emergency contact details.</p>
                      <div className="command-list-rail__items">
                        <span className="command-list-rail__item">
                          {tenantSummary[1].value} with email
                        </span>
                        <span className="command-list-rail__item">
                          {tenantSummary[0].value} records total
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
