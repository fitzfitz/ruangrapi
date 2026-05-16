import type { ReactNode } from 'react'

const sidebarItems = [
  'Dashboard',
  'Properties',
  'Units',
  'Tenants',
  'Billing',
  'Maintenance',
]

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
          <nav aria-label="Static app sections">
            <ul>
              {sidebarItems.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </nav>
        </aside>

        <main className="app-main">{children}</main>
      </div>
    </div>
  )
}
