import { BrowserRouter, Route, Routes } from 'react-router-dom'

import { DashboardPage } from '../../modules/dashboard'
import {
  AppGate,
  AuthPage,
  OnboardingPage,
  RouteAccessGate,
  SignUpPage,
} from '../../modules/identity'
import { PropertiesPage } from '../../modules/properties'
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
      </Routes>
    </BrowserRouter>
  )
}
