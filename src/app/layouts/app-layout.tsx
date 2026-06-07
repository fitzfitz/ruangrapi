import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from 'react'
import {
  Banknote,
  Bell,
  ClipboardList,
  FileText,
  Home,
  LayoutDashboard,
  MoreHorizontal,
  ReceiptText,
  Users,
  Wrench,
} from 'lucide-react'
import { NavLink, useLocation } from 'react-router-dom'

import { routePaths } from '../router/route-paths'

const primaryNavigationItems = [
  {
    label: 'Dashboard',
    path: routePaths.dashboard,
    icon: LayoutDashboard,
  },
  { label: 'Properties', path: routePaths.dashboardProperties, icon: Home },
  { label: 'Tenants', path: routePaths.dashboardTenants, icon: Users },
  { label: 'Invoices', path: routePaths.dashboardInvoices, icon: FileText },
  { label: 'Payments', path: routePaths.dashboardPayments, icon: Banknote },
]

const secondaryNavigationItems = [
  { label: 'Leases', path: routePaths.dashboardLeases, icon: ClipboardList },
  { label: 'Receipts', path: routePaths.dashboardReceipts, icon: ReceiptText },
  { label: 'Reminders', path: routePaths.dashboardReminders, icon: Bell },
  { label: 'Maintenance', path: routePaths.dashboardMaintenance, icon: Wrench },
]

const activePlateStorageKey = 'ruangrapi:app-bottom-nav-active-plate'

type StoredActivePlate = {
  width: number
  height: number
  x: number
  y: number
}

function toActivePlateStyle(plate: StoredActivePlate): CSSProperties {
  return {
    width: plate.width,
    height: plate.height,
    transform: `translate3d(${plate.x}px, ${plate.y}px, 0)`,
  }
}

function getStoredActivePlateStyle() {
  if (typeof window === 'undefined') {
    return {}
  }

  const storedValue = window.sessionStorage.getItem(activePlateStorageKey)

  if (!storedValue) {
    return {}
  }

  try {
    return toActivePlateStyle(JSON.parse(storedValue) as StoredActivePlate)
  } catch {
    window.sessionStorage.removeItem(activePlateStorageKey)
    return {}
  }
}

function getActivePrimaryIndex(pathname: string) {
  const activeIndex = primaryNavigationItems.findIndex((item) => {
    if (item.path === routePaths.dashboard) {
      return pathname === item.path
    }

    return pathname === item.path || pathname.startsWith(`${item.path}/`)
  })

  if (activeIndex !== -1) {
    return activeIndex
  }

  const isSecondaryRouteActive = secondaryNavigationItems.some(
    (item) => pathname === item.path || pathname.startsWith(`${item.path}/`),
  )

  return isSecondaryRouteActive ? primaryNavigationItems.length : 0
}

type AppLayoutProps = {
  children: ReactNode
}

