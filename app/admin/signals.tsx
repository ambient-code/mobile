import { View, Text, StyleSheet, ScrollView, RefreshControl, ActivityIndicator } from 'react-native'
import { useState } from 'react'
import { useGoldenSignals } from '@/services/analytics/hooks'
import { DashboardHeader } from '@/components/admin/layout/DashboardHeader'
import { LineChart } from '@/components/admin/charts/LineChart'
import { PieChart } from '@/components/admin/charts/PieChart'
import { MetricCard } from '@/components/admin/metrics/MetricCard'
import { TrendBadge } from '@/components/admin/metrics/TrendBadge'
import { ErrorTable } from '@/components/admin/metrics/ErrorTable'
import { SaturationGauge } from '@/components/admin/metrics/SaturationGauge'
import { ADMIN_METRICS } from '@/constants/AdminMetrics'
import type { GoldenSignalsPeriod } from '@/services/analytics/types'

export default function GoldenSignalsDashboard() {
  const [period] = useState<GoldenSignalsPeriod>('7d')
  const { data, isLoading, error, refetch, isRefetching } = useGoldenSignals(period)

  const onRefresh = () => {
    refetch()
  }

  if (isLoading && !data) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Loading Golden Signals...</Text>
      </View>
    )
  }

  if (error && !data) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorTitle}>Unable to load Golden Signals</Text>
        <Text style={styles.errorMessage}>
          {error instanceof Error ? error.message : 'An error occurred'}
        </Text>
        <Text style={styles.retryHint}>Pull down to retry</Text>
      </View>
    )
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={isRefetching} onRefresh={onRefresh} tintColor="#007AFF" />
      }
    >
      <DashboardHeader
        title="Golden Signals"
        subtitle="Google SRE monitoring metrics"
        lastUpdated={data?.timeRange.end}
      />

      <View style={styles.content}>
        {/* Latency Signal */}
        <Text style={styles.sectionTitle}>Latency</Text>
        <View style={styles.trendContainer}>
          <TrendBadge trend={data?.latency.trend ?? 'stable'} />
          <MetricCard
            label="Current p95 Latency"
            value={`${data?.latency.currentP95.toFixed(0) ?? 0}ms`}
            status={getLatencyStatus(data?.latency.currentP95 ?? 0)}
          />
        </View>
        <LineChart
          title="Latency Over Time (p95)"
          data={
            data?.latency.timeSeries.map((point) => ({
              timestamp: new Date(point.timestamp),
              value: point.value,
            })) ?? []
          }
          color={ADMIN_METRICS.CHART_COLORS.primary}
          yAxisLabel="ms"
          formatValue={(v) => `${v.toFixed(0)}ms`}
        />

        {/* Traffic Signal */}
        <Text style={styles.sectionTitle}>Traffic</Text>
        <View style={styles.row}>
          <View style={styles.halfCard}>
            <MetricCard
              label="Requests/Minute"
              value={data?.traffic.currentRPM.toFixed(0) ?? 0}
              status="success"
            />
          </View>
          <View style={styles.halfCard}>
            <MetricCard
              label="Active Sessions"
              value={data?.traffic.activeSessions ?? 0}
              status="success"
            />
          </View>
        </View>
        <LineChart
          title="Traffic Over Time"
          data={
            data?.traffic.timeSeries.map((point) => ({
              timestamp: new Date(point.timestamp),
              value: point.value,
            })) ?? []
          }
          color={ADMIN_METRICS.CHART_COLORS.success}
          formatValue={(v) => `${v.toFixed(0)} req/min`}
        />

        {/* Errors Signal */}
        <Text style={styles.sectionTitle}>Errors</Text>
        <LineChart
          title="Error Rate Over Time"
          data={
            data?.errors.timeSeries.map((point) => ({
              timestamp: new Date(point.timestamp),
              value: point.value,
            })) ?? []
          }
          color={ADMIN_METRICS.CHART_COLORS.error}
          formatValue={(v) => `${v.toFixed(2)}%`}
        />
        <PieChart
          title="Error Breakdown (4xx vs 5xx)"
          data={[
            {
              value: data?.errors.breakdown.total4xx ?? 0,
              label: '4xx Client Errors',
              color: ADMIN_METRICS.CHART_COLORS.warning,
            },
            {
              value: data?.errors.breakdown.total5xx ?? 0,
              label: '5xx Server Errors',
              color: ADMIN_METRICS.CHART_COLORS.error,
            },
          ]}
          donut
          centerLabel="Errors"
        />
        <ErrorTable errors={data?.errors.topErrors ?? []} title="Top 5 Errors" />

        {/* Saturation Signal */}
        <Text style={styles.sectionTitle}>Saturation</Text>
        {data?.saturation.cpu && <SaturationGauge label="CPU Usage" data={data.saturation.cpu} />}
        {data?.saturation.memory && (
          <SaturationGauge label="Memory Usage" data={data.saturation.memory} />
        )}
        {data?.saturation.dbPool && (
          <SaturationGauge label="DB Pool Usage" data={data.saturation.dbPool} />
        )}
      </View>
    </ScrollView>
  )
}

function getLatencyStatus(latency: number): 'success' | 'warning' | 'error' {
  if (latency < ADMIN_METRICS.HEALTH_THRESHOLDS.LATENCY_WARNING) return 'success'
  if (latency < ADMIN_METRICS.HEALTH_THRESHOLDS.LATENCY_CRITICAL) return 'warning'
  return 'error'
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  content: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 24,
    marginBottom: 12,
    color: '#000',
  },
  trendContainer: {
    marginBottom: 12,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  halfCard: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    padding: 20,
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FF3B30',
    marginBottom: 8,
  },
  errorMessage: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 16,
  },
  retryHint: {
    fontSize: 12,
    color: '#8E8E93',
  },
})
