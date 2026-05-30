import { BrowserRouter, Route, Routes } from 'react-router-dom'

import { DashboardPage } from '../../modules/dashboard'
import {
  AppGate,
  AuthPage,
  OnboardingPage,
  RouteAccessGate,
  SignUpPage,
} from '../../modules/identity'
import { CreateLeasePage, LeasesPage } from '../../modules/leases'
import {
  CreatePropertyPage,
  EditPropertyPage,
  PropertiesPage,
  PropertyDetailPage,
} from '../../modules/properties'
import {
  CreateTenantPage,
  EditTenantPage,
  TenantsPage,
} from '../../modules/tenants'
import { CreateUnitPage, EditUnitPage } from '../../modules/units'
import { routePaths } from './route-paths'

export function AppRouter() {
  return (
    <BrowserRouter>
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
    </BrowserRouter>
  )
}
