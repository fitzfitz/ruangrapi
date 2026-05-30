import type { ReactNode } from 'react'
import { NavLink } from 'react-router-dom'

import { routePaths } from '../router/route-paths'

const sidebarLinks = [
  { label: 'Dashboard', path: routePaths.dashboard },
  { label: 'Properties', path: routePaths.dashboardProperties },
  { label: 'Tenants', path: routePaths.dashboardTenants },
  { label: 'Leases', path: routePaths.dashboardLeases },
]

const futureSidebarItems = ['Units', 'Billing', 'Maintenance']

type AppLayoutProps = {
  children: ReactNode
}

export function AppLayout({ children }: AppLayoutProps) {
  return (
    <div className="app-layout">
      <header className="app-header">
        <h1>RuangRapi</h1>
      </header>

      <div className="app-layout__body">
        <aside className="app-sidebar" aria-label="Primary sections">
          <nav aria-label="Primary app sections">
            <ul>
              {sidebarLinks.map((item) => (
                <li key={item.path}>
                  <NavLink
                    end={item.path === routePaths.dashboard}
                    to={item.path}
                  >
                    {item.label}
                  </NavLink>
                </li>
              ))}
              {futureSidebarItems.map((item) => (
                <li className="app-sidebar__coming-soon" key={item}>
                  {item}
                </li>
              ))}
            </ul>
          </nav>
        </aside>

        <main className="app-main">{children}</main>
      </div>
    </div>
  )
}
