import { useState } from 'react'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  XAxis,
  YAxis,
} from 'recharts'
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from '@/components/ui/chart'
import {
  dashboardRangePresets,
  type DashboardBreakdownItem,
  type DashboardMetrics,
  type DashboardRangePreset,
} from './domain/dashboard-metrics'
import { useDashboardMetricsQuery } from './application/use-dashboard-metrics-query'

type DashboardMetricTone = 'neutral' | 'positive' | 'warning' | 'attention'

type DashboardMetricGroup = {
  id: string
  title: string
  summary: string
  metrics: DashboardMetricCardView[]
}

type DashboardMetricCardView = {
  id: string
  label: string
  value: string
  helper: string
  tone: DashboardMetricTone
}

const collectionChartConfig = {
  expected: {
    label: 'Expected',
    color: 'var(--chart-2)',
  },
  collected: {
    label: 'Collected',
    color: 'var(--chart-1)',
  },
} satisfies ChartConfig

function formatCurrency(value: number) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(value)
}

function formatNumber(value: number) {
  return new Intl.NumberFormat('id-ID').format(value)
}

function buildMetricGroups(metrics: DashboardMetrics): DashboardMetricGroup[] {
  return [
    {
      id: 'portfolio',
      title: 'Portfolio state',
      summary: 'Current unit availability',
      metrics: [
        {
          id: 'total-units',
          label: 'Total units',
          value: formatNumber(metrics.totalUnits),
          helper: 'Current portfolio',
          tone: 'neutral',
        },
        {
          id: 'occupied-units',
          label: 'Occupied units',
          value: formatNumber(metrics.occupiedUnits),
          helper: 'Currently occupied',
          tone: 'positive',
        },
        {
          id: 'vacant-units',
          label: 'Vacant units',
          value: formatNumber(metrics.vacantUnits),
          helper: 'Available to fill',
          tone: metrics.vacantUnits > 0 ? 'warning' : 'positive',
        },
      ],
    },
    {
      id: 'collection',
      title: 'Collection health',
      summary: metrics.range.label,
      metrics: [
        {
          id: 'expected-rent',
          label: 'Expected rent',
          value: formatCurrency(metrics.expectedRent),
          helper: metrics.range.label,
          tone: 'neutral',
        },
        {
          id: 'collected-rent',
          label: 'Collected rent',
          value: formatCurrency(metrics.collectedRent),
          helper: metrics.range.label,
          tone: 'positive',
        },
        {
          id: 'outstanding-rent',
          label: 'Outstanding rent',
          value: formatCurrency(metrics.outstandingRent),
          helper: metrics.range.label,
          tone: metrics.outstandingRent > 0 ? 'attention' : 'positive',
        },
      ],
    },
    {
      id: 'attention',
      title: 'Attention workload',
      summary: 'Records to monitor',
      metrics: [
        {
          id: 'attention-invoices',
          label: 'Invoices needing attention',
          value: formatNumber(metrics.attentionInvoiceCount),
          helper: 'Unpaid, partial, or overdue',
          tone: metrics.attentionInvoiceCount > 0 ? 'attention' : 'positive',
        },
        {
          id: 'open-maintenance',
          label: 'Open maintenance',
          value: formatNumber(metrics.openMaintenanceTicketCount),
          helper: 'Open or in progress',
          tone:
            metrics.openMaintenanceTicketCount > 0 ? 'warning' : 'positive',
        },
        {
          id: 'prepared-reminders',
          label: 'Prepared reminders',
          value: formatNumber(metrics.reminderCounts.prepared),
          helper: metrics.range.label,
          tone: metrics.reminderCounts.prepared > 0 ? 'warning' : 'neutral',
        },
      ],
    },
  ]
}

function EmptyChart({ label }: { label: string }) {
  return <p className="dashboard-shell__empty-chart">{label}</p>
}

function ChartLegendList({ data }: { data: DashboardBreakdownItem[] }) {
  if (data.length === 0) {
    return null
  }

  return (
    <ul className="dashboard-shell__legend" aria-label="Chart legend">
      {data.map((item) => (
        <li key={item.name}>
          <span
            className="dashboard-shell__legend-swatch"
            style={{ backgroundColor: item.fill }}
            aria-hidden="true"
          />
          <span>{item.name}</span>
          <strong>{formatNumber(item.value)}</strong>
        </li>
      ))}
    </ul>
  )
}

function CollectionLegend() {
  return (
    <ul className="dashboard-shell__legend dashboard-shell__legend--inline">
      <li>
        <span
          className="dashboard-shell__legend-swatch dashboard-shell__legend-swatch--expected"
          aria-hidden="true"
        />
        <span>Expected</span>
      </li>
      <li>
        <span
          className="dashboard-shell__legend-swatch dashboard-shell__legend-swatch--collected"
          aria-hidden="true"
        />
        <span>Collected</span>
      </li>
    </ul>
  )
}

function BreakdownChart({
  data,
  emptyLabel,
}: {
  data: DashboardBreakdownItem[]
  emptyLabel: string
}) {
  if (data.length === 0) {
    return <EmptyChart label={emptyLabel} />
  }

  const chartConfig = data.reduce<ChartConfig>((config, item) => {
    config[item.name] = {
      label: item.name,
      color: item.fill,
    }

    return config
  }, {})

  return (
    <div className="dashboard-shell__breakdown">
      <ChartContainer config={chartConfig} className="dashboard-shell__pie">
        <PieChart>
          <ChartTooltip content={<ChartTooltipContent nameKey="name" />} />
          <Pie data={data} dataKey="value" nameKey="name" innerRadius={54}>
            {data.map((item) => (
              <Cell key={item.name} fill={item.fill} />
            ))}
          </Pie>
        </PieChart>
      </ChartContainer>
      <ChartLegendList data={data} />
    </div>
  )
}

