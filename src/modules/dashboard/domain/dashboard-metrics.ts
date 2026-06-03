export type DashboardRangePreset =
  | 'this-month'
  | 'last-month'
  | 'last-3-months'
  | 'this-year'

export type DashboardRange = {
  preset: DashboardRangePreset
  label: string
  startBillingPeriod: string
  endBillingPeriod: string
  monthLabels: string[]
}

export type DashboardMetricCard = {
  id: string
  label: string
  value: string
  helper: string
}

export type DashboardMonthlyCollection = {
  month: string
  expected: number
  collected: number
}

export type DashboardBreakdownItem = {
  name: string
  value: number
  fill: string
}

export type DashboardMetrics = {
  range: DashboardRange
  totalUnits: number
  occupiedUnits: number
  vacantUnits: number
  expectedRent: number
  collectedRent: number
  outstandingRent: number
  attentionInvoiceCount: number
  openMaintenanceTicketCount: number
  reminderCounts: {
    draft: number
    prepared: number
    sent: number
    cancelled: number
  }
  monthlyCollections: DashboardMonthlyCollection[]
  invoiceStatusBreakdown: DashboardBreakdownItem[]
  maintenanceStatusBreakdown: DashboardBreakdownItem[]
  reminderStatusBreakdown: DashboardBreakdownItem[]
}

export const dashboardRangePresets: {
  value: DashboardRangePreset
  label: string
}[] = [
  { value: 'this-month', label: 'This month' },
  { value: 'last-month', label: 'Last month' },
  { value: 'last-3-months', label: 'Last 3 months' },
  { value: 'this-year', label: 'This year' },
]
