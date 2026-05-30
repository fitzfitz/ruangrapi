import { lazy, Suspense } from 'react'
import { BrowserRouter, Route, Routes } from 'react-router-dom'

import { AppGate } from '../../modules/identity/app-gate'
import { RouteAccessGate } from '../../modules/identity/route-access-gate'
import { routePaths } from './route-paths'

const AuthPage = lazy(() =>
  import('../../modules/identity/auth-page').then((module) => ({
    default: module.AuthPage,
  })),
)
const SignUpPage = lazy(() =>
  import('../../modules/identity/sign-up-page').then((module) => ({
    default: module.SignUpPage,
  })),
)
const OnboardingPage = lazy(() =>
  import('../../modules/identity/onboarding-page').then((module) => ({
    default: module.OnboardingPage,
  })),
)
const DashboardPage = lazy(() =>
  import('../../modules/dashboard/dashboard-page').then((module) => ({
    default: module.DashboardPage,
  })),
)
const PropertiesPage = lazy(() =>
  import('../../modules/properties/presentation/properties-page').then(
    (module) => ({
      default: module.PropertiesPage,
    }),
  ),
)
const CreatePropertyPage = lazy(() =>
  import('../../modules/properties/presentation/create-property-page').then(
    (module) => ({
      default: module.CreatePropertyPage,
    }),
  ),
)
const EditPropertyPage = lazy(() =>
  import('../../modules/properties/presentation/edit-property-page').then(
    (module) => ({
      default: module.EditPropertyPage,
    }),
  ),
)
const PropertyDetailPage = lazy(() =>
  import('../../modules/properties/presentation/property-detail-page').then(
    (module) => ({
      default: module.PropertyDetailPage,
    }),
  ),
)
const TenantsPage = lazy(() =>
  import('../../modules/tenants/presentation/tenants-page').then((module) => ({
    default: module.TenantsPage,
  })),
)
const CreateTenantPage = lazy(() =>
  import('../../modules/tenants/presentation/create-tenant-page').then(
    (module) => ({
      default: module.CreateTenantPage,
    }),
  ),
)
const EditTenantPage = lazy(() =>
  import('../../modules/tenants/presentation/edit-tenant-page').then(
    (module) => ({
      default: module.EditTenantPage,
    }),
  ),
)
const LeasesPage = lazy(() =>
  import('../../modules/leases/presentation/leases-page').then((module) => ({
    default: module.LeasesPage,
  })),
)
const CreateLeasePage = lazy(() =>
  import('../../modules/leases/presentation/create-lease-page').then(
    (module) => ({
      default: module.CreateLeasePage,
    }),
  ),
)
const InvoicesPage = lazy(() =>
  import('../../modules/invoices/presentation/invoices-page').then(
    (module) => ({
      default: module.InvoicesPage,
    }),
  ),
)
const CreateUnitPage = lazy(() =>
  import('../../modules/units/presentation/create-unit-page').then(
    (module) => ({
      default: module.CreateUnitPage,
    }),
  ),
)
const EditUnitPage = lazy(() =>
  import('../../modules/units/presentation/edit-unit-page').then((module) => ({
    default: module.EditUnitPage,
  })),
)

export function AppRouter() {
  return (
    <BrowserRouter>
      <Suspense
        fallback={
          <div className="route-loading" role="status">
            Loading...
          </div>
        }
      >
        <Routes>
          <Route path={routePaths.home} element={<AppGate />} />
          <Route
            path={routePaths.auth}
            element={
              <RouteAccessGate route="auth">
                <AuthPage />
              </RouteAccessGate>
            }
          />
          <Route path={routePaths.signup} element={<SignUpPage />} />
          <Route
            path={routePaths.onboarding}
            element={
              <RouteAccessGate route="onboarding">
                <OnboardingPage />
              </RouteAccessGate>
            }
          />
          <Route
            path={routePaths.dashboard}
            element={
              <RouteAccessGate route="dashboard">
                <DashboardPage />
              </RouteAccessGate>
            }
          />
          <Route
            path={routePaths.dashboardProperties}
            element={
              <RouteAccessGate route="dashboard">
                <PropertiesPage />
              </RouteAccessGate>
            }
          />
          <Route
            path={routePaths.dashboardPropertiesNew}
            element={
              <RouteAccessGate route="dashboard">
                <CreatePropertyPage />
              </RouteAccessGate>
            }
          />
          <Route
            path={routePaths.dashboardTenants}
            element={
              <RouteAccessGate route="dashboard">
                <TenantsPage />
              </RouteAccessGate>
            }
          />
          <Route
            path={routePaths.dashboardTenantsNew}
            element={
              <RouteAccessGate route="dashboard">
                <CreateTenantPage />
              </RouteAccessGate>
            }
          />
          <Route
            path={routePaths.dashboardTenantEdit}
            element={
              <RouteAccessGate route="dashboard">
                <EditTenantPage />
              </RouteAccessGate>
            }
          />
          <Route
            path={routePaths.dashboardLeases}
            element={
              <RouteAccessGate route="dashboard">
                <LeasesPage />
              </RouteAccessGate>
            }
          />
          <Route
            path={routePaths.dashboardLeasesNew}
            element={
              <RouteAccessGate route="dashboard">
                <CreateLeasePage />
              </RouteAccessGate>
            }
          />
          <Route
            path={routePaths.dashboardInvoices}
            element={
              <RouteAccessGate route="dashboard">
                <InvoicesPage />
              </RouteAccessGate>
            }
          />
          <Route
            path={routePaths.dashboardPropertyEdit}
            element={
              <RouteAccessGate route="dashboard">
                <EditPropertyPage />
              </RouteAccessGate>
            }
          />
          <Route
            path={routePaths.dashboardPropertyUnitNew}
            element={
              <RouteAccessGate route="dashboard">
                <CreateUnitPage />
              </RouteAccessGate>
            }
          />
          <Route
            path={routePaths.dashboardPropertyUnitEdit}
            element={
              <RouteAccessGate route="dashboard">
                <EditUnitPage />
              </RouteAccessGate>
            }
          />
          <Route
            path={routePaths.dashboardPropertyDetail}
            element={
              <RouteAccessGate route="dashboard">
                <PropertyDetailPage />
              </RouteAccessGate>
            }
          />
        </Routes>
      </Suspense>
    </BrowserRouter>
  )
}
