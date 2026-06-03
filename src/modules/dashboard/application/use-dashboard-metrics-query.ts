import { useQuery } from '@tanstack/react-query'
import type { DashboardRangePreset } from '../domain/dashboard-metrics'
import {
  dashboardMetricsQueryKey,
  getDashboardMetrics,
} from '../infrastructure/dashboard-metrics-repository'

export function useDashboardMetricsQuery(preset: DashboardRangePreset) {
  return useQuery({
    queryKey: [...dashboardMetricsQueryKey, preset],
    queryFn: () => getDashboardMetrics(preset),
  })
}