export function DashboardShell() {
  const [selectedPreset, setSelectedPreset] =
    useState<DashboardRangePreset>('this-month')
  const metricsQuery = useDashboardMetricsQuery(selectedPreset)

  return (
    <section className="dashboard-shell" aria-labelledby="dashboard-title">
      <div className="dashboard-shell__header">
        <div>
          <h2 id="dashboard-title">Dashboard</h2>
          <p>
            Review rental collection, invoice status, reminders, and maintenance
            workload.
          </p>
        </div>
        <div
          className="dashboard-shell__range"
          role="group"
          aria-label="Dashboard date range"
        >
          {dashboardRangePresets.map((preset) => (
            <button
              key={preset.value}
              type="button"
              className={
                preset.value === selectedPreset
                  ? 'dashboard-shell__range-button dashboard-shell__range-button--active'
                  : 'dashboard-shell__range-button'
              }
              onClick={() => {
                setSelectedPreset(preset.value)
              }}
            >
              {preset.label}
            </button>
          ))}
        </div>
      </div>

      {metricsQuery.isLoading ? (
        <div className="dashboard-shell__status" aria-live="polite">
          <span className="dashboard-shell__status-kicker">Loading</span>
          <strong>Preparing dashboard metrics</strong>
          <p>
            Collection, invoice, reminder, and maintenance summaries are being
            loaded.
          </p>
        </div>
      ) : null}

      {metricsQuery.isError ? (
        <div className="dashboard-shell__error" role="alert">
          <span className="dashboard-shell__status-kicker">
            Dashboard unavailable
          </span>
          <strong>We could not load dashboard metrics right now.</strong>
          <p>Please try again later.</p>
        </div>
      ) : null}

      {metricsQuery.isSuccess ? (
        <>
          <div
            className="dashboard-shell__metric-groups"
            aria-label="Dashboard metrics"
          >
            {buildMetricGroups(metricsQuery.data).map((group) => (
              <section className="dashboard-shell__metric-group" key={group.id}>
                <div className="dashboard-shell__metric-group-header">
                  <h3>{group.title}</h3>
                  <p>{group.summary}</p>
                </div>
                <div className="dashboard-shell__metrics">
                  {group.metrics.map((metric) => (
                    <article
                      className={`dashboard-shell__metric dashboard-shell__metric--${metric.tone}`}
                      key={metric.id}
                    >
                      <span>{metric.label}</span>
                      <strong>{metric.value}</strong>
                      <p>{metric.helper}</p>
                    </article>
                  ))}
                </div>
              </section>
            ))}
          </div>

          <div className="dashboard-shell__charts">
            <article className="dashboard-shell__chart dashboard-shell__chart--wide">
              <div className="dashboard-shell__chart-header">
                <h3>Collection by month</h3>
                <p>{metricsQuery.data.range.label}</p>
                <CollectionLegend />
              </div>
              {metricsQuery.data.monthlyCollections.some(
                (item) => item.expected > 0 || item.collected > 0,
              ) ? (
                <ChartContainer
                  config={collectionChartConfig}
                  className="dashboard-shell__bar"
                >
                  <BarChart data={metricsQuery.data.monthlyCollections}>
                    <CartesianGrid vertical={false} />
                    <XAxis dataKey="month" tickLine={false} axisLine={false} />
                    <YAxis
                      tickLine={false}
                      axisLine={false}
                      tickFormatter={(value) =>
                        new Intl.NumberFormat('id-ID', {
                          notation: 'compact',
                          maximumFractionDigits: 1,
                        }).format(Number(value))
                      }
                    />
                    <ChartTooltip
                      content={<ChartTooltipContent indicator="dashed" />}
                    />
                    <Bar
                      dataKey="expected"
                      fill="var(--color-expected)"
                      radius={4}
                    />
                    <Bar
                      dataKey="collected"
                      fill="var(--color-collected)"
                      radius={4}
                    />
                  </BarChart>
                </ChartContainer>
              ) : (
                <EmptyChart label="No collection data for this range." />
              )}
            </article>

            <article className="dashboard-shell__chart">
              <div className="dashboard-shell__chart-header">
                <h3>Invoice status</h3>
                <p>{metricsQuery.data.range.label}</p>
              </div>
              <BreakdownChart
                data={metricsQuery.data.invoiceStatusBreakdown}
                emptyLabel="No invoices for this range."
              />
            </article>

            <article className="dashboard-shell__chart">
              <div className="dashboard-shell__chart-header">
                <h3>Maintenance status</h3>
                <p>Current tickets</p>
              </div>
              <BreakdownChart
                data={metricsQuery.data.maintenanceStatusBreakdown}
                emptyLabel="No maintenance tickets yet."
              />
            </article>

            <article className="dashboard-shell__chart">
              <div className="dashboard-shell__chart-header">
                <h3>Reminder status</h3>
                <p>{metricsQuery.data.range.label}</p>
              </div>
              <BreakdownChart
                data={metricsQuery.data.reminderStatusBreakdown}
                emptyLabel="No reminders for this range."
              />
            </article>
          </div>
        </>
      ) : null}
    </section>
  )
}
