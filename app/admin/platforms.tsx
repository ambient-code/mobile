import { View, Text, StyleSheet, ScrollView, RefreshControl, ActivityIndicator } from 'react-native'
import { useState } from 'react'
import { usePlatforms } from '@/services/analytics/hooks'
import { DashboardHeader } from '@/components/admin/layout/DashboardHeader'
import { PieChart } from '@/components/admin/charts/PieChart'
import { MetricCard } from '@/components/admin/metrics/MetricCard'
import { ADMIN_METRICS } from '@/constants/AdminMetrics'
import type { PlatformPeriod, OSVersionBreakdown } from '@/services/analytics/types'

export default function PlatformComparisonDashboard() {
  const [period, setPeriod] = useState<PlatformPeriod>('30d')
  const { data, isLoading, error, refetch, isRefetching } = usePlatforms(period)

  const onRefresh = () => {
    refetch()
  }

  if (isLoading && !data) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Loading platform metrics...</Text>
      </View>
    )
  }

  if (error && !data) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorTitle}>Unable to load platform metrics</Text>
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
        title="Platform Comparison"
        subtitle="Cross-platform usage breakdown"
        lastUpdated={data?.timeRange.end}
      />

      <View style={styles.content}>
        {/* Platform Distribution */}
        <Text style={styles.sectionTitle}>Active Users by Platform</Text>
        <PieChart
          title="Platform Distribution (30 days)"
          data={[
            {
              value: data?.distribution.web.activeUsers ?? 0,
              label: 'Web Only',
              color: ADMIN_METRICS.CHART_COLORS.primary,
            },
            {
              value: data?.distribution.mobile.activeUsers ?? 0,
              label: 'Mobile Only',
              color: ADMIN_METRICS.CHART_COLORS.success,
            },
            {
              value: data?.distribution.both ?? 0,
              label: 'Both Platforms',
              color: ADMIN_METRICS.CHART_COLORS.warning,
            },
          ]}
          donut
          centerLabel="Users"
        />

        {/* Platform-Specific Metrics */}
        <Text style={styles.sectionTitle}>Platform Metrics</Text>
        <View style={styles.platformGrid}>
          <View style={styles.platformCard}>
            <Text style={styles.platformTitle}>Web Platform</Text>
            <MetricCard
              label="Active Users"
              value={data?.distribution.web.activeUsers ?? 0}
              subtitle={`${data?.distribution.web.percentage.toFixed(1)}% of total`}
            />
            <MetricCard
              label="Error Rate"
              value={`${data?.distribution.web.errorRate.toFixed(2)}%`}
              status={getErrorRateStatus(data?.distribution.web.errorRate ?? 0)}
            />
            <MetricCard
              label="Requests/Min"
              value={data?.distribution.web.requestsPerMinute.toFixed(0) ?? 0}
            />
          </View>

          <View style={styles.platformCard}>
            <Text style={styles.platformTitle}>Mobile Platform</Text>
            <MetricCard
              label="Active Users"
              value={data?.distribution.mobile.activeUsers ?? 0}
              subtitle={`${data?.distribution.mobile.percentage.toFixed(1)}% of total`}
            />
            <MetricCard
              label="Error Rate"
              value={`${data?.distribution.mobile.errorRate.toFixed(2)}%`}
              status={getErrorRateStatus(data?.distribution.mobile.errorRate ?? 0)}
            />
            <MetricCard
              label="Requests/Min"
              value={data?.distribution.mobile.requestsPerMinute.toFixed(0) ?? 0}
            />
          </View>
        </View>

        {/* OS Version Breakdowns */}
        <Text style={styles.sectionTitle}>Mobile OS Versions</Text>
        <OSVersionTable versions={data?.osVersions.mobile ?? []} />

        <Text style={styles.sectionTitle}>Web OS Versions</Text>
        <OSVersionTable versions={data?.osVersions.web ?? []} />
      </View>
    </ScrollView>
  )
}

function OSVersionTable({ versions }: { versions: OSVersionBreakdown[] }) {
  if (versions.length === 0) {
    return (
      <View style={styles.emptyState}>
        <Text style={styles.emptyText}>No OS version data available</Text>
      </View>
    )
  }

  return (
    <View style={styles.table}>
      <View style={styles.tableHeader}>
        <Text style={[styles.tableHeaderCell, styles.osColumn]}>OS</Text>
        <Text style={[styles.tableHeaderCell, styles.versionColumn]}>Version</Text>
        <Text style={[styles.tableHeaderCell, styles.countColumn]}>Users</Text>
        <Text style={[styles.tableHeaderCell, styles.percentColumn]}>%</Text>
      </View>
      {versions.map((version, index) => (
        <View key={`${version.os}-${version.version}`} style={styles.tableRow}>
          <Text style={[styles.tableCell, styles.osColumn]}>{version.os}</Text>
          <Text style={[styles.tableCell, styles.versionColumn]}>{version.version}</Text>
          <Text style={[styles.tableCell, styles.countColumn]}>{version.count}</Text>
          <Text style={[styles.tableCell, styles.percentColumn]}>
            {version.percentage.toFixed(1)}%
          </Text>
        </View>
      ))}
    </View>
  )
}

function getErrorRateStatus(errorRate: number): 'success' | 'warning' | 'error' {
  if (errorRate < 1) return 'success'
  if (errorRate < 5) return 'warning'
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
  platformGrid: {
    gap: 12,
  },
  platformCard: {
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
  },
  platformTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#000',
  },
  table: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  tableHeader: {
    flexDirection: 'row',
    borderBottomWidth: 2,
    borderBottomColor: '#E5E5EA',
    paddingBottom: 8,
    marginBottom: 8,
  },
  tableHeaderCell: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#666',
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F5F5F5',
  },
  tableCell: {
    fontSize: 14,
    color: '#000',
  },
  osColumn: {
    flex: 1.5,
  },
  versionColumn: {
    flex: 1.5,
  },
  countColumn: {
    flex: 1,
    textAlign: 'right',
  },
  percentColumn: {
    flex: 1,
    textAlign: 'right',
  },
  emptyState: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 20,
    alignItems: 'center',
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 14,
    color: '#8E8E93',
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
