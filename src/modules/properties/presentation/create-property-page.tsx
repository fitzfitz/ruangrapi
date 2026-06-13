import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { Link, useNavigate } from 'react-router-dom'

import { AppLayout } from '../../../app/layouts'
import { routePaths } from '../../../app/router/route-paths'
import { useCurrentProfileQuery } from '../../identity'
import { useCreatePropertyMutation } from '../application/use-create-property-mutation'
import {
  createPropertySchema,
  type CreatePropertyFormValues,
  type CreatePropertyInput,
} from '../domain/create-property-schema'

export function CreatePropertyPage() {
  const navigate = useNavigate()
  const currentProfileQuery = useCurrentProfileQuery()
  const createPropertyMutation = useCreatePropertyMutation()
  const {
    formState: { errors },
    handleSubmit,
    register,
  } = useForm<CreatePropertyFormValues, unknown, CreatePropertyInput>({
    resolver: zodResolver(createPropertySchema),
    defaultValues: {
      name: '',
      address: '',
      notes: '',
    },
  })

  const isSubmitting = createPropertyMutation.isPending
  const organizationId = currentProfileQuery.data?.organization_id ?? null

  return (
    <AppLayout>
      <section
        className="create-property-page"
        aria-labelledby="create-property-title"
      >
        <div className="create-property-page__header">
          <div>
            <h2 id="create-property-title">Add property</h2>
            <p>
              Create a rental property for your organization. Units and other
              rental operations will be added in later slices.
            </p>
          </div>
          <Link to={routePaths.dashboardProperties}>Back to properties</Link>
        </div>

        <form
          className="create-property-form command-form-card"
          onSubmit={handleSubmit((input) => {
            if (organizationId === null) {
              return
            }

            createPropertyMutation.mutate(
              { organizationId, input },
              {
                onSuccess: () => {
                  navigate(routePaths.dashboardProperties)
                },
              },
            )
          })}
          noValidate
        >
          <div className="create-property-form__field">
            <label htmlFor="property-name">Name</label>
            <input
              id="property-name"
              type="text"
              autoComplete="off"
              disabled={isSubmitting}
              aria-invalid={errors.name ? 'true' : 'false'}
              {...register('name')}
            />
            {errors.name?.message ? (
              <p className="create-property-form__error" role="alert">
                {errors.name.message}
              </p>
            ) : null}
          </div>

          <div className="create-property-form__field">
            <label htmlFor="property-address">Address</label>
            <textarea
              id="property-address"
              rows={3}
              disabled={isSubmitting}
              aria-invalid={errors.address ? 'true' : 'false'}
              {...register('address')}
            />
            {errors.address?.message ? (
              <p className="create-property-form__error" role="alert">
                {errors.address.message}
              </p>
            ) : null}
          </div>

          <div className="create-property-form__field">
            <label htmlFor="property-notes">Notes</label>
            <textarea
              id="property-notes"
              rows={4}
              disabled={isSubmitting}
              aria-invalid={errors.notes ? 'true' : 'false'}
              {...register('notes')}
            />
            {errors.notes?.message ? (
              <p className="create-property-form__error" role="alert">
                {errors.notes.message}
              </p>
            ) : null}
          </div>

          {currentProfileQuery.isError ? (
            <p className="create-property-form__error" role="alert">
              We could not confirm your organization. Please try again later.
            </p>
          ) : null}

          {createPropertyMutation.isError ? (
            <p className="create-property-form__error" role="alert">
              We could not create this property. Please check the details and
              try again.
            </p>
          ) : null}

          <div className="create-property-form__actions">
            <Link to={routePaths.dashboardProperties}>Cancel</Link>
            <button
              type="submit"
              disabled={
                isSubmitting ||
                currentProfileQuery.isLoading ||
                organizationId === null
              }
            >
              {isSubmitting ? 'Creating property...' : 'Create property'}
            </button>
          </div>
        </form>
      </section>
    </AppLayout>
  )
}
