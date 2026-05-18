import { AppLayout } from '../../../app/layouts'
import { usePropertiesQuery } from '../application/use-properties-query'
import type { Property } from '../domain/property'

function formatPropertyAddress(property: Property) {
  return property.address?.trim() || 'No address added yet.'
}

function formatPropertyNotes(property: Property) {
  return property.notes?.trim() || 'No notes.'
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
              View rental properties for your organization. Property creation
              and editing will be added in a later slice.
            </p>
          </div>
          <button type="button" disabled>
            Add property coming later
          </button>
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

        {propertiesQuery.isSuccess && propertiesQuery.data.length > 0 ? (
          <div className="properties-page__list" aria-label="Property list">
            {propertiesQuery.data.map((property) => (
              <article className="property-card" key={property.id}>
                <div>
                  <h3>{property.name}</h3>
                  <p>{formatPropertyAddress(property)}</p>
                </div>
                <p className="property-card__notes">
                  {formatPropertyNotes(property)}
                </p>
              </article>
            ))}
          </div>
        ) : null}
      </section>
    </AppLayout>
  )
}
