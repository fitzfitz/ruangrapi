import { Link } from 'react-router-dom'

import { AppLayout } from '../../../app/layouts'
import { routePaths } from '../../../app/router/route-paths'
import { usePropertiesQuery } from '../application/use-properties-query'
import type { Property } from '../domain/property'

function formatPropertyAddress(property: Property) {
  return property.address?.trim() || 'No address added yet.'
}

function formatPropertyNotes(property: Property) {
  return property.notes?.trim() || 'No notes.'
}

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

export function PropertiesPage() {
  const propertiesQuery = usePropertiesQuery()

  return (
    <AppLayout>
      <section className="properties-page" aria-labelledby="properties-title">
        <div className="properties-page__header">
          <div>
            <h2 id="properties-title">Properties</h2>
            <p>
              View rental properties for your organization. Add new properties
              here before future slices connect units and rental operations.
            </p>
          </div>
          <Link to={routePaths.dashboardPropertiesNew}>Add property</Link>
        </div>

        {propertiesQuery.isLoading ? (
          <p className="properties-page__status">Loading properties...</p>
        ) : null}

        {propertiesQuery.isError ? (
          <p className="properties-page__error" role="alert">
            We could not load properties right now. Please try again later.
          </p>
        ) : null}

        {propertiesQuery.isSuccess && propertiesQuery.data.length === 0 ? (
          <div className="properties-page__empty">
            <h3>No properties yet</h3>
            <p>
              Once properties are added, they will appear here as the starting
              point for units and rental operations.
            </p>
          </div>
        ) : null}

        {propertiesQuery.isSuccess && propertiesQuery.data.length > 0
          ? (() => {
              const propertySummary = buildPropertySummary(propertiesQuery.data)

              return (
                <>
                  <div
                    className="command-list-summary"
                    aria-label="Property summary"
                  >
                    {propertySummary.map((item) => (
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

                  <div className="command-list-grid command-list-grid--single">
                    <div
                      className="properties-page__list command-list-surface"
                      aria-label="Property list"
                    >
                      {propertiesQuery.data.map((property) => (
                        <article className="property-card" key={property.id}>
                          <div>
                            <h3>
                              <Link
                                to={`${routePaths.dashboardProperties}/${property.id}`}
                              >
                                {property.name}
                              </Link>
                            </h3>
                            <p>{formatPropertyAddress(property)}</p>
                          </div>
                          <p className="property-card__notes">
                            {formatPropertyNotes(property)}
                          </p>
                        </article>
                      ))}
                    </div>
                  </div>
                </>
              )
            })()
          : null}
      </section>
    </AppLayout>
  )
}
