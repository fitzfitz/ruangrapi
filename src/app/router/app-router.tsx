import { BrowserRouter, Route, Routes } from 'react-router-dom'

import { AppGate } from '../../modules/identity'
import { DashboardPage } from '../../modules/dashboard'
import { AuthPage, OnboardingPage } from '../../modules/identity'
import { routePaths } from './route-paths'

export function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path={routePaths.home} element={<AppGate />} />
        <Route path={routePaths.auth} element={<AuthPage />} />
        <Route path={routePaths.onboarding} element={<OnboardingPage />} />
        <Route path={routePaths.dashboard} element={<DashboardPage />} />
      </Routes>
    </BrowserRouter>
  )
}
