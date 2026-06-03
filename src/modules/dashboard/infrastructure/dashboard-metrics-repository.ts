import { supabaseClient } from '../../../shared/lib'
import type {
  DashboardBreakdownItem,
  DashboardMetrics,
  DashboardMonthlyCollection,
  DashboardRange,
  DashboardRangePreset,
} from '../domain/dashboard-metrics'

export const dashboardMetricsQueryKey = ['dashboard-metrics'] as const

type UnitStatus = 'vacant' | 'occupied' | 'maintenance' | 'inactive'
type InvoiceStatus =
  | 'draft'
  | 'unpaid'
  | 'partially_paid'
  | 'paid'
  | 'overdue'
  | 'cancelled'
type ReminderStatus = 'draft' | 'prepared' | 'sent' | 'cancelled'
type MaintenanceTicketStatus = 'open' | 'in_progress' | 'resolved' | 'cancelled'

type UnitMetricsRow = {
  status: UnitStatus
}

type InvoiceMetricsRow = {
  id: string
  billing_period: string
  total_amount: number
  status: InvoiceStatus
  payments: { amount: number }[] | null
}

type ReminderMetricsRow = {
  status: ReminderStatus
  invoices: { billing_period: string; status: InvoiceStatus } | null
}

type MaintenanceMetricsRow = {
  status: MaintenanceTicketStatus
}

const invoiceAttentionStatuses = new Set<InvoiceStatus>([
  'unpaid',
  'partially_paid',
  'overdue',
])

const openMaintenanceStatuses = new Set<MaintenanceTicketStatus>([
  'open',
  'in_progress',
])

const statusColors = {
  draft: '#64748b',
  unpaid: '#f97316',
  partially_paid: '#eab308',
  paid: '#16a34a',
  overdue: '#dc2626',
  cancelled: '#94a3b8',
  prepared: '#2563eb',
  sent: '#16a34a',
  open: '#dc2626',
  in_progress: '#2563eb',
  resolved: '#16a34a',
} as const

function toBillingPeriod(date: Date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')

  return `${year}-${month}-01`
}

function addMonths(date: Date, amount: number) {
  return new Date(date.getFullYear(), date.getMonth() + amount, 1)
}

function getMonthLabel(billingPeriod: string) {
  const [year, month] = billingPeriod.split('-').map(Number)

  return new Intl.DateTimeFormat('id-ID', {
    month: 'short',
    year: 'numeric',
  }).format(new Date(year, month - 1, 1))
}

function listBillingPeriods(start: string, end: string) {
  const periods: string[] = []
  const [startYear, startMonth] = start.split('-').map(Number)
  const [endYear, endMonth] = end.split('-').map(Number)
  let cursor = new Date(startYear, startMonth - 1, 1)
  const final = new Date(endYear, endMonth - 1, 1)

  while (cursor <= final) {
    periods.push(toBillingPeriod(cursor))
    cursor = addMonths(cursor, 1)
  }

  return periods
}

export function getDashboardRange(
  preset: DashboardRangePreset,
  now = new Date(),
): DashboardRange {
  const currentMonth = new Date(now.getFullYear(), now.getMonth(), 1)

  if (preset === 'last-month') {
    const month = addMonths(currentMonth, -1)
    const billingPeriod = toBillingPeriod(month)

    return {
      preset,
      label: 'Last month',
      startBillingPeriod: billingPeriod,
      endBillingPeriod: billingPeriod,
      monthLabels: [getMonthLabel(billingPeriod)],
    }
  }

  if (preset === 'last-3-months') {
    const start = toBillingPeriod(addMonths(currentMonth, -2))
    const end = toBillingPeriod(currentMonth)

    return {
      preset,
      label: 'Last 3 months',
      startBillingPeriod: start,
      endBillingPeriod: end,
      monthLabels: listBillingPeriods(start, end).map(getMonthLabel),
    }
  }

  if (preset === 'this-year') {
    const start = toBillingPeriod(new Date(now.getFullYear(), 0, 1))
    const end = toBillingPeriod(currentMonth)

    return {
      preset,
      label: 'This year',
      startBillingPeriod: start,
      endBillingPeriod: end,
      monthLabels: listBillingPeriods(start, end).map(getMonthLabel),
    }
  }

  const billingPeriod = toBillingPeriod(currentMonth)

  return {
    preset,
    label: 'This month',
    startBillingPeriod: billingPeriod,
    endBillingPeriod: billingPeriod,
    monthLabels: [getMonthLabel(billingPeriod)],
  }
}

function sumPayments(payments: { amount: number }[] | null) {
  return payments?.reduce((total, payment) => total + payment.amount, 0) ?? 0
}

function createBreakdown<TStatus extends string>({
  counts,
  labels,
  colors,
}: {
  counts: Map<TStatus, number>
  labels: Record<TStatus, string>
  colors: Record<TStatus, string>
}): DashboardBreakdownItem[] {
  return (Object.keys(labels) as TStatus[])
    .map((status) => ({
      name: labels[status],
      value: counts.get(status) ?? 0,
      fill: colors[status],
    }))
    .filter((item) => item.value > 0)
}

function incrementCount<TStatus extends string>(
  counts: Map<TStatus, number>,
  status: TStatus,
) {
  counts.set(status, (counts.get(status) ?? 0) + 1)
}

