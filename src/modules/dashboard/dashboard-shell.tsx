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

function buildMetricCards(metrics: DashboardMetrics) {
  return [
    {
      id: 'total-units',
      label: 'Total units',
      value: formatNumber(metrics.totalUnits),
      helper: 'Current portfolio state',
    },
    {
      id: 'occupied-units',
      label: 'Occupied units',
      value: formatNumber(metrics.occupiedUnits),
      helper: 'Current unit status',
    },
    {
      id: 'vacant-units',
      label: 'Vacant units',
      value: formatNumber(metrics.vacantUnits),
      helper: 'Current unit status',
    },
    {
      id: 'expected-rent',
      label: 'Expected rent',
      value: formatCurrency(metrics.expectedRent),
      helper: metrics.range.label,
    },
    {
      id: 'collected-rent',
      label: 'Collected rent',
      value: formatCurrency(metrics.collectedRent),
      helper: metrics.range.label,
    },
    {
      id: 'outstanding-rent',
      label: 'Outstanding rent',
      value: formatCurrency(metrics.outstandingRent),
      helper: metrics.range.label,
    },
    {
      id: 'attention-invoices',
      label: 'Invoices needing attention',
      value: formatNumber(metrics.attentionInvoiceCount),
      helper: 'Unpaid, partial, or overdue',
    },
    {
      id: 'open-maintenance',
      label: 'Open maintenance',
      value: formatNumber(metrics.openMaintenanceTicketCount),
      helper: 'Open or in progress',
    },
    {
      id: 'prepared-reminders',
      label: 'Prepared reminders',
      value: formatNumber(metrics.reminderCounts.prepared),
      helper: metrics.range.label,
    },
  ]
}

function EmptyChart({ label }: { label: string }) {
  return <p className="dashboard-shell__empty-chart">{label}</p>
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
        <p className="dashboard-shell__status">Loading dashboard metrics...</p>
      ) : null}

      {metricsQuery.isError ? (
        <p className="dashboard-shell__error" role="alert">
          We could not load dashboard metrics right now. Please try again later.
        </p>
      ) : null}

      {metricsQuery.isSuccess ? (
        <>
          <div
            className="dashboard-shell__metrics"
            aria-label="Dashboard metrics"
          >
            {buildMetricCards(metricsQuery.data).map((metric) => (
              <article className="dashboard-shell__metric" key={metric.id}>
                <span>{metric.label}</span>
                <strong>{metric.value}</strong>
                <p>{metric.helper}</p>
              </article>
            ))}
          </div>

          <div className="dashboard-shell__charts">
            <article className="dashboard-shell__chart dashboard-shell__chart--wide">
              <div className="dashboard-shell__chart-header">
                <h3>Collection by month</h3>
                <p>{metricsQuery.data.range.label}</p>
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