export function AppLayout({ children }: AppLayoutProps) {
  const [isMoreOpen, setIsMoreOpen] = useState(false)
  const [activePlateStyle, setActivePlateStyle] = useState<CSSProperties>(
    getStoredActivePlateStyle,
  )
  const navRef = useRef<HTMLElement | null>(null)
  const activePlateRef = useRef<HTMLSpanElement | null>(null)
  const navItemRefs = useRef<Array<HTMLElement | null>>([])
  const location = useLocation()
  const activePrimaryIndex = getActivePrimaryIndex(location.pathname)
  const isMoreRouteActive = activePrimaryIndex === primaryNavigationItems.length
  const displayedActiveIndex = activePrimaryIndex

  const getMeasuredActivePlate = useCallback(() => {
    const navElement = navRef.current
    const activeItem = navItemRefs.current[displayedActiveIndex]

    if (!navElement || !activeItem) {
      return null
    }

    const navRect = navElement.getBoundingClientRect()
    const itemRect = activeItem.getBoundingClientRect()

    return {
      width: itemRect.width,
      height: itemRect.height,
      x: itemRect.left - navRect.left,
      y: itemRect.top - navRect.top,
    }
  }, [displayedActiveIndex])

  const rememberCurrentPlate = useCallback(() => {
    const navElement = navRef.current
    const activePlate = activePlateRef.current

    if (!navElement || !activePlate) {
      return
    }

    const navRect = navElement.getBoundingClientRect()
    const plateRect = activePlate.getBoundingClientRect()

    window.sessionStorage.setItem(
      activePlateStorageKey,
      JSON.stringify({
        width: plateRect.width,
        height: plateRect.height,
        x: plateRect.left - navRect.left,
        y: plateRect.top - navRect.top,
      } satisfies StoredActivePlate),
    )
  }, [])

  useEffect(() => {
    const measuredPlate = getMeasuredActivePlate()

    if (!measuredPlate) {
      return
    }

    const animationFrame = window.requestAnimationFrame(() => {
      setActivePlateStyle(toActivePlateStyle(measuredPlate))
      window.sessionStorage.removeItem(activePlateStorageKey)
    })

    return () => {
      window.cancelAnimationFrame(animationFrame)
    }
  }, [getMeasuredActivePlate])

  useEffect(() => {
    function syncActivePlate() {
      const measuredPlate = getMeasuredActivePlate()

      if (!measuredPlate) {
        return
      }

      setActivePlateStyle(toActivePlateStyle(measuredPlate))
    }

    window.addEventListener('resize', syncActivePlate)

    return () => {
      window.removeEventListener('resize', syncActivePlate)
    }
  }, [getMeasuredActivePlate])

  return (
    <div className="app-layout">
      <header className="app-header">
        <div className="app-header__inner">
          <NavLink className="app-brand" to={routePaths.dashboard}>
            <span className="app-brand__mark" aria-hidden="true">
              RR
            </span>
            <span>
              <span className="app-brand__name">RuangRapi</span>
              <span className="app-brand__tagline">Rental ops with rhythm</span>
            </span>
          </NavLink>

          <div className="app-header__status" aria-label="Workspace status">
            <span>Lagoon command</span>
            <strong>Live ops</strong>
          </div>
        </div>
      </header>

      <main className="app-main">
        <div className="app-main__inner">{children}</div>
      </main>

      <nav
        ref={navRef}
        className="app-bottom-nav"
        aria-label="Primary app sections"
        id="primary-navigation"
      >
        <span
          ref={activePlateRef}
          className="app-bottom-nav__active-plate"
          aria-hidden="true"
          style={activePlateStyle}
        />
        <ul className="app-bottom-nav__list">
          {primaryNavigationItems.map((item, index) => {
            const Icon = item.icon

            return (
              <li key={item.path}>
                <NavLink
                  className="app-bottom-nav__item"
                  end={item.path === routePaths.dashboard}
                  to={item.path}
                  ref={(node) => {
                    navItemRefs.current[index] = node
                  }}
                  onClick={() => {
                    rememberCurrentPlate()
                    setIsMoreOpen(false)
                  }}
                >
                  <Icon aria-hidden="true" />
                  <span>{item.label}</span>
                </NavLink>
              </li>
            )
          })}
          <li className="app-bottom-nav__more">
            <button
              className={
                isMoreRouteActive
                  ? 'app-bottom-nav__item app-bottom-nav__item--active'
                  : 'app-bottom-nav__item'
              }
              ref={(node) => {
                navItemRefs.current[primaryNavigationItems.length] = node
              }}
              type="button"
              aria-expanded={isMoreOpen}
              aria-controls="secondary-navigation"
              onClick={() => {
                setIsMoreOpen((current) => !current)
              }}
            >
              <MoreHorizontal aria-hidden="true" />
              <span>More</span>
            </button>
            {isMoreOpen ? (
              <div className="app-bottom-nav__menu" id="secondary-navigation">
                {secondaryNavigationItems.map((item) => {
                  const Icon = item.icon

                  return (
                    <NavLink
                      className="app-bottom-nav__menu-item"
                      key={item.path}
                      to={item.path}
                      onClick={() => {
                        rememberCurrentPlate()
                        setIsMoreOpen(false)
                      }}
                    >
                      <Icon aria-hidden="true" />
                      <span>{item.label}</span>
                    </NavLink>
                  )
                })}
              </div>
            ) : null}
          </li>
        </ul>
      </nav>
    </div>
  )
}