function buildMonthlyCollections({
  range,
  invoices,
}: {
  range: DashboardRange
  invoices: InvoiceMetricsRow[]
}): DashboardMonthlyCollection[] {
  const periods = listBillingPeriods(
    range.startBillingPeriod,
    range.endBillingPeriod,
  )
  const collectionsByPeriod = new Map(
    periods.map((period) => [
      period,
      {
        month: getMonthLabel(period),
        expected: 0,
        collected: 0,
      },
    ]),
  )

  invoices.forEach((invoice) => {
    if (invoice.status === 'cancelled') {
      return
    }

    const collection = collectionsByPeriod.get(invoice.billing_period)

    if (collection === undefined) {
      return
    }

    collection.expected += invoice.total_amount
    collection.collected += sumPayments(invoice.payments)
  })

  return Array.from(collectionsByPeriod.values())
}

export async function getDashboardMetrics(
  preset: DashboardRangePreset,
): Promise<DashboardMetrics> {
  const range = getDashboardRange(preset)
  const [
    { data: units, error: unitsError },
    { data: invoices, error: invoicesError },
    { data: reminders, error: remindersError },
    { data: maintenanceTickets, error: maintenanceError },
  ] = await Promise.all([
    supabaseClient.from('units').select('status').returns<UnitMetricsRow[]>(),
    supabaseClient
      .from('invoices')
      .select(
        `
          id,
          billing_period,
          total_amount,
          status,
          payments (
            amount
          )
        `,
      )
      .gte('billing_period', range.startBillingPeriod)
      .lte('billing_period', range.endBillingPeriod)
      .returns<InvoiceMetricsRow[]>(),
    supabaseClient
      .from('reminders')
      .select(
        `
          status,
          invoices (
            billing_period,
            status
          )
        `,
      )
      .returns<ReminderMetricsRow[]>(),
    supabaseClient
      .from('maintenance_tickets')
      .select('status')
      .returns<MaintenanceMetricsRow[]>(),
  ])

  if (unitsError !== null) {
    throw new Error(`Could not load dashboard units: ${unitsError.message}`)
  }

  if (invoicesError !== null) {
    throw new Error(
      `Could not load dashboard invoices: ${invoicesError.message}`,
    )
  }

  if (remindersError !== null) {
    throw new Error(
      `Could not load dashboard reminders: ${remindersError.message}`,
    )
  }

  if (maintenanceError !== null) {
    throw new Error(
      `Could not load dashboard maintenance tickets: ${maintenanceError.message}`,
    )
  }

  const activeInvoices = invoices.filter(
    (invoice) => invoice.status !== 'cancelled',
  )
  const expectedRent = activeInvoices.reduce(
    (total, invoice) => total + invoice.total_amount,
    0,
  )
  const collectedRent = activeInvoices.reduce(
    (total, invoice) => total + sumPayments(invoice.payments),
    0,
  )
  const invoiceStatusCounts = new Map<InvoiceStatus, number>()
  const maintenanceStatusCounts = new Map<MaintenanceTicketStatus, number>()
  const reminderStatusCounts = new Map<ReminderStatus, number>()

  activeInvoices.forEach((invoice) => {
    incrementCount(invoiceStatusCounts, invoice.status)
  })

  maintenanceTickets.forEach((ticket) => {
    incrementCount(maintenanceStatusCounts, ticket.status)
  })

  reminders
    .filter((reminder) => {
      const invoice = reminder.invoices

      return (
        invoice !== null &&
        invoice.status !== 'cancelled' &&
        invoice.billing_period >= range.startBillingPeriod &&
        invoice.billing_period <= range.endBillingPeriod
      )
    })
    .forEach((reminder) => {
      incrementCount(reminderStatusCounts, reminder.status)
    })

  return {
    range,
    totalUnits: units.length,
    occupiedUnits: units.filter((unit) => unit.status === 'occupied').length,
    vacantUnits: units.filter((unit) => unit.status === 'vacant').length,
    expectedRent,
    collectedRent,
    outstandingRent: Math.max(expectedRent - collectedRent, 0),
    attentionInvoiceCount: activeInvoices.filter((invoice) =>
      invoiceAttentionStatuses.has(invoice.status),
    ).length,
    openMaintenanceTicketCount: maintenanceTickets.filter((ticket) =>
      openMaintenanceStatuses.has(ticket.status),
    ).length,
    reminderCounts: {
      draft: reminderStatusCounts.get('draft') ?? 0,
      prepared: reminderStatusCounts.get('prepared') ?? 0,
      sent: reminderStatusCounts.get('sent') ?? 0,
      cancelled: reminderStatusCounts.get('cancelled') ?? 0,
    },
    monthlyCollections: buildMonthlyCollections({
      range,
      invoices,
    }),
    invoiceStatusBreakdown: createBreakdown({
      counts: invoiceStatusCounts,
      labels: {
        draft: 'Draft',
        unpaid: 'Unpaid',
        partially_paid: 'Partially paid',
        paid: 'Paid',
        overdue: 'Overdue',
        cancelled: 'Cancelled',
      },
      colors: statusColors,
    }),
    maintenanceStatusBreakdown: createBreakdown({
      counts: maintenanceStatusCounts,
      labels: {
        open: 'Open',
        in_progress: 'In progress',
        resolved: 'Resolved',
        cancelled: 'Cancelled',
      },
      colors: statusColors,
    }),
    reminderStatusBreakdown: createBreakdown({
      counts: reminderStatusCounts,
      labels: {
        draft: 'Draft',
        prepared: 'Prepared',
        sent: 'Sent',
        cancelled: 'Cancelled',
      },
      colors: statusColors,
    }),
  }
}
