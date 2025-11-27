import { View, Text, StyleSheet, ScrollView, RefreshControl, ActivityIndicator } from 'react-native'
import { useState } from 'react'
import { useEngagement } from '@/services/analytics/hooks'
import { DashboardHeader } from '@/components/admin/layout/DashboardHeader'
import { LineChart } from '@/components/admin/charts/LineChart'
import { BarChart } from '@/components/admin/charts/BarChart'
import { MetricCard } from '@/components/admin/metrics/MetricCard'
import { ADMIN_METRICS } from '@/constants/AdminMetrics'
import type { EngagementPeriod } from '@/services/analytics/types'

export default function EngagementDashboard() {
  const [period, setPeriod] = useState<EngagementPeriod>('24h')
  const { data, isLoading, error, refetch, isRefetching } = useEngagement(period)

  const onRefresh = () => {
    refetch()
  }

  if (isLoading && !data) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Loading engagement metrics...</Text>
      </View>
    )
  }

  if (error && !data) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorTitle}>Unable to load engagement metrics</Text>
        <Text style={styles.errorMessage}>
          {error instanceof Error ? error.message : 'An error occurred'}
        </Text>
        <Text style={styles.retryHint}>Pull down to retry</Text>
      </View>
    )
  }

  // Calculate current DAU (most recent hour's unique users)
  const currentDAU = data?.dau?.[data.dau.length - 1]?.uniqueUsers ?? 0

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={isRefetching} onRefresh={onRefresh} tintColor="#007AFF" />
      }
    >
      <DashboardHeader
        title="User Engagement"
        subtitle="Daily and monthly active users"
        lastUpdated={data?.timeRange.end}
      />

      <View style={styles.content}>
        {/* Key Metrics */}
        <Text style={styles.sectionTitle}>Key Metrics</Text>
        <View style={styles.row}>
          <View style={styles.halfCard}>
            <MetricCard label="DAU" value={currentDAU} status="success" subtitle="Daily Active" />
          </View>
          <View style={styles.halfCard}>
            <MetricCard
              label="MAU"
              value={data?.mau ?? 0}
              status="success"
              subtitle="Monthly Active"
            />
          </View>
        </View>
        <MetricCard
          label="Stickiness Ratio"
          value={data?.stickiness !== null ? `${data.stickiness.toFixed(1)}%` : 'N/A'}
          status={getStickinessStatus(data?.stickiness ?? 0)}
          subtitle="DAU / MAU × 100"
        />

        {/* DAU Trend */}
        <Text style={styles.sectionTitle}>Daily Active Users (24h)</Text>
        <LineChart
          title="DAU Over Last 24 Hours"
          data={
            data?.dau.map((point) => ({
              timestamp: new Date(point.hour),
              value: point.uniqueUsers,
            })) ?? []
          }
          color={ADMIN_METRICS.CHART_COLORS.primary}
          formatValue={(v) => `${v} users`}
        />

        {/* New vs Returning Users */}
        <Text style={styles.sectionTitle}>New vs Returning Users</Text>
        <BarChart
          title="User Breakdown (24h)"
          data={
            data?.newVsReturning.map((point) => ({
              timestamp: new Date(point.hour),
              values: [
                {
                  value: point.newUsers,
                  color: ADMIN_METRICS.CHART_COLORS.success,
                  label: 'New',
                },
                {
                  value: point.returningUsers,
                  color: ADMIN_METRICS.CHART_COLORS.primary,
                  label: 'Returning',
                },
              ],
            })) ?? []
          }
          stacked
        />

        {/* Legend for stacked bar chart */}
        <View style={styles.legend}>
          <View style={styles.legendItem}>
            <View
              style={[
                styles.legendColor,
                { backgroundColor: ADMIN_METRICS.CHART_COLORS.success },
              ]}
            />
            <Text style={styles.legendLabel}>New Users</Text>
          </View>
          <View style={styles.legendItem}>
            <View
              style={[styles.legendColor, { backgroundColor: ADMIN_METRICS.CHART_COLORS.primary }]}
            />
            <Text style={styles.legendLabel}>Returning Users</Text>
          </View>
        </View>
      </View>
    </ScrollView>
  )
}

function getStickinessStatus(stickiness: number | null): 'success' | 'warning' | 'error' {
  if (stickiness === null || stickiness === 0) return 'error'
  if (stickiness >= 20) return 'success' // >20% is good stickiness
  if (stickiness >= 10) return 'warning' // 10-20% is moderate
  return 'error' // <10% is concerning
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
  row: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  halfCard: {
    flex: 1,
  },
  legend: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 20,
    marginTop: 12,
    padding: 12,
    backgroundColor: 'white',
    borderRadius: 8,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  legendColor: {
    width: 16,
    height: 16,
    borderRadius: 4,
    marginRight: 8,
  },
  legendLabel: {
    fontSize: 14,
    color: '#000',
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
