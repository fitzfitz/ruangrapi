import { useState, type ReactNode } from 'react'
import {
  Banknote,
  Bell,
  Building2,
  ClipboardList,
  FileText,
  Home,
  LayoutDashboard,
  Menu,
  ReceiptText,
  Users,
  Wrench,
  X,
} from 'lucide-react'
import { NavLink } from 'react-router-dom'

import { routePaths } from '../router/route-paths'

const sidebarLinks = [
  {
    label: 'Dashboard',
    path: routePaths.dashboard,
    icon: LayoutDashboard,
  },
  { label: 'Properties', path: routePaths.dashboardProperties, icon: Home },
  { label: 'Tenants', path: routePaths.dashboardTenants, icon: Users },
  { label: 'Leases', path: routePaths.dashboardLeases, icon: ClipboardList },
  { label: 'Invoices', path: routePaths.dashboardInvoices, icon: FileText },
  { label: 'Payments', path: routePaths.dashboardPayments, icon: Banknote },
  { label: 'Receipts', path: routePaths.dashboardReceipts, icon: ReceiptText },
  { label: 'Reminders', path: routePaths.dashboardReminders, icon: Bell },
  { label: 'Maintenance', path: routePaths.dashboardMaintenance, icon: Wrench },
]

const futureSidebarItems = [{ label: 'Units', icon: Building2 }]

type AppLayoutProps = {
  children: ReactNode
}

export function AppLayout({ children }: AppLayoutProps) {
  const [isNavigationOpen, setIsNavigationOpen] = useState(false)

  return (
    <div className="app-layout">
      <header className="app-header">
        <NavLink className="app-brand" to={routePaths.dashboard}>
          <span className="app-brand__mark" aria-hidden="true">
            RR
          </span>
          <span>
            <span className="app-brand__name">RuangRapi</span>
            <span className="app-brand__tagline">Rental operations ledger</span>
          </span>
        </NavLink>

        <button
          className="app-header__menu"
          type="button"
          aria-controls="primary-navigation"
          aria-expanded={isNavigationOpen}
          onClick={() => {
            setIsNavigationOpen((current) => !current)
          }}
        >
          {isNavigationOpen ? (
            <X aria-hidden="true" />
          ) : (
            <Menu aria-hidden="true" />
          )}
          <span>Menu</span>
        </button>
      </header>

      <div className="app-layout__body">
        <aside
          className={
            isNavigationOpen ? 'app-sidebar app-sidebar--open' : 'app-sidebar'
          }
          aria-label="Primary sections"
          id="primary-navigation"
        >
          <nav aria-label="Primary app sections" className="app-sidebar__nav">
            <ul>
              {sidebarLinks.map((item) => {
                const Icon = item.icon

                return (
                  <li key={item.path}>
                    <NavLink
                      end={item.path === routePaths.dashboard}
                      to={item.path}
                      onClick={() => {
                        setIsNavigationOpen(false)
                      }}
                    >
                      <Icon aria-hidden="true" />
                      <span>{item.label}</span>
                    </NavLink>
                  </li>
                )
              })}
              {futureSidebarItems.map((item) => (
                <li className="app-sidebar__coming-soon" key={item.label}>
                  <item.icon aria-hidden="true" />
                  <span>{item.label}</span>
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
